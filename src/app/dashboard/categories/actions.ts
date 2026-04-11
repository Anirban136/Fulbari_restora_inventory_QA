"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function getAggregatedCategories() {
  const [items, menuItems] = await Promise.all([
    prisma.item.findMany({ select: { category: true } }),
    prisma.menuItem.findMany({ select: { categoryId: true } })
  ])

  const categoryMap: Record<string, { name: string, inventoryCount: number, menuCount: number }> = {}

  items.forEach(item => {
    const name = item.category || "Uncategorized"
    if (!categoryMap[name]) {
      categoryMap[name] = { name, inventoryCount: 0, menuCount: 0 }
    }
    categoryMap[name].inventoryCount++
  })

  menuItems.forEach(mi => {
    const name = mi.categoryId || "Uncategorized"
    if (!categoryMap[name]) {
      categoryMap[name] = { name, inventoryCount: 0, menuCount: 0 }
    }
    categoryMap[name].menuCount++
  })

  return Object.values(categoryMap).sort((a, b) => 
    (b.inventoryCount + b.menuCount) - (a.inventoryCount + a.menuCount)
  )
}

export async function updateCategoryLabel(oldLabel: string, newLabel: string) {
  await prisma.$transaction([
    prisma.item.updateMany({
      where: { category: oldLabel },
      data: { category: newLabel }
    }),
    prisma.menuItem.updateMany({
      where: { categoryId: oldLabel },
      data: { categoryId: newLabel }
    })
  ])
  revalidatePath("/dashboard/categories")
  revalidatePath("/dashboard/inventory")
  revalidatePath("/dashboard/menus")
}

export async function deleteCategory(label: string) {
  await prisma.$transaction([
    prisma.item.updateMany({
      where: { category: label },
      data: { category: "Uncategorized" }
    }),
    prisma.menuItem.updateMany({
      where: { categoryId: label },
      data: { categoryId: "Uncategorized" }
    })
  ])
  revalidatePath("/dashboard/categories")
  revalidatePath("/dashboard/inventory")
  revalidatePath("/dashboard/menus")
}
