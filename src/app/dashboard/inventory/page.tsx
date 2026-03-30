import { prisma } from "@/lib/prisma"
export const dynamic = 'force-dynamic'
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { addItem, removeItem, addVendor } from "./actions"
import { PlusCircle, Search, Trash2, Users } from "lucide-react"
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

export default async function GlobalCatalogPage() {
  const session = await getServerSession(authOptions)
  const isOwner = session?.user?.role === "OWNER"

  const [items, vendors] = await Promise.all([
    prisma.item.findMany({
      include: { Vendor: true },
      orderBy: { name: 'asc' }
    }),
    prisma.vendor.findMany({
      orderBy: { name: 'asc' }
    })
  ])

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
        
        <div className="flex gap-4">
          <Dialog>
            <DialogTrigger render={<Button variant="outline" className="h-12 px-6 rounded-xl border-white/10 bg-white/5 hover:bg-white/10 text-white font-bold transition-all active:scale-95 gap-2" />}>
                <PlusCircle className="w-5 h-5" /> Add New Vendor
            </DialogTrigger>
            <DialogContent className="sm:max-w-[450px] bg-black/80 backdrop-blur-2xl border-white/10 rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.8)]">
              <DialogHeader className="mb-4">
                 <div className="w-12 h-12 bg-primary/20 rounded-2xl flex items-center justify-center mb-4 border border-primary/30 shadow-[0_0_15px_-3px_oklch(0.55_0.16_150_/_0.3)]">
                   <Users className="w-6 h-6 text-primary" />
                 </div>
                <DialogTitle className="text-2xl font-black text-white">Add New Vendor</DialogTitle>
                <DialogDescription className="text-slate-400">
                  Register a new supplier to link with catalog items.
                </DialogDescription>
              </DialogHeader>
              <form action={addVendor} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-xs font-bold text-slate-400 uppercase tracking-widest">Vendor Name</Label>
                  <Input id="vendor_name" name="name" placeholder="e.g. ABC Wholesale" required className="h-12 bg-white/5 border-white/10 text-white placeholder:text-slate-600 rounded-xl focus-visible:ring-primary/50" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact" className="text-xs font-bold text-slate-400 uppercase tracking-widest">Contact Number</Label>
                  <Input id="contact" name="contact" placeholder="e.g. +91 9876543210" className="h-12 bg-white/5 border-white/10 text-white placeholder:text-slate-600 rounded-xl focus-visible:ring-primary/50" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address" className="text-xs font-bold text-slate-400 uppercase tracking-widest">Address</Label>
                  <Input id="address" name="address" placeholder="Vendor location..." className="h-12 bg-white/5 border-white/10 text-white placeholder:text-slate-600 rounded-xl focus-visible:ring-primary/50" />
                </div>
                <Button type="submit" className="w-full h-14 text-lg font-bold bg-white text-black hover:bg-slate-200 mt-4 rounded-xl shadow-[0_0_20px_rgba(255,255,255,0.2)]">Save Vendor</Button>
              </form>
            </DialogContent>
          </Dialog>

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
                  <Label htmlFor="vendorId" className="text-xs font-bold text-slate-400 uppercase tracking-widest">Select Vendor</Label>
                  <select name="vendorId" id="vendorId" className="w-full h-12 px-4 py-2 rounded-xl border border-white/10 bg-black/40 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium">
                    <option value="" className="bg-slate-900 text-slate-500">Select a vendor...</option>
                    {vendors.map(v => (
                      <option key={v.id} value={v.id} className="bg-slate-900 text-white">{v.name}</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="costPerUnit" className="text-xs font-bold text-slate-400 uppercase tracking-widest">Cost Price (₹)</Label>
                    <Input id="costPerUnit" name="costPerUnit" type="number" step="0.01" placeholder="e.g. 50" className="h-12 bg-white/5 border-white/10 text-white placeholder:text-slate-600 rounded-xl focus-visible:ring-primary/50" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sellPrice" className="text-xs font-bold text-slate-400 uppercase tracking-widest">Sell Price (₹)</Label>
                    <Input id="sellPrice" name="sellPrice" type="number" step="0.01" placeholder="e.g. 150" className="h-12 bg-white/5 border-white/10 text-white placeholder:text-slate-600 rounded-xl focus-visible:ring-primary/50" />
                  </div>
                </div>
                <Button type="submit" className="w-full h-14 text-lg font-bold bg-white text-black hover:bg-slate-200 mt-4 rounded-xl shadow-[0_0_20px_rgba(255,255,255,0.2)]">Save Item</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="glass-panel rounded-3xl overflow-hidden relative z-10">
        <div className="p-0 max-h-[70vh] overflow-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-white/10 hover:bg-transparent">
                <TableHead className="font-bold text-slate-400 uppercase tracking-widest text-xs h-14 bg-black/40 backdrop-blur-md sticky top-0 z-20">Item Name</TableHead>
                <TableHead className="font-bold text-slate-400 uppercase tracking-widest text-xs h-14 bg-black/40 backdrop-blur-md sticky top-0 z-20">Unit</TableHead>
                <TableHead className="font-bold text-slate-400 uppercase tracking-widest text-xs h-14 bg-black/40 backdrop-blur-md sticky top-0 z-20 text-right">Central Stock</TableHead>
                <TableHead className="font-bold text-slate-400 uppercase tracking-widest text-xs h-14 bg-black/40 backdrop-blur-md sticky top-0 z-20 text-right">Cost Price</TableHead>
                <TableHead className="font-bold text-slate-400 uppercase tracking-widest text-xs h-14 bg-black/40 backdrop-blur-md sticky top-0 z-20 text-right">Sell Price</TableHead>
                <TableHead className="font-bold text-slate-400 uppercase tracking-widest text-xs h-14 bg-black/40 backdrop-blur-md sticky top-0 z-20">Vendor</TableHead>
                {isOwner && (
                  <TableHead className="font-bold text-slate-400 uppercase tracking-widest text-xs h-14 bg-black/40 backdrop-blur-md sticky top-0 z-20 text-center">Remove</TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.length === 0 ? (
                <TableRow className="border-b border-white/10">
                  <TableCell colSpan={isOwner ? 7 : 6} className="h-32 text-center text-slate-500">
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
                    <TableCell className="text-right text-slate-300 font-bold">
                      {item.costPerUnit ? `₹${item.costPerUnit.toFixed(2)}` : '—'}
                    </TableCell>
                    <TableCell className="text-right text-emerald-400 font-bold">
                      {item.sellPrice ? `₹${item.sellPrice.toFixed(2)}` : '—'}
                    </TableCell>
                    <TableCell className="text-slate-400 font-medium">{item.Vendor?.name || item.vendor || '—'}</TableCell>
                    {isOwner && (
                      <TableCell className="text-center">
                        <Dialog>
                          <DialogTrigger render={
                            <button className="p-2 rounded-xl text-red-400/60 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all group/del" title={`Remove ${item.name}`} />
                          }>
                            <Trash2 className="w-4 h-4" />
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-[400px] bg-black/90 backdrop-blur-2xl border-red-500/20 rounded-3xl shadow-[0_0_50px_rgba(239,68,68,0.2)]">
                            <DialogHeader className="mb-2">
                              <div className="w-12 h-12 bg-red-500/10 rounded-2xl flex items-center justify-center mb-4 border border-red-500/20">
                                <Trash2 className="w-6 h-6 text-red-400" />
                              </div>
                              <DialogTitle className="text-xl font-black text-white">Remove Item from Catalog?</DialogTitle>
                              <DialogDescription className="text-slate-400 leading-relaxed">
                                This will permanently remove <span className="text-white font-bold">{item.name}</span> and all its ledger history. This action cannot be undone.
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
