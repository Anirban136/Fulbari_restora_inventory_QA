"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function updateTransactionAction(tabId: string, data: { paymentMode: string, totalAmount: number, status: string }) {
  const session = await getServerSession(authOptions)
  if (!session || !["OWNER", "INV_MANAGER"].includes(session.user.role)) {
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
  revalidatePath("/cafe")
  revalidatePath("/chai")
  return { success: true }
}
