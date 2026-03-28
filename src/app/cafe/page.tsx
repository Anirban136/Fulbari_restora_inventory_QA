import { prisma } from "@/lib/prisma"
import { Button } from "@/components/ui/button"
import { UserControls } from "@/components/user-controls" // reuse logout button component
import { Coffee, PackageOpen, LayoutGrid, Search, History, Receipt } from "lucide-react"
import Link from "next/link"

export default async function CafeDashboard() {
  const cafe = await prisma.outlet.findFirst({ where: { type: "CAFE" }})
  
  if (!cafe) return <div className="min-h-screen bg-background text-white p-10 font-bold">Cafe outlet not configured.</div>

  const threeDaysAgo = new Date();
  threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

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
        openedAt: { gte: threeDaysAgo } 
      },
      include: { User: true },
      orderBy: { closedAt: 'desc' }
    })
  ])

  return (
    <div className="min-h-screen bg-background selection:bg-amber-500/30 relative overflow-hidden flex flex-col items-center">
      
      {/* Background Decorators */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay pointer-events-none z-0"></div>
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-amber-600/10 rounded-full blur-[150px] pointer-events-none z-0"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-orange-500/10 rounded-full blur-[150px] pointer-events-none z-0"></div>

      <div className="w-full max-w-6xl px-6 py-10 relative z-10 flex flex-col min-h-screen">
        
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
          <UserControls />
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 flex-1">
          
          <div className="lg:col-span-4 flex flex-col gap-8">
            {/* Launch POS */}
            <div className="glass-panel p-8 rounded-3xl group hover:border-amber-500/30 transition-all border border-amber-500/10 shadow-[0_20px_60px_-15px_rgba(245,158,11,0.1)] relative overflow-hidden">
               <div className="absolute -right-4 -top-4 w-32 h-32 bg-amber-500/10 rounded-full blur-[40px] group-hover:bg-amber-500/20 transition-all pointer-events-none"></div>
               <LayoutGrid className="w-10 h-10 text-amber-500 mb-6 drop-shadow-[0_0_15px_rgba(245,158,11,0.5)]" />
               <h2 className="text-2xl font-black text-white mb-2 relative z-10">POS Terminal</h2>
               <p className="text-slate-400 font-medium text-sm mb-8 leading-relaxed relative z-10">Launch the touch interface to take orders and auto-deduct live ingredients.</p>
               <Link href="/tabs" className="w-full flex">
                 <Button className="flex-1 w-full h-14 text-lg font-black tracking-widest uppercase bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black rounded-xl transition-all shadow-[0_0_30px_-5px_rgba(245,158,11,0.5)] active:scale-95">
                   Open Registers
                 </Button>
               </Link>
            </div>

            {/* Current Stock */}
            <div className="glass-panel p-6 rounded-3xl flex-1 max-h-[500px] flex flex-col">
               <h2 className="text-lg font-bold text-white uppercase tracking-widest mb-6 flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></div> Live Pantry
               </h2>
               <div className="flex-1 overflow-auto pr-2">
                  <ul className="space-y-3">
                    {localStock.length === 0 ? (
                      <p className="text-slate-500 text-sm font-medium">No inventory available.</p>
                    ) : (
                      localStock.map(stock => (
                        <li key={stock.id} className="flex justify-between items-center p-3 rounded-xl border border-white/5 bg-white/5">
                          <span className="font-bold text-slate-300 text-sm">{stock.Item.name}</span>
                          <span className="font-black text-amber-400 bg-amber-500/10 px-2 py-1 rounded-md text-sm">
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
                            <p className="text-xs font-bold text-slate-500 mb-1">{log.createdAt.toLocaleDateString()} at {log.createdAt.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                            <span className="font-bold text-slate-200 group-hover:text-white text-lg transition-colors">{log.Item.name}</span>
                            <p className="text-xs text-slate-500 mt-1 font-medium">Dispatched by: <span className="text-slate-400">{log.User.name}</span></p>
                          </div>
                          <div className="text-right">
                            <span className="font-black text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-xl text-xl drop-shadow-[0_0_5px_rgba(52,211,153,0.3)]">
                              +{log.quantity} <span className="text-[10px] ml-1 opacity-70 uppercase text-emerald-300 tracking-widest">{log.Item.unit}</span>
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
                   <h2 className="text-xl font-bold text-white uppercase tracking-widest">Register History</h2>
                 </div>
                 <span className="text-xs font-black tracking-widest uppercase bg-amber-500/20 text-amber-400 px-3 py-1 rounded-full border border-amber-500/20">Last 3 Days</span>
               </div>
               
               <div className="flex-1 overflow-auto p-8">
                  {recentTabs.length === 0 ? (
                    <div className="flex flex-col items-center justify-center text-slate-500 py-10 animate-pulse h-full">
                      <Receipt className="w-12 h-12 mb-4 opacity-20" />
                      <p className="font-bold tracking-widest uppercase text-sm">No closed registers in the last 3 days.</p>
                    </div>
                  ) : (
                    <ul className="space-y-4">
                      {recentTabs.map(tab => (
                        <li key={tab.id} className="flex items-center justify-between p-5 rounded-2xl border border-white/5 bg-white/5 hover:bg-white/10 hover:border-white/20 transition-all group shadow-sm">
                          <div>
                            <div className="flex items-center gap-3 mb-1">
                               <p className="text-xs font-bold text-slate-500">{(tab.closedAt || tab.openedAt).toLocaleDateString()} at {(tab.closedAt || tab.openedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                               {tab.status === "CANCELLED" && <span className="text-[9px] font-black tracking-widest bg-red-500/20 text-red-400 px-2 py-0.5 rounded uppercase border border-red-500/20">Cancelled</span>}
                            </div>
                            <span className="font-bold text-slate-200 group-hover:text-white text-lg transition-colors">{tab.customerName || "Walk-in Customer"}</span>
                            <p className="text-xs text-slate-500 mt-1 font-medium">Billed by: <span className="text-slate-400">{tab.User.name}</span></p>
                          </div>
                          <div className="text-right">
                            <span className={`font-black tracking-widest px-4 py-2 rounded-xl text-xl drop-shadow-[0_0_5px_rgba(255,255,255,0.1)] ${tab.status === "CANCELLED" ? "text-slate-500 bg-white/5 border border-white/5" : "text-amber-400 bg-amber-500/10 border border-amber-500/20"}`}>
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
          </div>

        </div>
      </div>
    </div>
  )
}
