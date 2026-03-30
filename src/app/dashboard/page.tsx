import { prisma } from "@/lib/prisma"
export const dynamic = 'force-dynamic'
import { TrendingUp, CreditCard, Activity, BarChart3, Crown, Receipt } from "lucide-react"
import { getISTDateBounds } from "@/lib/utils"
import { GrossRevenueModal } from "@/components/GrossRevenueModal"

export default async function DashboardOverview() {
  const { startUTC: startOfDay, endUTC: endOfDay } = getISTDateBounds();

  // 1. Fetch Today's Revenue & Sold Items
  const todaysClosedTabs = await prisma.tab.findMany({
    where: { status: "CLOSED", closedAt: { gte: startOfDay, lte: endOfDay } },
    include: { 
      Outlet: true,
      Items: {
        include: {
          MenuItem: true
        }
      }
    }
  })

  let totalRevenue = 0
  let cashRevenue = 0
  let onlineRevenue = 0
  let splitRevenue = 0
  const outletStats: Record<string, { total: number, cash: number, online: number, split: number }> = {}
  const categorySales: Record<string, number> = {}
  const itemSales: Record<string, {name: string, qty: number, rev: number}> = {}

  // 2. Compute the analytics
  todaysClosedTabs.forEach(tab => {
    totalRevenue += tab.totalAmount
    if (tab.paymentMode === "CASH") cashRevenue += tab.totalAmount
    if (tab.paymentMode === "ONLINE") onlineRevenue += tab.totalAmount
    if (tab.paymentMode === "SPLIT") splitRevenue += tab.totalAmount
    
    if (!outletStats[tab.Outlet.name]) {
      outletStats[tab.Outlet.name] = { total: 0, cash: 0, online: 0, split: 0 }
    }
    outletStats[tab.Outlet.name].total += tab.totalAmount
    if (tab.paymentMode === "CASH") outletStats[tab.Outlet.name].cash += tab.totalAmount
    if (tab.paymentMode === "ONLINE") outletStats[tab.Outlet.name].online += tab.totalAmount
    if (tab.paymentMode === "SPLIT") outletStats[tab.Outlet.name].split += tab.totalAmount

    tab.Items.forEach(item => {
      const cat = item.MenuItem.categoryId || "Misc"
      if (!categorySales[cat]) categorySales[cat] = 0
      const itemRev = item.priceAtTime * item.quantity
      categorySales[cat] += itemRev

      if (!itemSales[item.menuItemId]) {
        itemSales[item.menuItemId] = { name: item.MenuItem.name, qty: 0, rev: 0 }
      }
      itemSales[item.menuItemId].qty += item.quantity
      itemSales[item.menuItemId].rev += itemRev
    })
  })

  // Prepare Graphical Data
  const sortedCategories = Object.entries(categorySales).sort((a, b) => b[1] - a[1]).slice(0, 5)
  const maxCatSales = sortedCategories.length > 0 ? sortedCategories[0][1] : 1

  const sortedItems = Object.values(itemSales).sort((a, b) => b.qty - a.qty).slice(0, 5)

  return (
    <div className="space-y-10 relative">
      {/* Background Decorators */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-[100px] pointer-events-none"></div>

      <header>
        <h2 className="text-4xl font-extrabold tracking-tight text-white flex items-center gap-3">
          Executive Overview
          <div className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_15px_#10b981]"></div>
        </h2>
        <p className="text-muted-foreground mt-2 text-lg">Real-time performance metrics across all operations.</p>
      </header>

      {/* High-Level Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <GrossRevenueModal totalRevenue={totalRevenue} />

        <div className="glass-panel p-6 rounded-3xl group hover:-translate-y-1 transition-transform duration-300">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Cash Collected</h3>
            <span className="text-amber-400 text-xl">💵</span>
          </div>
          <p className="text-3xl font-bold text-foreground">₹{cashRevenue.toFixed(2)}</p>
        </div>

        <div className="glass-panel p-6 rounded-3xl group hover:-translate-y-1 transition-transform duration-300">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Digital (UPI/Card)</h3>
            <CreditCard className="text-blue-400 w-5 h-5" />
          </div>
          <p className="text-3xl font-bold text-foreground">₹{onlineRevenue.toFixed(2)}</p>
        </div>
        
        <div className="glass-panel p-6 rounded-3xl group hover:-translate-y-1 transition-transform duration-300">
           <div className="flex justify-between items-start mb-4">
             <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Split Payments</h3>
             <Activity className="text-purple-400 w-5 h-5" />
           </div>
           <p className="text-3xl font-bold text-foreground">₹{splitRevenue.toFixed(2)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Category-Wise Graphical Sales */}
        <div className="lg:col-span-2 glass-panel rounded-3xl overflow-hidden flex flex-col relative group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-[80px] pointer-events-none group-hover:bg-indigo-500/20 transition-all"></div>
          <div className="p-6 border-b border-border/50 bg-white/5 flex justify-between items-center backdrop-blur-md relative z-10">
            <div className="flex items-center gap-3">
              <BarChart3 className="text-indigo-400 w-5 h-5" />
              <h3 className="text-lg font-bold text-white tracking-wide">Category Sales</h3>
            </div>
            <span className="text-[10px] font-black tracking-widest bg-indigo-500/20 border border-indigo-500/30 px-3 py-1 rounded-full text-indigo-300 uppercase">Live Metrics</span>
          </div>
          <div className="p-8 bg-black/20 flex-1 relative z-10">
            {sortedCategories.length === 0 ? (
               <div className="text-center py-10 text-muted-foreground font-medium">No sales data available today.</div>
            ) : (
                <div className="space-y-6">
                  {sortedCategories.map(([category, amount]) => {
                    const percentage = (amount / maxCatSales) * 100
                    return (
                      <div key={category} className="space-y-2">
                        <div className="flex justify-between items-end">
                          <span className="font-bold text-slate-300 uppercase tracking-widest text-xs">{category}</span>
                          <span className="font-black text-white">₹{amount.toFixed(2)}</span>
                        </div>
                        <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                          <div 
                            className="h-full bg-gradient-to-r from-indigo-500 to-sky-400 rounded-full transition-all duration-1000 ease-out" 
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    )
                  })}
                </div>
            )}
          </div>
        </div>

        {/* Top Selling Items */}
        <div className="glass-panel rounded-3xl overflow-hidden flex flex-col relative group">
          <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/10 rounded-full blur-[50px] pointer-events-none group-hover:bg-amber-500/20 transition-all"></div>
          <div className="p-6 border-b border-border/50 bg-amber-500/10 flex justify-between items-center backdrop-blur-md relative z-10">
            <div className="flex gap-3 items-center">
              <Crown className="text-amber-400 w-5 h-5" />
              <h3 className="text-lg font-bold text-amber-200 tracking-wide">Top Sellers</h3>
            </div>
          </div>
          <div className="p-6 bg-black/20 flex-1 relative z-10">
             {sortedItems.length === 0 ? (
               <div className="p-8 text-muted-foreground text-center font-medium">No items sold today.</div>
             ) : (
               <ul className="space-y-3">
                 {sortedItems.map((item, index) => (
                   <li key={item.name} className="p-4 flex gap-4 items-center rounded-2xl bg-white/5 border border-white/5 hover:border-amber-500/30 hover:bg-amber-500/5 transition-colors group">
                     {/* Rank Badge */}
                     <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-sm shadow-inner shrink-0 ${
                       index === 0 ? 'bg-amber-500 text-black shadow-[0_0_15px_#f59e0b]' : 
                       index === 1 ? 'bg-slate-300 text-slate-800' :
                       index === 2 ? 'bg-amber-700 text-amber-100' :
                       'bg-white/10 text-slate-400'
                     }`}>
                       #{index + 1}
                     </div>
                     <div className="flex-1 min-w-0">
                       <p className="font-bold text-slate-200 truncate group-hover:text-amber-300 transition-colors text-sm">{item.name}</p>
                       <p className="text-xs text-slate-500 font-medium tracking-wide mt-1"><span className="text-emerald-400">{item.qty} sold</span> • ₹{item.rev.toFixed(0)}</p>
                     </div>
                   </li>
                 ))}
               </ul>
             )}
          </div>
        </div>

        {/* Outlet Breakdown (Compact) */}
        <div className="lg:col-span-3 glass-panel rounded-3xl overflow-hidden border border-white/10">
           <div className="p-6 bg-white/5 border-b border-white/10 flex items-center justify-between">
              <h3 className="text-sm font-bold tracking-widest uppercase text-slate-400">Total Revenue by Outlet</h3>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-white/10">
              {Object.keys(outletStats).length === 0 ? (
                 <div className="col-span-3 p-6 text-center text-sm text-slate-500">No data</div>
              ) : (
                 Object.entries(outletStats).map(([name, stats]) => (
                   <div key={name} className="p-6 flex flex-col items-center justify-center hover:bg-white/5 transition-colors group">
                     <span className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 group-hover:text-slate-300">{name}</span>
                     <span className="text-3xl font-black text-white group-hover:text-emerald-400 transition-colors drop-shadow-[0_0_15px_rgba(255,255,255,0.1)] mb-4">₹{stats.total.toFixed(2)}</span>
                     <div className="w-full space-y-2">
                       <div className="flex justify-between items-center bg-black/20 px-3 py-2 rounded-lg border border-white/5">
                         <span className="text-[10px] uppercase tracking-widest font-bold text-emerald-400">💵 Cash</span>
                         <span className="text-xs font-bold text-slate-300">₹{stats.cash.toFixed(2)}</span>
                       </div>
                       <div className="flex justify-between items-center bg-black/20 px-3 py-2 rounded-lg border border-white/5">
                         <span className="text-[10px] uppercase tracking-widest font-bold text-blue-400">💳 Online</span>
                         <span className="text-xs font-bold text-slate-300">₹{stats.online.toFixed(2)}</span>
                       </div>
                       {stats.split > 0 && (
                         <div className="flex justify-between items-center bg-black/20 px-3 py-2 rounded-lg border border-white/5">
                           <span className="text-[10px] uppercase tracking-widest font-bold text-purple-400">🔄 Split</span>
                           <span className="text-xs font-bold text-slate-300">₹{stats.split.toFixed(2)}</span>
                         </div>
                       )}
                     </div>
                   </div>
                 ))
              )}
           </div>
        </div>

      </div>

      {/* Today's Transactions & Exports */}
      <div className="glass-panel rounded-3xl overflow-hidden mt-8 border border-emerald-500/10 hover:border-emerald-500/30 transition-colors relative z-10">
         <div className="p-6 bg-white/5 border-b border-white/10 flex flex-col md:flex-row items-center justify-between backdrop-blur-md gap-4">
            <h3 className="text-xl font-bold text-white uppercase tracking-widest flex items-center gap-3">
              <Receipt className="w-5 h-5 text-emerald-400" />
              Today's Completed Tabs
            </h3>
            <div className="flex gap-3">
              <a href={`/api/export/transactions?outlet=CAFE`} download>
                <button className="px-4 py-2 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-400 rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95 shadow-[0_0_15px_-3px_rgba(245,158,11,0.3)]">
                  Export Cafe (CSV)
                </button>
              </a>
              <a href={`/api/export/transactions?outlet=CHAI_JOINT`} download>
                <button className="px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/40 text-blue-400 rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95 shadow-[0_0_15px_-3px_rgba(59,130,246,0.3)]">
                  Export Chai (CSV)
                </button>
              </a>
            </div>
         </div>
         <div className="p-0 max-h-[400px] overflow-auto custom-scrollbar bg-black/20">
            {todaysClosedTabs.length === 0 ? (
               <div className="text-center py-10 text-slate-500 font-medium tracking-widest uppercase">No transactions recorded today.</div>
            ) : (
               <table className="w-full text-left border-collapse">
                 <thead className="bg-black/60 sticky top-0 z-10 backdrop-blur-xl">
                   <tr>
                     <th className="p-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Time</th>
                     <th className="p-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Outlet</th>
                     <th className="p-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Customer</th>
                     <th className="p-5 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Amount</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-white/5">
                   {[...todaysClosedTabs].sort((a,b) => (b.closedAt?.getTime() || 0) - (a.closedAt?.getTime() || 0)).map(tab => (
                     <tr key={tab.id} className="hover:bg-white/5 transition-colors group">
                       <td className="p-5 text-sm text-slate-400 font-medium group-hover:text-slate-300 transition-colors">{tab.closedAt ? new Date(tab.closedAt).toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit' }) : "N/A"}</td>
                       <td className="p-5 text-sm font-bold text-emerald-400">{tab.Outlet.name}</td>
                       <td className="p-5 text-sm text-slate-300 font-medium">{tab.customerName || "Walk-in"}</td>
                       <td className="p-5 text-lg text-white font-black text-right tracking-tight drop-shadow-md">₹{tab.totalAmount.toFixed(2)}</td>
                     </tr>
                   ))}
                 </tbody>
               </table>
            )}
         </div>
      </div>
    </div>
  )
}
