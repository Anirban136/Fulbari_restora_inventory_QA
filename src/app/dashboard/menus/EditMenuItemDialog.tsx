"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Edit, Settings2 } from "lucide-react"
import { updateMenuItem } from "./actions"

export function EditMenuItemDialog({ menuItem, outlets, globalItems, existingCategories }: { menuItem: any, outlets: any[], globalItems: any[], existingCategories: string[] }) {
  const [open, setOpen] = useState(false)
  const [selectedOutletId, setSelectedOutletId] = useState(menuItem.outletId || "")

  const selectedOutlet = outlets.find(o => o.id === selectedOutletId)
  const isCafe = selectedOutlet?.type === "CAFE" || selectedOutlet?.name?.toLowerCase().includes("cafe")

  const cafeCategories = ["Breakfast", "Tea & Coffee", "Maggie & Pasta", "Burger & Sandwich", "Momo", "Snacks", "Mocktail", "Others"]
  const chaiCategories = ["Chai", "Coffee", "Ciggerette", "Beverage", "Others"]

  const categories = isCafe ? cafeCategories : chaiCategories
  
  // Format the existing category to match the <select> style
  let defaultCategory = menuItem.categoryId || "";
  
  // DB stores in uppercase, so reverse map if matches
  const matchCat = [...cafeCategories, ...chaiCategories].find(c => c.toUpperCase() === defaultCategory)
  if (matchCat) {
    defaultCategory = matchCat
  } else if (defaultCategory && !categories.includes(defaultCategory)) {
    defaultCategory = "Others" // fallback
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={
        <button className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-all border border-transparent hover:border-white/10 flex items-center justify-center">
          <Edit className="w-4 h-4" />
        </button>
      }>
        <Edit className="w-4 h-4" />
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-black/80 backdrop-blur-2xl border-white/10 rounded-3xl">
        <DialogHeader>
          <div className="h-12 w-12 bg-indigo-500/20 rounded-2xl flex items-center justify-center border border-indigo-500/30 shadow-[0_0_15px_-3px_rgba(99,102,241,0.3)] mb-4">
            <Edit className="w-6 h-6 text-indigo-400" />
          </div>
          <DialogTitle className="text-xl font-bold text-white tracking-tight">Edit Menu Item</DialogTitle>
        </DialogHeader>
        
        <form action={async (formData) => {
          await updateMenuItem(formData)
          setOpen(false)
        }} className="space-y-6 pt-4">
          <input type="hidden" name="id" value={menuItem.id} />
          
          <div className="space-y-2">
            <Label htmlFor={`edit_outlet_${menuItem.id}`} className="text-xs font-bold text-slate-400 uppercase tracking-widest">Select POS Outlet</Label>
            <select 
              name="outletId" 
              id={`edit_outlet_${menuItem.id}`} 
              required 
              value={selectedOutletId}
              onChange={(e) => setSelectedOutletId(e.target.value)}
              className="w-full h-12 px-4 py-2 rounded-xl border border-white/10 bg-black/40 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all shadow-inner font-medium"
            >
              <option value="" disabled className="bg-slate-900 text-slate-500">Cafe or Chai Joint...</option>
              {outlets.map(o => <option key={o.id} value={o.id} className="bg-slate-900 text-white">{o.name}</option>)}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor={`edit_name_${menuItem.id}`} className="text-xs font-bold text-slate-400 uppercase tracking-widest">Display Name on POS</Label>
            <Input id={`edit_name_${menuItem.id}`} name="name" defaultValue={menuItem.name} placeholder="e.g. Masala Chai" required className="h-12 bg-black/40 border-white/10 text-white placeholder:text-slate-600 rounded-xl focus-visible:ring-indigo-500/50 shadow-inner" />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor={`edit_price_${menuItem.id}`} className="text-xs font-bold text-slate-400 uppercase tracking-widest">Price (₹)</Label>
              <Input id={`edit_price_${menuItem.id}`} name="price" type="number" step="0.5" min="0" defaultValue={menuItem.price} required className="h-12 bg-black/40 border-white/10 text-white placeholder:text-slate-600 rounded-xl focus-visible:ring-indigo-500/50 shadow-inner font-mono text-lg" />
            </div>

            <div className="space-y-2">
              <Label htmlFor={`edit_category_${menuItem.id}`} className="text-xs font-bold text-slate-400 uppercase tracking-widest">Category</Label>
              <select name="category" id={`edit_category_${menuItem.id}`} required defaultValue={defaultCategory} className="w-full h-12 px-4 py-2 rounded-xl border border-white/10 bg-black/40 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-medium">
                <option value="" disabled className="bg-slate-900 text-slate-500">Select a category...</option>
                {categories.map(c => <option key={c} value={c} className="bg-slate-900 text-white">{c}</option>)}
              </select>
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-white/5">
            <Label htmlFor={`edit_itemId_${menuItem.id}`} className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Settings2 className="w-3 h-3" /> Auto-Deduct Inventory
            </Label>
            <select name="itemId" id={`edit_itemId_${menuItem.id}`} defaultValue={menuItem.itemId || ""} className="w-full h-12 px-4 py-2 rounded-xl border border-white/10 bg-black/40 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all shadow-inner font-medium">
              <option value="" className="bg-slate-900 text-slate-300">None (Standalone POS Item)</option>
              {globalItems.map(item => (
                <option key={item.id} value={item.id} className="bg-slate-900 text-white">Deduct: {item.name}</option>
              ))}
            </select>
            <p className="text-[10px] text-slate-500 pt-1 uppercase tracking-widest leading-relaxed">Optional: Link to catalog. 1 sale = -1 unit deduced immediately.</p>
          </div>

          <Button type="submit" className="w-full h-14 mt-6 text-lg font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_0_20px_-5px_rgba(99,102,241,0.5)] rounded-xl transition-all active:scale-[0.98]">
            Save Changes
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
