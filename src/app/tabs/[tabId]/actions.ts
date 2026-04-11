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

export async function adjustTabItemQuantity(tabItemId: string, tabId: string, delta: number, pricePerUnit: number) {
  const item = await prisma.tabItem.findUnique({ where: { id: tabItemId } })
  if (!item) return

  if (item.quantity === 1 && delta === -1) {
    // If quantity is 1 and we decrement, remove it entirely
    await prisma.tabItem.delete({ where: { id: tabItemId } })
  } else {
    // Otherwise update quality
    await prisma.tabItem.update({
      where: { id: tabItemId },
      data: { quantity: { increment: delta } }
    })
  }

  // Update tab total amount
  await prisma.tab.update({
    where: { id: tabId },
    data: { totalAmount: { increment: pricePerUnit * delta } }
  })

  revalidatePath(`/tabs/${tabId}`)
}


export async function closeTab(data: FormData) {
  const tabId = data.get("tabId") as string
  const paymentMode = data.get("paymentMode") as string
  
  const tab = await prisma.tab.findUnique({ 
    where: { id: tabId }, 
    include: { 
      Outlet: true, 
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
  if (!tab) return

  // Deduct inventory for all items on the tab
  for (const tabItem of tab.Items) {
     const { MenuItem: menuItem, quantity: orderQty } = tabItem

     // 1. Handle Legacy Single-Item link (1:1)
     if (menuItem.itemId) {
       try {
         await prisma.outletStock.update({
           where: { outletId_itemId: { outletId: tab.outletId, itemId: menuItem.itemId } },
           data: { quantity: { decrement: orderQty } }
         })
         
         await prisma.inventoryLedger.create({
           data: {
             type: "CONSUMPTION",
             itemId: menuItem.itemId,
             outletId: tab.outletId,
             quantity: orderQty,
             userId: tab.userId,
             notes: `POS Direct Link Deduction (Tab ${tab.id})`
           }
         })
       } catch (e) {
         console.error("Failed to decrement direct-link inventory for", menuItem.name, e)
       }
     }

     // 2. Handle Multi-Ingredient Recipes
     if (menuItem.ingredients && menuItem.ingredients.length > 0) {
       for (const ingredient of menuItem.ingredients) {
         const totalDuction = ingredient.quantity * orderQty
         try {
           await prisma.outletStock.update({
             where: { outletId_itemId: { outletId: tab.outletId, itemId: ingredient.itemId } },
             data: { quantity: { decrement: totalDuction } }
           })

           await prisma.inventoryLedger.create({
             data: {
               type: "CONSUMPTION",
               itemId: ingredient.itemId,
               outletId: tab.outletId,
               quantity: totalDuction,
               userId: tab.userId,
               notes: `POS Recipe Deduction for ${menuItem.name} (Tab ${tab.id})`
             }
           })
         } catch (e) {
           console.error(`Failed to deduct recipe ingredient (${ingredient.itemId}) for ${menuItem.name}`, e)
         }
       }
     }
  }

  // Generate token number for CAFE (daily auto-increment) if none exists
  let tokenNumber: number | null = tab.tokenNumber
  if (!tokenNumber && tab.Outlet.type === "CAFE") {
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
  const tab = await prisma.tab.findUnique({ 
    where: { id: tabId }, 
    include: { 
      Outlet: true, 
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
  if (!tab || tab.status !== "CLOSED") return

  // Reverse inventory deductions (Both Legacy and Recipes)
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
             userId: tab.userId,
             notes: `Tab Re-opened Reversal (Tab ${tab.id})`
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
               userId: tab.userId,
               notes: `Recipe Reversal for ${menuItem.name} (Tab ${tab.id})`
             }
           })
         } catch (e) {
           console.error(`Failed to revert recipe ingredient (${ingredient.itemId}) for ${menuItem.name}`, e)
         }
       }
     }
  }

  await prisma.tab.update({
    where: { id: tabId },
    data: {
      status: "OPEN",
      closedAt: null
    }
  })

  // We are already in server action, next/navigation redirect works here
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
