"use server"

import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function changeUserPin(currentPin: string, newPin: string) {
  const session = await getServerSession(authOptions)
  if (!session) throw new Error("Unauthorized")

  const user = await prisma.user.findUnique({ where: { id: session.user.id } })
  if (!user || user.pin !== currentPin) {
    throw new Error("Incorrect current PIN.")
  }

  // Ensure new PIN is exactly 4 digits.
  if (!/^\d{4}$/.test(newPin)) {
    throw new Error("New PIN must be exactly 4 digits.")
  }

  // Ensure new PIN is not used by anyone else
  const existing = await prisma.user.findFirst({ where: { pin: newPin } })
  if (existing) {
    throw new Error("This PIN is already in use by another staff member.")
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { pin: newPin }
  })

  return { success: true }
}
