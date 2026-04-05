import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding initial data...')

  // Create Outlets
  const restaurant = await prisma.outlet.create({
    data: { name: 'Restaurant', type: 'RESTAURANT' },
  })
  const cafe = await prisma.outlet.create({
    data: { name: 'Cafe', type: 'CAFE' },
  })
  const chaiJoint = await prisma.outlet.create({
    data: { name: 'Chai Joint', type: 'CHAI_JOINT' },
  })

  // Create Users
  const owner = await prisma.user.create({
    data: {
      name: 'Admin Owner',
      email: 'owner@fulbari.com',
      pin: '1234',
      role: 'OWNER',
    },
  })

  const invManager = await prisma.user.create({
    data: {
      name: 'Inventory Manager',
      pin: '2222',
      role: 'INV_MANAGER',
    },
  })

  const restStaff = await prisma.user.create({
    data: {
      name: 'Restaurant Staff',
      pin: '3333',
      role: 'REST_STAFF',
    },
  })

  const cafeStaff = await prisma.user.create({
    data: {
      name: 'Cafe Staff',
      pin: '4444',
      role: 'CAFE_STAFF',
    },
  })

  const chaiStaff = await prisma.user.create({
    data: {
      name: 'Chai Staff',
      pin: '5555',
      role: 'CHAI_STAFF',
    },
  })

  console.log('Seeding finished.')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
