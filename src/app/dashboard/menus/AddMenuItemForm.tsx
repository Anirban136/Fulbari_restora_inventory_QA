"use client"

import { useState, useId } from "react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Settings2 } from "lucide-react"
import { addMenuItem } from "./actions"
import { CategoryCombobox } from "./CategoryCombobox"

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

  // Preset suggestions per outlet type
  const cafeCategories = [
    "Breakfast",
    "Tea & Coffee",
    "Maggie & Pasta",
    "Burger & Sandwich",
    "Momo",
    "Snacks",
    "Mocktail",
    "Others",
  ]
  const chaiCategories = ["Tea & Coffee", "Cigarette", "Beverages", "Others"]

  // Merge presets with previously-used DB categories, deduped
  const presets = new Set<string>()
  if (isCafe) cafeCategories.forEach(c => presets.add(c))
  if (isChai) chaiCategories.forEach(c => presets.add(c))
  existingCategories.forEach(c => presets.add(c))
  if (!isCafe && !isChai) {
    // No outlet selected yet — show everything
    ;[...cafeCategories, ...chaiCategories].forEach(c => presets.add(c))
    existingCategories.forEach(c => presets.add(c))
  }
  const suggestions = Array.from(presets)

  return (
    <form action={addMenuItem} className="space-y-6">
      {/* OUTLET SELECTOR */}
      <div className="space-y-2">
        <Label
          htmlFor="outletId"
          className="text-xs font-bold text-slate-400 uppercase tracking-widest"
        >
          Select POS Outlet
        </Label>
        <select
          name="outletId"
          id="outletId"
          required
          value={selectedOutletId}
          onChange={e => setSelectedOutletId(e.target.value)}
          className="w-full h-12 px-4 py-2 rounded-xl border border-white/10 bg-black/40 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all shadow-inner font-medium"
        >
          <option value="" disabled className="bg-slate-900 text-slate-500">
            Cafe or Chai Joint...
          </option>
          {outlets.map(o => (
            <option key={o.id} value={o.id} className="bg-slate-900 text-white">
              {o.name}
            </option>
          ))}
          <option value="BOTH" className="bg-indigo-900 text-indigo-200 font-bold">
            ★ Both (Chai Hub &amp; Coffee Hub)
          </option>
        </select>
      </div>

      {/* DISPLAY NAME */}
      <div className="space-y-2">
        <Label
          htmlFor="name"
          className="text-xs font-bold text-slate-400 uppercase tracking-widest"
        >
          Display Name on POS
        </Label>
        <Input
          id="name"
          name="name"
          placeholder="e.g. Masala Chai"
          required
          className="h-12 bg-black/40 border-white/10 text-white placeholder:text-slate-600 rounded-xl focus-visible:ring-indigo-500/50 shadow-inner"
        />
      </div>

      {/* PRICE + CATEGORY */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label
            htmlFor="price"
            className="text-xs font-bold text-slate-400 uppercase tracking-widest"
          >
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
            className="h-12 bg-black/40 border-white/10 text-white placeholder:text-slate-600 rounded-xl focus-visible:ring-indigo-500/50 shadow-inner font-mono text-lg"
          />
        </div>

        <div className="space-y-2">
          <Label
            htmlFor="add_category"
            className="text-xs font-bold text-slate-400 uppercase tracking-widest"
          >
            Category
          </Label>
          {/* Free-text input with explicit custom dropdown suggestions */}
          <CategoryCombobox name="category" suggestions={suggestions} />
        </div>
      </div>

      {/* AUTO-DEDUCT */}
      <div className="space-y-2 pt-2 border-t border-white/5">
        <Label
          htmlFor="itemId"
          className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2"
        >
          <Settings2 className="w-3 h-3" /> Auto-Deduct Inventory
        </Label>
        <select
          name="itemId"
          id="itemId"
          className="w-full h-12 px-4 py-2 rounded-xl border border-white/10 bg-black/40 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all shadow-inner font-medium"
        >
          <option value="" className="bg-slate-900 text-slate-300">
            None (Standalone POS Item)
          </option>
          {globalItems.map(item => (
            <option key={item.id} value={item.id} className="bg-slate-900 text-white">
              Deduct: {item.name}
            </option>
          ))}
        </select>
        <p className="text-[10px] text-slate-500 pt-1 uppercase tracking-widest leading-relaxed">
          Optional: Link to catalog. 1 sale = -1 unit deduced immediately.
        </p>
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
