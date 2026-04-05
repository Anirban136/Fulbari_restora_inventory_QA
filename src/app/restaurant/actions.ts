"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function consumeStock(data: FormData) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "REST_STAFF") {
    throw new Error("Unauthorized")
  }

  const itemId = data.get("itemId") as string
  const quantity = parseFloat(data.get("quantity") as string)

  if (!itemId || isNaN(quantity) || quantity <= 0) return

  const restaurant = await prisma.outlet.findFirst({ where: { type: "RESTAURANT" }})
  if (!restaurant) return

  const stock = await prisma.outletStock.findUnique({
    where: { outletId_itemId: { outletId: restaurant.id, itemId } }
  })

  if (!stock || stock.quantity < quantity) {
    throw new Error("Insufficient local stock to consume.")
  }

  await prisma.$transaction([
    prisma.outletStock.update({
      where: { outletId_itemId: { outletId: restaurant.id, itemId } },
      data: { quantity: { decrement: quantity } }
    }),
    prisma.inventoryLedger.create({
      data: {
        type: "CONSUMPTION",
        itemId,
        outletId: restaurant.id,
        quantity,
        userId: session.user.id,
      }
    })
  ])

  revalidatePath("/restaurant")
}
