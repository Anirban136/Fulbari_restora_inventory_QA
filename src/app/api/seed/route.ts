import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const existingOwner = await prisma.user.findFirst({ where: { role: 'OWNER' }});
    if (existingOwner) {
      return NextResponse.json({ message: "Database already seeded." });
    }

    // Create Outlets
    await prisma.outlet.create({ data: { name: 'Restaurant', type: 'RESTAURANT' }})
    await prisma.outlet.create({ data: { name: 'Cafe', type: 'CAFE' }})
    await prisma.outlet.create({ data: { name: 'Chai Joint', type: 'CHAI_JOINT' }})

    // Create Users
    await prisma.user.create({ data: { name: 'Admin Owner', email: 'owner@fulbari.com', pin: '1234', role: 'OWNER' }})
    await prisma.user.create({ data: { name: 'Inventory Manager', pin: '2222', role: 'INV_MANAGER' }})
    await prisma.user.create({ data: { name: 'Restaurant Staff', pin: '3333', role: 'REST_STAFF' }})
    await prisma.user.create({ data: { name: 'Cafe Staff', pin: '4444', role: 'CAFE_STAFF' }})
    await prisma.user.create({ data: { name: 'Chai Staff', pin: '5555', role: 'CHAI_STAFF' }})

    return NextResponse.json({ message: "Seeding finished successfully!" })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
