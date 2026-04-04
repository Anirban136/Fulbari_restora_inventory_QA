"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function logStockIn(data: FormData) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session.user.role !== "OWNER" && session.user.role !== "INV_MANAGER")) {
      throw new Error("Unauthorized")
    }

    const itemId = data.get("itemId") as string
    const quantityStr = data.get("quantity") as string
    const costStr = data.get("cost") as string
    const notes = (data.get("notes") as string) || ""
    const vendorId = data.get("vendorId") as string || null
    const unitType = data.get("unitType") as string

    const item = await prisma.item.findUnique({ where: { id: itemId } }) as any
    if (!item) return { error: "Item not found" }

    const quantity = parseFloat(quantityStr)
    const cost = costStr ? parseFloat(costStr) : 0

    if (isNaN(quantity) || quantity <= 0) {
      return { error: "Invalid quantity" }
    }

    const finalQuantity = unitType === "box" ? quantity * (item.piecesPerBox || 1) : quantity
    const notePrefix = unitType === "box" ? `[BOX-ENTRY: ${quantity} boxes] ` : ""

    // Transaction to update Inventory Ledger and Global Catalog
    await prisma.$transaction([
      prisma.inventoryLedger.create({
        data: {
          type: "STOCK_IN",
          itemId,
          quantity: finalQuantity,
          vendorId,
          userId: session.user.id,
          notes: `${notePrefix}Cost Info: Cost=${isNaN(cost) ? 0 : cost}. ${notes}`,
        }
      }),
      prisma.item.update({
        where: { id: itemId },
        data: {
          currentStock: { increment: finalQuantity },
          costPerUnit: isNaN(cost) ? undefined : (cost || undefined),
        }
      })
    ])

    revalidatePath("/dashboard/inventory/stock-in")
    revalidatePath("/dashboard/inventory")
    return { success: true }
  } catch (error) {
    console.error("Stock In Error:", error)
    return { error: "Failed to log intake. Please try again." }
  }
}
