import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function getISTMidnight(offsetDays: number): Date {
  const now = new Date();
  const utcMs = now.getTime() + now.getTimezoneOffset() * 60000;
  const istBase = new Date(utcMs + 3600000 * 5.5);
  istBase.setDate(istBase.getDate() + offsetDays);
  istBase.setHours(0, 0, 0, 0);
  // Convert back to UTC for Prisma
  return new Date(istBase.getTime() - 3600000 * 5.5);
}

export async function GET() {
  const days: {
    date: string;
    cash: number;
    online: number;
    split: number;
    total: number;
  }[] = [];

  for (let i = 6; i >= 0; i--) {
    const startUTC = getISTMidnight(-i);
    const endUTC = new Date(startUTC.getTime() + 24 * 60 * 60 * 1000 - 1);

    const tabs = await prisma.tab.findMany({
      where: {
        status: "CLOSED",
        closedAt: { gte: startUTC, lte: endUTC },
      },
      select: { totalAmount: true, paymentMode: true },
    });

    let cash = 0,
      online = 0,
      split = 0;
    for (const tab of tabs) {
      if (tab.paymentMode === "CASH") cash += tab.totalAmount;
      else if (tab.paymentMode === "ONLINE") online += tab.totalAmount;
      else if (tab.paymentMode === "SPLIT") split += tab.totalAmount;
    }

    // Label in IST
    const istMs = startUTC.getTime() + 3600000 * 5.5;
    const label = new Date(istMs).toLocaleDateString("en-IN", {
      weekday: "short",
      day: "2-digit",
      month: "short",
    });

    days.push({ date: label, cash, online, split, total: cash + online + split });
  }

  return NextResponse.json({ days });
}
