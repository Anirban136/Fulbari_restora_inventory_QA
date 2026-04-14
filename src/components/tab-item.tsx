"use client"

import { useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { X, Loader2 } from "lucide-react"
import { cancelTab } from "@/app/tabs/actions"
import Link from "next/link"
import { formatTimeIST } from "@/lib/utils"

interface TabItemProps {
  tab: any
  itemsCount: number
}

export function TabItem({ tab, itemsCount }: TabItemProps) {
  const [isPending, startTransition] = useTransition()
  const [isError, setIsError] = useState(false)

  const handleCancel = async () => {
    if (!window.confirm("Are you sure you want to cancel this tab?")) return

    setIsError(false)
    startTransition(async () => {
      try {
        await cancelTab(tab.id)
      } catch (error) {
        console.error("Failed to cancel tab:", error)
        setIsError(true)
        alert("Failed to cancel tab. Please try again.")
      }
    })
  }

  return (
    <div className="glass-panel rounded-3xl flex flex-col hover:border-emerald-500/50 transition-all duration-300 hover:shadow-[0_10px_40px_-10px_rgba(16,185,129,0.2)] hover:-translate-y-1 group overflow-hidden relative">
      
      <div className="p-6 border-b border-border flex-1 relative z-10 bg-gradient-to-br from-foreground/5 to-transparent">
        <div className="flex justify-between items-start mb-4">
          <div>
            {(tab.tableName) && <div className="text-xs font-black tracking-widest text-emerald-600 dark:text-emerald-400 mb-1.5 px-2 py-0.5 bg-emerald-500/10 rounded-md border border-emerald-500/20 w-fit">TABLE {tab.tableName}</div>}
            <h3 className="text-2xl font-black text-foreground truncate pr-2 tracking-tight group-hover:text-emerald-600 dark:group-hover:text-emerald-300 transition-colors">
              {tab.customerName || "Walk-in"}
            </h3>
          </div>
          <span className="text-[10px] text-muted-foreground font-black tracking-widest bg-foreground/5 px-2 py-1.5 rounded-lg border border-border shadow-inner">
            {formatTimeIST(new Date(tab.openedAt))}
          </span>
        </div>
        
        <div className="inline-flex items-center gap-2 mb-6 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-lg">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
          <p className="text-xs font-black text-emerald-600 dark:text-emerald-400 tracking-widest uppercase">{itemsCount} items total</p>
        </div>
        
        <div className="space-y-2">
          {tab.Items.slice(0, 3).map((item: any) => (
            <div key={item.id} className="text-sm font-medium text-muted-foreground flex justify-between bg-foreground/5 p-2.5 rounded-xl border border-border shadow-inner">
              <span className="truncate pr-2 text-foreground/80 tracking-wide"><span className="text-emerald-600 dark:text-emerald-500 font-black bg-emerald-500/10 px-1.5 py-0.5 rounded mr-1 leading-none">{item.quantity}x</span> {item.MenuItem.name}</span>
              <span className="text-emerald-600/70 dark:text-emerald-500/70 font-black">₹{(item.quantity * item.priceAtTime).toFixed(2)}</span>
            </div>
          ))}
          {tab.Items.length > 3 && (
            <div className="text-xs font-black text-emerald-600/50 dark:text-emerald-500/50 uppercase tracking-widest pt-2 text-center bg-foreground/5 rounded-lg py-1 mt-2">And {tab.Items.length - 3} more...</div>
          )}
          {tab.Items.length === 0 && (
            <div className="text-xs font-bold tracking-widest uppercase text-muted-foreground/50 py-4 text-center bg-foreground/5 rounded-xl border border-border border-dashed">Empty Cart</div>
          )}
        </div>
      </div>

      <div className="p-4 bg-foreground/5 backdrop-blur-xl flex gap-3 relative z-10 border-t items-center border-border">
        <Link href={`/tabs/${tab.id}`} className="flex-1">
          <Button className="w-full h-12 font-bold tracking-widest uppercase text-xs bg-foreground/10 hover:bg-foreground text-foreground hover:text-background border border-border transition-all rounded-xl">View & Bill</Button>
        </Link>
        <Button 
          onClick={handleCancel}
          disabled={isPending}
          variant="outline" 
          className="w-12 h-12 bg-red-500/10 border-red-500/30 text-red-500 hover:bg-red-500 hover:text-white rounded-xl transition-all p-0 flex items-center justify-center shadow-inner active:scale-95 disabled:opacity-50"
        >
          {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <X className="w-5 h-5" />}
        </Button>
      </div>
    </div>
  )
}
