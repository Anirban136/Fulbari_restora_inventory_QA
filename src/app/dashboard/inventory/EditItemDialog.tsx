"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Edit, Package, ArrowRight, X } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog"
import { updateItem } from "./actions"
import { CategoryCombobox } from "../menus/CategoryCombobox"

export function EditItemDialog({ item, existingCategories = [] }: { item: any; existingCategories?: string[] }) {
  const [open, setOpen] = useState(false)
  const [unit, setUnit] = useState(item.unit || "")

  async function handleSubmit(formData: FormData) {
    await updateItem(formData)
    setOpen(false)
  }

  const showPiecesPerBox = unit === "box" || unit === "packet" || unit === "plate"

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={
        <button className="p-2.5 rounded-2xl text-amber-500/40 hover:text-amber-500 hover:bg-amber-500/10 border border-transparent hover:border-amber-500/20 transition-all group/edit" title={`Reconfigure ${item.name}`}>
          <Edit className="w-4 h-4" />
        </button>
      } />
      <DialogContent className="sm:max-w-[500px] bg-zinc-950/95 backdrop-blur-3xl border-white/10 rounded-[3rem] shadow-2xl p-0 overflow-hidden" showCloseButton={false}>
        {/* Explicit Close Button for Mobile Nav */}
        <DialogClose render={<button className="absolute top-6 right-6 p-3 rounded-2xl bg-white/5 border border-white/10 text-white/40 hover:text-white transition-all active:scale-90 z-50"><X className="w-5 h-5" /></button>} />
        
        <div className="absolute top-0 right-0 w-40 h-40 bg-primary/10 rounded-full blur-[80px] -z-10"></div>
        <div className="p-10">
          <DialogHeader className="mb-10">
             <div className="w-20 h-20 bg-primary/10 rounded-[2rem] flex items-center justify-center mb-6 border border-primary/20 shadow-inner">
               <Package className="w-10 h-10 text-primary" />
             </div>
            <DialogTitle className="text-4xl font-black text-white tracking-tighter uppercase leading-none truncate">Editing: {item.name}</DialogTitle>
            <DialogDescription className="text-slate-400 font-medium mt-4 tracking-tight leading-relaxed text-sm">
              Update core product details in the <span className="text-primary font-black uppercase">Global Repository</span>.
            </DialogDescription>
          </DialogHeader>

          <form action={handleSubmit} className="space-y-6">
            <input type="hidden" name="itemId" value={item.id} />

            <div className="space-y-2">
              <Label htmlFor="name" className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] ml-1">ITEM NAME</Label>
              <Input id="name" name="name" defaultValue={item.name} placeholder="e.g. PREMIUM ESPRESSO BEANS" required className="h-14 bg-white/[0.03] border-white/10 text-white placeholder:text-muted-foreground/20 rounded-2xl pl-5 pr-5 text-sm focus-visible:ring-primary/40 focus:border-primary/50 transition-all font-bold uppercase tracking-widest shadow-inner" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category" className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] ml-1">CATEGORY</Label>
                <CategoryCombobox 
                  key={open ? 'open' : 'closed'} 
                  name="category" 
                  suggestions={existingCategories} 
                  defaultValue={item.category}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="unit" className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] ml-1">UNIT</Label>
                <select 
                  name="unit" 
                  id="unit" 
                  required 
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="w-full h-14 px-6 py-2 rounded-2xl border border-white/10 bg-white/[0.03] text-white focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary/50 transition-all font-black uppercase tracking-widest text-xs appearance-none cursor-pointer shadow-inner"
                >
                  <option value="kg">Kilogram (kg)</option>
                  <option value="gm">Gram (gm)</option>
                  <option value="lit">Litre (lit)</option>
                  <option value="ml">Millilitre (ml)</option>
                  <option value="packet">Packet</option>
                  <option value="box">Box</option>
                  <option value="plate">Plate</option>
                  <option value="pcs">Pieces (pcs)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] ml-1">BUY PRICE (₹)</Label>
                <Input name="costPerUnit" type="number" step="0.01" defaultValue={item.costPerUnit} className="h-14 bg-white/[0.03] border-white/10 text-white rounded-2xl focus-visible:ring-primary/40 font-black text-lg" />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black text-primary uppercase tracking-[0.3em] ml-1">SELL PRICE (₹)</Label>
                <Input name="sellPrice" type="number" step="0.01" defaultValue={item.sellPrice} className="h-14 bg-white/[0.03] border-primary/20 text-primary rounded-2xl focus-visible:ring-primary/40 font-black text-lg" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-black text-amber-500 uppercase tracking-[0.3em] ml-1">LOW STOCK BORDER</Label>
                <Input name="minStock" type="number" step="0.01" defaultValue={item.minStock} required className="h-14 bg-white/[0.03] border-amber-500/20 text-amber-500 rounded-2xl focus-visible:ring-amber-500/40 font-black text-lg" />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black text-sky-400 uppercase tracking-[0.3em] ml-1">MANUAL STOCK ADJUST</Label>
                <Input name="currentStock" type="number" step="0.5" defaultValue={item.currentStock} required className="h-14 bg-white/[0.03] border-sky-400/20 text-sky-400 rounded-2xl focus-visible:ring-sky-400/40 font-black text-lg font-mono" />
              </div>
            </div>

            {showPiecesPerBox && (
              <div className="space-y-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <Label className="text-[10px] font-black text-blue-400 uppercase tracking-[0.3em] ml-1">Pieces per {unit}</Label>
                <Input name="piecesPerBox" type="number" defaultValue={item.piecesPerBox} required className="h-14 bg-white/[0.03] border-blue-500/20 text-blue-400 rounded-2xl focus-visible:ring-blue-500/40 font-black text-lg shadow-inner" />
              </div>
            )}

            <div className="pt-4">
              <Button type="submit" className="w-full h-16 text-sm font-black uppercase tracking-[0.4em] bg-white text-black hover:bg-slate-100 rounded-2xl shadow-2xl transition-all active:scale-95 flex items-center justify-center gap-3">
                SAVE CHANGES <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}
