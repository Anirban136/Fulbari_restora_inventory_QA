"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Edit } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { updateItem } from "./actions"

export function EditItemDialog({ item, vendors }: { item: any, vendors: any[] }) {
  const [open, setOpen] = useState(false)

  async function handleSubmit(formData: FormData) {
    await updateItem(formData)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={
        <button className="p-2 rounded-xl text-amber-400/60 hover:text-amber-400 hover:bg-amber-500/10 border border-transparent hover:border-amber-500/20 transition-all" title={`Edit ${item.name}`} />
      }>
        <Edit className="w-4 h-4" />
      </DialogTrigger>
      <DialogContent className="sm:max-w-[450px] bg-black/80 backdrop-blur-2xl border-white/10 rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.8)]">
        <DialogHeader className="mb-4">
          <div className="w-12 h-12 bg-amber-500/20 rounded-2xl flex items-center justify-center mb-4 border border-amber-500/30 shadow-[0_0_15px_-3px_rgba(245,158,11,0.3)]">
            <Edit className="w-6 h-6 text-amber-400" />
          </div>
          <DialogTitle className="text-2xl font-black text-white">Edit Item</DialogTitle>
          <DialogDescription className="text-slate-400">
            Update details for <span className="text-white font-bold">{item.name}</span>.
          </DialogDescription>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-5">
          <input type="hidden" name="itemId" value={item.id} />
          <div className="space-y-2">
            <Label htmlFor={`edit_name_${item.id}`} className="text-xs font-bold text-slate-400 uppercase tracking-widest">Item Name</Label>
            <Input id={`edit_name_${item.id}`} name="name" defaultValue={item.name} required className="h-12 bg-white/5 border-white/10 text-white rounded-xl" />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`edit_unit_${item.id}`} className="text-xs font-bold text-slate-400 uppercase tracking-widest">Unit Type</Label>
            <Input id={`edit_unit_${item.id}`} name="unit" defaultValue={item.unit} required className="h-12 bg-white/5 border-white/10 text-white rounded-xl" />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`edit_vendor_${item.id}`} className="text-xs font-bold text-slate-400 uppercase tracking-widest">Select Vendor</Label>
            <select name="vendorId" id={`edit_vendor_${item.id}`} defaultValue={item.vendorId || ""} className="w-full h-12 px-4 py-2 rounded-xl border border-white/10 bg-black/40 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium">
              <option value="" className="bg-slate-900 text-slate-500">No vendor selected</option>
              {vendors.map(v => (
                <option key={v.id} value={v.id} className="bg-slate-900 text-white">{v.name}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor={`edit_cost_${item.id}`} className="text-xs font-bold text-slate-400 uppercase tracking-widest">Cost Price (₹)</Label>
              <Input id={`edit_cost_${item.id}`} name="costPerUnit" type="number" step="0.01" defaultValue={item.costPerUnit || ""} className="h-12 bg-white/5 border-white/10 text-white rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`edit_sell_${item.id}`} className="text-xs font-bold text-slate-400 uppercase tracking-widest">Sell Price (₹)</Label>
              <Input id={`edit_sell_${item.id}`} name="sellPrice" type="number" step="0.01" defaultValue={item.sellPrice || ""} className="h-12 bg-white/5 border-white/10 text-white rounded-xl" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor={`edit_stock_${item.id}`} className="text-xs font-bold text-slate-400 uppercase tracking-widest">Current Stock ({item.unit})</Label>
              <Input id={`edit_stock_${item.id}`} name="currentStock" type="number" step="0.01" defaultValue={item.currentStock} required className="h-12 bg-white/5 border-white/10 text-white rounded-xl text-primary font-black" />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`edit_min_stock_${item.id}`} className="text-xs font-bold text-amber-500/80 uppercase tracking-widest">Min Stock</Label>
              <Input id={`edit_min_stock_${item.id}`} name="minStock" type="number" step="0.01" defaultValue={item.minStock || 0} required className="h-12 bg-white/5 border-amber-500/20 text-white rounded-xl font-bold focus-visible:ring-amber-500/50" />
            </div>
          </div>
          <Button type="submit" className="w-full h-14 text-lg font-bold bg-white text-black hover:bg-slate-200 mt-4 rounded-xl">Save Changes</Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
