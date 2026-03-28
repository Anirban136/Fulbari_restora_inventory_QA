const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding initial data...')

  // Check if already seeded to prevent unique constraint errors
  const existingOwner = await prisma.user.findFirst({ where: { role: 'OWNER' }})
  if (existingOwner) {
    console.log('Database already seeded.')
    return
  }

  // Create Outlets
  await prisma.outlet.create({
    data: { name: 'Restaurant', type: 'RESTAURANT' },
  })
  await prisma.outlet.create({
    data: { name: 'Cafe', type: 'CAFE' },
  })
  await prisma.outlet.create({
    data: { name: 'Chai Joint', type: 'CHAI_JOINT' },
  })

  // Create Users
  await prisma.user.create({
    data: {
      name: 'Admin Owner',
      email: 'owner@fulbari.com',
      pin: '1234',
      role: 'OWNER',
    },
  })

  await prisma.user.create({
    data: {
      name: 'Inventory Manager',
      pin: '2222',
      role: 'INV_MANAGER',
    },
  })

  await prisma.user.create({
    data: {
      name: 'Restaurant Staff',
      pin: '3333',
      role: 'REST_STAFF',
    },
  })

  await prisma.user.create({
    data: {
      name: 'Cafe Staff',
      pin: '4444',
      role: 'CAFE_STAFF',
    },
  })

  await prisma.user.create({
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
