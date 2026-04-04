"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PlusCircle } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { addItem } from "./actions"

export function AddItemDialog() {
  const [open, setOpen] = useState(false)

  async function handleSubmit(formData: FormData) {
    await addItem(formData)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={
        <Button className="h-12 px-6 rounded-xl bg-primary hover:bg-emerald-500 text-white font-bold shadow-[0_0_20px_-5px_oklch(0.55_0.16_150_/_0.5)] transition-all active:scale-95 gap-2 w-full" />
      }>
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
        <form action={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-xs font-bold text-slate-400 uppercase tracking-widest">Item Name</Label>
            <Input id="name" name="name" placeholder="e.g. Sugar, Milk" required className="h-12 bg-white/5 border-white/10 text-white placeholder:text-slate-600 rounded-xl focus-visible:ring-primary/50" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="category" className="text-xs font-bold text-slate-400 uppercase tracking-widest">Category</Label>
            <select name="category" id="category" required className="w-full h-12 px-4 py-2 rounded-xl border border-white/10 bg-black/40 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium">
              <option value="" className="bg-slate-900 text-slate-500">Select a category...</option>
              <option value="Cigarettes" className="bg-slate-900 text-white">Cigarettes</option>
              <option value="Dairy & Milk" className="bg-slate-900 text-white">Dairy & Milk</option>
              <option value="Produce" className="bg-slate-900 text-white">Produce</option>
              <option value="Vegetables" className="bg-slate-900 text-white">Vegetables</option>
              <option value="Fruits" className="bg-slate-900 text-white">Fruits</option>
              <option value="Meat" className="bg-slate-900 text-white">Meat</option>
              <option value="Spices" className="bg-slate-900 text-white">Spices</option>
              <option value="Beverages" className="bg-slate-900 text-white">Beverages</option>
              <option value="Bakery" className="bg-slate-900 text-white">Bakery</option>
              <option value="Cleaning Supplies" className="bg-slate-900 text-white">Cleaning Supplies</option>
              <option value="Packaging" className="bg-slate-900 text-white">Packaging</option>
              <option value="Dry Goods" className="bg-slate-900 text-white">Dry Goods</option>
              <option value="Uncategorized" className="bg-slate-900 text-white">Other / Uncategorized</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="unit" className="text-xs font-bold text-slate-400 uppercase tracking-widest">Unit Type</Label>
            <select name="unit" id="unit" required className="w-full h-12 px-4 py-2 rounded-xl border border-white/10 bg-black/40 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium">
              <option value="" className="bg-slate-900 text-slate-500">Select a unit...</option>
              <option value="kg" className="bg-slate-900 text-white">kg</option>
              <option value="gm" className="bg-slate-900 text-white">gm</option>
              <option value="lit" className="bg-slate-900 text-white">litre (lit)</option>
              <option value="ml" className="bg-slate-900 text-white">ml</option>
              <option value="packet" className="bg-slate-900 text-white">packet</option>
              <option value="box" className="bg-slate-900 text-white">box</option>
              <option value="pcs" className="bg-slate-900 text-white">pieces (pcs)</option>
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
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="minStock" className="text-xs font-bold text-slate-400 uppercase tracking-widest text-amber-400">Low Stock Alert</Label>
              <Input id="minStock" name="minStock" type="number" step="0.01" placeholder="e.g. 5" className="h-12 bg-white/5 border-amber-500/20 text-white placeholder:text-slate-700 rounded-xl focus-visible:ring-amber-500/50" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="piecesPerBox" className="text-xs font-bold text-slate-400 uppercase tracking-widest text-blue-400">Pieces in Box</Label>
              <Input id="piecesPerBox" name="piecesPerBox" type="number" placeholder="e.g. 20" className="h-12 bg-white/5 border-blue-500/20 text-white placeholder:text-slate-700 rounded-xl focus-visible:ring-blue-500/50" />
            </div>
          </div>
          <Button type="submit" className="w-full h-14 text-lg font-bold bg-white text-black hover:bg-slate-200 mt-4 rounded-xl shadow-[0_0_20px_rgba(255,255,255,0.2)]">Save Item</Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
