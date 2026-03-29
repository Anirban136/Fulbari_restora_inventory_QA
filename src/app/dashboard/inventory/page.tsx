import { prisma } from "@/lib/prisma"
export const dynamic = 'force-dynamic'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { addItem } from "./actions"
import { PlusCircle, Search } from "lucide-react"
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

export default async function CentralInventoryPage() {
  const items = await prisma.item.findMany({
    orderBy: { name: 'asc' }
  })

  return (
    <div className="space-y-8 relative">
      {/* Background Decorators */}
      <div className="absolute top-[-100px] left-[-100px] w-[400px] h-[400px] bg-primary/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="flex items-center justify-between relative z-10 glass-panel p-6 rounded-3xl">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
            Global Catalog
            <div className="h-2 w-2 rounded-full bg-primary animate-pulse shadow-[0_0_10px_oklch(0.55_0.16_150)]"></div>
          </h2>
          <p className="text-muted-foreground mt-1 font-medium text-sm tracking-wide uppercase">Manage all items available in central inventory</p>
        </div>
        
        <Dialog>
          <DialogTrigger render={<Button className="h-12 px-6 rounded-xl bg-primary hover:bg-emerald-500 text-white font-bold shadow-[0_0_20px_-5px_oklch(0.55_0.16_150_/_0.5)] transition-all active:scale-95 gap-2" />}>
              <PlusCircle className="w-5 h-5" /> Add New Item
          </DialogTrigger>
          <DialogContent className="sm:max-w-[450px] bg-black/80 backdrop-blur-2xl border-white/10 rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.8)]">
            <DialogHeader className="mb-4">
               <div className="w-12 h-12 bg-primary/20 rounded-2xl flex items-center justify-center mb-4 border border-primary/30 shadow-[0_0_15px_-3px_oklch(0.55_0.16_150_/_0.3)]">
                 <PlusCircle className="w-6 h-6 text-primary" />
               </div>
              <DialogTitle className="text-2xl font-black text-white">Add Inventory Item</DialogTitle>
              <DialogDescription className="text-slate-400">
                Create a new item in the global catalog. It starts with 0 stock.
              </DialogDescription>
            </DialogHeader>
            <form action={addItem} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-xs font-bold text-slate-400 uppercase tracking-widest">Item Name</Label>
                <Input id="name" name="name" placeholder="e.g. Sugar, Milk" required className="h-12 bg-white/5 border-white/10 text-white placeholder:text-slate-600 rounded-xl focus-visible:ring-primary/50" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="unit" className="text-xs font-bold text-slate-400 uppercase tracking-widest">Unit Type</Label>
                <Input id="unit" name="unit" placeholder="e.g. kg, litre, pieces" required className="h-12 bg-white/5 border-white/10 text-white placeholder:text-slate-600 rounded-xl focus-visible:ring-primary/50" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="vendor" className="text-xs font-bold text-slate-400 uppercase tracking-widest">Default Vendor (Optional)</Label>
                <Input id="vendor" name="vendor" placeholder="e.g. ABC Suppliers" className="h-12 bg-white/5 border-white/10 text-white placeholder:text-slate-600 rounded-xl focus-visible:ring-primary/50" />
              </div>
              <Button type="submit" className="w-full h-14 text-lg font-bold bg-white text-black hover:bg-slate-200 mt-4 rounded-xl shadow-[0_0_20px_rgba(255,255,255,0.2)]">Save Item</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="glass-panel rounded-3xl overflow-hidden relative z-10">
        <div className="p-0 max-h-[70vh] overflow-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-white/10 hover:bg-transparent">
                <TableHead className="font-bold text-slate-400 uppercase tracking-widest text-xs h-14 bg-black/40 backdrop-blur-md sticky top-0 z-20">Item Name</TableHead>
                <TableHead className="font-bold text-slate-400 uppercase tracking-widest text-xs h-14 bg-black/40 backdrop-blur-md sticky top-0 z-20">Unit</TableHead>
                <TableHead className="font-bold text-slate-400 uppercase tracking-widest text-xs h-14 bg-black/40 backdrop-blur-md sticky top-0 z-20 text-right">Central Stock</TableHead>
                <TableHead className="font-bold text-slate-400 uppercase tracking-widest text-xs h-14 bg-black/40 backdrop-blur-md sticky top-0 z-20">Vendor</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.length === 0 ? (
                <TableRow className="border-b border-white/10">
                  <TableCell colSpan={4} className="h-32 text-center text-slate-500">
                     <span className="flex flex-col items-center justify-center">
                       <Search className="w-8 h-8 opacity-20 mb-2" />
                       No items found in catalog. Add your first item.
                     </span>
                  </TableCell>
                </TableRow>
              ) : (
                items.map((item) => (
                  <TableRow key={item.id} className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                    <TableCell className="font-medium text-slate-200 group-hover:text-white transition-colors">{item.name}</TableCell>
                    <TableCell className="text-slate-500">{item.unit}</TableCell>
                    <TableCell className="text-right">
                      <span className="inline-flex items-center justify-center px-4 py-1 rounded-xl bg-primary/20 border border-primary/30 text-primary-foreground font-black tracking-widest text-sm shadow-[0_0_10px_-2px_oklch(0.55_0.16_150_/_0.3)]">
                        {item.currentStock} <span className="text-[10px] ml-1 opacity-70 uppercase">{item.unit}</span>
                      </span>
                    </TableCell>
                    <TableCell className="text-slate-500">{item.vendor || '—'}</TableCell>
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
