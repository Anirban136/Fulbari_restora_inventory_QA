import { prisma } from "@/lib/prisma"
export const dynamic = 'force-dynamic'
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { logStockIn } from "./actions"
import { Truck, Search } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export default async function StockInPage() {
  const items = await prisma.item.findMany({ orderBy: { name: 'asc' } })
  const recentLogs = await prisma.inventoryLedger.findMany({
    where: { type: "STOCK_IN" },
    include: { Item: true, User: true },
    orderBy: { createdAt: 'desc' },
    take: 10
  })

  return (
    <div className="space-y-8 relative">
      {/* Background Decorators */}
      <div className="absolute top-[20%] right-[-100px] w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="glass-panel p-6 rounded-3xl relative z-10 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
            Stock Intake
            <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_10px_#10b981]"></div>
          </h2>
          <p className="text-muted-foreground mt-1 font-medium text-sm tracking-wide uppercase">Log new warehouse deliveries and update central inventory.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
        
        {/* Left Form */}
        <div className="md:col-span-1 glass-panel p-8 rounded-3xl self-start hover:border-white/20 transition-all">
          <div className="flex items-center gap-4 mb-8">
             <div className="h-12 w-12 bg-primary/20 rounded-2xl flex items-center justify-center border border-primary/30 shadow-[0_0_15px_-3px_oklch(0.55_0.16_150_/_0.3)]">
               <Truck className="w-6 h-6 text-primary" />
             </div>
             <h3 className="text-xl font-bold text-white">Receive Shipment</h3>
          </div>
          
          <form action={logStockIn} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="itemId" className="text-xs font-bold text-slate-400 uppercase tracking-widest">Select Item</Label>
              <select name="itemId" id="itemId" required defaultValue="" className="w-full h-12 px-4 py-2 rounded-xl border border-white/10 bg-black/40 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all shadow-inner font-medium">
                <option value="" disabled className="bg-slate-900 text-slate-500">Select an item...</option>
                {items.map(item => (
                  <option key={item.id} value={item.id} className="bg-slate-900 text-white">{item.name} ({item.unit})</option>
                ))}
              </select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="quantity" className="text-xs font-bold text-slate-400 uppercase tracking-widest">Quantity Received</Label>
              <Input id="quantity" name="quantity" type="number" step="0.01" min="0.01" placeholder="e.g. 50" required className="h-12 bg-black/40 border-white/10 text-white placeholder:text-slate-600 rounded-xl focus-visible:ring-primary/50 shadow-inner" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cost" className="text-xs font-bold text-slate-400 uppercase tracking-widest">Cost per unit (₹) <span className="opacity-50 font-normal ml-1">Optional</span></Label>
              <Input id="cost" name="cost" type="number" step="0.01" min="0" placeholder="e.g. 150.50" className="h-12 bg-black/40 border-white/10 text-white placeholder:text-slate-600 rounded-xl focus-visible:ring-primary/50 shadow-inner" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes" className="text-xs font-bold text-slate-400 uppercase tracking-widest">Delivery Note / Invoice Ref</Label>
              <Input id="notes" name="notes" placeholder="Invoice #1234..." className="h-12 bg-black/40 border-white/10 text-white placeholder:text-slate-600 rounded-xl focus-visible:ring-primary/50 shadow-inner" />
            </div>

            <Button type="submit" className="w-full h-14 mt-4 text-lg font-bold bg-primary hover:bg-emerald-500 text-white shadow-[0_0_20px_-5px_oklch(0.55_0.16_150_/_0.5)] rounded-xl transition-all active:scale-[0.98]">
              Log Intake
            </Button>
          </form>
        </div>

        {/* Right Table */}
        <div className="md:col-span-2 glass-panel rounded-3xl overflow-hidden flex flex-col">
          <div className="p-6 border-b border-white/10 bg-white/5 backdrop-blur-md">
            <h3 className="text-lg font-bold text-white tracking-wide">Recent Deliveries Overview</h3>
          </div>
          <div className="flex-1 overflow-auto max-h-[600px] p-0">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-white/10 hover:bg-transparent">
                  <TableHead className="font-bold text-slate-400 uppercase tracking-widest text-[10px] h-12 bg-black/40 sticky top-0 z-20">Date / Time</TableHead>
                  <TableHead className="font-bold text-slate-400 uppercase tracking-widest text-[10px] h-12 bg-black/40 sticky top-0 z-20">Item</TableHead>
                  <TableHead className="font-bold text-slate-400 uppercase tracking-widest text-[10px] h-12 bg-black/40 sticky top-0 z-20 text-right">Quantity In</TableHead>
                  <TableHead className="font-bold text-slate-400 uppercase tracking-widest text-[10px] h-12 bg-black/40 sticky top-0 z-20">Received By</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                 {recentLogs.length === 0 ? (
                   <TableRow className="border-b border-white/10">
                    <TableCell colSpan={4} className="h-40 text-center text-slate-500">
                      <span className="flex flex-col items-center justify-center">
                        <Search className="w-8 h-8 opacity-20 mb-2" />
                        No recent incoming stock logged.
                      </span>
                    </TableCell>
                  </TableRow>
                 ) : (
                  recentLogs.map((log) => (
                    <TableRow key={log.id} className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                      <TableCell className="text-slate-500 font-medium whitespace-nowrap text-sm">
                        <span className="text-slate-300">{log.createdAt.toLocaleDateString()}</span> <span className="opacity-50">{log.createdAt.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                      </TableCell>
                      <TableCell className="font-bold text-slate-200 group-hover:text-white transition-colors">{log.Item.name}</TableCell>
                      <TableCell className="text-right">
                        <span className="inline-flex items-center text-emerald-400 font-black tracking-widest text-sm drop-shadow-[0_0_8px_rgba(52,211,153,0.3)]">
                           +{log.quantity} <span className="text-[10px] ml-1 opacity-70 uppercase">{log.Item.unit}</span>
                        </span>
                      </TableCell>
                      <TableCell className="text-slate-500 text-sm font-medium">{log.User.name}</TableCell>
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
