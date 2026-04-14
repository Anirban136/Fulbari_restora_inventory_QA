"use client"

import { useState } from "react"
import { AlertTriangle, TrendingUp, X } from "lucide-react"

export function CriticalSupplyAlert({ criticalAlerts }: { criticalAlerts: any[] }) {
  const [isDismissed, setIsDismissed] = useState(false)

  if (isDismissed || criticalAlerts.length === 0) return null

  return (
    <div className="relative z-20 animate-in fade-in slide-in-from-top-4 duration-500">
      <div className="glass-card border-red-500/30 bg-red-500/10 p-6 lg:p-10 rounded-[3rem] flex flex-col lg:flex-row items-center gap-8 overflow-hidden shadow-[0_30px_60px_-15px_rgba(239,68,68,0.2)] relative">
        {/* Close Button */}
        <button 
          onClick={() => setIsDismissed(true)}
          className="absolute top-6 right-6 p-3 rounded-2xl bg-foreground/10 border border-foreground/10 text-muted-foreground hover:text-foreground hover:bg-foreground/20 transition-all active:scale-90 z-30"
          title="Dismiss Alert"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/10 blur-[100px] rounded-full -z-10"></div>
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-red-500/5 blur-3xl rounded-full -z-10"></div>
        
        <div className="h-24 w-24 lg:h-28 lg:w-28 bg-red-500 text-white rounded-[2.5rem] flex items-center justify-center shrink-0 shadow-[0_25px_50px_-12px_rgba(239,68,68,0.6)] animate-pulse">
          <AlertTriangle className="w-12 h-12" />
        </div>
        
        <div className="flex-1 text-center lg:text-left">
          <div className="flex flex-col lg:flex-row lg:items-center gap-2 lg:gap-4 mb-4">
            <h3 className="text-3xl lg:text-4xl font-black text-foreground uppercase tracking-tighter">Critical Supply Alert</h3>
            <span className="px-4 py-1.5 bg-red-500/20 text-red-600 dark:text-red-500 text-[10px] font-black uppercase tracking-widest rounded-full border border-red-500/30 self-center lg:self-auto">Global Catalog Deficiency</span>
          </div>
          
          <div className="flex flex-wrap justify-center lg:justify-start gap-3">
            {criticalAlerts.slice(0, 10).map(item => (
              <div key={item.id} className="group relative px-5 py-3 bg-background/40 border border-red-500/20 rounded-[1.5rem] flex items-center gap-4 hover:border-red-500/50 transition-all duration-300">
                <div className={`w-2 h-2 rounded-full ${item.currentStock === 0 ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,1)]' : 'bg-orange-500'}`}></div>
                <div className="flex flex-col">
                  <span className="text-xs font-black text-foreground uppercase tracking-tight">{item.name}</span>
                  <span className={`text-[10px] font-bold ${item.currentStock === 0 ? 'text-red-500' : 'text-orange-500'}`}>
                    {item.currentStock === 0 ? "OUT OF STOCK" : `${item.currentStock} ${item.unit} left`}
                  </span>
                </div>
              </div>
            ))}
            {criticalAlerts.length > 10 && (
              <div className="px-5 py-3 bg-foreground/5 border border-border rounded-[1.5rem] flex items-center justify-center">
                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">+{criticalAlerts.length - 10} More Items</span>
              </div>
            )}
          </div>
        </div>
        
        <a href="/dashboard/inventory" className="shrink-0 w-full lg:w-auto">
          <button className="w-full px-12 py-5 bg-foreground text-background rounded-2xl font-black uppercase text-xs tracking-[0.2em] hover:scale-105 active:scale-95 transition-all shadow-2xl flex items-center justify-center gap-3">
            Update Inventory <TrendingUp className="w-4 h-4" />
          </button>
        </a>
      </div>
    </div>
  )
}
