"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Banknote, CreditCard, SplitSquareHorizontal, Receipt, Printer, CheckCircle2 } from "lucide-react"
import { PrintReceiptButton } from "@/components/PrintReceiptButton"
import { closeTab } from "./actions"

interface CheckoutSidebarProps {
  tabId: string
  totalAmount: number
  isCafe: boolean
  outletName: string
  tokenNumber: number | null
  customerName: string | null
  items: any[]
}

export function CheckoutSidebar({
  tabId, totalAmount, isCafe,
  outletName, tokenNumber, customerName, items
}: CheckoutSidebarProps) {
  const [billGenerated, setBillGenerated] = useState(false)

  return (
    <div className="p-3 sm:p-8 bg-black/60 border-t lg:border-t-0 border-white/10 z-10 backdrop-blur-xl shrink-0">
      <div className="flex justify-between items-center mb-4 sm:mb-8">
        <span className="text-slate-400 text-xs sm:text-sm font-bold tracking-widest uppercase">Total Due</span>
        <span className="text-2xl sm:text-5xl font-black text-white text-glow">₹{totalAmount.toFixed(2)}</span>
      </div>

      {!billGenerated ? (
        <Button 
          onClick={() => setBillGenerated(true)}
          disabled={items.length === 0}
          className={`w-full h-12 sm:h-16 text-sm sm:text-xl font-black tracking-widest uppercase ${isCafe ? "bg-orange-600 hover:bg-orange-500 shadow-[0_0_40px_-5px_rgba(249,115,22,0.5)]" : "bg-sky-600 hover:bg-sky-500 shadow-[0_0_40px_-5px_rgba(14,165,233,0.5)]"} text-white rounded-xl sm:rounded-2xl transition-all active:scale-[0.98] group`}
        >
          <Receipt className="w-5 h-5 sm:w-6 sm:h-6 mr-2 group-hover:rotate-12 transition-transform" />
          Generate Bill
        </Button>
      ) : (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Print Options */}
          <div className="bg-white/5 rounded-2xl p-4 border border-white/10 shadow-inner">
            <div className="flex items-center gap-2 mb-3">
              <Printer className={`w-4 h-4 ${isCafe ? "text-orange-400" : "text-sky-400"}`} />
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Step 1: Print Receipts</span>
            </div>
            <PrintReceiptButton
              outletName={outletName}
              tokenNumber={tokenNumber}
              customerName={customerName}
              tabId={tabId}
              items={items}
              totalAmount={totalAmount}
              paymentMode="UNPAID"
              closedAt={null}
              accentColor={isCafe ? "amber" : "sky"}
              isSidebar={true}
            />
          </div>

          <form action={closeTab} className="space-y-6">
            <input type="hidden" name="tabId" value={tabId} />
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                  Step 2: Payment Mode
                </label>
                <button 
                  type="button" 
                  onClick={() => setBillGenerated(false)}
                  className="text-[10px] text-slate-500 hover:text-slate-300 underline"
                >
                  Edit Order
                </button>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <label className="cursor-pointer group">
                  <input type="radio" name="paymentMode" value="CASH" className="peer sr-only" defaultChecked required />
                  <div className={`flex flex-col items-center justify-center gap-2 py-2 sm:py-4 rounded-xl border-2 border-white/10 bg-white/5 font-bold text-slate-400 ${isCafe ? "peer-checked:border-orange-500 peer-checked:bg-orange-500/10 peer-checked:text-orange-400 peer-checked:shadow-[0_0_20px_-5px_#f97316]" : "peer-checked:border-sky-500 peer-checked:bg-sky-500/10 peer-checked:text-sky-400 peer-checked:shadow-[0_0_20px_-5px_#0ea5e9]"} group-hover:bg-white/10 transition-all text-[10px] sm:text-xs`}>
                    <Banknote className="w-4 h-4 sm:w-5 sm:h-5 mb-1" />
                    CASH
                  </div>
                </label>
                <label className="cursor-pointer group">
                  <input type="radio" name="paymentMode" value="ONLINE" className="peer sr-only" required />
                  <div className={`flex flex-col items-center justify-center gap-2 py-2 sm:py-4 rounded-xl border-2 border-white/10 bg-white/5 font-bold text-slate-400 ${isCafe ? "peer-checked:border-orange-500 peer-checked:bg-orange-500/10 peer-checked:text-orange-400 peer-checked:shadow-[0_0_20px_-5px_#f97316]" : "peer-checked:border-sky-500 peer-checked:bg-sky-500/10 peer-checked:text-sky-400 peer-checked:shadow-[0_0_20px_-5px_#0ea5e9]"} group-hover:bg-white/10 transition-all text-[10px] sm:text-xs text-center leading-tight`}>
                    <CreditCard className="w-4 h-4 sm:w-5 sm:h-5 mb-1" />
                    UPI/CARD
                  </div>
                </label>
                <label className="cursor-pointer group">
                  <input type="radio" name="paymentMode" value="SPLIT" className="peer sr-only" required />
                  <div className={`flex flex-col items-center justify-center gap-2 py-2 sm:py-4 rounded-xl border-2 border-white/10 bg-white/5 font-bold text-slate-400 ${isCafe ? "peer-checked:border-orange-500 peer-checked:bg-orange-500/10 peer-checked:text-orange-400 peer-checked:shadow-[0_0_20px_-5px_#f97316]" : "peer-checked:border-sky-500 peer-checked:bg-sky-500/10 peer-checked:text-sky-400 peer-checked:shadow-[0_0_20px_-5px_#0ea5e9]"} group-hover:bg-white/10 transition-all text-[10px] sm:text-xs`}>
                    <SplitSquareHorizontal className="w-4 h-4 sm:w-5 sm:h-5 mb-1" />
                    SPLIT
                  </div>
                </label>
              </div>
            </div>
            
            <Button 
              type="submit" 
              className={`w-full h-12 sm:h-16 text-sm sm:text-xl font-black tracking-widest uppercase bg-emerald-600 hover:bg-emerald-500 shadow-[0_0_40px_-5px_rgba(16,185,129,0.5)] text-white rounded-xl sm:rounded-2xl transition-all active:scale-[0.98] animate-pulse`}
            >
              Step 3: Close Tab
            </Button>
          </form>
        </div>
      )}
    </div>
  )
}
