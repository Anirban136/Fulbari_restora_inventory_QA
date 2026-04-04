import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { revalidatePath } from "next/cache"

export async function wipeTestData() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "OWNER") {
    throw new Error("Unauthorized: Only Owner can wipe data")
  }

  // Delete operational data first to avoid foreign key constraints
  await prisma.$transaction([
    prisma.tabItem.deleteMany(),
    prisma.tab.deleteMany(),
    prisma.vendorPayment.deleteMany(),
    prisma.inventoryLedger.deleteMany(),
    prisma.outletStock.deleteMany(),
    prisma.menuItem.deleteMany(),
    prisma.item.deleteMany(),
    prisma.vendor.deleteMany(),
  ])

  revalidatePath("/")
  revalidatePath("/dashboard")
}
