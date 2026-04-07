"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function logWaste(data: FormData) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session.user.role !== "OWNER" && session.user.role !== "INV_MANAGER")) {
      throw new Error("Unauthorized")
    }

    const itemId = data.get("itemId") as string
    const quantityStr = data.get("quantity") as string
    const notes = (data.get("notes") as string) || "Discarded / Spoilage"
    const vendorId = data.get("vendorId") as string || null
    const unitType = data.get("unitType") as string

    const item = await prisma.item.findUnique({ where: { id: itemId } }) as any
    if (!item) return { error: "Item not found" }

    const quantity = parseFloat(quantityStr)

    if (isNaN(quantity) || quantity <= 0) {
      return { error: "Invalid quantity" }
    }

    const piecesPerBox = item.piecesPerBox || 1
    const isContainer = unitType === "box" || unitType === "packet" || unitType === "plate"
    const finalQuantity = isContainer ? quantity * piecesPerBox : quantity
    
    const notePrefix = isContainer ? `[${unitType.toUpperCase()}-ENTRY: ${quantity} ${unitType}s] ` : ""

    // Transaction to update Inventory Ledger and deduct from Global Catalog
    await prisma.$transaction([
      prisma.inventoryLedger.create({
        data: {
          type: "WASTE",
          itemId,
          quantity: finalQuantity,
          vendorId,
          userId: session.user.id,
          notes: `${notePrefix}${notes}`,
        }
      }),
      prisma.item.update({
        where: { id: itemId },
        data: {
          currentStock: { decrement: finalQuantity },
        }
      })
    ])

    revalidatePath("/dashboard/inventory/waste")
    revalidatePath("/dashboard/inventory")
    return { success: true }
  } catch (error) {
    console.error("Waste Logging Error:", error)
    return { error: "Failed to log waste. Please try again." }
  }
}

export async function revertWasteEntry(data: FormData) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "OWNER") throw new Error("Unauthorized")

  const ledgerId = data.get("ledgerId") as string
  if (!ledgerId) return

  const entry = await prisma.inventoryLedger.findUnique({ where: { id: ledgerId } })
  if (!entry || entry.type !== "WASTE") return

  // Revert: give stock back, delete ledger
  await prisma.$transaction([
    prisma.item.update({
      where: { id: entry.itemId },
      data: { currentStock: { increment: entry.quantity } }
    }),
    prisma.inventoryLedger.delete({ where: { id: ledgerId } })
  ])

  revalidatePath("/dashboard/inventory/waste")
  revalidatePath("/dashboard/inventory")
}
