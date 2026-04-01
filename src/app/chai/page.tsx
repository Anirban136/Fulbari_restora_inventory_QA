import { prisma } from "@/lib/prisma"
export const dynamic = 'force-dynamic'
import { Button } from "@/components/ui/button"
import { UserControls } from "@/components/user-controls"
import { CupSoda, PackageOpen, LayoutGrid, Search, History, Receipt } from "lucide-react"
import Link from "next/link"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { formatTimeIST, formatDateIST, getISTDateBounds } from "@/lib/utils"
import AppLayout from "@/components/layouts/app-layout"
import { TabReceiptModal } from "@/components/TabReceiptModal"

export default async function ChaiDashboard() {
  const chaiJoint = await prisma.outlet.findFirst({ where: { type: "CHAI_JOINT" }})
  
  if (!chaiJoint) return <div className="min-h-screen bg-background text-white p-10 font-bold">Chai Joint outlet not configured.</div>

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
      where: { outletId: chaiJoint.id, quantity: { gt: 0 } },
      include: { Item: true },
      orderBy: { Item: { name: 'asc' } }
    }),
    prisma.inventoryLedger.findMany({
      where: { outletId: chaiJoint.id, type: "DISPATCH" },
      include: { Item: true, User: true },
      orderBy: { createdAt: 'desc' },
      take: 10
    }),
    prisma.tab.findMany({
      where: { 
        outletId: chaiJoint.id, 
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
    <AppLayout>
      <div className="w-full max-w-6xl px-6 py-10 relative z-10 flex flex-col min-h-full">
        
        <header className="flex items-center justify-between pb-8 mb-8 border-b border-white/10">
          <div className="flex items-center gap-4">
             <div className="h-14 w-14 bg-gradient-to-br from-blue-500 to-sky-600 rounded-2xl flex items-center justify-center border border-white/10 shadow-[0_0_30px_-5px_oklch(0.65_0.22_25_/_0.5)] p-1">
               <div className="h-full w-full bg-background/50 rounded-xl flex items-center justify-center backdrop-blur-md">
                 <CupSoda className="text-blue-400 w-6 h-6" />
               </div>
             </div>
            <div>
              <h1 className="text-4xl font-black text-white tracking-tight">Chai Joint Hub</h1>
              <p className="text-blue-400 font-bold mt-1 tracking-widest uppercase text-xs">Manager & POS Operations</p>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 flex-1">
          
          <div className="lg:col-span-4 flex flex-col gap-8">
            {/* Launch POS */}
            <div className="glass-panel p-8 rounded-3xl group hover:border-blue-500/30 transition-all border border-blue-500/10 shadow-[0_20px_60px_-15px_rgba(59,130,246,0.1)] relative overflow-hidden">
               <div className="absolute -right-4 -top-4 w-32 h-32 bg-blue-500/10 rounded-full blur-[40px] group-hover:bg-blue-500/20 transition-all pointer-events-none"></div>
               <LayoutGrid className="w-10 h-10 text-blue-500 mb-6 drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]" />
               <h2 className="text-2xl font-black text-white mb-2 relative z-10">POS Terminal</h2>
               <p className="text-slate-400 font-medium text-sm mb-8 leading-relaxed relative z-10">Launch the touch interface to take orders and auto-deduct live ingredients.</p>
               <Link href="/tabs?target=CHAI_JOINT" className="w-full flex">
                 <Button className="flex-1 w-full h-14 text-lg font-black tracking-widest uppercase bg-gradient-to-r from-blue-500 to-sky-500 hover:from-blue-400 hover:to-sky-400 text-black rounded-xl transition-all shadow-[0_0_30px_-5px_rgba(59,130,246,0.5)] active:scale-95">
                   Open Registers
                 </Button>
               </Link>
            </div>

            {/* Today's Report */}
            <div className="glass-panel p-6 rounded-3xl group transition-all border border-blue-500/10 hover:border-blue-500/30">
                <h2 className="text-lg font-bold text-white uppercase tracking-widest mb-6 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span>Today's Report</span>
                    <Receipt className="w-5 h-5 text-blue-500" />
                  </div>
                  {isOwner && (
                    <a href="/api/export/transactions?outlet=CHAI_JOINT" download>
                      <Button variant="ghost" size="sm" className="h-8 px-2 text-[10px] text-blue-400 hover:bg-blue-500/10 border border-blue-500/20">
                        Download CSV
                      </Button>
                    </a>
                  )}
                </h2>
               <div className="space-y-3">
                 <div className="flex justify-between items-center bg-white/5 p-3 rounded-xl border border-white/5">
                   <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">💵 Cash</span>
                   <span className="text-lg font-black text-white">₹{dailyReport.CASH.toFixed(2)}</span>
                 </div>
                 <div className="flex justify-between items-center bg-white/5 p-3 rounded-xl border border-white/5">
                   <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">💳 Online</span>
                   <span className="text-lg font-black text-white">₹{dailyReport.ONLINE.toFixed(2)}</span>
                 </div>
                 {dailyReport.SPLIT > 0 && (
                   <div className="flex justify-between items-center bg-white/5 p-3 rounded-xl border border-white/5">
                     <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">🔄 Split</span>
                     <span className="text-lg font-black text-white">₹{dailyReport.SPLIT.toFixed(2)}</span>
                   </div>
                 )}
                 <div className="flex justify-between items-center bg-blue-500/10 p-4 rounded-xl border border-blue-500/20 mt-4">
                   <span className="text-sm font-black text-blue-500 uppercase tracking-widest">Total</span>
                   <span className="text-2xl font-black text-blue-400 drop-shadow-[0_0_10px_rgba(59,130,246,0.5)] text-glow">₹{dailyReport.TOTAL.toFixed(2)}</span>
                 </div>
               </div>
            </div>

            {/* Current Stock */}
            <div className="glass-panel p-6 rounded-3xl flex-1 max-h-[500px] flex flex-col">
               <h2 className="text-lg font-bold text-white uppercase tracking-widest mb-6 flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div> Live Pantry
               </h2>
               <div className="flex-1 overflow-auto pr-2">
                  <ul className="space-y-3">
                    {localStock.length === 0 ? (
                      <p className="text-slate-500 text-sm font-medium">No inventory available.</p>
                    ) : (
                      localStock.map(stock => (
                        <li key={stock.id} className="flex justify-between items-center p-3 rounded-xl border border-white/5 bg-white/5">
                          <span className="font-bold text-slate-300 text-sm">{stock.Item.name}</span>
                          <span className="font-black text-blue-400 bg-blue-500/10 px-2 py-1 rounded-md text-sm">
                            {stock.quantity} <span className="text-[9px] ml-0.5 opacity-70 uppercase">{stock.Item.unit}</span>
                          </span>
                        </li>
                      ))
                    )}
                  </ul>
               </div>
            </div>
          </div>

          {/* Right Column: Deliveries & History */}
          <div className="lg:col-span-8 flex flex-col gap-8 max-h-[800px]">
            {/* Incoming Dispatches */}
            <div className="glass-panel rounded-3xl overflow-hidden flex flex-col flex-1 min-h-[350px]">
               <div className="p-8 border-b border-white/10 bg-white/5 backdrop-blur-md flex items-center gap-4 shrink-0">
                 <PackageOpen className="w-6 h-6 text-slate-400" />
                 <h2 className="text-xl font-bold text-white uppercase tracking-widest">Incoming Deliveries from Warehouse</h2>
               </div>
               
               <div className="flex-1 overflow-auto p-8">
                  {incomingDispatches.length === 0 ? (
                    <div className="flex flex-col items-center justify-center text-slate-500 py-10 animate-pulse h-full">
                      <Search className="w-12 h-12 mb-4 opacity-20" />
                      <p className="font-bold tracking-widest uppercase text-sm">No dispatches received yet.</p>
                    </div>
                  ) : (
                    <ul className="space-y-4">
                      {incomingDispatches.map(log => (
                        <li key={log.id} className="flex items-center justify-between p-5 rounded-2xl border border-white/5 bg-white/5 hover:bg-white/10 hover:border-white/20 transition-all group shadow-sm">
                          <div>
                            <p className="text-xs font-bold text-slate-500 mb-1">{formatDateIST(log.createdAt)} at {formatTimeIST(log.createdAt)}</p>
                            <span className="font-bold text-slate-200 group-hover:text-white text-lg transition-colors">{log.Item.name}</span>
                            <p className="text-xs text-slate-500 mt-1 font-medium">Dispatched by: <span className="text-slate-400">{log.User.name}</span></p>
                          </div>
                          <div className="text-right">
                            <span className="font-black text-sky-400 bg-sky-500/10 border border-sky-500/20 px-4 py-2 rounded-xl text-xl drop-shadow-[0_0_5px_rgba(14,165,233,0.3)]">
                              +{log.quantity} <span className="text-[10px] ml-1 opacity-70 uppercase text-sky-300 tracking-widest">{log.Item.unit}</span>
                            </span>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-2">{log.notes || "Added to Pantry"}</p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
               </div>
            </div>

            {/* Register History */}
            <div className="glass-panel rounded-3xl overflow-hidden flex flex-col flex-1 min-h-[350px]">
               <div className="p-8 border-b border-white/10 bg-white/5 backdrop-blur-md flex items-center justify-between shrink-0">
                 <div className="flex items-center gap-4">
                   <History className="w-6 h-6 text-slate-400" />
                   <h2 className="text-xl font-bold text-white uppercase tracking-widest">Today's Transactions</h2>
                 </div>
                 <span className="text-xs font-black tracking-widest uppercase bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full border border-blue-500/20">Live</span>
               </div>
               
               <div className="flex-1 overflow-auto p-8">
                  {recentTabs.length === 0 ? (
                    <div className="flex flex-col items-center justify-center text-slate-500 py-10 animate-pulse h-full">
                      <Receipt className="w-12 h-12 mb-4 opacity-20" />
                      <p className="font-bold tracking-widest uppercase text-sm">No closed registers today.</p>
                    </div>
                  ) : (
                    <ul className="space-y-4">
                      {recentTabs.map(tab => (
                        <li key={tab.id} className="flex items-start justify-between p-5 rounded-2xl border border-white/5 bg-white/5 hover:bg-white/10 hover:border-white/20 transition-all group shadow-sm gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-1">
                               <p className="text-xs font-bold text-slate-500">{formatTimeIST(tab.closedAt || tab.openedAt)}</p>
                               {tab.status === "CANCELLED" && <span className="text-[9px] font-black tracking-widest bg-red-500/20 text-red-400 px-2 py-0.5 rounded uppercase border border-red-500/20">Cancelled</span>}
                            </div>
                            <span className="font-bold text-slate-200 group-hover:text-white text-lg transition-colors block truncate">{tab.customerName || "Walk-in Customer"}</span>
                            <p className="text-xs text-slate-500 mt-1 font-medium">Billed by: <span className="text-slate-400">{tab.User.name}</span></p>
                            <div className="mt-3">
                              <TabReceiptModal
                                tabId={tab.id}
                                customerName={tab.customerName}
                                totalAmount={tab.totalAmount}
                                paymentMode={tab.paymentMode}
                                closedAt={tab.closedAt}
                                items={tab.Items}
                                accentColor="blue"
                              />
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <span className={`font-black tracking-widest px-4 py-2 rounded-xl text-xl drop-shadow-[0_0_5px_rgba(255,255,255,0.1)] ${tab.status === "CANCELLED" ? "text-slate-500 bg-white/5 border border-white/5" : "text-blue-400 bg-blue-500/10 border border-blue-500/20"}`}>
                              ₹{tab.totalAmount.toFixed(2)}
                            </span>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-2">{tab.paymentMode || "UNKNOWN"}</p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
               </div>
            </div>

            {isOwner && (
              <div className="glass-panel p-6 rounded-3xl mt-2 border border-sky-500/10 hover:border-sky-500/30 transition-colors">
                <h2 className="text-lg font-bold text-white uppercase tracking-widest mb-6 flex items-center justify-between">
                  <span>Daily ExceL Reports</span>
                </h2>
                <div className="flex overflow-x-auto gap-4 pb-2 custom-scrollbar">
                   {last7Days.map((day) => (
                     <div key={day.dateStr} className="min-w-[140px] p-4 bg-white/5 border border-white/10 rounded-2xl flex flex-col items-center gap-3 hover:bg-white/10 transition-colors">
                       <span className="text-xs font-bold text-slate-400 uppercase tracking-widest text-center whitespace-nowrap">{day.isToday ? "Today" : day.displayDate}</span>
                       <a href={`/api/export/transactions?outlet=CHAI_JOINT&date=${day.dateStr}`} download className="w-full">
                         <Button variant="secondary" className="w-full text-xs h-8 bg-sky-500/20 text-sky-400 hover:bg-sky-500/40 border border-sky-500/30">Download</Button>
                       </a>
                     </div>
                   ))}
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </AppLayout>
  )
}
