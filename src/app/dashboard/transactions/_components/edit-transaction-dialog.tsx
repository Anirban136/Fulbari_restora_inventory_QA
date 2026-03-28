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
      alert("Failed to update transaction. Ensure you have proper permissions.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger 
        className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-white/10 bg-white/5 shadow-sm hover:bg-white/10 hover:text-white h-8 px-3"
      >
        <Pencil className="w-3 h-3 mr-2" />
        Edit
      </DialogTrigger>
      <DialogContent className="bg-slate-900 border-white/10 text-white sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold tracking-tight">Edit Transaction</DialogTitle>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          <div className="grid gap-2">
            <Label className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Customer Name</Label>
            <Input disabled value={tab.customerName || "Walk-in"} className="bg-white/5 border-white/10 text-white opacity-50" />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="amount" className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Total Amount (₹)</Label>
            <Input 
              id="amount" 
              type="number" 
              value={amount} 
              onChange={e => setAmount(e.target.value)}
              className="bg-white/5 border-white/10 focus-visible:ring-emerald-500 text-white font-bold text-lg" 
            />
          </div>

          <div className="grid gap-2">
            <Label className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Payment Mode</Label>
            <Select value={paymentMode} onValueChange={(val) => setPaymentMode(val || "CASH")}>
              <SelectTrigger className="bg-white/5 border-white/10 text-white font-medium">
                <SelectValue placeholder="Select mode" />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-white/10 text-white">
                <SelectItem value="CASH">Cash</SelectItem>
                <SelectItem value="ONLINE">Online/UPI</SelectItem>
                <SelectItem value="SPLIT">Split</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Status</Label>
            <Select value={status} onValueChange={(val) => setStatus(val || "OPEN")}>
              <SelectTrigger className="bg-white/5 border-white/10 text-white font-medium">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-white/10 text-white">
                <SelectItem value="OPEN">Open</SelectItem>
                <SelectItem value="CLOSED">Closed</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="flex justify-end gap-3 mt-4">
          <Button variant="ghost" onClick={() => setOpen(false)} disabled={loading} className="text-slate-400 hover:text-white hover:bg-white/5">Cancel</Button>
          <Button 
            onClick={handleSave} 
            disabled={loading}
            className="bg-emerald-500 hover:bg-emerald-600 text-black font-black uppercase tracking-widest shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all"
          >
            {loading ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
