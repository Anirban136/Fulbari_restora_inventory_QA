import { prisma } from "@/lib/prisma"
export const dynamic = 'force-dynamic'
import { StoreIcon, Search, Package, History, TrendingDown, ClipboardList } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { AdjustStockForm } from "./AdjustStockForm"
import { cn } from "@/lib/utils"

export default async function OutletsStockPage() {
  const outlets = await prisma.outlet.findMany({
    include: {
      Stock: {
        include: { Item: true }
      }
    },
    orderBy: { name: 'asc' }
  })

  // Fetch recent consumptions/adjustments for the ledger view
  const recentConsumptions = await prisma.inventoryLedger.findMany({
    where: { type: 'CONSUMPTION' },
    include: { Item: true, Outlet: true },
    orderBy: { createdAt: 'desc' },
    take: 5
  })

  return (
    <div className="flex flex-col lg:flex-row gap-8 relative pb-20">
      {/* Background Decor */}
      <div className="absolute top-[10%] left-[30%] w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-[150px] pointer-events-none -translate-y-1/2 -z-10"></div>
      
      {/* 1. LEFT SIDEBAR: ADJUSTMENT FORM */}
      <aside className="w-full lg:w-[400px] flex-shrink-0 space-y-8">
        <div className="glass-panel p-6 rounded-3xl border border-white/5 bg-white/[0.02]">
           <div className="flex items-center gap-3 mb-2">
             <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
                <TrendingDown className="w-4 h-4 text-emerald-400" />
             </div>
             <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Live Management</h4>
           </div>
           <h2 className="text-2xl font-black text-white tracking-tighter">Inventory Control</h2>
           <p className="text-xs text-muted-foreground mt-2 font-medium leading-relaxed">
             Manually reduce outlet stock levels when items are used in the kitchen, wasted, or consumed.
           </p>
        </div>

        <AdjustStockForm outlets={outlets} />

        {/* Recent Activity Mini-Feed */}
        <div className="glass-panel p-6 rounded-3xl border border-white/5 bg-white/[0.02]">
           <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-purple-400" />
                <span className="text-[10px] font-black uppercase tracking-widest text-white">Recent Adjustments</span>
              </div>
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]"></div>
           </div>
           
           <div className="space-y-4">
              {recentConsumptions.length === 0 ? (
                <div className="text-center py-4 opacity-20">
                   <p className="text-[9px] font-black uppercase tracking-[0.2em]">No history yet</p>
                </div>
              ) : (
                recentConsumptions.map(entry => (
                  <div key={entry.id} className="flex items-center justify-between p-3 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-all">
                    <div className="flex flex-col">
                       <span className="text-[10px] font-black text-white uppercase truncate max-w-[120px]">{entry.Item.name}</span>
                       <span className="text-[8px] font-bold text-muted-foreground uppercase">{entry.Outlet?.name}</span>
                    </div>
                    <div className="flex flex-col items-end">
                       <span className="text-xs font-black text-red-400">-{entry.quantity}</span>
                       <span className="text-[7px] font-bold text-muted-foreground uppercase">{new Date(entry.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))
              )}
           </div>
        </div>
      </aside>

      {/* 2. RIGHT CONTENT: OUTLET STOCK TABLES */}
      <main className="flex-1 space-y-10">
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-6 lg:p-8 rounded-[2.5rem] border border-white/5 bg-white/[0.01] backdrop-blur-xl relative overflow-hidden">
           <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-purple-500/20 to-transparent"></div>
           <div>
              <h1 className="text-3xl lg:text-4xl font-black text-white tracking-tighter flex items-center gap-4">
                Outlets Stock
                <span className="px-3 py-1 bg-purple-500/20 text-purple-400 text-[10px] font-black uppercase tracking-[0.3em] rounded-lg border border-purple-500/30 shadow-[0_0_20px_rgba(168,85,247,0.1)]">
                  Live Status
                </span>
              </h1>
              <p className="text-muted-foreground mt-2 font-medium text-xs lg:text-sm tracking-wide uppercase opacity-60">Real-time inventory levels across all production units.</p>
           </div>
           
           <div className="flex items-center gap-6">
              <div className="flex flex-col items-end">
                 <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Total Outlets</span>
                 <span className="text-2xl font-black text-white">{outlets.length}</span>
              </div>
              <div className="h-10 w-[1px] bg-white/10"></div>
              <div className="flex flex-col items-end">
                 <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Global Stock Items</span>
                 <span className="text-2xl font-black text-white">
                    {outlets.reduce((acc, o) => acc + o.Stock.length, 0)}
                 </span>
              </div>
           </div>
        </header>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {outlets.map(outlet => (
            <section key={outlet.id} className="glass-panel rounded-[2.5rem] overflow-hidden flex flex-col group hover:shadow-[0_20px_50px_-20px_rgba(168,85,247,0.15)] hover:border-purple-500/20 transition-all duration-500 bg-white/[0.01]">
              <div className="bg-white/[0.03] px-6 py-5 border-b border-white/5 flex justify-between items-center backdrop-blur-md relative overflow-hidden group-hover:bg-white/[0.05] transition-colors">
                <div className="absolute -right-4 -top-4 w-24 h-24 bg-purple-500/10 rounded-full blur-[30px] group-hover:bg-purple-500/20 transition-colors pointer-events-none"></div>
                
                <div className="relative z-10">
                  <h3 className="text-xl font-black text-white flex items-center gap-3 tracking-tight uppercase">
                    <div className="p-2 bg-purple-500/10 rounded-xl">
                       <StoreIcon className="w-5 h-5 text-purple-400" />
                    </div>
                    {outlet.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-1.5 ml-12">
                     <span className="w-1.5 h-1.5 rounded-full bg-purple-500 shadow-[0_0_8px_#a855f7]"></span>
                     <p className="text-[9px] text-purple-400/80 font-black tracking-[0.2em] uppercase">{outlet.type}</p>
                  </div>
                </div>
                
                <div className="relative z-10 flex items-center gap-3">
                   <div className="flex flex-col items-end leading-none">
                      <span className="text-[8px] font-black text-muted-foreground uppercase tracking-widest mb-1">Catalog</span>
                      <span className="text-lg font-black text-white">{outlet.Stock.length}</span>
                   </div>
                </div>
              </div>
              
              <div className="p-0 flex-1 overflow-auto custom-scrollbar-premium max-h-[500px]">
                <Table>
                  <TableHeader>
                    <TableRow className="border-b border-white/5 hover:bg-transparent bg-white/[0.02] sticky top-0 z-20 backdrop-blur-3xl">
                      <TableHead className="font-black text-muted-foreground/40 uppercase tracking-[0.3em] text-[10px] h-12 px-8 border-r border-white/5">Item Detail</TableHead>
                      <TableHead className="font-black text-muted-foreground/40 uppercase tracking-[0.3em] text-[10px] h-12 px-8 text-right">In Stock</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {outlet.Stock.length === 0 ? (
                      <TableRow className="border-b border-white/5 hover:bg-transparent">
                        <TableCell colSpan={2} className="text-center py-24">
                          <div className="flex flex-col items-center justify-center space-y-4 opacity-10">
                            <Search className="w-12 h-12" />
                            <p className="font-black uppercase tracking-[0.5em] text-[10px]">No Dispatch Records</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      outlet.Stock.map(stock => (
                        <TableRow key={stock.id} className="border-b border-white/2 hover:bg-white/[0.02] transition-colors group/row">
                          <TableCell className="px-8 py-5 border-r border-white/5">
                            <div className="flex flex-col gap-0.5">
                               <span className="text-[11px] font-black text-white/80 uppercase group-hover/row:text-primary transition-colors tracking-tight">
                                 {stock.Item.name}
                               </span>
                               <span className="text-[8px] font-black text-muted-foreground/30 uppercase tracking-widest">
                                 {stock.Item.category || "General"}
                               </span>
                            </div>
                          </TableCell>
                          <TableCell className="px-8 py-5 text-right">
                             <div className={cn(
                               "inline-flex flex-col items-end px-4 py-2 rounded-2xl font-black tracking-widest text-xs shadow-inner transition-all",
                               stock.quantity <= 0 
                                 ? "bg-red-500/10 border border-red-500/20 text-red-500" 
                                 : "bg-white/5 border border-white/10 text-white group-hover/row:bg-primary/10 group-hover/row:border-primary/20 group-hover/row:text-primary"
                             )}>
                               <span className="text-sm font-black tracking-tighter">
                                 {stock.quantity} <span className="text-[9px] ml-1 opacity-50 uppercase font-black">{stock.Item.piecesPerBox ? 'pcs' : stock.Item.unit}</span>
                               </span>
                               {stock.Item.piecesPerBox && (
                                 <span className="text-[8px] opacity-40 font-black uppercase tracking-tighter mt-1">
                                   ({(stock.quantity / stock.Item.piecesPerBox).toFixed(1)} {stock.Item.unit})
                                 </span>
                               )}
                             </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </section>
          ))}
        </div>
      </main>
    </div>
  )
}
