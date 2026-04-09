"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Edit, Package, Check, ArrowRight, X } from "lucide-react"
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
        
        <div className="absolute top-0 right-0 w-40 h-40 bg-amber-500/10 rounded-full blur-[80px] -z-10"></div>
        <div className="p-10">
          <DialogHeader className="mb-10">
            <div className="w-20 h-20 bg-amber-500/10 rounded-[2rem] flex items-center justify-center mb-6 border border-amber-500/20 shadow-inner">
              <Package className="w-10 h-10 text-amber-500" />
            </div>
            <DialogTitle className="text-4xl font-black text-white tracking-tighter uppercase leading-none">Edit Global Item</DialogTitle>
            <DialogDescription className="text-slate-400 font-medium mt-4 tracking-tight leading-relaxed text-sm">
              Modify core attributes of <span className="text-amber-500 font-black uppercase">{item.name}</span> in the <span className="text-amber-500 font-black uppercase">Global Repository</span>.
            </DialogDescription>
          </DialogHeader>

          <form action={handleSubmit} className="space-y-8">
            <input type="hidden" name="itemId" value={item.id} />
            
            <div className="space-y-3">
              <Label htmlFor={`edit_name_${item.id}`} className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] ml-1">ITEM NAME</Label>
              <Input id={`edit_name_${item.id}`} name="name" defaultValue={item.name} required className="h-14 bg-white/[0.03] border-white/10 text-white rounded-2xl focus-visible:ring-amber-500/40 font-bold uppercase tracking-widest text-sm shadow-inner" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label htmlFor={`edit_category_${item.id}`} className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] ml-1">CATEGORY</Label>
                <CategoryCombobox 
                  name="category" 
                  suggestions={existingCategories} 
                  defaultValue={item.category || ""}
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor={`edit_unit_${item.id}`} className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] ml-1">UNIT</Label>
                <select 
                  name="unit" 
                  id={`edit_unit_${item.id}`} 
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  required 
                  className="w-full h-14 px-6 py-2 rounded-2xl border border-white/10 bg-white/[0.03] text-white focus:outline-none focus:ring-4 focus:ring-amber-500/10 transition-all font-black uppercase tracking-widest text-xs appearance-none cursor-pointer shadow-inner"
                >
                  <option value="kg" className="bg-zinc-950 text-white">Kilogram (kg)</option>
                  <option value="gm" className="bg-zinc-950 text-white">Gram (gm)</option>
                  <option value="lit" className="bg-zinc-950 text-white">Litre (lit)</option>
                  <option value="ml" className="bg-zinc-950 text-white">Millilitre (ml)</option>
                  <option value="packet" className="bg-zinc-950 text-white">Packet</option>
                  <option value="box" className="bg-zinc-950 text-white">Box</option>
                  <option value="plate" className="bg-zinc-950 text-white">Plate</option>
                  <option value="pcs" className="bg-zinc-950 text-white">Pieces (pcs)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label htmlFor={`edit_cost_${item.id}`} className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] ml-1">BUY PRICE (₹)</Label>
                <Input id={`edit_cost_${item.id}`} name="costPerUnit" type="number" step="0.01" defaultValue={item.costPerUnit || ""} className="h-14 bg-white/[0.03] border-white/10 text-white rounded-2xl focus-visible:ring-amber-500/40 font-black text-lg shadow-inner" />
              </div>
              <div className="space-y-3">
                <Label htmlFor={`edit_sell_${item.id}`} className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.3em] ml-1">SELL PRICE (₹)</Label>
                <Input id={`edit_sell_${item.id}`} name="sellPrice" type="number" step="0.01" defaultValue={item.sellPrice || ""} className="h-14 bg-white/[0.03] border-emerald-500/20 text-emerald-500 rounded-2xl focus-visible:ring-emerald-500/40 font-black text-lg shadow-[0_0_20px_rgba(16,185,129,0.05)]" />
              </div>
            </div>

            <div className="space-y-3 bg-amber-500/5 p-5 rounded-3xl border border-amber-500/10">
              <Label htmlFor={`edit_stock_${item.id}`} className="text-[10px] font-black text-amber-500 uppercase tracking-[0.3em] ml-1 flex items-center justify-between">
                <span>MANUAL STOCK SYNC</span>
                <span className="opacity-40 text-[8px] tracking-normal lowercase">(Direct Override)</span>
              </Label>
              <div className="relative">
                <Input id={`edit_stock_${item.id}`} name="currentStock" type="number" step="0.01" defaultValue={item.currentStock} required className="h-16 bg-black/40 border-amber-500/30 text-amber-500 text-3xl font-black rounded-2xl tracking-tighter pl-6 focus-visible:ring-amber-500/40 shadow-2xl" />
                <span className="absolute right-6 top-1/2 -translate-y-1/2 text-[10px] font-black text-amber-400/40 uppercase tracking-widest">{item.unit}</span>
              </div>
            </div>

            <div className={`grid gap-6 transition-all duration-500 ${showPiecesPerBox ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1'}`}>
              <div className="space-y-3">
                <Label htmlFor={`edit_min_stock_${item.id}`} className="text-[10px] font-black text-amber-500 uppercase tracking-[0.3em] ml-1">LOW STOCK ALERT</Label>
                <Input id={`edit_min_stock_${item.id}`} name="minStock" type="number" step="0.01" defaultValue={item.minStock || 0} required className="h-14 bg-white/[0.03] border-amber-500/20 text-amber-500 rounded-2xl focus-visible:ring-amber-500/40 font-black text-lg" />
              </div>
              {showPiecesPerBox && (
                <div className="space-y-3 animate-in fade-in slide-in-from-right-4 duration-500">
                  <Label htmlFor={`edit_pieces_per_box_${item.id}`} className="text-[10px] font-black text-blue-400 uppercase tracking-[0.3em] ml-1">Pieces / {unit}</Label>
                  <Input id={`edit_pieces_per_box_${item.id}`} name="piecesPerBox" type="number" defaultValue={item.piecesPerBox || ""} required className="h-14 bg-white/[0.03] border-blue-500/20 text-blue-400 rounded-2xl focus-visible:ring-blue-500/40 font-black text-lg shadow-inner" />
                </div>
              )}
            </div>

            <div className="pt-6">
              <Button type="submit" className="w-full h-16 text-sm font-black uppercase tracking-[0.4em] bg-white text-black hover:bg-slate-100 rounded-2xl shadow-2xl transition-all active:scale-95 flex items-center justify-center gap-3">
                SUBMIT CHANGES <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}
