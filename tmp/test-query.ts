import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Testing MenusPage Prisma Query...')
  try {
    const outlets = await prisma.outlet.findMany({
      where: { type: { in: ["CAFE", "CHAI_JOINT"] } },
      orderBy: { name: 'asc' }
    })
    console.log(`Found ${outlets.length} outlets.`)

    const menuItems = await prisma.menuItem.findMany({
      include: { Outlet: true, ingredients: true },
      orderBy: [ { Outlet: { name: 'asc' } }, { categoryId: 'asc' }, { name: 'asc' } ]
    })
    console.log(`Found ${menuItems.length} menu items.`)
    console.log('Query successful!')
  } catch (error) {
    console.error('Query failed:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()
