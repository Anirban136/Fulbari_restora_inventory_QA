"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PlusCircle, Package, ArrowRight } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { addItem } from "./actions"
import { CategoryCombobox } from "../menus/CategoryCombobox"

export function AddItemDialog({ existingCategories = [], variant = "default" }: { existingCategories?: string[], variant?: "default" | "compact" }) {
  const [open, setOpen] = useState(false)
  const [unit, setUnit] = useState("")

  async function handleSubmit(formData: FormData) {
    await addItem(formData)
    setOpen(false)
    setUnit("")
  }

  const showPiecesPerBox = unit === "box" || unit === "packet" || unit === "plate"

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={
        variant === "compact" ? (
          <Button variant="outline" className="h-[38px] lg:h-[40px] px-4 lg:px-5 rounded-xl lg:rounded-2xl border-white/10 bg-white/5 hover:bg-white/10 text-white font-black text-[9px] lg:text-[10px] transition-all active:scale-95 gap-2 uppercase tracking-widest">
            <PlusCircle className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-primary" /> New Entry
          </Button>
        ) : (
          <Button className="h-12 lg:h-14 px-6 lg:px-8 rounded-xl lg:rounded-2xl bg-primary hover:bg-emerald-500 text-primary-foreground font-black shadow-[0_15px_30px_-10px_rgba(16,185,129,0.5)] transition-all active:scale-95 gap-3 w-full uppercase tracking-[0.2em] text-[10px] lg:text-xs">
            <PlusCircle className="w-4 h-4 lg:w-5 lg:h-5" /> Initialize New Node
          </Button>
        )
      } />
      <DialogContent className="sm:max-w-[500px] bg-zinc-950/95 backdrop-blur-3xl border-white/10 rounded-[2.5rem] lg:rounded-[3rem] shadow-2xl p-0 overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-primary/10 rounded-full blur-[80px] -z-10"></div>
        <div className="p-8 lg:p-10">
          <DialogHeader className="mb-6 lg:mb-10">
             <div className="w-16 h-16 lg:w-20 lg:h-20 bg-primary/10 rounded-[1.5rem] lg:rounded-[2rem] flex items-center justify-center mb-6 border border-primary/20 shadow-inner">
               <Package className="w-8 h-8 lg:w-10 lg:h-10 text-primary" />
             </div>
            <DialogTitle className="text-3xl lg:text-4xl font-black text-white tracking-tighter uppercase leading-none">Catalog Entry</DialogTitle>
            <DialogDescription className="text-slate-400 font-medium mt-4 tracking-tight leading-relaxed text-sm">
              Define a new core node in the <span className="text-primary font-black uppercase">Global Repository</span>. Initial stock is set to zero parity.
            </DialogDescription>
          </DialogHeader>

          <form action={handleSubmit} className="space-y-6 lg:space-y-8">
            <div className="space-y-2 lg:space-y-3">
              <Label htmlFor="name" className="text-[9px] lg:text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] lg:tracking-[0.3em] ml-1">Entity Identifier</Label>
              <Input id="name" name="name" placeholder="e.g. PREMIUM ESPRESSO BEANS" required className="h-12 lg:h-14 bg-white/[0.03] border-white/10 text-white placeholder:text-muted-foreground/20 rounded-xl lg:rounded-2xl pl-5 pr-5 text-xs lg:text-sm focus-visible:ring-primary/40 focus:border-primary/50 transition-all font-bold uppercase tracking-widest shadow-inner" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
              <div className="space-y-2 lg:space-y-3">
                <Label htmlFor="category" className="text-[9px] lg:text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] lg:tracking-[0.3em] ml-1">Node Class</Label>
                <CategoryCombobox 
                  key={open ? 'open' : 'closed'} 
                  name="category" 
                  suggestions={existingCategories} 
                />
              </div>

              <div className="space-y-2 lg:space-y-3">
                <Label htmlFor="unit" className="text-[9px] lg:text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] lg:tracking-[0.3em] ml-1">Metric Unit</Label>
                <select 
                  name="unit" 
                  id="unit" 
                  required 
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="w-full h-12 lg:h-14 px-5 lg:px-6 py-2 rounded-xl lg:rounded-2xl border border-white/10 bg-white/[0.03] text-white focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary/50 transition-all font-black uppercase tracking-widest text-[10px] lg:text-xs appearance-none cursor-pointer shadow-inner"
                >
                  <option value="" className="bg-zinc-950 text-muted-foreground/30">Select Metric...</option>
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
              <div className="space-y-2 lg:space-y-3">
                <Label htmlFor="costPerUnit" className="text-[9px] lg:text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] lg:tracking-[0.3em] ml-1">Input Credit (₹)</Label>
                <Input id="costPerUnit" name="costPerUnit" type="number" step="0.01" placeholder="0.00" className="h-12 lg:h-14 bg-white/[0.03] border-white/10 text-white placeholder:text-muted-foreground/10 rounded-xl lg:rounded-2xl focus-visible:ring-primary/40 font-black lg:text-lg" />
              </div>
              <div className="space-y-2 lg:space-y-3">
                <Label htmlFor="sellPrice" className="text-[9px] lg:text-[10px] font-black text-primary uppercase tracking-[0.2em] lg:tracking-[0.3em] ml-1">Output Credit (₹)</Label>
                <Input id="sellPrice" name="sellPrice" type="number" step="0.01" placeholder="0.00" className="h-12 lg:h-14 bg-white/[0.03] border-primary/20 text-primary placeholder:text-primary/10 rounded-xl lg:rounded-2xl focus-visible:ring-primary/40 font-black lg:text-lg shadow-[0_0_20px_rgba(16,185,129,0.05)]" />
              </div>
            </div>

            <div className={`grid gap-4 lg:gap-6 transition-all duration-500 ${showPiecesPerBox ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1'}`}>
              <div className="space-y-2 lg:space-y-3">
                <Label htmlFor="minStock" className="text-[9px] lg:text-[10px] font-black text-amber-500 uppercase tracking-[0.2em] lg:tracking-[0.3em] ml-1">Redline Threshold</Label>
                <Input id="minStock" name="minStock" type="number" step="0.01" placeholder="5.00" className="h-12 lg:h-14 bg-white/[0.03] border-amber-500/20 text-amber-500 placeholder:text-amber-500/10 rounded-xl lg:rounded-2xl focus-visible:ring-amber-500/40 font-black lg:text-lg" />
              </div>
              {showPiecesPerBox && (
                <div className="space-y-2 lg:space-y-3 animate-in fade-in slide-in-from-right-4 duration-500">
                  <Label htmlFor="piecesPerBox" className="text-[9px] lg:text-[10px] font-black text-blue-400 uppercase tracking-[0.2em] lg:tracking-[0.3em] ml-1">Pieces / {unit}</Label>
                  <Input id="piecesPerBox" name="piecesPerBox" type="number" placeholder="20" required className="h-12 lg:h-14 bg-white/[0.03] border-blue-500/20 text-blue-400 placeholder:text-blue-400/10 rounded-xl lg:rounded-2xl focus-visible:ring-blue-500/40 font-black lg:text-lg shadow-inner" />
                </div>
              )}
            </div>

            <div className="pt-2 lg:pt-4 pb-6 lg:pb-4">
              <Button type="submit" className="w-full h-14 lg:h-16 text-xs lg:text-sm font-black uppercase tracking-[0.4em] bg-white text-black hover:bg-slate-100 rounded-xl lg:rounded-2xl shadow-2xl transition-all active:scale-95 flex items-center justify-center gap-3">
                Commit Node <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}
