"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PlusCircle, Users } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { addVendor } from "./actions"

export function AddVendorDialog() {
  const [open, setOpen] = useState(false)

  async function handleSubmit(formData: FormData) {
    await addVendor(formData)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={
        <Button variant="outline" className="h-12 px-6 rounded-xl border-white/10 bg-white/5 hover:bg-white/10 text-white font-bold transition-all active:scale-95 gap-2 w-full" />
      }>
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
        <form action={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="vendor_name" className="text-xs font-bold text-slate-400 uppercase tracking-widest">Vendor Name</Label>
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
  )
}
