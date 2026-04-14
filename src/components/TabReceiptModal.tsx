"use client"

import { useState } from "react"
import { X, Receipt, ShoppingBag } from "lucide-react"

type TabItem = {
  id: string
  quantity: number
  priceAtTime: number
  MenuItem: { name: string }
}

type TabReceiptProps = {
  tabId: string
  customerName: string | null
  totalAmount: number
  paymentMode: string | null
  closedAt: Date | null
  items: TabItem[]
  accentColor?: "amber" | "blue"
}

export function TabReceiptModal({
  tabId,
  customerName,
  totalAmount,
  paymentMode,
  closedAt,
  items,
  accentColor = "amber",
}: TabReceiptProps) {
  const [open, setOpen] = useState(false)

  const accent = {
    amber: {
      border: "border-amber-500/20",
      bg: "bg-amber-500/10",
      text: "text-amber-500",
      icon: "bg-amber-500/10 border-amber-500/20",
      btn: "bg-amber-600 hover:bg-amber-500",
      trigger: "text-amber-600/60 hover:text-amber-600 hover:bg-amber-500/10 border-transparent hover:border-amber-500/20",
    },
    blue: {
      border: "border-blue-500/20",
      bg: "bg-blue-500/10",
      text: "text-blue-500",
      icon: "bg-blue-500/10 border-blue-500/20",
      btn: "bg-blue-600 hover:bg-blue-500",
      trigger: "text-blue-600/60 hover:text-blue-600 hover:bg-blue-500/10 border-transparent hover:border-blue-500/20",
    },
  }[accentColor]

  const subtotal = items.reduce((s, i) => s + i.priceAtTime * i.quantity, 0)

  return (
    <>
      {/* Trigger button */}
      <button
        onClick={() => setOpen(true)}
        title="View bill"
        className={`flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg border transition-all ${accent.trigger}`}
      >
        <ShoppingBag className="w-3 h-3" />
        View Bill
      </button>

      {/* Modal */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md"
          onClick={(e) => e.target === e.currentTarget && setOpen(false)}
        >
          <div
            className={`relative w-full max-w-md rounded-3xl border ${accent.border} shadow-2xl overflow-hidden bg-card`}
          >
            {/* Header */}
            <div className={`flex items-center justify-between px-6 py-5 border-b border-border ${accent.bg}`}>
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center border ${accent.icon}`}>
                  <Receipt className={`w-4 h-4 ${accent.text}`} />
                </div>
                <div>
                  <h2 className="text-sm font-black text-foreground uppercase tracking-widest">
                    {customerName || "Walk-in Customer"}
                  </h2>
                  {closedAt && (
                    <p className="text-[10px] text-muted-foreground font-medium mt-0.5">
                      {new Date(closedAt).toLocaleString("en-IN", {
                        timeZone: "Asia/Kolkata",
                        day: "2-digit",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  )}
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="p-2 rounded-full hover:bg-foreground/10 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Items */}
            <div className="p-5 max-h-[50vh] overflow-y-auto space-y-2">
              {items.length === 0 ? (
                <p className="text-center text-muted-foreground text-sm py-6">No items recorded for this bill.</p>
              ) : (
                items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between px-4 py-3 rounded-xl bg-foreground/5 border border-border hover:bg-foreground/10 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className={`text-xs font-black w-6 h-6 flex items-center justify-center rounded-md ${accent.bg} ${accent.text}`}>
                        {item.quantity}×
                      </span>
                      <span className="text-sm font-bold text-foreground/80">{item.MenuItem.name}</span>
                    </div>
                    <span className="text-sm font-black text-foreground">
                      ₹{(item.priceAtTime * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))
              )}
            </div>

            {/* Footer totals */}
            <div className="px-5 pb-5 space-y-2">
              <div className="flex justify-between items-center pt-3 border-t border-border px-1">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Payment</span>
                <span className={`text-xs font-black uppercase tracking-widest ${accent.text}`}>
                  {paymentMode || "—"}
                </span>
              </div>
              <div className={`flex justify-between items-center p-4 rounded-2xl border ${accent.border} ${accent.bg}`}>
                <span className={`text-sm font-black uppercase tracking-widest ${accent.text}`}>Total Paid</span>
                <span className="text-2xl font-black text-foreground">₹{totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
