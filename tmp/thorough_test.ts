import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('--- STARTING THOROUGH PRODUCTION-READY TEST ---')

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
      name: 'Test Production Supplier',
      contact: '+91 0000000000',
      address: 'Test Warehouse 1'
    }
  })
  console.log(`- Vendor created: ${vendor.name}`)

  // 3. Create a Test Item in Global Catalog
  console.log('\nSTEP 2: Creating Global Item and Stocking In...')
  const item = await prisma.item.create({
    data: {
      name: 'PRODUCTION TEST ITEM',
      unit: 'pcs',
      vendorId: vendor.id,
      costPerUnit: 10,
      sellPrice: 20,
      currentStock: 100 // Start with 100
    }
  })
  
  await prisma.inventoryLedger.create({
    data: {
      type: 'STOCK_IN',
      itemId: item.id,
      quantity: 100,
      userId: owner.id,
      notes: 'Initial Stock In for Production Testing'
    }
  })
  console.log(`- Item created: ${item.name} with 100 units central stock.`)

  // 4. Dispatch Stock to Cafe Hub
  console.log('\nSTEP 3: Dispatching Stock to Cafe Hub...')
  const dispatchQuantity = 50;
  
  // Create or Update Outlet Stock
  await prisma.outletStock.upsert({
    where: { outletId_itemId: { outletId: cafe.id, itemId: item.id } },
    update: { quantity: { increment: dispatchQuantity } },
    create: { outletId: cafe.id, itemId: item.id, quantity: dispatchQuantity }
  })

  // Deduct from Central
  await prisma.item.update({
    where: { id: item.id },
    data: { currentStock: { decrement: dispatchQuantity } }
  })

  // Ledger Entry
  await prisma.inventoryLedger.create({
    data: {
      type: 'DISPATCH',
      itemId: item.id,
      outletId: cafe.id,
      quantity: dispatchQuantity,
      userId: owner.id,
      notes: 'Test Dispatch to Cafe Hub'
    }
  })
  
  const cafeStockAfterDispatch = await prisma.outletStock.findUnique({
    where: { outletId_itemId: { outletId: cafe.id, itemId: item.id } }
  })
  console.log(`- Dispatched 50 units. Cafe Hub stock is now: ${cafeStockAfterDispatch?.quantity}`)

  // 5. Create Menu Item and simulate POS Sale
  console.log('\nSTEP 4: Simulating POS Sale...')
  
  const category = await prisma.category.findFirst({ where: { outletId: cafe.id } })
  const menuItem = await prisma.menuItem.create({
    data: {
      name: 'TEST MENU ITEM',
      price: 50,
      outletId: cafe.id,
      categoryId: category?.id,
      itemId: item.id // IMPORTANT: LINKED TO CATALOG ITEM
    }
  })

  // Simulate Sale of 5 units
  const saleQuantity = 5;
  const tab = await prisma.tab.create({
    data: {
      outletId: cafe.id,
      userId: owner.id,
      customerName: 'Test Customer',
      status: 'OPEN',
      totalAmount: 100
    }
  })

  const tabItem = await prisma.tabItem.create({
    data: {
      tabId: tab.id,
      menuItemId: menuItem.id,
      quantity: saleQuantity,
      priceAtTime: 50
    }
  })

  // EXECUTE TAB CLOSURE LOGIC (Simulated from actions.ts)
  console.log('Closing tab and deducting stock...')
  
  // This mimics the logic in src/app/tabs/[tabId]/actions.ts
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
      notes: `POS Test Sale Consumption (Tab ${tab.id})`
    }
  })

  await prisma.tab.update({
    where: { id: tab.id },
    data: { status: 'CLOSED', paymentMode: 'CASH', closedAt: new Date() }
  })

  // 6. FINAL VERIFICATION
  console.log('\nSTEP 5: FINAL VERIFICATION')
  const finalCafeStock = await prisma.outletStock.findUnique({
    where: { outletId_itemId: { outletId: cafe.id, itemId: item.id } }
  })
  const centralStock = await prisma.item.findUnique({ where: { id: item.id } })

  console.log(`[VERDICT] Central Stock: ${centralStock?.currentStock} (Expected: 50)`)
  console.log(`[VERDICT] Cafe Hub Stock: ${finalCafeStock?.quantity} (Expected: 45)`)

  const ledgerEntries = await prisma.inventoryLedger.findMany({
    where: { itemId: item.id },
    orderBy: { createdAt: 'asc' }
  })
  console.log('\n--- AUDIT TRAIL (LEDGER) ---')
  ledgerEntries.forEach(l => {
    console.log(`[${l.type}] Quantity: ${l.quantity} | Outlet: ${l.outletId || 'Central'} | Notes: ${l.notes}`)
  })

  if (centralStock?.currentStock === 50 && finalCafeStock?.quantity === 45) {
     console.log('\n✅ TEST PASSED: Flow is PRODUCTION READY.')
  } else {
     console.log('\n❌ TEST FAILED: Stock mismatch.')
  }

  // CLEANUP TEST DATA
  console.log('\nCleaning up test data...')
  await prisma.tabItem.delete({ where: { id: tabItem.id } })
  await prisma.tab.delete({ where: { id: tab.id } })
  await prisma.menuItem.delete({ where: { id: menuItem.id } })
  await prisma.outletStock.delete({ where: { outletId_itemId: { outletId: cafe.id, itemId: item.id } } })
  await prisma.inventoryLedger.deleteMany({ where: { itemId: item.id } })
  await prisma.item.delete({ where: { id: item.id } })
  await prisma.vendor.delete({ where: { id: vendor.id } })
  console.log('Cleanup complete.')
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
