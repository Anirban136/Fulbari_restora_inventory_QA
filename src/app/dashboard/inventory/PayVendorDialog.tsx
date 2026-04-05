"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { IndianRupee, Banknote } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { payVendor } from "./actions"

interface PayVendorDialogProps {
  vendor: {
    id: string
    name: string
  }
  balanceDue: number
}

export function PayVendorDialog({ vendor, balanceDue }: PayVendorDialogProps) {
  const [open, setOpen] = useState(false)
  const [customAmount, setCustomAmount] = useState("")
  const [useFullAmount, setUseFullAmount] = useState(false)

  const effectiveAmount = useFullAmount ? balanceDue.toFixed(2) : customAmount

  async function handleSubmit(formData: FormData) {
    // Override with effective amount
    formData.set("amount", effectiveAmount)
    await payVendor(formData)
    setOpen(false)
    setCustomAmount("")
    setUseFullAmount(false)
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) { setCustomAmount(""); setUseFullAmount(false); } }}>
      <DialogTrigger render={
        <button
          className="px-3 py-1.5 rounded-xl text-emerald-400/80 hover:text-emerald-400 bg-emerald-500/5 hover:bg-emerald-500/15 border border-emerald-500/10 hover:border-emerald-500/30 transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5"
          title={`Pay ${vendor.name}`}
          disabled={balanceDue <= 0}
        >
          <Banknote className="w-3.5 h-3.5" />
          Pay
        </button>
      } />
      <DialogContent className="sm:max-w-[420px] bg-black/90 backdrop-blur-2xl border-emerald-500/20 rounded-3xl shadow-[0_0_50px_rgba(16,185,129,0.15)]">
        <DialogHeader className="mb-2">
          <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-4 border border-emerald-500/20">
            <IndianRupee className="w-6 h-6 text-emerald-400" />
          </div>
          <DialogTitle className="text-xl font-black text-white">
            Pay {vendor.name}
          </DialogTitle>
          <DialogDescription className="text-slate-400 leading-relaxed">
            Outstanding balance: <span className="text-emerald-400 font-bold">₹{balanceDue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
          </DialogDescription>
        </DialogHeader>

        <form action={handleSubmit} className="space-y-5 mt-2">
          <input type="hidden" name="vendorId" value={vendor.id} />
          <input type="hidden" name="amount" value={effectiveAmount} />

          {/* Quick Pay Full Amount Toggle */}
          <button
            type="button"
            onClick={() => { setUseFullAmount(!useFullAmount); setCustomAmount(""); }}
            className={`w-full py-4 rounded-2xl border-2 transition-all font-bold text-sm flex items-center justify-center gap-3 ${
              useFullAmount 
                ? "border-emerald-500 bg-emerald-500/20 text-emerald-300 shadow-[0_0_20px_-5px_rgba(16,185,129,0.4)]" 
                : "border-white/10 bg-white/5 text-slate-400 hover:border-white/20 hover:bg-white/10"
            }`}
          >
            <IndianRupee className="w-4 h-4" />
            Pay Full Amount — ₹{balanceDue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </button>

          {/* Divider */}
          <div className="flex items-center gap-4">
            <div className="flex-1 h-px bg-white/10"></div>
            <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">or custom amount</span>
            <div className="flex-1 h-px bg-white/10"></div>
          </div>

          {/* Custom Amount Input */}
          <div className="space-y-2">
            <Label htmlFor="customAmount" className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              Custom Amount (₹)
            </Label>
            <div className="relative">
              <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <Input
                id="customAmount"
                type="number"
                step="0.01"
                min="0.01"
                max={balanceDue}
                placeholder="e.g. 500"
                value={customAmount}
                onChange={(e) => { setCustomAmount(e.target.value); setUseFullAmount(false); }}
                className="h-12 pl-10 bg-white/5 border-white/10 text-white placeholder:text-slate-600 rounded-xl focus-visible:ring-emerald-500/50 text-lg font-bold"
                disabled={useFullAmount}
              />
            </div>
          </div>

          {/* Optional Notes */}
          <div className="space-y-2">
            <Label htmlFor="payNotes" className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              Notes (Optional)
            </Label>
            <Input
              id="payNotes"
              name="notes"
              placeholder="e.g. Paid via UPI, Cash payment"
              className="h-12 bg-white/5 border-white/10 text-white placeholder:text-slate-600 rounded-xl focus-visible:ring-emerald-500/50"
            />
          </div>

          <Button
            type="submit"
            disabled={!effectiveAmount || parseFloat(effectiveAmount) <= 0}
            className="w-full h-12 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm tracking-wide shadow-[0_0_20px_-5px_rgba(16,185,129,0.5)] transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Confirm Payment of ₹{effectiveAmount ? parseFloat(effectiveAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 }) : "0.00"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
