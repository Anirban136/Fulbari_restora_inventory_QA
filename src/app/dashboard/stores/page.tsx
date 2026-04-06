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
      
      <div className="glass-panel p-6 rounded-3xl relative z-10 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
            Outlets Stock
            <div className="h-2 w-2 rounded-full bg-purple-500 shadow-[0_0_10px_#a855f7]"></div>
          </h2>
          <p className="text-muted-foreground mt-1 font-medium text-sm tracking-wide uppercase">Live visibility into inventory levels across the Restaurant, Cafe, and Chai Joint.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 relative z-10">
        {outlets.map(outlet => (
          <div key={outlet.id} className="glass-panel rounded-3xl overflow-hidden flex flex-col group hover:-translate-y-1 transition-all duration-300 hover:shadow-[0_10px_40px_-10px_rgba(168,85,247,0.2)] hover:border-purple-500/30">
            <div className="bg-black/40 px-6 py-5 border-b border-white/10 flex justify-between items-center backdrop-blur-md relative overflow-hidden">
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-purple-500/20 rounded-full blur-[30px] group-hover:bg-purple-500/30 transition-colors pointer-events-none"></div>
              
              <div className="relative z-10">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <StoreIcon className="w-5 h-5 text-purple-400" />
                  {outlet.name}
                </h3>
                <p className="text-[10px] text-purple-300/80 font-black tracking-[0.2em] mt-1">{outlet.type}</p>
              </div>
              
              <div className="relative z-10 h-12 w-12 flex items-center justify-center rounded-2xl bg-white/5 border border-white/10 text-white font-bold shadow-inner backdrop-blur-md">
                 {outlet.Stock.length}
              </div>
            </div>
            
            <div className="p-0 flex-1 overflow-auto max-h-[400px]">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-white/10 hover:bg-transparent">
                    <TableHead className="font-bold text-slate-400 uppercase tracking-widest text-[10px] h-12 bg-white/5 backdrop-blur-xl sticky top-0 z-20">Item</TableHead>
                    <TableHead className="font-bold text-slate-400 uppercase tracking-widest text-[10px] h-12 bg-white/5 backdrop-blur-xl sticky top-0 z-20 text-right">In Stock</TableHead>
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
                      <TableRow key={stock.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                        <TableCell className="font-medium text-slate-300 transition-colors">{stock.Item.name}</TableCell>
                        <TableCell className="text-right">
                           <span className={`inline-flex items-center justify-center px-3 py-1 rounded-lg font-black tracking-widest text-xs shadow-inner ${stock.quantity <= 0 ? 'bg-red-500/20 border border-red-500/30 text-red-400 shadow-[0_0_10px_-2px_rgba(239,68,68,0.4)]' : 'bg-purple-500/20 border border-purple-500/30 text-purple-300'}`}>
                             {stock.quantity} <span className="text-[9px] ml-1 opacity-70 uppercase">{stock.Item.piecesPerBox ? 'pcs' : stock.Item.unit}</span>
                           </span>
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
