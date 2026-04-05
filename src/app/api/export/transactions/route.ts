import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const targetDateStr = searchParams.get("date") // expected format YYYY-MM-DD
  const outletType = searchParams.get("outlet")

  // Authentication logic based on role
  const role = session.user.role
  if (role !== "OWNER") {
    if (outletType === "CAFE" && role !== "CAFE_STAFF") return new NextResponse("Forbidden", { status: 403 })
    if (outletType === "CHAI_JOINT" && role !== "CHAI_STAFF") return new NextResponse("Forbidden", { status: 403 })
    if (!outletType) return new NextResponse("Forbidden", { status: 403 }) // Only owner can fetch without specifying outlet
  }

  // Determine the date bounds in UTC for the given IST day
  let startUTC: Date, endUTC: Date;

  if (targetDateStr) {
    // Manually parse YYYY-MM-DD into a UTC date, treating it as midnight IST
    const [year, month, day] = targetDateStr.split("-").map(Number);
    // New Date(year, monthIndex, day) in local time depends on the server's time zone.
    // Instead, we construct the exact UTC timestamps that map to 00:00:00 and 23:59:59 in IST (+5:30).
    // An IST midnight is UTC previous day 18:30:00.
    startUTC = new Date(Date.UTC(year, month - 1, day, -5, -30, 0, 0));
    endUTC = new Date(Date.UTC(year, month - 1, day, 18, 29, 59, 999));
  } else {
    // Default to today IST
    const now = new Date();
    const currentUTC = now.getTime() + (now.getTimezoneOffset() * 60000);
    const istDate = new Date(currentUTC + (3600000 * 5.5));
    
    startUTC = new Date(Date.UTC(istDate.getFullYear(), istDate.getMonth(), istDate.getDate(), -5, -30, 0, 0));
    endUTC = new Date(Date.UTC(istDate.getFullYear(), istDate.getMonth(), istDate.getDate(), 18, 29, 59, 999));
  }

  // Validate the query constraint
  const whereClause: any = {
    status: { in: ["CLOSED", "CANCELLED", "OPEN"] },
    openedAt: { gte: startUTC, lte: endUTC }
  }

  if (outletType) {
    const outlet = await prisma.outlet.findFirst({ where: { type: outletType } })
    if (outlet) {
      whereClause.outletId = outlet.id
    } else {
      return new NextResponse("Outlet not found", { status: 404 })
    }
  }

  // Fetch the data
  const tabs = await prisma.tab.findMany({
    where: whereClause,
    include: {
      Outlet: true,
      User: true,
      Items: {
        include: {
          MenuItem: true
        }
      }
    },
    orderBy: { openedAt: "asc" }
  })

  // Create CSV String
  const headers = [
    "Date",
    "Time",
    "Transaction ID",
    "Outlet",
    "Billed By",
    "Customer",
    "Status",
    "Payment Mode",
    "Total Amount (INR)",
    "Items Breakdown"
  ]

  let csvContent = headers.join(",") + "\n"

  tabs.forEach(tab => {
    const ts = new Date(tab.closedAt || tab.openedAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
    const [datePart, timePart] = ts.split(', ');

    const itemsStr = tab.Items.map(item => `${item.quantity}x ${item.MenuItem.name}`).join(" | ")

    const row = [
      datePart,
      timePart,
      tab.id,
      tab.Outlet.name,
      tab.User.name,
      tab.customerName || "Walk-in",
      tab.status,
      tab.paymentMode || "",
      tab.totalAmount.toFixed(2),
      `"${itemsStr}"` // wrap items in quotes to escape potential commas safely
    ]

    csvContent += row.map(cell => {
      // Basic CSV escaping for fields that might contain commas but aren't explicitly quoted
      const cellStr = String(cell);
      if (cellStr.includes(',') && !cellStr.startsWith('"')) {
        return `"${cellStr}"`;
      }
      return cellStr;
    }).join(",") + "\n"
  })

  // Calculate Subtotals
  const totalCash = tabs.filter(t => t.paymentMode === "CASH").reduce((sum, t) => sum + t.totalAmount, 0);
  const totalOnline = tabs.filter(t => t.paymentMode === "ONLINE").reduce((sum, t) => sum + t.totalAmount, 0);
  const totalSplit = tabs.filter(t => t.paymentMode === "SPLIT").reduce((sum, t) => sum + t.totalAmount, 0);
  const grandTotal = tabs.reduce((sum, t) => sum + t.totalAmount, 0);

  // Append Summary Rows
  csvContent += "\n";
  csvContent += `,,,,,,,TOTAL CASH,${totalCash.toFixed(2)},\n`;
  csvContent += `,,,,,,,TOTAL ONLINE (UPI/CARD),${totalOnline.toFixed(2)},\n`;
  if (totalSplit > 0) {
    csvContent += `,,,,,,,TOTAL SPLIT,${totalSplit.toFixed(2)},\n`;
  }
  csvContent += `,,,,,,,GRAND TOTAL,${grandTotal.toFixed(2)},\n`;

  // Format filename
  const prefix = outletType ? outletType.toLowerCase() : "all_outlets";
  const dateStr = targetDateStr || new Date().toISOString().split('T')[0];
  const filename = `${prefix}_transactions_${dateStr}.csv`;

  return new NextResponse(csvContent, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`
    }
  })
}
