"use client"

import { useActionState } from "react"
import { dispatchStock } from "./actions"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ArrowLeftRight, AlertTriangle, CheckCircle2 } from "lucide-react"

type Item = {
  id: string
  name: string
  currentStock: number
  unit: string
}

type Outlet = {
  id: string
  name: string
}

const initialState = { error: undefined as string | undefined }

export function DispatchForm({ items, outlets }: { items: Item[]; outlets: Outlet[] }) {
  const [state, formAction, isPending] = useActionState(
    async (_prev: typeof initialState, formData: FormData) => {
      const result = await dispatchStock(formData)
      return { error: result.error }
    },
    initialState
  )

  const isSuccess = !state.error && state !== initialState

  return (
    <div className="md:col-span-1 glass-panel p-8 rounded-3xl self-start hover:border-white/20 transition-all">
      <div className="flex items-center gap-4 mb-8">
        <div className="h-12 w-12 bg-blue-500/20 rounded-2xl flex items-center justify-center border border-blue-500/30 shadow-[0_0_15px_-3px_rgba(59,130,246,0.3)]">
          <ArrowLeftRight className="w-6 h-6 text-blue-400" />
        </div>
        <h3 className="text-xl font-bold text-white">Send Shipment</h3>
      </div>

      <form action={formAction} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="itemId" className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            Select Item
          </Label>
          <select
            name="itemId"
            id="itemId"
            required
            defaultValue=""
            className="w-full h-12 px-4 py-2 rounded-xl border border-white/10 bg-black/40 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all shadow-inner font-medium"
          >
            <option value="" disabled className="bg-slate-900 text-slate-500">
              Select an item...
            </option>
            {items.map((item) => (
              <option key={item.id} value={item.id} className="bg-slate-900 text-white">
                {item.name} ({item.currentStock} {item.unit} central stock)
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="outletId" className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            Destination Outlet
          </Label>
          <select
            name="outletId"
            id="outletId"
            required
            defaultValue=""
            className="w-full h-12 px-4 py-2 rounded-xl border border-white/10 bg-black/40 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all shadow-inner font-medium"
          >
            <option value="" disabled className="bg-slate-900 text-slate-500">
              Select an outlet...
            </option>
            {outlets.map((outlet) => (
              <option key={outlet.id} value={outlet.id} className="bg-slate-900 text-white">
                {outlet.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="quantity" className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            Quantity to Dispatch
          </Label>
          <Input
            id="quantity"
            name="quantity"
            type="number"
            step="0.01"
            min="0.01"
            placeholder="e.g. 10"
            required
            className="h-12 bg-black/40 border-white/10 text-white placeholder:text-slate-600 rounded-xl focus-visible:ring-blue-500/50 shadow-inner"
          />
        </div>

        {/* Error Message */}
        {state.error && (
          <div className="flex items-start gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/40 text-red-400 text-sm font-medium animate-in fade-in slide-in-from-top-2 duration-300">
            <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5 text-red-400" />
            <span>{state.error}</span>
          </div>
        )}

        {/* Success Message */}
        {isSuccess && (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/40 text-emerald-400 text-sm font-bold animate-in fade-in slide-in-from-top-2 duration-300">
            <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400" />
            Dispatch approved successfully!
          </div>
        )}

        <Button
          type="submit"
          disabled={isPending}
          className="w-full h-14 mt-4 text-lg font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_20px_5px_rgba(59,130,246,0.3)] rounded-xl transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isPending ? "Processing…" : "Approve Dispatch"}
        </Button>
      </form>

      {items.length === 0 && (
        <div className="mt-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center font-medium animate-pulse">
          Cannot dispatch. Central catalog has zero stock available.
        </div>
      )}
    </div>
  )
}
