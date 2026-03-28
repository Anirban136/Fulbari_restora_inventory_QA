"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function logStockIn(data: FormData) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user.role !== "OWNER" && session.user.role !== "INV_MANAGER")) {
    throw new Error("Unauthorized")
  }

  const itemId = data.get("itemId") as string
  const quantity = parseFloat(data.get("quantity") as string)
  const cost = parseFloat(data.get("cost") as string || "0")
  const notes = data.get("notes") as string

  if (!itemId || isNaN(quantity) || quantity <= 0) return

  // Transaction to update Inventory Ledger and Global Catalog
  await prisma.$transaction([
    prisma.inventoryLedger.create({
      data: {
        type: "STOCK_IN",
        itemId,
        quantity,
        userId: session.user.id,
        notes: `Vendor/Cost Info: Cost=${cost}. ${notes}`,
      }
    }),
    prisma.item.update({
      where: { id: itemId },
      data: {
        currentStock: { increment: quantity },
        costPerUnit: cost || undefined,
      }
    })
  ])

  revalidatePath("/dashboard/inventory/stock-in")
  revalidatePath("/dashboard/inventory")
}
