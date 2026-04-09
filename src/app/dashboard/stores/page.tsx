import { prisma } from "@/lib/prisma"
export const dynamic = 'force-dynamic'
import { StoreIcon, Search } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export default async function OutletsStockPage() {
  const outlets = await prisma.outlet.findMany({
    include: {
      Stock: {
        include: { Item: true }
      }
    },
    orderBy: { name: 'asc' }
  })

  return (
    <div className="space-y-10 relative">
      <div className="absolute top-[10%] left-[30%] w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-[150px] pointer-events-none -translate-y-1/2"></div>
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10 glass-panel p-4 lg:p-6 rounded-2xl lg:rounded-3xl">
        <div>
          <h2 className="text-xl lg:text-3xl font-black text-foreground tracking-tight flex items-center gap-3">
            Outlets Stock
            <div className="h-2 w-2 rounded-full bg-purple-500 shadow-[0_0_10px_#a855f7]"></div>
          </h2>
          <p className="text-muted-foreground mt-1 font-medium text-[10px] lg:text-sm tracking-wide uppercase">Live visibility into inventory levels.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 relative z-10">
        {outlets.map(outlet => (
          <div key={outlet.id} className="glass-panel rounded-3xl overflow-hidden flex flex-col group hover:-translate-y-1 transition-all duration-300 hover:shadow-[0_10px_40px_-10px_rgba(168,85,247,0.2)] hover:border-purple-500/30">
            <div className="bg-muted/20 dark:bg-black/40 px-4 py-3 border-b border-border/50 flex justify-between items-center backdrop-blur-md relative overflow-hidden">
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-purple-500/20 rounded-full blur-[30px] group-hover:bg-purple-500/30 transition-colors pointer-events-none"></div>
              
              <div className="relative z-10">
                <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <StoreIcon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  {outlet.name}
                </h3>
                <p className="text-[9px] text-purple-600 dark:text-purple-300/80 font-black tracking-[0.2em] mt-0.5">{outlet.type}</p>
              </div>
              
              <div className="relative z-10 h-10 w-10 flex items-center justify-center rounded-xl bg-muted/20 border border-border/50 text-foreground font-bold shadow-inner backdrop-blur-md">
                 {outlet.Stock.length}
              </div>
            </div>
            
            <div className="p-0 flex-1 overflow-auto max-h-[400px]">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-border/50 hover:bg-transparent">
                    <TableHead className="font-bold text-muted-foreground uppercase tracking-widest text-[10px] h-12 bg-muted/10 dark:bg-white/5 backdrop-blur-xl sticky top-0 z-20">Item</TableHead>
                    <TableHead className="font-bold text-muted-foreground uppercase tracking-widest text-[10px] h-12 bg-muted/10 dark:bg-white/5 backdrop-blur-xl sticky top-0 z-20 text-right">In Stock</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {outlet.Stock.length === 0 ? (
                    <TableRow className="border-b border-white/5">
                      <TableCell colSpan={2} className="text-center py-16 text-slate-500">
                        <span className="flex flex-col items-center justify-center">
                          <Search className="w-8 h-8 opacity-20 mb-3" />
                          No inventory dispatched yet.
                        </span>
                      </TableCell>
                    </TableRow>
                  ) : (
                    outlet.Stock.map(stock => (
                      <TableRow key={stock.id} className="border-b border-border/5 hover:bg-muted/5 transition-colors">
                        <TableCell className="font-medium text-foreground/80 transition-colors">{stock.Item.name}</TableCell>
                        <TableCell className="text-right">
                           <div className={`inline-flex flex-col items-end px-3 py-1.5 rounded-xl font-black tracking-widest text-xs shadow-inner ${stock.quantity <= 0 ? 'bg-red-500/20 border border-red-500/30 text-red-600 dark:text-red-400' : 'bg-purple-500/20 border border-purple-500/30 text-purple-600 dark:text-purple-300'}`}>
                             <span>
                               {stock.quantity} <span className="text-[9px] ml-1 opacity-70 uppercase font-black">{stock.Item.piecesPerBox ? 'pcs' : stock.Item.unit}</span>
                             </span>
                             {stock.Item.piecesPerBox && (
                               <span className="text-[9px] opacity-60 font-black uppercase tracking-tighter mt-0.5">
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
          </div>
        ))}
      </div>
    </div>
  )
}
