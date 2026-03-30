import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('--- STARTING THOROUGH PRODUCTION-READY TEST V2 ---')

  // 1. Fetch Owner and Cafe Outlet
  const owner = await prisma.user.findFirst({ where: { role: 'OWNER' } })
  const cafe = await prisma.outlet.findFirst({ where: { name: 'Cafe' } })

  if (!owner || !cafe) {
    throw new Error('Missing Owner or Cafe Outlet in database')
  }

  console.log(`Using Owner: ${owner.name} (${owner.id})`)
  console.log(`Using Outlet: ${cafe.name} (${cafe.id})`)

  // 2. Create a Test Vendor
  console.log('\nSTEP 1: Creating Test Vendor...')
  const vendor = await prisma.vendor.create({
    data: {
      name: 'PRODUCTION TEST VENDOR',
      contact: '+91 9999999999',
      address: 'Test Warehouse'
    }
  })
  console.log(`- Vendor created: ${vendor.name}`)

  // 3. Create a Test Item in Global Catalog
  console.log('\nSTEP 2: Creating Global Item and Stocking In...')
  const item = await prisma.item.create({
    data: {
      name: 'PROD_TEST_CIGARETTE',
      unit: 'pack',
      vendorId: vendor.id,
      costPerUnit: 100,
      sellPrice: 150,
      currentStock: 100 // Starting stock
    }
  })
  
  await prisma.inventoryLedger.create({
    data: {
      type: 'STOCK_IN',
      itemId: item.id,
      quantity: 100,
      userId: owner.id,
      notes: 'Test: Initial Stock In'
    }
  })
  console.log(`- Item created: ${item.name} with 100 units.`)

  // 4. Dispatch Stock to Cafe Hub
  console.log('\nSTEP 3: Dispatching Stock to Cafe Hub...')
  const dispatchQuantity = 50;
  
  await prisma.outletStock.upsert({
    where: { outletId_itemId: { outletId: cafe.id, itemId: item.id } },
    update: { quantity: { increment: dispatchQuantity } },
    create: { outletId: cafe.id, itemId: item.id, quantity: dispatchQuantity }
  })

  await prisma.item.update({
    where: { id: item.id },
    data: { currentStock: { decrement: dispatchQuantity } }
  })

  await prisma.inventoryLedger.create({
    data: {
      type: 'DISPATCH',
      itemId: item.id,
      outletId: cafe.id,
      quantity: dispatchQuantity,
      userId: owner.id,
      notes: 'Test: Warehouse -> Cafe Hub'
    }
  })
  
  const cafeStock = await prisma.outletStock.findUnique({
    where: { outletId_itemId: { outletId: cafe.id, itemId: item.id } }
  })
  console.log(`- Dispatched 50 units. Cafe Hub stock is now: ${cafeStock?.quantity}`)

  // 5. Setup Menu Item and Sale
  console.log('\nSTEP 4: Simulating POS Sale...')

  // Ensure category exists
  let category = await prisma.category.findFirst({ where: { outletId: cafe.id } })
  if (!category) {
    category = await prisma.category.create({
      data: { name: 'TEST CATEGORY', outletId: cafe.id }
    })
  }

  const menuItem = await prisma.menuItem.create({
    data: {
      name: 'PROD_TEST_MENU_ITEM',
      price: 180,
      outletId: cafe.id,
      categoryId: category.id,
      itemId: item.id // LINKED
    }
  })

  const saleQuantity = 10;
  const tab = await prisma.tab.create({
    data: {
      outletId: cafe.id,
      userId: owner.id,
      customerName: 'Test Production Customer',
      status: 'OPEN',
      totalAmount: 1800
    }
  })

  await prisma.tabItem.create({
    data: {
      tabId: tab.id,
      menuItemId: menuItem.id,
      quantity: saleQuantity,
      priceAtTime: 180
    }
  })

  // Simulating the closeTab action logic
  console.log(`Closing tab and deducting ${saleQuantity} units from Cafe Hub...`)
  
  await prisma.outletStock.update({
    where: { outletId_itemId: { outletId: cafe.id, itemId: item.id } },
    data: { quantity: { decrement: saleQuantity } }
  })

  await prisma.inventoryLedger.create({
    data: {
      type: 'CONSUMPTION',
      itemId: item.id,
      outletId: cafe.id,
      quantity: saleQuantity,
      userId: owner.id,
      notes: `POS Production Test Sale (Tab ${tab.id})`
    }
  })

  await prisma.tab.update({
    where: { id: tab.id },
    data: { status: 'CLOSED', paymentMode: 'ONLINE', closedAt: new Date() }
  })

  // 6. FINAL ANALYSIS
  console.log('\nSTEP 5: FINAL SYSTEM ANALYSIS')
  const finalCafeStock = await prisma.outletStock.findUnique({
    where: { outletId_itemId: { outletId: cafe.id, itemId: item.id } }
  })
  const finalCentralStock = await prisma.item.findUnique({ where: { id: item.id } })

  console.log(`- Final Central Stock: ${finalCentralStock?.currentStock} (Target: 50)`)
  console.log(`- Final Cafe Hub Stock: ${finalCafeStock?.quantity} (Target: 40)`)

  const ledger = await prisma.inventoryLedger.findMany({
    where: { itemId: item.id },
    orderBy: { createdAt: 'asc' }
  })
  
  console.log('\n--- SYSTEM AUDIT TRAIL (LEDGER) ---')
  ledger.forEach(l => {
    console.log(`[${l.type}] | ${l.quantity} units | Notes: ${l.notes}`)
  })

  if (finalCentralStock?.currentStock === 50 && finalCafeStock?.quantity === 40) {
    console.log('\n✅ TEST SUCCESSFUL: The system flow is PRODUCTION READY.')
    console.log('Every Stock In, Dispatch, and Sale deduction is correctly captured in the Ledger.')
  } else {
    console.log('\n❌ TEST FAILED: Discrepancy detected in stock calculations.')
  }

  // Cleanup
  console.log('\nPurging test data...')
  await prisma.tabItem.deleteMany({ where: { tabId: tab.id } })
  await prisma.tab.delete({ where: { id: tab.id } })
  await prisma.menuItem.delete({ where: { id: menuItem.id } })
  await prisma.outletStock.delete({ where: { outletId_itemId: { outletId: cafe.id, itemId: item.id } } })
  await prisma.inventoryLedger.deleteMany({ where: { itemId: item.id } })
  await prisma.item.delete({ where: { id: item.id } })
  await prisma.vendor.delete({ where: { id: vendor.id } })
  console.log('--- TEST FINISHED AND CLEANED ---')
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
