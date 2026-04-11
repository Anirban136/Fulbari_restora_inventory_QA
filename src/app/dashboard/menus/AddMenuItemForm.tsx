"use client"

import { useState, useId } from "react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Settings2, Plus, Trash2, UtensilsCrossed } from "lucide-react"
import { addMenuItem } from "./actions"
import { CategoryCombobox } from "./CategoryCombobox"
import { cn } from "@/lib/utils"

export function AddMenuItemForm({
  outlets,
  globalItems,
  existingCategories,
}: {
  outlets: any[]
  globalItems: any[]
  existingCategories: string[]
}) {
  const [selectedOutletId, setSelectedOutletId] = useState("")
  const [ingredients, setIngredients] = useState<{ itemId: string, quantity: number }[]>([])
  const listId = useId()

  const selectedOutlet = outlets.find(o => o.id === selectedOutletId)
  const isCafe =
    selectedOutletId === "BOTH" ||
    selectedOutlet?.type === "CAFE" ||
    selectedOutlet?.name?.toLowerCase().includes("cafe")
  const isChai =
    selectedOutletId === "BOTH" ||
    selectedOutlet?.type === "CHAI_JOINT" ||
    selectedOutlet?.name?.toLowerCase().includes("chai")

  const suggestions = useMemo(() => {
    const cafeCategories = ["Breakfast", "Tea & Coffee", "Maggie & Pasta", "Burger & Sandwich", "Momo", "Snacks", "Mocktail", "Others"]
    const chaiCategories = ["Tea & Coffee", "Cigarette", "Beverages", "Others"]
    const presets = new Set<string>()
    if (isCafe) cafeCategories.forEach(c => presets.add(c))
    if (isChai) chaiCategories.forEach(c => presets.add(c))
    existingCategories.forEach(c => presets.add(c))
    if (!isCafe && !isChai) {
      ;[...cafeCategories, ...chaiCategories].forEach(c => presets.add(c))
      existingCategories.forEach(c => presets.add(c))
    }
    return Array.from(presets)
  }, [isCafe, isChai, existingCategories])

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
    <form action={addMenuItem} className="space-y-6">
      {/* Hidden ingredients JSON */}
      <input type="hidden" name="ingredients" value={JSON.stringify(ingredients)} />

      {/* OUTLET SELECTOR */}
      <div className="space-y-2">
        <Label htmlFor="outletId" className="text-xs font-bold text-slate-400 uppercase tracking-widest">
          Select POS Outlet
        </Label>
        <select
          name="outletId"
          id="outletId"
          required
          value={selectedOutletId}
          onChange={e => setSelectedOutletId(e.target.value)}
          className="w-full h-12 px-4 py-2 rounded-xl border border-white/10 bg-black/40 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-medium"
        >
          <option value="" disabled className="bg-slate-900 text-slate-500">Cafe or Chai Joint...</option>
          {outlets.map(o => (
            <option key={o.id} value={o.id} className="bg-slate-900 text-white">{o.name}</option>
          ))}
          <option value="BOTH" className="bg-indigo-900 text-indigo-200 font-bold">★ Both (Chai Hub & Coffee Hub)</option>
        </select>
      </div>

      {/* DISPLAY NAME */}
      <div className="space-y-2">
        <Label htmlFor="name" className="text-xs font-bold text-slate-400 uppercase tracking-widest">
          Display Name on POS
        </Label>
        <Input
          id="name"
          name="name"
          placeholder="e.g. Masala Chai"
          required
          className="h-12 bg-black/40 border-white/10 text-white rounded-xl focus-visible:ring-indigo-500/50"
        />
      </div>

      {/* PRICE + CATEGORY */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="price" className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            Price (₹)
          </Label>
          <Input
            id="price"
            name="price"
            type="number"
            step="0.5"
            min="0"
            placeholder="e.g. 20"
            required
            className="h-12 bg-black/40 border-white/10 text-white rounded-xl focus-visible:ring-indigo-500/50 font-mono text-lg"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="add_category" className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            Category
          </Label>
          <CategoryCombobox name="category" suggestions={suggestions} />
        </div>
      </div>

      {/* RECIPE BUILDER (REPLACED AUTO-DEDUCT) */}
      <div className="space-y-4 pt-4 border-t border-white/5">
        <div className="flex items-center justify-between">
          <Label className="text-xs font-bold text-indigo-400 uppercase tracking-[0.2em] flex items-center gap-2">
            <UtensilsCrossed className="w-4 h-4" /> Recipe / Auto-Deduction
          </Label>
          <Button 
            type="button" 
            variant="ghost" 
            size="sm" 
            onClick={addIngredient}
            className="h-8 text-[10px] font-black uppercase tracking-widest text-indigo-400 hover:text-white hover:bg-indigo-500/20 rounded-lg gap-2"
          >
            <Plus className="w-3 h-3" /> Add Ingredient
          </Button>
        </div>

        {ingredients.length === 0 ? (
          <div className="p-6 rounded-2xl border-2 border-dashed border-white/5 bg-white/2 flex flex-col items-center justify-center text-center">
            <Settings2 className="w-8 h-8 text-slate-700 mb-2" />
            <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">No auto-deduction configured</p>
            <p className="text-[9px] text-slate-600 mt-1">This will be a standalone POS item with no stock impact.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {ingredients.map((ing, index) => (
              <div key={index} className="grid grid-cols-12 gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="col-span-7">
                  <select
                    value={ing.itemId}
                    onChange={(e) => updateIngredient(index, "itemId", e.target.value)}
                    required
                    className="w-full h-11 px-3 rounded-xl border border-white/10 bg-black/60 text-xs text-white focus:ring-1 focus:ring-indigo-500/50"
                  >
                    <option value="" disabled className="text-slate-500">Pick Item...</option>
                    {globalItems.map(item => (
                      <option key={item.id} value={item.id} className="bg-slate-900">{item.name} ({item.unit})</option>
                    ))}
                  </select>
                </div>
                <div className="col-span-3">
                  <Input 
                    type="number"
                    step="0.01"
                    min="0.01"
                    placeholder="Qty"
                    value={ing.quantity}
                    onChange={(e) => updateIngredient(index, "quantity", parseFloat(e.target.value))}
                    required
                    className="h-11 bg-black/60 border-white/10 text-xs text-center font-bold"
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
          </div>
        )}
      </div>

      <Button
        type="submit"
        className="w-full h-14 mt-6 text-lg font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_0_20px_-5px_rgba(99,102,241,0.5)] rounded-xl transition-all active:scale-[0.98]"
      >
        Add to Menu
      </Button>
    </form>
  )
}

import { useMemo } from "react"
