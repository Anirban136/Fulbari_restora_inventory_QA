"use client"

import { useState } from "react"
import { Pencil, Loader2 } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { updateTab } from "@/app/tabs/[tabId]/actions"
import { useRouter } from "next/navigation"

export function EditTransactionModal({ tabId, currentAmount, currentMode }: { tabId: string, currentAmount: number, currentMode: string }) {
  const [open, setOpen] = useState(false)
  const [amount, setAmount] = useState(currentAmount.toString())
  const [mode, setMode] = useState(currentMode)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async () => {
    setLoading(true)
    try {
      await updateTab(tabId, parseFloat(amount), mode)
      setOpen(false)
      router.refresh()
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-white/10 text-muted-foreground hover:text-primary">
          <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-black/95 border-white/10 backdrop-blur-2xl text-white">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black uppercase tracking-tighter">Edit Transaction</DialogTitle>
        </DialogHeader>
        <div className="grid gap-6 py-6">
          <div className="grid gap-2">
            <Label htmlFor="amount" className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Total Amount (₹)</Label>
            <Input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="bg-white/5 border-white/10 h-12 text-lg font-bold focus:border-primary/50 text-white"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="mode" className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Payment Mode</Label>
            <Select value={mode} onValueChange={setMode}>
              <SelectTrigger className="bg-white/5 border-white/10 h-12 text-lg font-bold text-white">
                <SelectValue placeholder="Select mode" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-950 border-white/10 text-white">
                <SelectItem value="CASH">CASH</SelectItem>
                <SelectItem value="ONLINE">ONLINE (UPI/CARD)</SelectItem>
                <SelectItem value="SPLIT">SPLIT</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex justify-end gap-3 pt-4">
          <Button variant="ghost" onClick={() => setOpen(false)} className="font-bold border border-white/5 hover:bg-white/5 uppercase text-xs tracking-widest">Cancel</Button>
          <Button onClick={handleSubmit} disabled={loading} className="bg-primary text-primary-foreground font-black uppercase text-xs tracking-widest h-11 px-8">
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            Sync Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
