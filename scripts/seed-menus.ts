import { PrismaClient } from '@prisma/client'
import * as dotenv from 'dotenv'
dotenv.config()

const prisma = new PrismaClient()

async function main() {
  console.log("Seeding menus and inventory...")

  // 1. Get the owner user to attach to ledger entries
  const owner = await prisma.user.findFirst({ where: { role: 'OWNER' } })
  if (!owner) throw new Error("No owner found to log ledgers.")

  // 2. Get outlets
  const cafe = await prisma.outlet.findFirst({ where: { type: 'CAFE' } })
  const chaiJoint = await prisma.outlet.findFirst({ where: { type: 'CHAI_JOINT' } })
  if (!cafe || !chaiJoint) throw new Error("Outlets not found.")

  // 3. Create Inventory Items
  const itemsData = [
    // For Cafe
    { name: "Eggs", unit: "pieces" },
    { name: "Bread", unit: "slices" },
    { name: "Cheese", unit: "slices" },
    { name: "Potatoes", unit: "kg" },
    { name: "Dosa Batter", unit: "kg" },
    { name: "Tea Leaves", unit: "kg" },
    { name: "Coffee Beans", unit: "kg" },
    { name: "Milk", unit: "litre" },
    { name: "Pasta", unit: "kg" },
    { name: "White Sauce", unit: "litre" },
    { name: "Red Sauce", unit: "litre" },
    { name: "Maggi", unit: "packets" },
    { name: "Chicken", unit: "kg" },
    { name: "Burger Buns", unit: "pieces" },
    { name: "Burger Patties", unit: "pieces" },
    { name: "Momo wrappers", unit: "packets" },
    { name: "Fish Balls", unit: "packets" },
    { name: "Soda Water", unit: "litre" },
    { name: "Curd", unit: "kg" },
    
    // For Chai Joint
    { name: "Cigarettes", unit: "packets" }
  ]

  const createdItems = []

  for (const data of itemsData) {
    const item = await prisma.item.upsert({
      where: { id: `item_${data.name.replace(/\s+/g, '_')}` },
      update: { currentStock: 100 }, // reset current stock
      create: {
        id: `item_${data.name.replace(/\s+/g, '_')}`,
        name: data.name,
        unit: data.unit,
        currentStock: 100
      }
    });

    createdItems.push(item);

    // Create Stock In Ledger
    await prisma.inventoryLedger.create({
      data: {
        type: "STOCK_IN",
        itemId: item.id,
        quantity: 100,
        userId: owner!.id,
        notes: "Initial DB Seed for Testing"
      }
    });
  }

  const getItemId = (name: string) => `item_${name.replace(/\s+/g, '_')}`

  // Helper to dispatch stock
  async function dispatchToOutlet(outletId: string, itemName: string, quantity: number) {
    const itemId = getItemId(itemName)
    
    // Deduct central stock
    await prisma.item.update({
      where: { id: itemId },
      data: { currentStock: { decrement: quantity } }
    });

    // Add Ledger
    await prisma.inventoryLedger.create({
      data: {
        type: "DISPATCH",
        itemId,
        quantity,
        outletId,
        userId: owner!.id,
        notes: "Seeded Dispatch"
      }
    });

    // Update OutletStock
    const existing = await prisma.outletStock.findUnique({
      where: { outletId_itemId: { outletId, itemId } }
    })
    
    if (existing) {
      await prisma.outletStock.update({
        where: { id: existing.id },
        data: { quantity: { increment: quantity } }
      })
    } else {
      await prisma.outletStock.create({
        data: { outletId, itemId, quantity }
      })
    }
  }

  // Dispatch items to CAFE
  const cafeDispatches = [
    { name: "Eggs", qty: 50 },
    { name: "Bread", qty: 50 },
    { name: "Cheese", qty: 20 },
    { name: "Potatoes", qty: 10 },
    { name: "Dosa Batter", qty: 5 },
    { name: "Tea Leaves", qty: 5 },
    { name: "Coffee Beans", qty: 5 },
    { name: "Milk", qty: 20 },
    { name: "Pasta", qty: 10 },
    { name: "White Sauce", qty: 5 },
    { name: "Red Sauce", qty: 5 },
    { name: "Maggi", qty: 40 },
    { name: "Chicken", qty: 10 },
    { name: "Burger Buns", qty: 30 },
    { name: "Burger Patties", qty: 30 },
    { name: "Momo wrappers", qty: 10 },
    { name: "Fish Balls", qty: 5 },
    { name: "Soda Water", qty: 10 },
    { name: "Curd", qty: 5 },
  ]
  for (const d of cafeDispatches) await dispatchToOutlet(cafe.id, d.name, d.qty)

  // Dispatch items to CHAI_JOINT
  const chaiDispatches = [
    { name: "Tea Leaves", qty: 5 },
    { name: "Coffee Beans", qty: 2 },
    { name: "Milk", qty: 10 },
    { name: "Cigarettes", qty: 50 },
  ]
  for (const d of chaiDispatches) await dispatchToOutlet(chaiJoint.id, d.name, d.qty)

  // Clear existing tabs/tabItems to prevent foreign key issues on menu reset
  await prisma.tabItem.deleteMany();
  await prisma.tab.deleteMany();

  // Clear existing menu for cafe and chai joint to avoid duplicates during testing
  await prisma.menuItem.deleteMany({
    where: { outletId: { in: [cafe.id, chaiJoint.id] } }
  });

  // 4. Create Menus
  const menus = [
    // ------------- CAFE MENU -------------
    // BREAKFAST
    { outletId: cafe.id, name: "Bread Omelette", price: 60, categoryId: "BREAKFAST", itemId: getItemId("Eggs") },
    { outletId: cafe.id, name: "Bread Butter Toast", price: 50, categoryId: "BREAKFAST", itemId: getItemId("Bread") },
    { outletId: cafe.id, name: "Cheese Omelette", price: 50, categoryId: "BREAKFAST", itemId: getItemId("Eggs") },
    { outletId: cafe.id, name: "Double Egg Omelette", price: 40, categoryId: "BREAKFAST", itemId: getItemId("Eggs") },
    { outletId: cafe.id, name: "Boiled Egg", price: 35, categoryId: "BREAKFAST", itemId: getItemId("Eggs") },
    { outletId: cafe.id, name: "Puri Sabji", price: 50, categoryId: "BREAKFAST" },
    { outletId: cafe.id, name: "Aloo Paratha with Curd", price: 80, categoryId: "BREAKFAST", itemId: getItemId("Curd") },
    { outletId: cafe.id, name: "Plain Dosa", price: 50, categoryId: "BREAKFAST", itemId: getItemId("Dosa Batter") },
    { outletId: cafe.id, name: "Masala Dosa", price: 80, categoryId: "BREAKFAST", itemId: getItemId("Dosa Batter") },

    // TEA & COFFEE
    { outletId: cafe.id, name: "Tea (Small)", price: 15, categoryId: "TEA & COFFEE", itemId: getItemId("Tea Leaves") },
    { outletId: cafe.id, name: "Tea (Medium)", price: 20, categoryId: "TEA & COFFEE", itemId: getItemId("Tea Leaves") },
    { outletId: cafe.id, name: "Tea (Large)", price: 25, categoryId: "TEA & COFFEE", itemId: getItemId("Tea Leaves") },
    { outletId: cafe.id, name: "Black Tea", price: 20, categoryId: "TEA & COFFEE", itemId: getItemId("Tea Leaves") },
    { outletId: cafe.id, name: "Green Tea", price: 25, categoryId: "TEA & COFFEE" },
    { outletId: cafe.id, name: "Black coffee", price: 20, categoryId: "TEA & COFFEE", itemId: getItemId("Coffee Beans") },
    { outletId: cafe.id, name: "Coffee", price: 40, categoryId: "TEA & COFFEE", itemId: getItemId("Milk") },

    // MAGGI & PASTA
    { outletId: cafe.id, name: "White Sauce Pasta (Veg)", price: 210, categoryId: "MAGGI & PASTA", itemId: getItemId("Pasta") },
    { outletId: cafe.id, name: "White Sauce Pasta (Egg)", price: 230, categoryId: "MAGGI & PASTA", itemId: getItemId("Pasta") },
    { outletId: cafe.id, name: "White Sauce Pasta (Chicken)", price: 260, categoryId: "MAGGI & PASTA", itemId: getItemId("Pasta") },
    { outletId: cafe.id, name: "Red Sauce Pasta (Veg)", price: 200, categoryId: "MAGGI & PASTA", itemId: getItemId("Pasta") },
    { outletId: cafe.id, name: "Red Sauce Pasta (Egg)", price: 220, categoryId: "MAGGI & PASTA", itemId: getItemId("Pasta") },
    { outletId: cafe.id, name: "Red Sauce Pasta (Chicken)", price: 250, categoryId: "MAGGI & PASTA", itemId: getItemId("Pasta") },
    { outletId: cafe.id, name: "Sofi Maggi (Veg)", price: 70, categoryId: "MAGGI & PASTA", itemId: getItemId("Maggi") },
    { outletId: cafe.id, name: "Sofi Maggi (Egg)", price: 90, categoryId: "MAGGI & PASTA", itemId: getItemId("Maggi") },
    { outletId: cafe.id, name: "Sofi Maggi (Chicken)", price: 110, categoryId: "MAGGI & PASTA", itemId: getItemId("Maggi") },
    { outletId: cafe.id, name: "Fried Maggi (Veg)", price: 100, categoryId: "MAGGI & PASTA", itemId: getItemId("Maggi") },
    { outletId: cafe.id, name: "Fried Maggi (Egg)", price: 120, categoryId: "MAGGI & PASTA", itemId: getItemId("Maggi") },
    { outletId: cafe.id, name: "Fried Maggi (Chicken)", price: 150, categoryId: "MAGGI & PASTA", itemId: getItemId("Maggi") },

    // BURGER & SANDWICH
    { outletId: cafe.id, name: "Burger (Veg)", price: 100, categoryId: "BURGER & SANDWICH", itemId: getItemId("Burger Buns") },
    { outletId: cafe.id, name: "Burger (Chicken)", price: 150, categoryId: "BURGER & SANDWICH", itemId: getItemId("Burger Buns") },
    { outletId: cafe.id, name: "Grilled Sandwich (Veg)", price: 120, categoryId: "BURGER & SANDWICH", itemId: getItemId("Bread") },
    { outletId: cafe.id, name: "Grilled Sandwich (Chicken)", price: 150, categoryId: "BURGER & SANDWICH", itemId: getItemId("Bread") },
    { outletId: cafe.id, name: "Club Sandwich (Veg)", price: 150, categoryId: "BURGER & SANDWICH", itemId: getItemId("Bread") },
    { outletId: cafe.id, name: "Club Sandwich (Chicken)", price: 200, categoryId: "BURGER & SANDWICH", itemId: getItemId("Bread") },

    // MOMO
    { outletId: cafe.id, name: "Steam Momo (Veg)", price: 100, categoryId: "MOMO", itemId: getItemId("Momo wrappers") },
    { outletId: cafe.id, name: "Steam Momo (Chicken)", price: 150, categoryId: "MOMO", itemId: getItemId("Momo wrappers") },
    { outletId: cafe.id, name: "Fried Momo (Veg)", price: 120, categoryId: "MOMO", itemId: getItemId("Momo wrappers") },
    { outletId: cafe.id, name: "Fried Momo (Chicken)", price: 160, categoryId: "MOMO", itemId: getItemId("Momo wrappers") },

    // SNACKS
    { outletId: cafe.id, name: "Chicken Cheese Ball", price: 60, categoryId: "SNACKS", itemId: getItemId("Chicken") },
    { outletId: cafe.id, name: "Chicken Finger", price: 60, categoryId: "SNACKS", itemId: getItemId("Chicken") },
    { outletId: cafe.id, name: "Fish Ball", price: 60, categoryId: "SNACKS", itemId: getItemId("Fish Balls") },
    { outletId: cafe.id, name: "Veg Corn Ball", price: 60, categoryId: "SNACKS" },

    // MOCKTAIL / SHAKES
    { outletId: cafe.id, name: "Fresh Lime Soda", price: 60, categoryId: "MOCKTAIL", itemId: getItemId("Soda Water") },
    { outletId: cafe.id, name: "Masala Cola", price: 60, categoryId: "MOCKTAIL" },
    { outletId: cafe.id, name: "Virgin Mojito", price: 80, categoryId: "MOCKTAIL", itemId: getItemId("Soda Water") },
    { outletId: cafe.id, name: "Black Currant", price: 80, categoryId: "MOCKTAIL" },
    { outletId: cafe.id, name: "Milk Shake", price: 100, categoryId: "MOCKTAIL", itemId: getItemId("Milk") },
    { outletId: cafe.id, name: "Cold Coffee", price: 120, categoryId: "MOCKTAIL", itemId: getItemId("Milk") },
    { outletId: cafe.id, name: "Dahi Lassi", price: 60, categoryId: "MOCKTAIL", itemId: getItemId("Curd") },

    // ------------- CHAI JOINT MENU -------------
    { outletId: chaiJoint.id, name: "Chai", price: 15, categoryId: "HOT DRINKS", itemId: getItemId("Tea Leaves") },
    { outletId: chaiJoint.id, name: "Black Tea", price: 20, categoryId: "HOT DRINKS", itemId: getItemId("Tea Leaves") },
    { outletId: chaiJoint.id, name: "Coffee", price: 40, categoryId: "HOT DRINKS", itemId: getItemId("Milk") },
    { outletId: chaiJoint.id, name: "Black Coffee", price: 20, categoryId: "HOT DRINKS", itemId: getItemId("Coffee Beans") },
    { outletId: chaiJoint.id, name: "Cigarettes", price: 20, categoryId: "TOBACCO", itemId: getItemId("Cigarettes") }
  ]

  let count = 0;
  for (const m of menus) {
    await prisma.menuItem.create({ data: m })
    count++;
    if (count % 5 === 0) {
      console.log(`Created ${count}/${menus.length} menu items...`)
    }
  }

  console.log("Successfully seeded menus and inventory!")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

