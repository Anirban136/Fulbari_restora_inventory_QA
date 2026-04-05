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
<<<<<<< HEAD
    const inputCost = costStr ? parseFloat(costStr) : 0
=======
    const cost = costStr ? parseFloat(costStr) : 0
>>>>>>> e6b0872507fa39290faeb12e670b353a0ac202ee

    if (isNaN(quantity) || quantity <= 0) {
      return { error: "Invalid quantity" }
    }

<<<<<<< HEAD
    const piecesPerBox = item.piecesPerBox || 1
    const finalQuantity = unitType === "box" ? quantity * piecesPerBox : quantity
    const unitCost = unitType === "box" ? inputCost / piecesPerBox : inputCost
    
    const notePrefix = unitType === "box" ? `[BOX-ENTRY: ${quantity} boxes @ ₹${inputCost}/box] ` : ""
=======
    const finalQuantity = unitType === "box" ? quantity * (item.piecesPerBox || 1) : quantity
    const notePrefix = unitType === "box" ? `[BOX-ENTRY: ${quantity} boxes] ` : ""
>>>>>>> e6b0872507fa39290faeb12e670b353a0ac202ee

    // Transaction to update Inventory Ledger and Global Catalog
    await prisma.$transaction([
      prisma.inventoryLedger.create({
        data: {
          type: "STOCK_IN",
          itemId,
          quantity: finalQuantity,
          vendorId,
          userId: session.user.id,
<<<<<<< HEAD
          notes: `${notePrefix}Cost Info: Cost=${isNaN(unitCost) ? 0 : unitCost.toFixed(4)}. ${notes}`,
=======
          notes: `${notePrefix}Cost Info: Cost=${isNaN(cost) ? 0 : cost}. ${notes}`,
>>>>>>> e6b0872507fa39290faeb12e670b353a0ac202ee
        }
      }),
      prisma.item.update({
        where: { id: itemId },
        data: {
          currentStock: { increment: finalQuantity },
<<<<<<< HEAD
          costPerUnit: isNaN(unitCost) ? undefined : (unitCost || undefined),
=======
          costPerUnit: isNaN(cost) ? undefined : (cost || undefined),
>>>>>>> e6b0872507fa39290faeb12e670b353a0ac202ee
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
