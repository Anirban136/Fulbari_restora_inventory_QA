import { prisma } from "@/lib/prisma"
export const dynamic = 'force-dynamic'
import { Button } from "@/components/ui/button"
import { UserControls } from "@/components/user-controls" // reuse logout button component
import { Coffee, PackageOpen, LayoutGrid, Search, History, Receipt, Edit } from "lucide-react"
import Link from "next/link"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { formatTimeIST, formatDateIST, getISTDateBounds, cn } from "@/lib/utils"
import AppLayout from "@/components/layouts/app-layout"
import { TabReceiptModal } from "@/components/TabReceiptModal"
import { PrintReceiptButton } from "@/components/PrintReceiptButton"
import { reopenTab } from "@/app/tabs/[tabId]/actions"

export default async function CafeDashboard() {
  const cafe = await prisma.outlet.findFirst({ where: { type: "CAFE" }})
  
  if (!cafe) return <div className="min-h-screen bg-background text-white p-10 font-bold">Cafe outlet not configured.</div>

  const session = await getServerSession(authOptions)
  const isOwner = session?.user?.role === "OWNER"

  const { startUTC: todayStart, endUTC: todayEnd } = getISTDateBounds();

  // Generate last 7 days array for reporting
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toLocaleDateString("en-CA"); // YYYY-MM-DD
    const displayDate = d.toLocaleDateString("en-IN", { weekday: 'short', month: 'short', day: 'numeric' });
    return { dateStr, displayDate, isToday: i === 0 };
  });

  const [localStock, incomingDispatches, recentTabs] = await Promise.all([
    prisma.outletStock.findMany({
      where: { outletId: cafe.id, quantity: { gt: 0 } },
      include: { Item: true },
      orderBy: { Item: { name: 'asc' } }
    }),
    prisma.inventoryLedger.findMany({
      where: { outletId: cafe.id, type: "DISPATCH" },
      include: { Item: true, User: true },
      orderBy: { createdAt: 'desc' },
      take: 10
    }),
    prisma.tab.findMany({
      where: { 
        outletId: cafe.id, 
        status: { in: ["CLOSED", "CANCELLED"] },
        openedAt: { gte: todayStart, lte: todayEnd } 
      },
      include: {
        User: true,
        Items: { include: { MenuItem: true } }
      },
      orderBy: { closedAt: 'desc' }
    })
  ])

  const todaysTabs = recentTabs;

  const dailyReport = {
    CASH: todaysTabs.filter(t => t.paymentMode === 'CASH').reduce((sum, t) => sum + t.totalAmount, 0),
    ONLINE: todaysTabs.filter(t => t.paymentMode === 'ONLINE').reduce((sum, t) => sum + t.totalAmount, 0),
    SPLIT: todaysTabs.filter(t => t.paymentMode === 'SPLIT').reduce((sum, t) => sum + t.totalAmount, 0),
    TOTAL: todaysTabs.reduce((sum, t) => sum + t.totalAmount, 0)
  };

  return (
    <AppLayout user={session?.user}>
      <div className="w-full max-w-6xl px-6 py-10 relative z-10 flex flex-col min-h-full">
        <header className="flex items-center justify-between pb-8 mb-8 border-b border-white/10">
          <div className="flex items-center gap-4">
             <div className="h-14 w-14 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center border border-white/10 shadow-[0_0_30px_-5px_oklch(0.65_0.22_25_/_0.5)] p-1">
               <div className="h-full w-full bg-background/50 rounded-xl flex items-center justify-center backdrop-blur-md">
                 <Coffee className="text-amber-400 w-6 h-6" />
               </div>
             </div>
            <div>
              <h1 className="text-4xl font-black text-white tracking-tight">Cafe Hub</h1>
              <p className="text-amber-400 font-bold mt-1 tracking-widest uppercase text-xs">Manager & POS Operations</p>
            </div>
          </div>
        </header>

        <div className="space-y-12">
          {/* 1. TOP PRIORITY: TODAY'S REPORT */}
          <section className="animate-in fade-in slide-in-from-top-4 duration-700">
             <div className="flex items-center gap-3 mb-6 px-2">
                <Receipt className="w-6 h-6 text-amber-500" />
                <h2 className="text-2xl font-black text-white uppercase tracking-tighter italic">Today's Revenue</h2>
                <div className="h-px flex-1 bg-gradient-to-r from-amber-500/20 to-transparent ml-4"></div>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="glass-panel p-6 rounded-3xl border border-white/5 bg-white/[0.02] flex flex-col justify-between group hover:bg-white/[0.04] transition-all">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4">Cash Sales</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-xs font-bold text-slate-500">₹</span>
                    <span className="text-3xl font-black text-white tracking-tighter">{dailyReport.CASH.toFixed(2)}</span>
                  </div>
                </div>

                <div className="glass-panel p-6 rounded-3xl border border-white/5 bg-white/[0.02] flex flex-col justify-between group hover:bg-white/[0.04] transition-all">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4">Online Sales</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-xs font-bold text-slate-500">₹</span>
                    <span className="text-3xl font-black text-white tracking-tighter">{dailyReport.ONLINE.toFixed(2)}</span>
                  </div>
                </div>

                <div className="glass-panel p-6 rounded-3xl border border-white/5 bg-white/[0.02] flex flex-col justify-between group hover:bg-white/[0.04] transition-all">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4">Split/Other</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-xs font-bold text-slate-500">₹</span>
                    <span className="text-3xl font-black text-white tracking-tighter">{dailyReport.SPLIT.toFixed(2)}</span>
                  </div>
                </div>

                <div className="glass-panel p-6 rounded-[2rem] border border-amber-500/20 bg-amber-500/[0.03] flex flex-col justify-between relative overflow-hidden group hover:bg-amber-500/[0.06] transition-all shadow-[0_20px_50px_-15px_rgba(245,158,11,0.15)]">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-3xl -mr-10 -mt-10 group-hover:bg-amber-500/20 transition-all"></div>
                  <span className="text-[10px] font-black text-amber-500 uppercase tracking-[0.2em] mb-4 relative z-10">Total Gross</span>
                  <div className="flex items-baseline gap-1 relative z-10">
                    <span className="text-sm font-black text-amber-500">₹</span>
                    <span className="text-4xl font-black text-amber-400 tracking-tighter text-glow drop-shadow-[0_0_15px_rgba(245,158,11,0.5)]">
                      {dailyReport.TOTAL.toFixed(2)}
                    </span>
                  </div>
                </div>
             </div>
          </section>

          {/* 2. MAIN HUB ACTIONS & TRANSACTIONS */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            
            {/* Transactions Feed (Priority 2) */}
            <div className="lg:col-span-8 space-y-6 order-2 lg:order-1">
               <div className="flex items-center justify-between px-2">
                  <div className="flex items-center gap-3">
                    <History className="w-5 h-5 text-slate-400" />
                    <h2 className="text-xl font-black text-white uppercase tracking-tight">Today's Transactions</h2>
                    <span className="px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest bg-amber-500/20 text-amber-400 border border-amber-500/20 animate-pulse">Live</span>
                  </div>
               </div>

               <div className="glass-panel rounded-[2.5rem] overflow-hidden border border-white/5 bg-white/[0.01]">
                 <div className="flex-1 overflow-auto max-h-[600px] p-6 lg:p-8 space-y-4 custom-scrollbar-premium">
                    {recentTabs.length === 0 ? (
                      <div className="flex flex-col items-center justify-center text-slate-500 py-32 opacity-20">
                        <Receipt className="w-16 h-16 mb-4" />
                        <p className="font-black tracking-[0.4em] uppercase text-xs">No transactions recorded</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 gap-4">
                        {recentTabs.map(tab => (
                          <div key={tab.id} className="glass-panel p-6 rounded-3xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/10 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 group">
                            <div className="flex gap-5 items-center flex-1 min-w-0">
                               <div className={cn(
                                 "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border transition-transform group-hover:scale-110",
                                 tab.status === "CANCELLED" 
                                   ? "bg-red-500/10 border-red-500/20 text-red-400" 
                                   : "bg-amber-500/10 border-amber-500/20 text-amber-400"
                               )}>
                                 <Receipt className="w-6 h-6" />
                               </div>
                               <div className="min-w-0">
                                  <div className="flex items-center gap-2 mb-0.5">
                                     <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{formatTimeIST(tab.closedAt || tab.openedAt)}</span>
                                     {tab.tokenNumber && <span className="text-[9px] font-black bg-white/5 text-slate-300 px-2 py-0.5 rounded-md border border-white/5">TOKEN #{tab.tokenNumber}</span>}
                                  </div>
                                  <h3 className="text-lg font-black text-white/90 truncate group-hover:text-amber-400 transition-colors uppercase tracking-tight">
                                    {tab.customerName || "Walk-in Customer"}
                                  </h3>
                                  <div className="flex items-center gap-2 mt-1 opacity-60">
                                     <span className="text-[10px] font-bold text-slate-500 uppercase">Staff: {tab.User.name}</span>
                                     <div className="w-1 h-1 rounded-full bg-slate-700"></div>
                                     <span className="text-[10px] font-bold text-amber-500/80 uppercase">{tab.paymentMode}</span>
                                  </div>
                               </div>
                            </div>

                            <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-4 w-full sm:w-auto mt-4 sm:mt-0 pt-4 sm:pt-0 border-t sm:border-t-0 border-white/5">
                               <div className="flex flex-col items-end leading-none">
                                  <span className={cn(
                                    "text-2xl font-black tracking-tighter drop-shadow-sm",
                                    tab.status === "CANCELLED" ? "text-slate-500 line-through" : "text-white group-hover:text-amber-400 transition-colors"
                                  )}>
                                    ₹{tab.totalAmount.toFixed(2)}
                                  </span>
                                  {tab.status === "CANCELLED" && <span className="text-[8px] font-black text-red-500 uppercase tracking-[0.2em] mt-1">Order Cancelled</span>}
                               </div>

                               <div className="flex items-center gap-2">
                                  <TabReceiptModal
                                    tabId={tab.id}
                                    customerName={tab.customerName}
                                    totalAmount={tab.totalAmount}
                                    paymentMode={tab.paymentMode}
                                    closedAt={tab.closedAt}
                                    items={tab.Items}
                                    accentColor="amber"
                                  />
                                  {tab.status === "CLOSED" && tab.tokenNumber && (
                                    <PrintReceiptButton
                                      outletName={cafe.name}
                                      tokenNumber={tab.tokenNumber}
                                      customerName={tab.customerName}
                                      tabId={tab.id}
                                      items={tab.Items}
                                      totalAmount={tab.totalAmount}
                                      paymentMode={tab.paymentMode}
                                      closedAt={tab.closedAt}
                                      accentColor="amber"
                                    />
                                  )}
                                  {(tab.status === "CLOSED" || tab.status === "CANCELLED") && (
                                    <form action={reopenTab.bind(null, tab.id)}>
                                      <Button type="submit" variant="ghost" size="icon" className="h-9 w-9 rounded-xl text-slate-400 hover:text-amber-400 hover:bg-amber-500/10 border border-transparent hover:border-amber-500/20">
                                        <Edit className="w-4 h-4" />
                                      </Button>
                                    </form>
                                  )}
                               </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                 </div>
               </div>
            </div>

            {/* Sidebar Controls (Priority 3) */}
            <div className="lg:col-span-4 space-y-8 order-1 lg:order-2">
               {/* Launch POS */}
               <div className="glass-panel p-8 rounded-[2.5rem] group hover:border-amber-500/30 transition-all border border-white/5 bg-white/[0.01] relative overflow-hidden shadow-2xl">
                  <div className="absolute -right-4 -top-4 w-32 h-32 bg-amber-500/5 rounded-full blur-[40px] group-hover:bg-amber-500/10 transition-all pointer-events-none"></div>
                  <div className="w-14 h-14 bg-amber-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <LayoutGrid className="w-7 h-7 text-amber-500 drop-shadow-[0_0_15px_rgba(245,158,11,0.5)]" />
                  </div>
                  <h2 className="text-3xl font-black text-white mb-2 leading-none uppercase tracking-tighter italic">POS Register</h2>
                  <p className="text-slate-500 font-medium text-xs mb-8 uppercase tracking-widest opacity-80">Take new orders & manage inventory</p>
                  <Link href="/tabs?target=CAFE" className="w-full flex">
                    <Button className="flex-1 w-full h-16 text-sm font-black tracking-[0.2em] uppercase bg-white text-black hover:bg-amber-400 transition-all rounded-2xl active:scale-95 shadow-[0_10px_30px_-10px_rgba(255,255,255,0.2)]">
                      Open Registers
                    </Button>
                  </Link>
               </div>

               {/* Live Pantry */}
               <div className="glass-panel p-8 rounded-[2.5rem] border border-white/5 bg-white/[0.01] flex flex-col">
                  <h2 className="text-sm font-black text-white uppercase tracking-[0.3em] mb-8 flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div> Live Stock
                  </h2>
                  <div className="space-y-3 max-h-[400px] overflow-auto pr-2 custom-scrollbar-premium">
                     {localStock.length === 0 ? (
                       <p className="text-slate-600 text-xs font-black uppercase tracking-widest py-4">Pantry Empty</p>
                     ) : (
                       localStock.map(stock => (
                         <div key={stock.id} className="flex justify-between items-center p-4 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-colors">
                           <span className="font-bold text-slate-300 text-xs uppercase tracking-tight">{stock.Item.name}</span>
                           <div className="flex flex-col items-end">
                              <span className="font-black text-white text-sm">
                                {stock.quantity} <span className="text-[8px] opacity-40 uppercase">{stock.Item.piecesPerBox ? 'pcs' : stock.Item.unit}</span>
                              </span>
                           </div>
                         </div>
                       ))
                     )}
                  </div>
               </div>

               {/* Export Reports */}
               {isOwner && (
                 <div className="glass-panel p-8 rounded-[2.5rem] border border-blue-500/10 bg-blue-500/[0.02] hover:bg-blue-500/[0.04] transition-all group">
                    <h2 className="text-xs font-black text-blue-400 uppercase tracking-[0.3em] mb-6">History Log</h2>
                    <div className="flex flex-wrap gap-2">
                       {last7Days.map((day) => (
                         <a key={day.dateStr} href={`/api/export/transactions?outlet=CAFE&date=${day.dateStr}`} download className="group/btn">
                           <div className="px-3 py-2 bg-white/5 border border-white/5 rounded-xl text-[9px] font-black text-slate-400 hover:text-white hover:bg-blue-500/20 hover:border-blue-500/30 transition-all uppercase tracking-widest">
                             {day.isToday ? "Today" : day.displayDate}
                           </div>
                         </a>
                       ))}
                    </div>
                 </div>
               )}
            </div>
          </div>

          {/* Incoming Dispatches */}
          <section className="glass-panel rounded-[2.5rem] overflow-hidden border border-white/5 bg-white/[0.01]">
             <div className="p-8 border-b border-white/5 bg-white/[0.02] flex items-center gap-4">
               <PackageOpen className="w-6 h-6 text-slate-500" />
               <h2 className="text-xl font-black text-white uppercase tracking-tighter">Deliveries from Warehouse</h2>
             </div>
             
             <div className="p-8 overflow-auto max-h-[400px] custom-scrollbar-premium">
                {incomingDispatches.length === 0 ? (
                  <div className="text-center py-20 opacity-20">
                    <p className="font-black tracking-[0.4em] uppercase text-[10px]">No recent dispatches</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {incomingDispatches.map(log => (
                      <div key={log.id} className="flex items-center justify-between p-5 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-all">
                        <div>
                          <p className="text-[9px] font-black text-slate-500 mb-1 uppercase tracking-widest">{formatTimeIST(log.createdAt)}</p>
                          <span className="font-black text-slate-200 text-sm uppercase">{log.Item.name}</span>
                        </div>
                        <div className="text-right">
                          <span className="font-black text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-lg text-sm">
                            +{log.quantity}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
             </div>
          </section>
        </div>
      </div>
    </AppLayout>
  )
}
