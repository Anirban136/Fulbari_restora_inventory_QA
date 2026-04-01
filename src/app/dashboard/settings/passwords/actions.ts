"use server"

import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { revalidatePath } from "next/cache"

export async function updateUserPinAdmin(targetUserId: string, newPin: string) {
  const session = await getServerSession(authOptions)
  
  if (!session || session.user.role !== "OWNER") {
    throw new Error("Unauthorized: Only Admins can change user PINs.")
  }

  // Ensure new PIN is exactly 4 digits.
  if (!/^\d{4}$/.test(newPin)) {
    throw new Error("PIN must be exactly 4 digits.")
  }

  // Ensure new PIN is not used by anyone else
  const existing = await prisma.user.findFirst({ 
    where: { 
      pin: newPin,
      id: { not: targetUserId }
    } 
  })
  if (existing) {
    throw new Error("This PIN is already in use by another user.")
  }

  await prisma.user.update({
    where: { id: targetUserId },
    data: { pin: newPin }
  })

  revalidatePath("/dashboard/settings/passwords")
  return { success: true }
}
