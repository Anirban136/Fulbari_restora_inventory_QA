import { prisma } from "@/lib/prisma"
export const dynamic = 'force-dynamic'
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { dispatchStock } from "./actions"
import { ArrowLeftRight, Search } from "lucide-react"
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
      where: { currentStock: { gt: 0 } },
      order_by: { name: 'asc' } 
    }),
    prisma.outlet.findMany({ order_by: { name: 'asc' } }),
    prisma.inventoryLedger.findMany({
      where: { type: "DISPATCH" },
      include: { Item: true, User: true },
      order_by: { createdAt: 'desc' },
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
        <div className="md:col-span-1 glass-panel p-8 rounded-3xl self-start hover:border-white/20 transition-all">
          <div className="flex items-center gap-4 mb-8">
             <div className="h-12 w-12 bg-blue-500/20 rounded-2xl flex items-center justify-center border border-blue-500/30 shadow-[0_0_15px_-3px_rgba(59,130,246,0.3)]">
               <ArrowLeftRight className="w-6 h-6 text-blue-400" />
             </div>
             <h3 className="text-xl font-bold text-white">Send Shipment</h3>
          </div>
          
          <form action={dispatchStock} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="itemId" className="text-xs font-bold text-slate-400 uppercase tracking-widest">Select Item</Label>
              <select name="itemId" id="itemId" required defaultValue="" className="w-full h-12 px-4 py-2 rounded-xl border border-white/10 bg-black/40 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all shadow-inner font-medium">
                <option value="" disabled className="bg-slate-900 text-slate-500">Select an item...</option>
                {items.map(item => (
                  <option key={item.id} value={item.id} className="bg-slate-900 text-white">{item.name} ({item.currentStock} {item.unit} central stock)</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="outletId" className="text-xs font-bold text-slate-400 uppercase tracking-widest">Destination Outlet</Label>
              <select name="outletId" id="outletId" required defaultValue="" className="w-full h-12 px-4 py-2 rounded-xl border border-white/10 bg-black/40 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all shadow-inner font-medium">
                <option value="" disabled className="bg-slate-900 text-slate-500">Select an outlet...</option>
                {outlets.map(outlet => (
                  <option key={outlet.id} value={outlet.id} className="bg-slate-900 text-white">{outlet.name}</option>
                ))}
              </select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="quantity" className="text-xs font-bold text-slate-400 uppercase tracking-widest">Quantity to Dispatch</Label>
              <Input id="quantity" name="quantity" type="number" step="0.01" min="0.01" placeholder="e.g. 10" required className="h-12 bg-black/40 border-white/10 text-white placeholder:text-slate-600 rounded-xl focus-visible:ring-blue-500/50 shadow-inner" />
            </div>

            <Button type="submit" className="w-full h-14 mt-4 text-lg font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_20_5px_rgba(59,130,246,0.5)] rounded-xl transition-all active:scale-[0.98]">
              Approve Dispatch
            </Button>
          </form>
          {items.length === 0 && (
             <div className="mt-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center font-medium animate-pulse">
               Cannot dispatch. Central catalog has zero stock available.
             </div>
          )}
        </div>

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
