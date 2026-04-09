"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { getISTDateBounds } from "@/lib/utils"

export async function addTabItem(tabId: string, menuItemId: string, price: number, forcedQuantity: number = 1) {
  // Check if it already exists to increment quantity instead
  const existingItem = await prisma.tabItem.findFirst({
    where: { tabId, menuItemId }
  })

  if (existingItem) {
    await prisma.tabItem.update({
      where: { id: existingItem.id },
      data: { quantity: { increment: forcedQuantity } }
    })
  } else {
    await prisma.tabItem.create({
      data: { tabId, menuItemId, priceAtTime: price, quantity: forcedQuantity }
    })
  }

  // Update tab total
  await prisma.tab.update({
    where: { id: tabId },
    data: { totalAmount: { increment: price * forcedQuantity } }
  })

  revalidatePath(`/tabs/${tabId}`)
}

export async function removeTabItem(tabItemId: string, tabId: string, priceDesc: number) {
  await prisma.tabItem.delete({ where: { id: tabItemId } })
  
  await prisma.tab.update({
    where: { id: tabId },
    data: { totalAmount: { decrement: priceDesc } }
  })

  revalidatePath(`/tabs/${tabId}`)
}

export async function closeTab(data: FormData) {
  const tabId = data.get("tabId") as string
  const paymentMode = data.get("paymentMode") as string
  
  const tab = await prisma.tab.findUnique({ where: { id: tabId }, include: { Outlet: true, Items: { include: { MenuItem: true } } }})
  if (!tab) return

  // Deduct inventory if items are linked to Central Catalog
  for (const item of tab.Items) {
     if (item.MenuItem.itemId) {
       // Attempt to consume outlet stock
       try {
         await prisma.outletStock.update({
           where: { outletId_itemId: { outletId: tab.outletId, itemId: item.MenuItem.itemId } },
           data: { quantity: { decrement: item.quantity } }
         })
         
         await prisma.inventoryLedger.create({
           data: {
             type: "CONSUMPTION",
             itemId: item.MenuItem.itemId,
             outletId: tab.outletId,
             quantity: item.quantity,
             userId: tab.userId,
             notes: `POS Sales Consumption (Tab ${tab.id})`
           }
         })
       } catch (e) {
         console.error("Failed to decrement inventory for", item.MenuItem.name, e)
       }
     }
  }

  // Generate token number for CAFE (daily auto-increment)
  let tokenNumber: number | null = null
  if (tab.Outlet.type === "CAFE") {
    const { startUTC: todayStart } = getISTDateBounds()
    
    const lastToken = await prisma.tab.findFirst({
      where: {
        outletId: tab.outletId,
        tokenNumber: { not: null },
        openedAt: { gte: todayStart }
      },
      orderBy: { tokenNumber: 'desc' }
    })
    
    tokenNumber = (lastToken?.tokenNumber || 0) + 1
  }

  await prisma.tab.update({
    where: { id: tabId },
    data: {
      status: "CLOSED",
      paymentMode,
      tokenNumber,
      closedAt: new Date()
    }
  })

  revalidatePath(`/tabs/${tabId}`)
  revalidatePath(`/tabs`)
  revalidatePath(`/cafe`)
  revalidatePath(`/chai`)
  revalidatePath(`/dashboard`)
}

export async function reopenTab(tabId: string) {
  const tab = await prisma.tab.findUnique({ where: { id: tabId }, include: { Outlet: true, Items: { include: { MenuItem: true } } }})
  if (!tab || tab.status !== "CLOSED") return

  // Reverse inventory deductions
  for (const item of tab.Items) {
     if (item.MenuItem.itemId) {
       try {
         await prisma.outletStock.update({
           where: { outletId_itemId: { outletId: tab.outletId, itemId: item.MenuItem.itemId } },
           data: { quantity: { increment: item.quantity } }
         })
         
         await prisma.inventoryLedger.create({
           data: {
             type: "REVERSAL",
             itemId: item.MenuItem.itemId,
             outletId: tab.outletId,
             quantity: item.quantity,
             userId: tab.userId,
             notes: `Tab Re-opened Reversal (Tab ${tab.id})`
           }
         })
       } catch (e) {
         console.error("Failed to increment inventory for reversal", item.MenuItem.name, e)
       }
     }
  }

  await prisma.tab.update({
    where: { id: tabId },
    data: {
      status: "OPEN",
      paymentMode: null,
      closedAt: null
    }
  })

  redirect(`/tabs/${tabId}`)
}

export async function updateTab(tabId: string, totalAmount: number, paymentMode: string) {
  await prisma.tab.update({
    where: { id: tabId },
    data: { 
      totalAmount,
      paymentMode
    }
  })
  
  revalidatePath('/dashboard')
  revalidatePath('/cafe')
  revalidatePath('/chai')
  revalidatePath(`/tabs/${tabId}`)
}
