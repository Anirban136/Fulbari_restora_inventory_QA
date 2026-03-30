"use client"

import { useState } from "react"
import { Truck, Loader2, AlertCircle, CheckCircle2 } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ItemSearchableSelect } from "./ItemSearchableSelect"
import { logStockIn } from "./actions"

interface Item {
  id: string
  name: string
  unit: string
}

export function StockInForm({ items }: { items: Item[] }) {
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<{ error?: string; success?: boolean } | null>(null)

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setStatus(null)
    
    try {
      const result = await logStockIn(formData)
      if (result?.error) {
        setStatus({ error: result.error })
      } else {
        setStatus({ success: true })
        // Clear success message after 3 seconds
        setTimeout(() => setStatus(null), 3000)
        // Reset form if success (optional, but good for multiple intakes)
        const form = document.getElementById("stock-in-form") as HTMLFormElement
        form?.reset()
      }
    } catch (err) {
      setStatus({ error: "A network error occurred. Please check your connection." })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="xl:col-span-1 glass-panel p-8 rounded-3xl self-start hover:border-white/20 transition-all">
      <div className="flex items-center gap-4 mb-8">
        <div className="h-12 w-12 bg-primary/20 rounded-2xl flex items-center justify-center border border-primary/30 shadow-[0_0_15px_-3px_oklch(0.55_0.16_150_/_0.3)]">
          <Truck className="w-6 h-6 text-primary" />
        </div>
        <h3 className="text-xl font-bold text-white">Receive Shipment</h3>
      </div>
      
      <form id="stock-in-form" action={handleSubmit} className="space-y-6">
        {status?.error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-400 animate-in fade-in slide-in-from-top-1">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm font-medium">{status.error}</p>
          </div>
        )}

        {status?.success && (
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-3 text-emerald-400 animate-in fade-in slide-in-from-top-1">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm font-medium">Stock logged successfully!</p>
          </div>
        )}

        <div className="space-y-4">
          <Label htmlFor="itemId" className="text-xs font-bold text-slate-400 uppercase tracking-widest">Item Name (Type to search)</Label>
          <ItemSearchableSelect items={items} />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="quantity" className="text-xs font-bold text-slate-400 uppercase tracking-widest">Quantity Received</Label>
          <Input id="quantity" name="quantity" type="number" step="0.01" min="0.01" placeholder="e.g. 50" required className="h-12 bg-black/40 border-white/10 text-white placeholder:text-slate-600 rounded-xl focus-visible:ring-primary/50 shadow-inner" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="cost" className="text-xs font-bold text-slate-400 uppercase tracking-widest">Cost per unit (₹) <span className="opacity-50 font-normal ml-1">Optional</span></Label>
          <Input id="cost" name="cost" type="number" step="0.01" min="0" placeholder="e.g. 150.50" className="h-12 bg-black/40 border-white/10 text-white placeholder:text-slate-600 rounded-xl focus-visible:ring-primary/50 shadow-inner" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes" className="text-xs font-bold text-slate-400 uppercase tracking-widest">Delivery Note / Invoice Ref</Label>
          <Input id="notes" name="notes" placeholder="Invoice #1234..." className="h-12 bg-black/40 border-white/10 text-white placeholder:text-slate-600 rounded-xl focus-visible:ring-primary/50 shadow-inner" />
        </div>

        <Button 
          type="submit" 
          disabled={loading}
          className="w-full h-14 mt-4 text-lg font-bold bg-primary hover:bg-emerald-500 text-white shadow-[0_0_20px_-5px_oklch(0.55_0.16_150_/_0.5)] rounded-xl transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin" /> Logging...
            </span>
          ) : (
            "Log Intake"
          )}
        </Button>
      </form>
    </div>
  )
}
