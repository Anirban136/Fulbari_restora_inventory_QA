"use client"

import { useState, useId, useMemo } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Edit, Settings2, Plus, Trash2, UtensilsCrossed } from "lucide-react"
import { updateMenuItem } from "./actions"
import { CategoryCombobox } from "./CategoryCombobox"
import { cn } from "@/lib/utils"

export function EditMenuItemDialog({
  menuItem,
  outlets,
  globalItems,
  existingCategories,
}: {
  menuItem: any
  outlets: any[]
  globalItems: any[]
  existingCategories: string[]
}) {
  const [open, setOpen] = useState(false)
  const [selectedOutletId, setSelectedOutletId] = useState(menuItem.outletId || "")
  const [ingredients, setIngredients] = useState<{ itemId: string, quantity: number }[]>(
    menuItem.ingredients?.map((i: any) => ({ itemId: i.itemId, quantity: i.quantity })) || []
  )

  const cafeCategories = ["Breakfast", "Tea & Coffee", "Maggie & Pasta", "Burger & Sandwich", "Momo", "Snacks", "Mocktail", "Others"]
  const chaiCategories = ["Tea & Coffee", "Cigarette", "Beverages", "Others"]

  const suggestions = useMemo(() => {
    const allPresets = new Set<string>()
    cafeCategories.forEach(c => allPresets.add(c))
    chaiCategories.forEach(c => allPresets.add(c))
    existingCategories.forEach(c => allPresets.add(c))
    return Array.from(allPresets)
  }, [existingCategories])

  const rawCategory = menuItem.categoryId || ""
  const matchCat = suggestions.find(c => c.toUpperCase() === rawCategory)
  const defaultCategory = matchCat ?? rawCategory

  const addIngredient = () => {
    setIngredients([...ingredients, { itemId: "", quantity: 1 }])
  }

  const removeIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index))
  }

  const updateIngredient = (index: number, field: "itemId" | "quantity", value: string | number) => {
    const newIngs = [...ingredients]
    newIngs[index] = { ...newIngs[index], [field]: value }
    setIngredients(newIngs)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-all border border-transparent hover:border-white/10 flex items-center justify-center">
          <Edit className="w-4 h-4" />
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[450px] bg-black/90 backdrop-blur-3xl border-white/10 rounded-[2rem] overflow-hidden">
        <DialogHeader className="p-6 pb-0">
          <div className="h-12 w-12 bg-indigo-500/20 rounded-2xl flex items-center justify-center border border-indigo-500/30 shadow-[0_0_15px_-3px_rgba(99,102,241,0.3)] mb-4">
            <Edit className="w-6 h-6 text-indigo-400" />
          </div>
          <DialogTitle className="text-2xl font-black text-white tracking-tight uppercase">Update Menu Entry</DialogTitle>
        </DialogHeader>

        <form action={async (formData) => {
          await updateMenuItem(formData)
          setOpen(false)
        }} className="p-6 pt-4 space-y-6 overflow-y-auto max-h-[80vh]">
          <input type="hidden" name="id" value={menuItem.id} />
          <input type="hidden" name="ingredients" value={JSON.stringify(ingredients)} />

          {/* OUTLET */}
          <div className="space-y-2">
            <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Target POS Outlet</Label>
            <select
              name="outletId"
              required
              value={selectedOutletId}
              onChange={(e) => setSelectedOutletId(e.target.value)}
              className="w-full h-12 px-4 py-2 rounded-xl border border-white/10 bg-black/60 text-white focus:ring-2 focus:ring-indigo-500/50 transition-all font-medium"
            >
              <option value="" disabled className="bg-slate-900">Select Hub...</option>
              {outlets.map(o => <option key={o.id} value={o.id} className="bg-slate-900">{o.name}</option>)}
            </select>
          </div>

          {/* DISPLAY NAME */}
          <div className="space-y-2">
            <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Display Name</Label>
            <Input
              name="name"
              defaultValue={menuItem.name}
              placeholder="e.g. Masala Chai"
              required
              className="h-12 bg-black/60 border-white/10 text-white rounded-xl focus:ring-2 focus:ring-indigo-500/50"
            />
          </div>

          {/* PRICE + CATEGORY */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Price (₹)</Label>
              <Input
                name="price"
                type="number"
                step="0.5"
                min="0"
                defaultValue={menuItem.price}
                required
                className="h-12 bg-black/60 border-white/10 text-white rounded-xl focus:ring-2 focus:ring-indigo-500/50 font-bold text-lg"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Global category</Label>
              <CategoryCombobox name="category" defaultValue={defaultCategory} suggestions={suggestions} />
            </div>
          </div>

          {/* RECIPE BUILDER */}
          <div className="space-y-4 pt-4 border-t border-white/5">
            <div className="flex items-center justify-between">
              <Label className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] flex items-center gap-2">
                <UtensilsCrossed className="w-4 h-4" /> Edit Recipe
              </Label>
              <Button 
                type="button" 
                variant="ghost" 
                size="sm" 
                onClick={addIngredient}
                className="h-8 text-[10px] font-black uppercase tracking-widest text-indigo-400 hover:text-white hover:bg-indigo-500/20 rounded-lg gap-2"
              >
                <Plus className="w-3 h-3" /> Add Item
              </Button>
            </div>

            <div className="space-y-3">
              {ingredients.map((ing, index) => (
                <div key={index} className="grid grid-cols-12 gap-3 items-center">
                  <div className="col-span-7">
                    <select
                      value={ing.itemId}
                      onChange={(e) => updateIngredient(index, "itemId", e.target.value)}
                      required
                      className="w-full h-11 px-3 rounded-xl border border-white/10 bg-black/60 text-xs text-white focus:ring-1 focus:ring-indigo-500/50"
                    >
                      <option value="" disabled>Pick Product...</option>
                      {globalItems.map(item => (
                        <option key={item.id} value={item.id} className="bg-slate-900">{item.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-span-3">
                    <Input 
                      type="number"
                      step="0.01"
                      min="0.01"
                      value={ing.quantity}
                      onChange={(e) => updateIngredient(index, "quantity", parseFloat(e.target.value))}
                      required
                      className="h-11 bg-black/60 border-white/10 text-xs text-center font-black"
                    />
                  </div>
                  <div className="col-span-2">
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => removeIngredient(index)}
                      className="h-11 w-full rounded-xl hover:bg-red-500/10 text-slate-600 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
              {ingredients.length === 0 && (
                <p className="text-[10px] text-slate-600 uppercase font-black tracking-widest text-center py-4 bg-white/2 rounded-2xl border border-dashed border-white/5">
                  No Auto-Deduction active
                </p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest opacity-50">Legacy Link (Optional)</Label>
              <select
                name="itemId"
                defaultValue={menuItem.itemId || ""}
                className="w-full h-10 px-4 py-1 text-xs rounded-lg border border-white/5 bg-black/40 text-slate-400"
              >
                <option value="">None</option>
                {globalItems.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}
              </select>
            </div>
          </div>

          <Button type="submit" className="w-full h-14 bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-indigo-500/20 active:scale-95 transition-all">
            Commit Changes
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
