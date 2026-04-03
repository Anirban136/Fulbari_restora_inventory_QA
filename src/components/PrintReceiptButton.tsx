"use client"

import { useState } from "react"
import { Printer, Loader2, CheckCircle2, AlertCircle, Bluetooth } from "lucide-react"
import { printReceipt, type ReceiptData } from "@/lib/thermal-printer"

interface PrintReceiptButtonProps {
  outletName: string
  tokenNumber: number | null
  customerName: string | null
  tabId: string
  items: Array<{
    quantity: number
    priceAtTime: number
    MenuItem: { name: string }
  }>
  totalAmount: number
  paymentMode: string | null
  closedAt: Date | string | null
  accentColor?: string
}

export function PrintReceiptButton({
  outletName,
  tokenNumber,
  customerName,
  tabId,
  items,
  totalAmount,
  paymentMode,
  closedAt,
  accentColor = "amber"
}: PrintReceiptButtonProps) {
  const [status, setStatus] = useState<"idle" | "printing" | "success" | "error">("idle")
  const [errorMsg, setErrorMsg] = useState("")

  async function handlePrint() {
    setStatus("printing")
    setErrorMsg("")

    const receiptData: ReceiptData = {
      outletName: outletName,
      tokenNumber: tokenNumber || 0,
      customerName: customerName || "Walk-in Customer",
      tabId,
      items: items.map(item => ({
        name: item.MenuItem.name,
        quantity: item.quantity,
        price: item.priceAtTime
      })),
      totalAmount,
      paymentMode: paymentMode || "N/A",
      closedAt: closedAt || new Date()
    }

    const result = await printReceipt(receiptData)

    if (result.success) {
      setStatus("success")
      setTimeout(() => setStatus("idle"), 3000)
    } else {
      setStatus("error")
      setErrorMsg(result.error || "Unknown error")
      setTimeout(() => setStatus("idle"), 5000)
    }
  }

  const colorMap: Record<string, string> = {
    amber: "bg-amber-500/10 border-amber-500/20 text-amber-400 hover:bg-amber-500/20",
    sky: "bg-sky-500/10 border-sky-500/20 text-sky-400 hover:bg-sky-500/20",
  }
  const colors = colorMap[accentColor] || colorMap.amber

  return (
    <div className="inline-flex flex-col items-start">
      <button
        onClick={handlePrint}
        disabled={status === "printing"}
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold uppercase tracking-wider transition-all active:scale-95 disabled:opacity-50 disabled:cursor-wait ${colors}`}
      >
        {status === "printing" ? (
          <>
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            Printing...
          </>
        ) : status === "success" ? (
          <>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            Printed!
          </>
        ) : status === "error" ? (
          <>
            <AlertCircle className="w-3.5 h-3.5 text-red-400" />
            Failed
          </>
        ) : (
          <>
            <Printer className="w-3.5 h-3.5" />
            Print Bill
          </>
        )}
      </button>
      {status === "error" && errorMsg && (
        <p className="text-[10px] text-red-400/80 mt-1 max-w-[200px] leading-tight">{errorMsg}</p>
      )}
      {tokenNumber && status === "idle" && (
        <span className="text-[10px] text-slate-500 mt-1 flex items-center gap-1">
          <Bluetooth className="w-2.5 h-2.5" /> Token #{tokenNumber}
        </span>
      )}
    </div>
  )
}
