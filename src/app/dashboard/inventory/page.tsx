import { prisma } from "@/lib/prisma"
export const dynamic = 'force-dynamic'
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { addItem, removeItem, addVendor, updateItem } from "./actions"
import { PlusCircle, Search, Trash2, Users, Edit } from "lucide-react"
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
import { AddItemDialog } from "./AddItemDialog"
import { EditItemDialog } from "./EditItemDialog"

export default async function GlobalCatalogPage() {
  const session = await getServerSession(authOptions)
  const isOwner = session?.user?.role === "OWNER"

  const items = await prisma.item.findMany({
    orderBy: { name: 'asc' }
  })

  // Gather unique categories dynamically from the existing catalog
  const existingCategories = Array.from(new Set(items.map((item: any) => item.category).filter(Boolean))) as string[]

  return (
    <div className="space-y-8 relative">
      {/* Background Decorators */}
      <div className="absolute top-[-100px] left-[-100px] w-[400px] h-[400px] bg-primary/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10 glass-panel p-4 lg:p-6 rounded-2xl lg:rounded-3xl">
        <div>
          <h2 className="text-xl lg:text-3xl font-black text-foreground tracking-tight flex items-center gap-3">
            Global Catalog
            <div className="h-2 w-2 rounded-full bg-primary animate-pulse shadow-[0_0_10px_oklch(0.55_0.16_150)]"></div>
          </h2>
          <p className="text-muted-foreground mt-1 font-medium text-[10px] lg:text-sm tracking-wide uppercase">Manage all items in central inventory</p>
        </div>
        
        <div className="flex flex-col gap-3 min-w-[200px] w-full sm:w-auto">
          <AddItemDialog existingCategories={existingCategories} />
        </div>
      </div>

      <div className="glass-panel rounded-3xl overflow-hidden relative z-10 shadow-2xl">
        <div className="p-0 max-h-[85vh] overflow-auto custom-scrollbar-premium">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-border/10 hover:bg-transparent">
                <TableHead className="font-bold text-muted-foreground uppercase tracking-widest text-[10px] h-14 bg-muted/20 dark:bg-black/40 backdrop-blur-md sticky top-0 z-20">Item Name</TableHead>
                <TableHead className="font-bold text-muted-foreground uppercase tracking-widest text-[10px] h-14 bg-muted/20 dark:bg-black/40 backdrop-blur-md sticky top-0 z-20">Category</TableHead>
                <TableHead className="font-bold text-muted-foreground uppercase tracking-widest text-[10px] h-14 bg-muted/20 dark:bg-black/40 backdrop-blur-md sticky top-0 z-20 text-right">Unit</TableHead>
                <TableHead className="font-bold text-muted-foreground uppercase tracking-widest text-[10px] h-14 bg-muted/20 dark:bg-black/40 backdrop-blur-md sticky top-0 z-20 text-center">Box Size</TableHead>
                <TableHead className="font-bold text-muted-foreground uppercase tracking-widest text-[10px] h-14 bg-muted/20 dark:bg-black/40 backdrop-blur-md sticky top-0 z-20 text-right">Central Stock</TableHead>
                <TableHead className="font-bold text-muted-foreground uppercase tracking-widest text-[10px] h-14 bg-muted/20 dark:bg-black/40 backdrop-blur-md sticky top-0 z-20 text-right">Min Stock</TableHead>
                <TableHead className="font-bold text-muted-foreground uppercase tracking-widest text-[10px] h-14 bg-muted/20 dark:bg-black/40 backdrop-blur-md sticky top-0 z-20 text-right">Cost Price</TableHead>
                <TableHead className="font-bold text-muted-foreground uppercase tracking-widest text-[10px] h-14 bg-muted/20 dark:bg-black/40 backdrop-blur-md sticky top-0 z-20 text-right">Sell Price</TableHead>
                {(isOwner || session?.user?.role === "INV_MANAGER") && (
                  <TableHead className="font-bold text-muted-foreground uppercase tracking-widest text-[10px] h-14 bg-muted/20 dark:bg-black/40 backdrop-blur-md sticky top-0 z-20 text-center">Actions</TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.length === 0 ? (
                <TableRow className="border-b border-white/10">
                  <TableCell colSpan={isOwner ? 9 : 8} className="h-32 text-center text-slate-500">
                     <span className="flex flex-col items-center justify-center">
                       <Search className="w-8 h-8 opacity-20 mb-2" />
                       No items found in catalog. Add your first item.
                     </span>
                  </TableCell>
                </TableRow>
              ) : (
                items.map((item: any) => (
                  <TableRow key={item.id} className="border-b border-border/5 hover:bg-muted/5 transition-colors group">
                    <TableCell className="font-medium text-foreground/90 group-hover:text-foreground transition-colors">{item.name}</TableCell>
                    <TableCell className="text-muted-foreground text-[10px] font-bold uppercase tracking-wider">{item.category}</TableCell>
                    <TableCell className="text-muted-foreground/80 text-right">{item.piecesPerBox ? 'pcs' : item.unit}</TableCell>
                    <TableCell className="text-center font-bold text-blue-400">
                      {item.piecesPerBox ? (
                        <span className="inline-flex items-center gap-1 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                          {item.piecesPerBox} <span className="text-[10px] opacity-60">pcs</span>
                        </span>
                      ) : '—'}
                    </TableCell>
                    <TableCell className="text-right">
                      {item.minStock > 0 && item.currentStock <= item.minStock ? (
                        <span className="inline-flex items-center justify-center px-3 py-1 rounded-lg bg-red-500/20 border border-red-500/30 text-red-400 font-black tracking-widest text-xs shadow-[0_0_15px_-2px_rgba(239,68,68,0.3)] animate-pulse">
                          {item.currentStock} <span className="text-[9px] ml-1 opacity-80 uppercase font-black">{item.piecesPerBox ? 'pcs' : item.unit}</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center justify-center px-3 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-black tracking-widest text-xs">
                          {item.currentStock} <span className="text-[9px] ml-1 opacity-80 uppercase font-black">{item.piecesPerBox ? 'pcs' : item.unit}</span>
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground font-medium">
                      {item.minStock || '—'}
                    </TableCell>
                    <TableCell className="text-right text-foreground/80 font-bold">
                      {item.costPerUnit ? `₹${item.costPerUnit.toFixed(2)}` : '—'}
                    </TableCell>
                    <TableCell className="text-right text-emerald-600 dark:text-emerald-400 font-bold">
                      {item.sellPrice ? `₹${item.sellPrice.toFixed(2)}` : '—'}
                    </TableCell>

                    {(isOwner || session?.user?.role === "INV_MANAGER") && (
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-2">
                          {/* Edit Dialog */}
                          <EditItemDialog item={item} existingCategories={existingCategories} />

                          {/* Delete Dialog (Only for Owner) */}

                          {/* Delete Dialog (Only for Owner) */}
                          {isOwner && (
                            <Dialog>
                              <DialogTrigger render={
                                <button className="p-2 rounded-xl text-red-400/60 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all group/del" title={`Remove ${item.name}`} />
                              }>
                                <Trash2 className="w-4 h-4" />
                              </DialogTrigger>
                              <DialogContent className="sm:max-w-[400px] bg-background backdrop-blur-2xl border-border rounded-3xl shadow-[0_0_50px_rgba(239,68,68,0.1)]">
                                <DialogHeader className="mb-2">
                                  <div className="w-12 h-12 bg-red-500/10 rounded-2xl flex items-center justify-center mb-4 border border-red-500/20">
                                    <Trash2 className="w-6 h-6 text-red-500 dark:text-red-400" />
                                  </div>
                                  <DialogTitle className="text-xl font-black text-foreground">Remove Item from Catalog?</DialogTitle>
                                  <DialogDescription className="text-muted-foreground leading-relaxed">
                                    This will permanently remove <span className="text-foreground font-bold">{item.name}</span> and all its ledger history. This action cannot be undone.
                                  </DialogDescription>
                                </DialogHeader>
                                <form action={removeItem} className="mt-4 flex gap-3">
                                  <input type="hidden" name="itemId" value={item.id} />
                                  <Button type="submit" className="flex-1 h-11 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl transition-all active:scale-95">
                                    Yes, Remove
                                  </Button>
                                </form>
                              </DialogContent>
                            </Dialog>
                          )}
                        </div>
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
  )
}
