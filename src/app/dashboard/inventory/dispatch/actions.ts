"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function dispatchStock(data: FormData) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user.role !== "OWNER" && session.user.role !== "INV_MANAGER")) {
    throw new Error("Unauthorized")
  }

  const itemId = data.get("itemId") as string
  const outletId = data.get("outletId") as string
  const quantity = parseFloat(data.get("quantity") as string)

  if (!itemId || !outletId || isNaN(quantity) || quantity <= 0) return

  const item = await prisma.item.findUnique({ where: { id: itemId }})
  if (!item || item.currentStock < quantity) {
    throw new Error("Insufficient central stock.")
  }

  // Transaction to update Central Stock, Outlet Stock, and Ledger
  await prisma.$transaction(async (tx) => {
    // 1. Decrement Central Stock
    await tx.item.update({
      where: { id: itemId },
      data: { currentStock: { decrement: quantity } }
    })

    // 2. Increment Outlet Stock
    await tx.outletStock.upsert({
      where: { outletId_itemId: { outletId, itemId } },
      update: { quantity: { increment: quantity } },
      create: { outletId, itemId, quantity }
    })

    // 3. Create Ledger Entry
    await tx.inventoryLedger.create({
      data: {
        type: "DISPATCH",
        itemId,
        outletId,
        quantity,
        userId: session.user.id,
      }
    })
  })

  revalidatePath("/dashboard/inventory/dispatch")
  revalidatePath("/dashboard/inventory")
  revalidatePath("/dashboard/stores")
}
