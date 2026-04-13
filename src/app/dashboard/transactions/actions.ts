"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function updateTransactionAction(tabId: string, data: { paymentMode: string, totalAmount: number, status: string }) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "OWNER") {
    throw new Error("Unauthorized")
  }

  await prisma.tab.update({
    where: { id: tabId },
    data: {
      paymentMode: data.paymentMode,
      totalAmount: data.totalAmount,
      status: data.status,
    }
  })

  revalidatePath("/dashboard/transactions")
  revalidatePath("/dashboard")
  return { success: true }
}

export async function deleteClosedTab(tabId: string) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "OWNER") {
    throw new Error("Unauthorized")
  }

  const tab = await prisma.tab.findUnique({
    where: { id: tabId },
    include: {
      Items: {
        include: {
          MenuItem: {
            include: {
              ingredients: true
            }
          }
        }
      }
    }
  })

  if (!tab) throw new Error("Transaction not found")

  // Reverse inventory deductions (Copying logic from reopenTab)
  for (const tabItem of tab.Items) {
    const { MenuItem: menuItem, quantity: orderQty } = tabItem

    // 1. Revert Legacy Single-Item link
    if (menuItem.itemId) {
      try {
        await prisma.outletStock.update({
          where: { outletId_itemId: { outletId: tab.outletId, itemId: menuItem.itemId } },
          data: { quantity: { increment: orderQty } }
        })
        
        await prisma.inventoryLedger.create({
          data: {
            type: "REVERSAL",
            itemId: menuItem.itemId,
            outletId: tab.outletId,
            quantity: orderQty,
            userId: session.user.id,
            notes: `DELETED Transaction Reversal (Tab ${tab.id})`
          }
        })
      } catch (e) {
        console.error("Failed to increment inventory for reversal", menuItem.name, e)
      }
    }

    // 2. Revert Multi-Ingredient Recipes
    if (menuItem.ingredients && menuItem.ingredients.length > 0) {
      for (const ingredient of menuItem.ingredients) {
        const totalReversal = ingredient.quantity * orderQty
        try {
          await prisma.outletStock.update({
            where: { outletId_itemId: { outletId: tab.outletId, itemId: ingredient.itemId } },
            data: { quantity: { increment: totalReversal } }
          })

          await prisma.inventoryLedger.create({
            data: {
              type: "REVERSAL",
              itemId: ingredient.itemId,
              outletId: tab.outletId,
              quantity: totalReversal,
              userId: session.user.id,
              notes: `Recipe Deletion Reversal for ${menuItem.name} (Tab ${tab.id})`
            }
          })
        } catch (e) {
          console.error(`Failed to revert recipe ingredient (${ingredient.itemId}) for ${menuItem.name}`, e)
        }
      }
    }
  }

  // Delete the record
  await prisma.tab.delete({
    where: { id: tabId }
  })

  revalidatePath("/dashboard/transactions")
  revalidatePath("/dashboard")
  return { success: true }
}
