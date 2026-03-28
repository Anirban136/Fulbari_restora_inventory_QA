"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function addItem(data: FormData) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user.role !== "OWNER" && session.user.role !== "INV_MANAGER")) {
    throw new Error("Unauthorized")
  }

  const name = data.get("name") as string
  const unit = data.get("unit") as string
  const vendor = data.get("vendor") as string

  await prisma.item.create({
    data: { name, unit, vendor },
  })

  revalidatePath("/dashboard/inventory")
}
