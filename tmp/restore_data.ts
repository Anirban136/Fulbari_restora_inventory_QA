import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('--- RECONSTRUCTING DATABASE ---')

  // 1. Create Outlets
  console.log('Restoring Outlets...')
  const restaurant = await prisma.outlet.upsert({
    where: { id: 'rest_1' }, // Dummy ID for tracking if needed
    update: {},
    create: { name: 'Restaurant', type: 'RESTAURANT' },
  })
  const cafe = await prisma.outlet.upsert({
    where: { id: 'cafe_1' },
    update: {},
    create: { name: 'Cafe', type: 'CAFE' },
  })
  const chaiJoint = await prisma.outlet.upsert({
    where: { id: 'chai_1' },
    update: {},
    create: { name: 'Chai Joint', type: 'CHAI_JOINT' },
  })

  // 2. Create Users
  console.log('Restoring Users...')
  await prisma.user.createMany({
    data: [
      { name: 'Admin Owner', email: 'owner@fulbari.com', pin: '1234', role: 'OWNER' },
      { name: 'Inventory Manager', pin: '2222', role: 'INV_MANAGER' },
      { name: 'Restaurant Staff', pin: '3333', role: 'REST_STAFF' },
      { name: 'Cafe Staff', pin: '4444', role: 'CAFE_STAFF' },
      { name: 'Chai Staff', pin: '5555', role: 'CHAI_STAFF' },
    ],
    skipDuplicates: true,
  })

  // 3. Create Vendor
  const vendor = await prisma.vendor.create({
    data: { name: 'Das Cigarette' }
  })

  // 4. Restore Items (Based on screenshot media__1774904305368.jpg)
  console.log('Restoring Global Catalog Items & Stock...')
  const items = [
    { name: 'Baby Corn', unit: 'Kg', currentStock: 3 },
    { name: 'Bread', unit: 'slices', currentStock: 50 },
    { name: 'Burger Buns', unit: 'pieces', currentStock: 70 },
    { name: 'Burger Patties', unit: 'pieces', currentStock: 70 },
    { name: 'Cheese', unit: 'slices', currentStock: 0 },
    { name: 'Chicken', unit: 'kg', currentStock: 550 },
    { name: 'Classic Verve', unit: '20', currentStock: 160 },
    { name: 'Milk', unit: 'LITRE', currentStock: 59 },
    { name: 'Cigarettes', unit: 'PACKETS', currentStock: 100 },
    { name: 'Curd', unit: 'KG', currentStock: 100 },
    { name: 'Soda Water', unit: 'LITRE', currentStock: 100 },
    { name: 'Fish Balls', unit: 'PACKETS', currentStock: 100 },
  ]

  for (const item of items) {
    await prisma.item.create({
      data: item
    })
  }

  // Restore the one with Vendor
  await prisma.item.create({
    data: {
      name: 'cigarette(12rs)',
      unit: 'piece',
      currentStock: 300,
      vendorId: vendor.id,
      vendor: 'Das Cigarette'
    }
  })

  console.log('--- RECONSTRUCTION COMPLETE ---')
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
