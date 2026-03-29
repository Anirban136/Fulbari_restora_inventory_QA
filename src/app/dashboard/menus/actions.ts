"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function addMenuItem(data: FormData) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "OWNER") {
    throw new Error("Unauthorized")
  }

  const outletId = data.get("outletId") as string
  const name = data.get("name") as string
  const price = parseFloat(data.get("price") as string)
  const categoryId = (data.get("category") as string)?.toUpperCase().trim() || "GENERAL"
  const itemId = data.get("itemId") as string

  if (!outletId || !name || isNaN(price)) return

  await prisma.menuItem.create({
    data: {
      outletId,
      name,
      price,
      categoryId: categoryId,
      itemId: itemId || null, // Optional link to central catalog
    }
  })

  revalidatePath("/dashboard/menus")
}

export async function toggleMenuItem(menuItemId: string, isAvailable: boolean) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "OWNER") throw new Error("Unauthorized")

  await prisma.menuItem.update({
    where: { id: menuItemId },
    data: { isAvailable: !isAvailable }
  })

  revalidatePath("/dashboard/menus")
}
