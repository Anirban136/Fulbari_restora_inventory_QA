import { prisma } from "@/lib/prisma"
export const dynamic = 'force-dynamic'
import { TrendingUp, CreditCard, Activity, BarChart3, Crown, Receipt, AlertTriangle, PackageSearch } from "lucide-react"
import { getISTDateBounds } from "@/lib/utils"
import { GrossRevenueModal } from "@/components/GrossRevenueModal"

export default async function DashboardOverview() {
  const { startUTC: startOfDay, endUTC: endOfDay } = getISTDateBounds();

  // 1. Fetch Data
  const [todaysClosedTabs, lowStockItems] = await Promise.all([
    prisma.tab.findMany({
      where: { status: "CLOSED", closedAt: { gte: startOfDay, lte: endOfDay } },
      include: { 
        Outlet: true,
        Items: {
          include: {
            MenuItem: true
          }
        }
      }
    }),
    prisma.item.findMany({
      where: { minStock: { gt: 0 } },
      orderBy: { name: 'asc' }
    })
  ])

  // Filter low stock items in JS (Prisma doesn't support field-to-field comparison in where clause easily)
  const alerts = lowStockItems.filter(item => item.currentStock <= item.minStock)

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

      <header className="relative z-10 pt-2 lg:pt-0">
        <h2 className="text-lg lg:text-4xl font-black tracking-tight text-foreground flex items-center gap-3">
          Executive Overview
          <div className="h-2 w-2 lg:h-3 lg:w-3 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_15px_#10b981]"></div>
        </h2>
        <p className="text-foreground/70 dark:text-muted-foreground mt-1 text-[10px] lg:text-lg font-bold">Real-time performance metrics.</p>
      </header>

      {/* High-Level Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
        <GrossRevenueModal totalRevenue={totalRevenue} />

        <div className="glass-panel p-3 lg:p-6 rounded-2xl lg:rounded-3xl group hover:-translate-y-1 transition-transform duration-300">
          <div className="flex justify-between items-start mb-2 lg:mb-4">
            <h3 className="text-[8px] lg:text-xs font-bold text-muted-foreground uppercase tracking-widest">Cash Collected</h3>
            <span className="text-amber-500 text-base lg:text-xl">💵</span>
          </div>
          <p className="text-lg lg:text-3xl font-black text-foreground">₹{cashRevenue.toFixed(0)}</p>
        </div>

        <div className="glass-panel p-3 lg:p-6 rounded-2xl lg:rounded-3xl group hover:-translate-y-1 transition-transform duration-300">
          <div className="flex justify-between items-start mb-2 lg:mb-4">
            <h3 className="text-[8px] lg:text-xs font-bold text-muted-foreground uppercase tracking-widest">Digital (UPI/Card)</h3>
            <CreditCard className="text-blue-600 dark:text-blue-400 w-3 h-3 lg:w-5 lg:h-5" />
          </div>
          <p className="text-lg lg:text-3xl font-black text-foreground">₹{onlineRevenue.toFixed(0)}</p>
        </div>
        
        <div className="glass-panel p-3 lg:p-6 rounded-2xl lg:rounded-3xl group hover:-translate-y-1 transition-transform duration-300">
           <div className="flex justify-between items-start mb-2 lg:mb-4">
             <h3 className="text-[8px] lg:text-xs font-bold text-muted-foreground uppercase tracking-widest">Split Payments</h3>
             <Activity className="text-purple-600 dark:text-purple-400 w-3 h-3 lg:w-5 lg:h-5" />
           </div>
           <p className="text-lg lg:text-3xl font-black text-foreground">₹{splitRevenue.toFixed(0)}</p>
        </div>
      </div>

      {/* Low Stock Alerts */}
      {alerts.length > 0 && (
        <div className="glass-panel border-red-500/20 bg-red-500/5 p-6 rounded-[2rem] flex flex-col sm:flex-row items-center gap-6 animate-in slide-in-from-top-4 duration-500 shadow-[0_20px_50px_-20px_rgba(239,68,68,0.2)]">
          <div className="h-16 w-16 bg-red-500/10 rounded-2xl flex items-center justify-center shrink-0 border border-red-500/20 shadow-[0_0_20px_rgba(239,68,68,0.2)]">
            <AlertTriangle className="text-red-500 w-8 h-8 animate-pulse" />
          </div>
          <div className="flex-1 text-center sm:text-left">
            <h3 className="text-xl font-black text-foreground flex items-center justify-center sm:justify-start gap-2 uppercase tracking-tight">
              Inventory Alerts Needed
              <span className="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full ml-2 animate-bounce">{alerts.length}</span>
            </h3>
            <div className="mt-3 flex flex-wrap justify-center sm:justify-start gap-2">
              {alerts.map(item => (
                <div key={item.id} className="px-3 py-1.5 bg-muted/10 dark:bg-black/40 border border-red-500/20 rounded-xl flex items-center gap-2 group hover:border-red-500/50 transition-colors">
                  <span className="text-xs font-bold text-muted-foreground">{item.name}:</span>
                  <span className="text-xs font-black text-red-500 dark:text-red-400">{item.currentStock} {item.unit}</span>
                  <span className="text-[10px] text-muted-foreground/60 font-bold uppercase tracking-tighter">(Min: {item.minStock})</span>
                </div>
              ))}
            </div>
          </div>
          <a href="/dashboard/inventory" className="shrink-0 w-full sm:w-auto">
            <button className="w-full sm:w-auto px-6 py-3 bg-red-600 hover:bg-red-500 text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2">
              <PackageSearch className="w-4 h-4" /> Resolve Now
            </button>
          </a>
        </div>
      )}



      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Category-Wise Graphical Sales */}
        <div className="lg:col-span-2 glass-panel rounded-3xl overflow-hidden flex flex-col relative group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-[80px] pointer-events-none group-hover:bg-indigo-500/20 transition-all"></div>
          <div className="p-4 lg:p-6 border-b border-border/50 bg-muted/20 dark:bg-white/5 flex justify-between items-center backdrop-blur-md relative z-10">
            <div className="flex items-center gap-3">
              <BarChart3 className="text-indigo-600 dark:text-indigo-400 w-4 h-4 lg:w-5 lg:h-5" />
              <h3 className="text-base lg:text-lg font-black text-foreground tracking-wide">Category Sales</h3>
            </div>
            <span className="text-[8px] lg:text-[10px] font-black tracking-widest bg-indigo-500/10 dark:bg-indigo-500/20 border border-indigo-500/30 px-2 lg:px-3 py-1 rounded-full text-indigo-700 dark:text-indigo-300 uppercase">Live Metrics</span>
          </div>
          <div className="p-4 lg:p-8 bg-muted/10 dark:bg-black/20 flex-1 relative z-10">
            {sortedCategories.length === 0 ? (
               <div className="text-center py-10 text-muted-foreground font-medium">No sales data available today.</div>
            ) : (
                <div className="space-y-6">
                  {sortedCategories.map(([category, amount]) => {
                    const percentage = (amount / maxCatSales) * 100
                    return (
                      <div key={category} className="space-y-1">
                        <div className="flex justify-between items-end">
                          <span className="font-bold text-muted-foreground uppercase tracking-widest text-[9px]">{category}</span>
                          <span className="font-black text-foreground text-sm">₹{amount.toFixed(2)}</span>
                        </div>
                        <div className="h-2 lg:h-3 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
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
          <div className="p-4 lg:p-6 border-b border-border/50 bg-amber-500/10 flex justify-between items-center backdrop-blur-md relative z-10">
            <div className="flex gap-3 items-center">
              <Crown className="text-amber-600 dark:text-amber-400 w-4 h-4 lg:w-5 lg:h-5" />
              <h3 className="text-base lg:text-lg font-black text-amber-700 dark:text-amber-200 tracking-wide">Top Sellers</h3>
            </div>
          </div>
          <div className="p-4 lg:p-6 bg-muted/5 dark:bg-black/20 flex-1 relative z-10">
             {sortedItems.length === 0 ? (
               <div className="p-8 text-muted-foreground text-center font-medium">No items sold today.</div>
             ) : (
               <ul className="space-y-2">
                 {sortedItems.map((item, index) => (
                   <li key={item.name} className="p-3 lg:p-4 flex gap-3 lg:gap-4 items-center rounded-xl lg:rounded-2xl bg-muted/5 dark:bg-white/5 border border-border/50 hover:border-amber-500/30 hover:bg-amber-500/5 transition-colors group">
                     {/* Rank Badge */}
                     <div className={`w-7 h-7 lg:w-8 lg:h-8 rounded-full flex items-center justify-center font-black text-xs lg:text-sm shadow-inner shrink-0 ${
                       index === 0 ? 'bg-amber-500 text-black shadow-[0_0_15px_#f59e0b]' : 
                       index === 1 ? 'bg-slate-200 dark:bg-slate-300 text-slate-800' :
                       index === 2 ? 'bg-amber-700 text-amber-100' :
                       'bg-muted text-muted-foreground dark:bg-white/10 dark:text-slate-400'
                     }`}>
                       #{index + 1}
                     </div>
                     <div className="flex-1 min-w-0">
                       <p className="font-bold text-foreground/90 truncate group-hover:text-amber-600 dark:group-hover:text-amber-300 transition-colors text-xs lg:text-sm">{item.name}</p>
                       <p className="text-[10px] lg:text-xs text-muted-foreground font-medium tracking-wide mt-0.5"><span className="text-emerald-600 dark:text-emerald-400">{item.qty} sold</span> • ₹{item.rev.toFixed(0)}</p>
                     </div>
                   </li>
                 ))}
               </ul>
             )}
          </div>
        </div>

        {/* Outlet Breakdown (Compact) */}
        <div className="lg:col-span-3 glass-panel rounded-3xl overflow-hidden border border-border/50">
           <div className="p-6 bg-muted/5 border-b border-border/50 flex items-center justify-between">
            <h3 className="text-sm font-black tracking-widest uppercase text-foreground/60">Total Revenue by Outlet</h3>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-border/50">
              {Object.keys(outletStats).length === 0 ? (
                 <div className="col-span-3 p-6 text-center text-sm text-foreground/50 italic">No data</div>
              ) : (
                  Object.entries(outletStats).map(([name, stats]) => (
                    <div key={name} className="p-4 lg:p-6 flex flex-col items-center justify-center hover:bg-muted/5 transition-colors group text-center">
                      <span className="text-[10px] lg:text-xs font-black text-foreground/60 uppercase tracking-widest mb-3 group-hover:text-foreground">{name}</span>
                      <span className="text-2xl lg:text-3xl font-black text-foreground group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors mb-4">₹{stats.total.toFixed(2)}</span>
                      <div className="w-full space-y-1.5 lg:space-y-2">
                       <div className="flex justify-between items-center bg-muted/20 dark:bg-black/20 px-3 py-2 rounded-lg border border-border/50">
                         <span className="text-[10px] uppercase tracking-widest font-bold text-emerald-600 dark:text-emerald-400">💵 Cash</span>
                         <span className="text-xs font-bold text-muted-foreground">₹{stats.cash.toFixed(2)}</span>
                       </div>
                       <div className="flex justify-between items-center bg-muted/20 dark:bg-black/20 px-3 py-2 rounded-lg border border-border/50">
                         <span className="text-[10px] uppercase tracking-widest font-bold text-blue-600 dark:text-blue-400">💳 Online</span>
                         <span className="text-xs font-bold text-muted-foreground">₹{stats.online.toFixed(2)}</span>
                       </div>
                       {stats.split > 0 && (
                         <div className="flex justify-between items-center bg-muted/20 dark:bg-black/20 px-3 py-2 rounded-lg border border-border/50">
                           <span className="text-[10px] uppercase tracking-widest font-bold text-purple-600 dark:text-purple-400">🔄 Split</span>
                           <span className="text-xs font-bold text-muted-foreground">₹{stats.split.toFixed(2)}</span>
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
         <div className="p-6 bg-muted/5 border-b border-border/50 flex flex-col md:flex-row items-center justify-between backdrop-blur-md gap-4">
            <h3 className="text-xl font-bold text-foreground uppercase tracking-widest flex items-center gap-3">
              <Receipt className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
              Today's Completed Tabs
            </h3>
            <div className="flex gap-3">
              <a href={`/api/export/transactions?outlet=CAFE`} download>
                <button className="px-4 py-2 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-600 dark:text-amber-400 rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95 shadow-[0_0_15px_-3px_rgba(245,158,11,0.3)]">
                  Export Cafe (CSV)
                </button>
              </a>
              <a href={`/api/export/transactions?outlet=CHAI_JOINT`} download>
                <button className="px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/40 text-blue-600 dark:text-blue-400 rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95 shadow-[0_0_15px_-3px_rgba(59,130,246,0.3)]">
                  Export Chai (CSV)
                </button>
              </a>
            </div>
         </div>
         <div className="p-0 overflow-x-auto custom-scrollbar bg-muted/5 dark:bg-black/20">
            <div className="min-w-[800px]">
            {todaysClosedTabs.length === 0 ? (
               <div className="text-center py-10 text-muted-foreground font-medium tracking-widest uppercase">No transactions recorded today.</div>
            ) : (
                <table className="w-full text-left border-collapse table-dense">
                  <thead className="bg-muted/20 dark:bg-black/60 sticky top-0 z-10 backdrop-blur-xl">
                    <tr>
                      <th className="p-3 lg:p-5 text-[10px] lg:text-xs font-bold text-muted-foreground uppercase tracking-widest">Time</th>
                      <th className="p-3 lg:p-5 text-[10px] lg:text-xs font-bold text-muted-foreground uppercase tracking-widest">Outlet</th>
                      <th className="p-3 lg:p-5 text-[10px] lg:text-xs font-bold text-muted-foreground uppercase tracking-widest">Customer</th>
                      <th className="p-3 lg:p-5 text-[10px] lg:text-xs font-bold text-muted-foreground uppercase tracking-widest text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {[...todaysClosedTabs].sort((a,b) => (b.closedAt?.getTime() || 0) - (a.closedAt?.getTime() || 0)).map(tab => (
                      <tr key={tab.id} className="hover:bg-muted/5 transition-colors group">
                        <td className="p-3 lg:p-5 text-[11px] lg:text-sm text-muted-foreground font-medium group-hover:text-foreground transition-colors">{tab.closedAt ? new Date(tab.closedAt).toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit' }) : "N/A"}</td>
                        <td className="p-3 lg:p-5 text-[11px] lg:text-sm font-bold text-emerald-600 dark:text-emerald-400">{tab.Outlet.name}</td>
                        <td className="p-3 lg:p-5 text-[11px] lg:text-sm text-foreground/80 font-medium">{tab.customerName || "Walk-in"}</td>
                        <td className="p-3 lg:p-5 text-sm lg:text-lg text-foreground font-black text-right tracking-tight">₹{tab.totalAmount.toFixed(0)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
            )}
            </div>
         </div>
      </div>
    </div>
  )
}
