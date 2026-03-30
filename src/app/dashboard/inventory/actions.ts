"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function addItem(data: FormData) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user.role !== "OWNER" && session.user.role !== "INV_MANAGER")) {
    throw new Error("Unauthorized")
  }

  const name = data.get("name") as string
  const unit = data.get("unit") as string
  const vendor = data.get("vendor") as string
  const costPerUnitRaw = data.get("costPerUnit") as string
  const costPerUnit = costPerUnitRaw ? parseFloat(costPerUnitRaw) : null

  await prisma.item.create({
    data: { name, unit, vendor, costPerUnit },
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
