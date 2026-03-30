import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('--- PURGING INVENTORY DATA FOR TESTING ---')

  // 1. Reset Central Catalog Stocks
  console.log('Zeroing Global Catalog stocks...')
  await prisma.item.updateMany({
    data: { currentStock: 0 }
  })

  // 2. Reset Outlet Stocks
  console.log('Zeroing all Outlet/Hub stocks...')
  await prisma.outletStock.updateMany({
    data: { quantity: 0 }
  })

  // 3. Clear Ledger History (Dispatches, Stock In, Consumption)
  console.log('Clearing inventory ledger history...')
  await prisma.inventoryLedger.deleteMany({})

  console.log('--- SYSTEM READY FOR TESTING ---')
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
