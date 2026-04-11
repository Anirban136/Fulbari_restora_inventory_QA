"use client"

import { useState } from "react"
import { updateTransactionAction } from "../actions"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Pencil } from "lucide-react"
import { useRouter } from "next/navigation"

type TabData = {
  id: string
  totalAmount: number
  paymentMode: string | null
  status: string
  customerName: string | null
}

export function EditTransactionDialog({ tab }: { tab: TabData }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [amount, setAmount] = useState(tab.totalAmount.toString())
  const [paymentMode, setPaymentMode] = useState(tab.paymentMode || "CASH")
  const [status, setStatus] = useState(tab.status)
  const router = useRouter()

  const handleSave = async () => {
    setLoading(true)
    try {
      await updateTransactionAction(tab.id, {
        totalAmount: parseFloat(amount),
        paymentMode,
        status
      })
      setOpen(false)
      router.refresh()
    } catch (e) {
      console.error(e)
      alert("Failed to update transaction.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button variant="outline" className="h-10 px-5 rounded-xl border-white/10 bg-white/5 hover:bg-white/10 text-white/60 hover:text-white font-black text-[10px] uppercase tracking-widest gap-2 group/edit transition-all active:scale-95 shadow-sm">
            <Pencil className="w-3 h-3 text-emerald-500/50 group-hover/edit:text-emerald-500 transition-colors" />
            Rectify
          </Button>
        }
      />
      <DialogContent className="bg-zinc-950/95 backdrop-blur-3xl border-white/10 text-white sm:max-w-[425px] rounded-[2.5rem] p-8 shadow-2xl">
        <DialogHeader className="mb-6">
          <DialogTitle className="text-2xl font-black tracking-tighter uppercase">Transaction Audit</DialogTitle>
          <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mt-1">Rectify records for <span className="text-emerald-500">{tab.customerName || "WALK-IN"}</span></p>
        </DialogHeader>
        
        <div className="grid gap-6 py-2">
          <div className="grid gap-2.5">
            <Label className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] ml-1">TOTAL PAYABLE (₹)</Label>
            <Input 
              id="amount" 
              type="number" 
              value={amount} 
              onChange={e => setAmount(e.target.value)}
              className="h-14 bg-white/[0.03] border-white/10 focus-visible:ring-emerald-500/40 text-white font-black text-xl rounded-2xl pl-5" 
            />
          </div>

          <div className="grid gap-2.5">
            <Label className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] ml-1">PAYMENT CHANNEL</Label>
            <Select value={paymentMode} onValueChange={(val) => setPaymentMode(val || "CASH")}>
              <SelectTrigger className="h-14 bg-white/[0.03] border-white/10 text-white font-black rounded-2xl px-5 uppercase tracking-widest text-xs">
                <SelectValue placeholder="Select channel" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-white/10 text-white rounded-xl">
                <SelectItem value="CASH">Liquid Cash</SelectItem>
                <SelectItem value="ONLINE">Online / UPI</SelectItem>
                <SelectItem value="SPLIT">Split Payment</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2.5">
            <Label className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] ml-1">SETTLEMENT STATUS</Label>
            <Select value={status} onValueChange={(val) => setStatus(val || "OPEN")}>
              <SelectTrigger className="h-14 bg-white/[0.03] border-white/10 text-white font-black rounded-2xl px-5 uppercase tracking-widest text-xs">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-white/10 text-white rounded-xl">
                <SelectItem value="OPEN">Draft / Open</SelectItem>
                <SelectItem value="CLOSED">Finalized / Closed</SelectItem>
                <SelectItem value="CANCELLED">Void / Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="flex justify-end gap-3 mt-8">
          <Button variant="ghost" onClick={() => setOpen(false)} disabled={loading} className="rounded-2xl text-white/40 hover:text-white hover:bg-white/5 font-bold uppercase tracking-widest text-[10px]">Abandon</Button>
          <Button 
            onClick={handleSave} 
            disabled={loading}
            className="h-14 px-8 rounded-2xl bg-white text-black hover:bg-slate-100 font-black uppercase tracking-[0.2em] text-[10px] transition-all active:scale-95 shadow-xl"
          >
            {loading ? "Syncing..." : "Apply Rectification"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
