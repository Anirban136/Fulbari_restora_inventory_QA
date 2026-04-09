import { prisma } from "@/lib/prisma"
export const dynamic = 'force-dynamic'
import { TrendingUp, CreditCard, Activity, BarChart3, Crown, Receipt, AlertTriangle, PackageSearch, Coffee } from "lucide-react"
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

  // Filter low stock items in JS
  const alerts = lowStockItems.filter(item => item.currentStock <= item.minStock)

  // 2. Compute the analytics
  let totalRevenue = 0
  
  // Filtered for Chai & Cafe Hero Metrics
  let chaiCafeTotal = 0
  let chaiCafeCash = 0
  let chaiCafeDigital = 0

  const outletStats: Record<string, { total: number, cash: number, online: number, split: number }> = {}
  const categorySales: Record<string, number> = {}
  const itemSales: Record<string, {name: string, qty: number, rev: number}> = {}

  todaysClosedTabs.forEach(tab => {
    const isChaiOrCafe = tab.Outlet.name === "CHAI_JOINT" || tab.Outlet.name === "CAFE"
    
    totalRevenue += tab.totalAmount

    // Populate Chai/Cafe Specific Metrics
    if (isChaiOrCafe) {
      chaiCafeTotal += tab.totalAmount
      if (tab.paymentMode === "CASH") chaiCafeCash += tab.totalAmount
      if (tab.paymentMode === "ONLINE") chaiCafeDigital += tab.totalAmount
      if (tab.paymentMode === "SPLIT") {
        chaiCafeCash += tab.totalAmount / 2
        chaiCafeDigital += tab.totalAmount / 2
      }
    }
    
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

  const sortedCategories = Object.entries(categorySales).sort((a, b) => b[1] - a[1])
  const sortedItems = Object.entries(itemSales).sort((a, b) => b[1].qty - a[1].qty)

  return (
    <div className="space-y-10 relative px-4 pt-6 pb-20 max-w-[1600px] mx-auto">
      {/* Background Decorators */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-[100px] pointer-events-none -z-10"></div>

      <header className="relative z-10 pt-4 lg:pt-0 mb-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h2 className="text-4xl lg:text-7xl font-extrabold tracking-tighter text-foreground flex items-center gap-4">
              Ops <span className="text-primary">Intelligence</span>
              <div className="h-4 w-4 rounded-full bg-emerald-500 animate-pulse-slow shadow-[0_0_30px_#10b981]"></div>
            </h2>
            <p className="text-muted-foreground mt-2 text-[10px] lg:text-sm font-black uppercase tracking-[0.4em] opacity-60">
              Live Flow Analysis • {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' })}
            </p>
          </div>
          <div className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/20 px-6 py-3 rounded-full backdrop-blur-xl">
            <Activity className="w-5 h-5 text-emerald-500 animate-pulse" />
            <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-[0.2em]">System Optimal</span>
          </div>
        </div>
      </header>

      {/* Main Executive Panel (Chai + Cafe) */}
      <div className="space-y-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          
          {/* Hero Card - 7 Column Width on Desktop */}
          <div className="md:col-span-7">
            <GrossRevenueModal totalRevenue={chaiCafeTotal} />
          </div>
          
          {/* Quick Stats - 5 Column Width on Desktop */}
          <div className="md:col-span-5 grid grid-cols-2 gap-4 sm:gap-6">
             <div className="glass-card p-6 rounded-[2.5rem] flex flex-col justify-between hover:-translate-y-2 transition-all duration-500 bg-amber-500/5 group">
                <div className="flex justify-between items-center">
                  <div className="p-3 bg-amber-500/10 rounded-2xl group-hover:rotate-12 transition-transform">
                    <Coffee className="w-6 h-6 text-amber-500" />
                  </div>
                  <span className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-[0.2em]">Cafe Branch</span>
                </div>
                <div className="mt-8">
                  <p className="text-[10px] font-black text-muted-foreground uppercase opacity-60 mb-1">Volume</p>
                  <p className="text-3xl font-black text-foreground">₹{(outletStats["CAFE"]?.total || 0).toFixed(0)}</p>
                </div>
             </div>

             <div className="glass-card p-6 rounded-[2.5rem] flex flex-col justify-between hover:-translate-y-2 transition-all duration-500 bg-indigo-500/5 group">
                <div className="flex justify-between items-center">
                  <div className="p-3 bg-indigo-500/10 rounded-2xl group-hover:rotate-12 transition-transform">
                    <Activity className="w-6 h-6 text-indigo-500" />
                  </div>
                  <span className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-[0.2em]">Chai Joint</span>
                </div>
                <div className="mt-8">
                  <p className="text-[10px] font-black text-muted-foreground uppercase opacity-60 mb-1">Volume</p>
                  <p className="text-3xl font-black text-foreground">₹{(outletStats["CHAI_JOINT"]?.total || 0).toFixed(0)}</p>
                </div>
             </div>

             <div className="glass-card p-6 rounded-[2.5rem] flex flex-col justify-between hover:-translate-y-2 transition-all duration-500 bg-emerald-500/5 group">
                <div className="flex justify-between items-center">
                  <div className="p-3 bg-emerald-500/10 rounded-2xl group-hover:rotate-12 transition-transform">
                    <TrendingUp className="w-6 h-6 text-emerald-500" />
                  </div>
                  <span className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-[0.2em]">Hard Cash</span>
                </div>
                <div className="mt-8">
                  <p className="text-[10px] font-black text-muted-foreground uppercase opacity-60 mb-1">Collected</p>
                  <p className="text-3xl font-black text-foreground">₹{chaiCafeCash.toFixed(0)}</p>
                </div>
             </div>

             <div className="glass-card p-6 rounded-[2.5rem] flex flex-col justify-between hover:-translate-y-2 transition-all duration-500 bg-blue-500/5 group">
                <div className="flex justify-between items-center">
                  <div className="p-3 bg-blue-500/10 rounded-2xl group-hover:rotate-12 transition-transform">
                    <CreditCard className="w-6 h-6 text-blue-500" />
                  </div>
                  <span className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-[0.2em]">Digital</span>
                </div>
                <div className="mt-8">
                  <p className="text-[10px] font-black text-muted-foreground uppercase opacity-60 mb-1">UPI Flows</p>
                  <p className="text-3xl font-black text-foreground">₹{chaiCafeDigital.toFixed(0)}</p>
                </div>
             </div>
          </div>
        </div>
      </div>

      {/* alerts (Low Stock) */}
      {alerts.length > 0 && (
        <div className="glass-card border-red-500/30 bg-red-500/5 p-8 rounded-[3rem] flex flex-col lg:flex-row items-center gap-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 blur-3xl rounded-full"></div>
          <div className="h-20 w-20 bg-red-500 text-white rounded-[2rem] flex items-center justify-center shrink-0 shadow-[0_20px_40px_-10px_rgba(239,68,68,0.5)]">
            <AlertTriangle className="w-10 h-10 animate-bounce" />
          </div>
          <div className="flex-1 text-center lg:text-left">
            <h3 className="text-2xl font-black text-foreground uppercase tracking-tight">Critical Supply Alert</h3>
            <div className="mt-4 flex flex-wrap justify-center lg:justify-start gap-3">
              {alerts.slice(0, 5).map(item => (
                <div key={item.id} className="px-4 py-2 bg-black/40 border border-red-500/20 rounded-2xl flex items-center gap-3">
                  <span className="text-xs font-black text-foreground">{item.name}</span>
                  <span className="text-xs font-black text-red-500">{item.currentStock} {item.unit}</span>
                </div>
              ))}
            </div>
          </div>
          <a href="/dashboard/inventory" className="shrink-0 w-full lg:w-auto">
            <button className="w-full px-10 py-4 bg-primary text-primary-foreground rounded-2xl font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl">
              Restock Global
            </button>
          </a>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 relative z-10">
        
        {/* Category Performance */}
        <div className="glass-panel p-8 rounded-[3rem] relative overflow-hidden group">
          <div className="absolute -top-10 -right-10 w-64 h-64 bg-primary/10 rounded-full blur-[80px]"></div>
          
          <div className="flex justify-between items-center mb-10">
            <div>
              <h3 className="text-2xl font-black text-foreground tracking-tight uppercase">Flow Categories</h3>
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mt-1 opacity-60">Revenue Distribution</p>
            </div>
            <BarChart3 className="text-primary w-8 h-8" />
          </div>

          <div className="space-y-8">
            {sortedCategories.length === 0 ? (
              <div className="text-center py-20 text-muted-foreground font-black uppercase tracking-widest opacity-20 italic">No flow detected</div>
            ) : (
              sortedCategories.slice(0, 6).map(([cat, amount], idx) => {
                const percentage = (amount / totalRevenue) * 100
                return (
                  <div key={cat} className="space-y-3">
                    <div className="flex justify-between items-end">
                      <span className="text-xs font-black text-foreground uppercase tracking-tight">{cat}</span>
                      <span className="text-lg font-black text-primary">₹{amount.toFixed(0)}</span>
                    </div>
                    <div className="h-3 bg-muted/20 dark:bg-white/5 rounded-full overflow-hidden border border-white/5">
                      <div 
                        className="h-full rounded-full transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                        style={{ 
                          width: `${percentage}%`,
                          background: `linear-gradient(90deg, oklch(0.55 0.16 150 / 0.6), oklch(0.55 0.16 150))`
                        }}
                      />
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* Elite Rank (Top Sellers) */}
        <div className="glass-panel p-8 rounded-[3rem] relative overflow-hidden group">
          <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-amber-500/10 rounded-full blur-[80px]"></div>
          
          <div className="flex justify-between items-center mb-10">
            <div>
              <h3 className="text-2xl font-black text-foreground tracking-tight uppercase">Elite Rank</h3>
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mt-1 opacity-60">High-Velocity Items</p>
            </div>
            <Crown className="text-amber-500 w-8 h-8 animate-pulse" />
          </div>

          <div className="space-y-5">
            {sortedItems.length === 0 ? (
              <div className="text-center py-20 text-muted-foreground font-black uppercase tracking-widest opacity-20 italic">Awaiting performers</div>
            ) : (
              sortedItems.slice(0, 5).map(([id, stats], idx) => (
                <div key={id} className={`flex items-center gap-5 p-5 rounded-[2rem] transition-all border ${idx === 0 ? 'bg-amber-500/10 border-amber-500/30 glow-border' : 'bg-muted/5 border-transparent hover:border-white/10'}`}>
                  <div className={`h-14 w-14 rounded-2xl flex items-center justify-center font-black text-xl shadow-inner ${idx === 0 ? 'bg-amber-500 text-white shadow-[0_20px_30px_-10px_rgba(245,158,11,0.5)]' : 'bg-muted/20 text-muted-foreground'}`}>
                    {idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-black text-foreground uppercase truncate tracking-tight">{stats.name}</p>
                    <p className="text-[10px] font-black text-muted-foreground uppercase mt-0.5">{stats.qty} Units Sold</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-black text-foreground">₹{stats.rev.toFixed(0)}</p>
                    <div className="flex gap-1 mt-1 justify-end">
                      {[...Array(5 - idx)].map((_, i) => (
                        <div key={i} className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                      ))}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Global Outlet Grid */}
        <div className="lg:col-span-2 glass-panel rounded-[3rem] overflow-hidden relative">
          <div className="p-8 border-b border-white/5 bg-muted/5 flex items-center justify-between">
            <h3 className="text-[11px] font-black tracking-[0.3em] uppercase text-muted-foreground">Comprehensive Flow Matrix</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-white/5">
            {Object.entries(outletStats).map(([name, stats]) => (
              <div key={name} className="p-10 flex flex-col items-center hover:bg-white/5 transition-all duration-500 group">
                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-6">{name.replace('_', ' ')}</span>
                <span className="text-5xl font-black text-foreground mb-10 group-hover:scale-110 transition-transform">₹{stats.total.toFixed(0)}</span>
                <div className="w-full space-y-3">
                  <div className="flex justify-between px-4 py-3 bg-black/40 rounded-2xl border border-white/5 group-hover:border-emerald-500/20 transition-colors">
                    <span className="text-[10px] font-black uppercase text-emerald-500">Cash Flow</span>
                    <span className="text-xs font-black">₹{stats.cash.toFixed(0)}</span>
                  </div>
                  <div className="flex justify-between px-4 py-3 bg-black/40 rounded-2xl border border-white/5 group-hover:border-blue-500/20 transition-colors">
                    <span className="text-[10px] font-black uppercase text-blue-500">Digital Capture</span>
                    <span className="text-xs font-black">₹{stats.online.toFixed(0)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Real-time Activity Stream */}
      <div className="space-y-8 relative z-10 mt-16">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center px-4 gap-6">
          <div className="flex items-center gap-4">
             <div className="p-4 bg-primary/10 rounded-[1.5rem] border border-primary/20">
               <Receipt className="text-primary w-6 h-6" />
             </div>
             <div>
               <h3 className="text-3xl font-black text-foreground tracking-tight uppercase">Flow Log</h3>
               <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] opacity-60">Live Transaction Stream</p>
             </div>
          </div>
          <div className="flex gap-3">
            <a href={`/api/export/transactions?outlet=CAFE`} className="bg-amber-500/10 border border-amber-500/20 px-6 py-2.5 rounded-2xl text-[10px] font-black text-amber-600 hover:bg-amber-500 shadow-lg hover:text-white transition-all uppercase tracking-widest">Cafe Export</a>
            <a href={`/api/export/transactions?outlet=CHAI_JOINT`} className="bg-blue-500/10 border border-blue-500/20 px-6 py-2.5 rounded-2xl text-[10px] font-black text-blue-600 hover:bg-blue-500 shadow-lg hover:text-white transition-all uppercase tracking-widest">Chai Export</a>
          </div>
        </div>

        {/* Stream View (Cards on Mobile, Premium Table on Desktop) */}
        <div className="space-y-4">
          {/* Card View (Mobile-First) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:hidden gap-4 px-2">
            {todaysClosedTabs.length === 0 ? (
              <div className="text-center py-20 text-muted-foreground font-black uppercase tracking-widest opacity-20 italic col-span-full">No active capture</div>
            ) : (
              [...todaysClosedTabs].sort((a,b) => (b.closedAt?.getTime() || 0) - (a.closedAt?.getTime() || 0)).slice(0, 15).map(tab => (
                <div key={tab.id} className="glass-card p-6 rounded-[2.5rem] border-white/5 flex flex-col justify-between">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex flex-col">
                      <span className="text-[9px] font-black text-primary uppercase tracking-[0.2em] mb-1">{tab.Outlet.name.replace('_', ' ')}</span>
                      <span className="text-lg font-black text-foreground truncate">{tab.customerName || "Walk-in Capture"}</span>
                    </div>
                    <span className="text-[10px] font-bold text-muted-foreground">{tab.closedAt ? new Date(tab.closedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : "N/A"}</span>
                  </div>
                  <div className="flex justify-between items-end border-t border-white/5 pt-4">
                    <div className="flex items-center gap-2">
                       <div className={`w-2 h-2 rounded-full ${tab.paymentMode === 'CASH' ? 'bg-emerald-500' : 'bg-blue-500'}`}></div>
                       <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">{tab.paymentMode}</span>
                    </div>
                    <p className="text-3xl font-black text-foreground tracking-tighter">₹{tab.totalAmount.toFixed(0)}</p>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Desktop Table */}
          <div className="hidden lg:block glass-panel rounded-[3rem] overflow-hidden border border-white/5">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-muted/10 border-b border-white/5">
                  <th className="p-8 text-[11px] font-black text-muted-foreground uppercase tracking-[0.3em]">Temporal Point</th>
                  <th className="p-8 text-[11px] font-black text-muted-foreground uppercase tracking-[0.3em]">Node Location</th>
                  <th className="p-8 text-[11px] font-black text-muted-foreground uppercase tracking-[0.3em]">Subject Entity</th>
                  <th className="p-8 text-[11px] font-black text-muted-foreground uppercase tracking-[0.3em] text-right">Credit Resolved</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {[...todaysClosedTabs].sort((a,b) => (b.closedAt?.getTime() || 0) - (a.closedAt?.getTime() || 0)).map(tab => (
                  <tr key={tab.id} className="hover:bg-white/5 transition-all duration-300 group">
                    <td className="p-8 text-xs font-bold text-muted-foreground group-hover:text-foreground">{tab.closedAt ? new Date(tab.closedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : "N/A"}</td>
                    <td className="p-8 text-[11px] font-black text-primary uppercase tracking-widest">{tab.Outlet.name.replace('_', ' ')}</td>
                    <td className="p-8 text-lg font-black text-foreground">{tab.customerName || "Direct Walk-in Capture"}</td>
                    <td className="p-8 text-right">
                      <div className="flex flex-col items-end">
                        <span className="text-3xl font-black text-foreground tracking-tighter">₹{tab.totalAmount.toFixed(0)}</span>
                        <span className="mt-1 px-3 py-1 bg-muted/20 rounded-full text-[8px] font-black text-muted-foreground uppercase tracking-widest group-hover:bg-primary/20 group-hover:text-primary transition-colors">{tab.paymentMode}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="text-center pt-10">
           <a href="/dashboard/transactions" className="inline-flex items-center gap-3 px-10 py-4 bg-muted/10 hover:bg-primary hover:text-primary-foreground border border-white/10 rounded-full text-xs font-black uppercase tracking-[0.2em] transition-all hover:scale-105 active:scale-95 shadow-xl">
             Explore Full Flow Ledger <Receipt className="w-4 h-4" />
           </a>
        </div>
      </div>
    </div>
  )
}
