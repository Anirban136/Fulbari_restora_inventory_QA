import { prisma } from "@/lib/prisma"
export const dynamic = 'force-dynamic'
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { DispatchForm } from "./DispatchForm"
import { revertLedgerEntry, editDispatchQuantity } from "../actions"
import { Search, Undo2, Edit } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { formatTimeIST, formatDateIST } from "@/lib/utils"

export default async function DispatchPage() {
  const session = await getServerSession(authOptions)
  const isOwner = session?.user?.role === "OWNER"

  const [items, outlets, recentDispatches] = await Promise.all([
    prisma.item.findMany({ 
      orderBy: { name: 'asc' } 
    }),
    prisma.outlet.findMany({ orderBy: { name: 'asc' } }),
    prisma.inventoryLedger.findMany({
      where: { type: "DISPATCH" },
      include: { Item: true, User: true },
      orderBy: { createdAt: 'desc' },
      take: 15
    })
  ])

  return (
    <div className="space-y-8 relative">
      <div className="absolute top-[50%] left-[10%] w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-[130px] pointer-events-none -translate-y-1/2"></div>
      
      <div className="glass-panel p-6 rounded-3xl relative z-10 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-foreground tracking-tight flex items-center gap-3">
            Dispatch Stock
            <div className="h-2 w-2 rounded-full bg-blue-500 shadow-[0_0_10px_#3b82f6]"></div>
          </h2>
          <p className="text-muted-foreground mt-1 font-medium text-sm tracking-wide uppercase">Send inventory from Central Store to Outlets.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10">
        {/* Client form with error handling */}
        <DispatchForm items={items} outlets={outlets} />

        <div className="lg:col-span-2 glass-panel rounded-3xl overflow-hidden flex flex-col">
          <div className="p-6 border-b border-border/50 bg-white/5 backdrop-blur-md flex items-center justify-between">
            <h3 className="text-lg font-bold text-foreground tracking-wide">Dispatch History LEDGER</h3>
            {isOwner && (
              <span className="text-[10px] font-black tracking-widest bg-amber-500/10 border border-amber-500/20 text-amber-400 px-3 py-1 rounded-full uppercase">
                Revert available
              </span>
            )}
          </div>
          <div className="flex-1 overflow-auto max-h-[600px] p-0">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-border/10 hover:bg-transparent">
                  <TableHead className="font-bold text-muted-foreground uppercase tracking-widest text-[10px] h-12 bg-muted/20 dark:bg-black/40 sticky top-0 z-20">Date / Time</TableHead>
                  <TableHead className="font-bold text-muted-foreground uppercase tracking-widest text-[10px] h-12 bg-muted/20 dark:bg-black/40 sticky top-0 z-20">Item</TableHead>
                  <TableHead className="font-bold text-muted-foreground uppercase tracking-widest text-[10px] h-12 bg-muted/20 dark:bg-black/40 sticky top-0 z-20">Destination</TableHead>
                  <TableHead className="font-bold text-muted-foreground uppercase tracking-widest text-[10px] h-12 bg-muted/20 dark:bg-black/40 sticky top-0 z-20 text-right">Qty Out</TableHead>
                  {isOwner && (
                    <TableHead className="font-bold text-muted-foreground uppercase tracking-widest text-[10px] h-12 bg-muted/20 dark:bg-black/40 sticky top-0 z-20 text-center">Actions</TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                 {recentDispatches.length === 0 ? (
                  <TableRow className="border-b border-white/10">
                    <TableCell colSpan={isOwner ? 5 : 4} className="h-40 text-center text-slate-500">
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
                      <TableCell>
                        <div className="font-bold text-foreground/90 group-hover:text-foreground transition-colors">{log.Item.name}</div>
                        <div className="text-[10px] text-muted-foreground uppercase tracking-widest font-black mt-1">{log.Item.category || "Uncategorized"}</div>
                      </TableCell>
                      <TableCell className="font-medium text-slate-400 tracking-wide uppercase text-xs">{outlets.find(o => o.id === log.outletId)?.name}</TableCell>
                      <TableCell className="text-right">
                        <div className="inline-flex flex-col items-end">
                          <span className="inline-flex items-center text-blue-400 font-black tracking-widest text-xs lg:text-sm drop-shadow-[0_0_8px_rgba(59,130,246,0.3)]">
                            {log.quantity} <span className="text-[9px] lg:text-[10px] ml-1 opacity-70 uppercase">{log.Item.piecesPerBox ? 'pcs' : log.Item.unit}</span>
                          </span>
                          {log.Item.piecesPerBox && (
                            <span className="text-[9px] text-blue-500/50 font-black uppercase tracking-tighter -mt-0.5">
                              ({(log.quantity / log.Item.piecesPerBox).toFixed(1)} {log.Item.unit})
                            </span>
                          )}
                        </div>
                      </TableCell>
                      {isOwner && (
                        <TableCell className="text-center flex justify-center gap-2">
                          {/* Edit Dialog */}
                          <Dialog>
                            <DialogTrigger render={
                              <button className="p-2 rounded-xl text-blue-400/60 hover:text-blue-400 hover:bg-blue-500/10 border border-transparent hover:border-blue-500/20 transition-all" title="Edit dispatched quantity" />
                            }>
                              <Edit className="w-4 h-4" />
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[400px] bg-black/90 backdrop-blur-2xl border-blue-500/20 rounded-3xl shadow-[0_0_50px_rgba(59,130,246,0.15)]">
                              <DialogHeader className="mb-2">
                                <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-4 border border-blue-500/20">
                                  <Edit className="w-6 h-6 text-blue-400" />
                                </div>
                                <DialogTitle className="text-xl font-black text-white">Edit Dispatch Quantity</DialogTitle>
                                <DialogDescription className="text-slate-400 leading-relaxed">
                                  Modify the dispatched quantity of <span className="text-white font-bold">{log.Item.name}</span> to <span className="text-white font-bold">{outlets.find(o => o.id === log.outletId)?.name}</span>. Currently dispatched: <span className="text-blue-400 font-bold">{log.quantity} {log.Item.piecesPerBox ? 'pcs' : log.Item.unit}</span>
                                  {log.Item.piecesPerBox && (
                                    <span className="text-blue-500/80 font-bold ml-1">({(log.quantity / log.Item.piecesPerBox).toFixed(1)} {log.Item.unit})</span>
                                  )}.
                                </DialogDescription>
                              </DialogHeader>
                              <form action={editDispatchQuantity} className="mt-4 space-y-4">
                                <input type="hidden" name="ledgerId" value={log.id} />
                                <div className="space-y-2">
                                  <label htmlFor={`newQty-${log.id}`} className="text-xs font-bold text-muted-foreground uppercase tracking-widest">New Quantity</label>
                                  <Input 
                                    id={`newQty-${log.id}`}
                                    name="newQuantity" 
                                    type="number" 
                                    step="0.01" 
                                    min="0.01" 
                                    defaultValue={log.quantity}
                                    required
                                    className="h-12 bg-background border-border text-foreground rounded-xl focus-visible:ring-blue-500/50 shadow-inner"
                                  />
                                </div>
                                <Button type="submit" className="w-full h-11 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all active:scale-95">
                                  Save Changes
                                </Button>
                              </form>
                            </DialogContent>
                          </Dialog>

                          {/* Revert Dialog */}
                          <Dialog>
                            <DialogTrigger render={
                              <button className="p-2 rounded-xl text-amber-400/60 hover:text-amber-400 hover:bg-amber-500/10 border border-transparent hover:border-amber-500/20 transition-all" title="Revert this dispatch" />
                            }>
                              <Undo2 className="w-4 h-4" />
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[400px] bg-black/90 backdrop-blur-2xl border-amber-500/20 rounded-3xl shadow-[0_0_50px_rgba(245,158,11,0.15)]">
                              <DialogHeader className="mb-2">
                                <div className="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center mb-4 border border-amber-500/20">
                                  <Undo2 className="w-6 h-6 text-amber-400" />
                                </div>
                                <DialogTitle className="text-xl font-black text-white">Revert Dispatch?</DialogTitle>
                                <DialogDescription className="text-slate-400 leading-relaxed">
                                  This will reverse the dispatch of <span className="text-blue-400 font-bold">{log.quantity} {log.Item.piecesPerBox ? 'pcs' : log.Item.unit}</span> of <span className="text-white font-bold">{log.Item.name}</span> to <span className="text-white font-bold">{outlets.find(o => o.id === log.outletId)?.name}</span> — restoring stock to central and reducing outlet stock accordingly.
                                </DialogDescription>
                              </DialogHeader>
                              <form action={revertLedgerEntry} className="mt-4">
                                <input type="hidden" name="ledgerId" value={log.id} />
                                <Button type="submit" className="w-full h-11 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl transition-all active:scale-95">
                                  Yes, Revert Dispatch
                                </Button>
                              </form>
                            </DialogContent>
                          </Dialog>
                        </TableCell>
                      )}
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
