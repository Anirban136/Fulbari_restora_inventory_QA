"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function dispatchStock(data: FormData): Promise<{ error?: string }> {
  const session = await getServerSession(authOptions)
  if (!session || (session.user.role !== "OWNER" && session.user.role !== "INV_MANAGER")) {
    return { error: "Unauthorized" }
  }

  const itemId = data.get("itemId") as string
  const outletId = data.get("outletId") as string
  const unitType = data.get("unitType") as string
  const quantity = parseFloat(data.get("quantity") as string)

  if (!itemId || !outletId || isNaN(quantity) || quantity <= 0) {
    return { error: "Invalid input. Please fill all fields with valid values." }
  }

  const item = await prisma.item.findUnique({ where: { id: itemId } }) as any
  if (!item) {
    return { error: "Item not found." }
  }

  const isContainer = unitType === "box" || unitType === "packet" || unitType === "plate"
  const finalQuantity = isContainer ? quantity * (item.piecesPerBox || 1) : quantity
  const notePrefix = isContainer ? `[${unitType.toUpperCase()}-DISPATCH: ${quantity} ${unitType}s] ` : ""

  if (item.currentStock < finalQuantity) {
    return {
      error: `Dispatch not possible! Requested ${finalQuantity} pieces but only ${item.currentStock} available in central stock.`
    }
  }

  // Transaction to update Central Stock, Outlet Stock, and Ledger
  await prisma.$transaction(async (tx) => {
    // 1. Decrement Central Stock
    await tx.item.update({
      where: { id: itemId },
      data: { currentStock: { decrement: finalQuantity } }
    })

    // 2. Increment Outlet Stock
    await tx.outletStock.upsert({
      where: { outletId_itemId: { outletId, itemId } },
      update: { quantity: { increment: finalQuantity } },
      create: { outletId, itemId, quantity: finalQuantity }
    })

    // 3. Create Ledger Entry
    await tx.inventoryLedger.create({
      data: {
        type: "DISPATCH",
        itemId,
        outletId,
        quantity: finalQuantity,
        userId: session.user.id,
        notes: notePrefix
      }
    })
  })

  revalidatePath("/dashboard/inventory/dispatch")
  revalidatePath("/dashboard/inventory")
  revalidatePath("/dashboard/stores")

  return {}
}
