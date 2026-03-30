import { prisma } from "@/lib/prisma"
export const dynamic = 'force-dynamic'
import { DispatchForm } from "./DispatchForm"
import { Search } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { formatTimeIST, formatDateIST } from "@/lib/utils"

export default async function DispatchPage() {
  const [items, outlets, recentDispatches] = await Promise.all([
    prisma.item.findMany({ 
      orderBy: { name: 'asc' } 
    }),
    prisma.outlet.findMany({ orderBy: { name: 'asc' } }),
    prisma.inventoryLedger.findMany({
      where: { type: "DISPATCH" },
      include: { Item: true, User: true },
      orderBy: { createdAt: 'desc' },
      take: 10
    })
  ])

  return (
    <div className="space-y-8 relative">
      <div className="absolute top-[50%] left-[10%] w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-[130px] pointer-events-none -translate-y-1/2"></div>
      
      <div className="glass-panel p-6 rounded-3xl relative z-10 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
            Dispatch Stock
            <div className="h-2 w-2 rounded-full bg-blue-500 shadow-[0_0_10px_#3b82f6]"></div>
          </h2>
          <p className="text-muted-foreground mt-1 font-medium text-sm tracking-wide uppercase">Send inventory from Central Store to Outlets.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
        {/* Client form with error handling */}
        <DispatchForm items={items} outlets={outlets} />

        <div className="md:col-span-2 glass-panel rounded-3xl overflow-hidden flex flex-col">
          <div className="p-6 border-b border-white/10 bg-white/5 backdrop-blur-md">
             <h3 className="text-lg font-bold text-white tracking-wide">Dispatch History LEDGER</h3>
          </div>
          <div className="flex-1 overflow-auto max-h-[600px] p-0">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-white/10 hover:bg-transparent">
                  <TableHead className="font-bold text-slate-400 uppercase tracking-widest text-[10px] h-12 bg-black/40 sticky top-0 z-20">Date / Time</TableHead>
                  <TableHead className="font-bold text-slate-400 uppercase tracking-widest text-[10px] h-12 bg-black/40 sticky top-0 z-20">Item</TableHead>
                  <TableHead className="font-bold text-slate-400 uppercase tracking-widest text-[10px] h-12 bg-black/40 sticky top-0 z-20">Destination</TableHead>
                  <TableHead className="font-bold text-slate-400 uppercase tracking-widest text-[10px] h-12 bg-black/40 sticky top-0 z-20 text-right">Quantity Out</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                 {recentDispatches.length === 0 ? (
                  <TableRow className="border-b border-white/10">
                    <TableCell colSpan={4} className="h-40 text-center text-slate-500">
                      <span className="flex flex-col items-center justify-center">
                        <Search className="w-8 h-8 opacity-20 mb-2" />
                        No recent outward shipments.
                      </span>
                    </TableCell>
                  </TableRow>
                 ) : (
                  recentDispatches.map((log) => (
                    <TableRow key={log.id} className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                      <TableCell className="text-slate-500 font-medium whitespace-nowrap text-sm">
                        <span className="text-slate-300">{formatDateIST(log.createdAt)}</span> <span className="opacity-50">{formatTimeIST(log.createdAt)}</span>
                      </TableCell>
                      <TableCell className="font-bold text-slate-200 group-hover:text-white transition-colors">{log.Item.name}</TableCell>
                      <TableCell className="font-medium text-slate-400 tracking-wide uppercase text-xs">{outlets.find(o => o.id === log.outletId)?.name}</TableCell>
                      <TableCell className="text-right">
                         <span className="inline-flex items-center text-blue-400 font-black tracking-widest text-sm drop-shadow-[0_0_8px_rgba(59,130,246,0.3)]">
                           {log.quantity} <span className="text-[10px] ml-1 opacity-70 uppercase">{log.Item.unit}</span>
                         </span>
                      </TableCell>
                    </TableRow>
                  ))
                 )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  )
}
