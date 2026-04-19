"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"

export async function createTab(data: FormData) {
  const session = await getServerSession(authOptions)
  if (!session || !["CAFE_STAFF", "CHAI_STAFF", "OWNER"].includes(session.user.role)) {
    throw new Error("Unauthorized")
  }

  const customerName = data.get("customerName") as string
  const tableName = data.get("tableName") as string
  const explicitOutletId = data.get("outletId") as string

  let outlet;
  if (explicitOutletId) {
    outlet = await prisma.outlet.findUnique({ where: { id: explicitOutletId } })
  } else {
    const roleTypeMap: Record<string, string> = { CAFE_STAFF: "CAFE", CHAI_STAFF: "CHAI_JOINT" } 
    // Owner is edge case, we'll assign to first available outlet or infer for simplicity
    const outletSearch = session.user.role === "OWNER" ? {} : { type: roleTypeMap[session.user.role] }
    outlet = await prisma.outlet.findFirst({ where: outletSearch })
  }

  if (!outlet) throw new Error("Outlet not found")

  // By-passing strict typing using any, since Windows locks the query engine preventing prisma generate
  const tab = await (prisma.tab as any).create({
    data: {
      outletId: outlet.id,
      userId: session.user.id,
      customerName: customerName || "Walk-in",
      tableName: tableName || null,
      status: "OPEN",
    }
  })

  redirect(`/tabs/${tab.id}`)
}

export async function cancelTab(tabId: string) {
  const session = await getServerSession(authOptions)
  if (!session || !["OWNER", "CAFE_STAFF", "CHAI_STAFF"].includes(session.user.role)) {
    throw new Error("Unauthorized")
  }

  console.log(`Cancelling tab: ${tabId} by ${session.user.name}`)
  
  await prisma.tab.update({ 
    where: { id: tabId }, 
    data: { status: "CANCELLED", closedAt: new Date() } 
  })

  revalidatePath("/tabs")
  revalidatePath("/cafe")
  revalidatePath("/chai")
  revalidatePath("/dashboard")
}

export async function finalizeTab(tabId: string) {
  await prisma.tab.update({
    where: { id: tabId },
    data: { status: "CLOSED" }
  })
  
  revalidatePath("/tabs")
  revalidatePath("/cafe")
  revalidatePath("/chai")
  revalidatePath("/dashboard")
}

