"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function addVendor(data: FormData) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user.role !== "OWNER" && session.user.role !== "INV_MANAGER")) {
    throw new Error("Unauthorized")
  }

  const name = data.get("name") as string
  const contact = data.get("contact") as string
  const email = data.get("email") as string
  const address = data.get("address") as string

  await prisma.vendor.create({
    data: { name, contact, email, address },
  })

  revalidatePath("/dashboard/inventory")
}

export async function addItem(data: FormData) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user.role !== "OWNER" && session.user.role !== "INV_MANAGER")) {
    throw new Error("Unauthorized")
  }

  const name = data.get("name") as string
  const category = data.get("category") as string || "Uncategorized"
  const unit = data.get("unit") as string
  const vendorId = data.get("vendorId") as string
  const costPerUnitRaw = data.get("costPerUnit") as string
  const sellPriceRaw = data.get("sellPrice") as string
  const minStockRaw = data.get("minStock") as string
  
  const costPerUnit = costPerUnitRaw ? parseFloat(costPerUnitRaw) : null
  const sellPrice = sellPriceRaw ? parseFloat(sellPriceRaw) : null
  const minStock = minStockRaw ? parseFloat(minStockRaw) : 0

  await prisma.item.create({
    data: { 
      name, 
      category,
      unit, 
      vendorId: vendorId || null, 
      costPerUnit,
      sellPrice,
      minStock
    },
  })

  revalidatePath("/dashboard/inventory")
}

export async function updateItem(data: FormData) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user.role !== "OWNER" && session.user.role !== "INV_MANAGER")) {
    throw new Error("Unauthorized")
  }

  const itemId = data.get("itemId") as string
  const name = data.get("name") as string
  const category = data.get("category") as string || "Uncategorized"
  const unit = data.get("unit") as string
  const vendorId = data.get("vendorId") as string
  const costPerUnitRaw = data.get("costPerUnit") as string
  const sellPriceRaw = data.get("sellPrice") as string
  const currentStockRaw = data.get("currentStock") as string
  const minStockRaw = data.get("minStock") as string
  
  const costPerUnit = costPerUnitRaw ? parseFloat(costPerUnitRaw) : null
  const sellPrice = sellPriceRaw ? parseFloat(sellPriceRaw) : null
  const currentStock = currentStockRaw ? parseFloat(currentStockRaw) : 0
  const minStock = minStockRaw ? parseFloat(minStockRaw) : 0

  await prisma.item.update({
    where: { id: itemId },
    data: { 
      name, 
      category,
      unit, 
      vendorId: vendorId || null, 
      costPerUnit,
      sellPrice,
      currentStock,
      minStock
    },
  })

  revalidatePath("/dashboard/inventory")
}

export async function removeItem(data: FormData) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "OWNER") {
    throw new Error("Unauthorized — only Admin Owner can remove catalog items")
  }

  const itemId = data.get("itemId") as string
  if (!itemId) return

  // Delete related records first to avoid FK constraint errors
  await prisma.$transaction([
    prisma.inventoryLedger.deleteMany({ where: { itemId } }),
    prisma.outletStock.deleteMany({ where: { itemId } }),
    prisma.item.delete({ where: { id: itemId } }),
  ])

  revalidatePath("/dashboard/inventory")
  revalidatePath("/dashboard/inventory/stock-in")
  revalidatePath("/dashboard/inventory/dispatch")
  revalidatePath("/dashboard/stores")
}

export async function revertLedgerEntry(data: FormData) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "OWNER") {
    throw new Error("Unauthorized — only Admin Owner can revert stock entries")
  }

  const ledgerId = data.get("ledgerId") as string
  if (!ledgerId) return

  const entry = await prisma.inventoryLedger.findUnique({
    where: { id: ledgerId },
  })

  if (!entry) return

  if (entry.type === "STOCK_IN") {
    // Revert: remove what was added to central stock
    await prisma.$transaction([
      prisma.item.update({
        where: { id: entry.itemId },
        data: { currentStock: { decrement: entry.quantity } },
      }),
      prisma.inventoryLedger.delete({ where: { id: ledgerId } }),
    ])
  } else if (entry.type === "DISPATCH" && entry.outletId) {
    // Revert: add back to central stock, remove from outlet stock
    await prisma.$transaction([
      prisma.item.update({
        where: { id: entry.itemId },
        data: { currentStock: { increment: entry.quantity } },
      }),
      prisma.outletStock.update({
        where: { outletId_itemId: { outletId: entry.outletId, itemId: entry.itemId } },
        data: { quantity: { decrement: entry.quantity } },
      }),
      prisma.inventoryLedger.delete({ where: { id: ledgerId } }),
    ])
  }

  revalidatePath("/dashboard/inventory")
  revalidatePath("/dashboard/inventory/stock-in")
  revalidatePath("/dashboard/inventory/dispatch")
  revalidatePath("/dashboard/stores")
}

export async function editDispatchQuantity(data: FormData) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "OWNER") {
    throw new Error("Unauthorized — only Admin Owner can edit stock entries")
  }

  const ledgerId = data.get("ledgerId") as string
  const newQuantityRaw = data.get("newQuantity") as string
  const newQuantity = parseFloat(newQuantityRaw)

  if (!ledgerId || isNaN(newQuantity) || newQuantity <= 0) return

  const entry = await prisma.inventoryLedger.findUnique({
    where: { id: ledgerId },
  })

  if (!entry || entry.type !== "DISPATCH" || !entry.outletId) return

  const diff = newQuantity - entry.quantity

  if (diff === 0) return // No change

  if (diff > 0) {
    // Dispatching MORE: Check central stock
    const item = await prisma.item.findUnique({ where: { id: entry.itemId } })
    if (!item) throw new Error("Item not found")
    if (item.currentStock < diff) {
      throw new Error(`Cannot increase dispatch. Only ${item.currentStock} ${item.unit} available.`)
    }

    await prisma.$transaction([
      prisma.item.update({
        where: { id: entry.itemId },
        data: { currentStock: { decrement: diff } },
      }),
      prisma.outletStock.update({
        where: { outletId_itemId: { outletId: entry.outletId, itemId: entry.itemId } },
        data: { quantity: { increment: diff } },
      }),
      prisma.inventoryLedger.update({
        where: { id: ledgerId },
        data: { quantity: newQuantity, notes: (entry.notes || "") + ` (Edited: was ${entry.quantity})` },
      }),
    ])
  } else {
    // Dispatching LESS: Return difference to central stock
    const absDiff = Math.abs(diff)
    await prisma.$transaction([
      prisma.item.update({
        where: { id: entry.itemId },
        data: { currentStock: { increment: absDiff } },
      }),
      prisma.outletStock.update({
        where: { outletId_itemId: { outletId: entry.outletId, itemId: entry.itemId } },
        data: { quantity: { decrement: absDiff } },
      }),
      prisma.inventoryLedger.update({
        where: { id: ledgerId },
        data: { quantity: newQuantity, notes: (entry.notes || "") + ` (Edited: was ${entry.quantity})` },
      }),
    ])
  }

  revalidatePath("/dashboard/inventory")
  revalidatePath("/dashboard/inventory/stock-in")
  revalidatePath("/dashboard/inventory/dispatch")
  revalidatePath("/dashboard/stores")
}
