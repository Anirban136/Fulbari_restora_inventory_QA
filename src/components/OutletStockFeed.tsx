"use client"

import { useState } from "react"
import { Package, Coffee, Activity, Search, AlertCircle, CheckCircle2 } from "lucide-react"

export function OutletStockFeed({ stocks }: { stocks: any[] }) {
  const [activeOutlet, setActiveOutlet] = useState<"CAFE" | "CHAI">("CAFE")
  const [searchTerm, setSearchTerm] = useState("")

  const filteredStocks = stocks.filter(s => {
    const isOutlet = s.Outlet.name.toUpperCase().includes(activeOutlet)
    const matchesSearch = s.Item.name.toLowerCase().includes(searchTerm.toLowerCase())
    return isOutlet && matchesSearch
  })

  const outletTheme = activeOutlet === "CAFE" 
    ? { primary: "amber", color: "text-amber-500", bg: "bg-amber-500", border: "border-amber-500/20", glow: "shadow-[0_0_30px_rgba(245,158,11,0.15)]" }
    : { primary: "indigo", color: "text-indigo-500", bg: "bg-indigo-500", border: "border-indigo-500/20", glow: "shadow-[0_0_30px_rgba(99,102,241,0.15)]" }

  return (
    <div className={`glass-panel p-8 rounded-[3rem] relative overflow-hidden group border border-border h-full transition-all duration-700 ${outletTheme.glow}`}>
      <div className={`absolute -top-20 -right-20 w-80 h-80 ${activeOutlet === 'CAFE' ? 'bg-amber-500/10' : 'bg-indigo-500/10'} rounded-full blur-[100px] pointer-events-none transition-all duration-700`}></div>
      <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-primary/5 rounded-full blur-[80px] pointer-events-none"></div>
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-10 relative z-10">
        <div className="flex items-center gap-5">
           <div className={`p-4 rounded-[1.8rem] border ${outletTheme.border} ${activeOutlet === 'CAFE' ? 'bg-amber-500/10' : 'bg-indigo-500/10'} shadow-inner`}>
             {activeOutlet === 'CAFE' ? <Coffee className="w-7 h-7 text-amber-500" /> : <Activity className="w-7 h-7 text-indigo-500" />}
           </div>
           <div>
             <h3 className="text-3xl font-black text-foreground tracking-tighter uppercase leading-none">{activeOutlet} STOCK</h3>
             <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] mt-2 opacity-100">Real-time Deployment Capture</p>
           </div>
        </div>
        
        <div className="flex items-center gap-2 bg-foreground/5 p-1.5 rounded-2xl border border-border backdrop-blur-3xl shadow-2xl">
          <button 
            onClick={() => setActiveOutlet("CAFE")}
            className={`px-8 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all duration-500 flex items-center gap-3 ${activeOutlet === 'CAFE' ? 'bg-amber-500 text-primary-foreground shadow-[0_10px_20px_-5px_rgba(245,158,11,0.4)] scale-105' : 'text-muted-foreground hover:text-foreground hover:bg-foreground/5'}`}
          >
            <Coffee className={`w-4 h-4 ${activeOutlet === 'CAFE' ? 'animate-bounce' : ''}`} />
            Cafe
          </button>
          <button 
            onClick={() => setActiveOutlet("CHAI")}
            className={`px-8 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all duration-500 flex items-center gap-3 ${activeOutlet === 'CHAI' ? 'bg-indigo-500 text-primary-foreground shadow-[0_10px_20px_-5px_rgba(99,102,241,0.4)] scale-105' : 'text-muted-foreground hover:text-foreground hover:bg-foreground/5'}`}
          >
            <Activity className={`w-4 h-4 ${activeOutlet === 'CHAI' ? 'animate-pulse' : ''}`} />
            Joint
          </button>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative mb-10 group/search group relative z-10">
         <Search className={`absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors duration-300 ${activeOutlet === 'CAFE' ? 'text-amber-500/40 group-focus-within/search:text-amber-500' : 'text-indigo-500/40 group-focus-within/search:text-indigo-500'}`} />
         <input 
          type="text"
          placeholder="Scan node repository..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={`w-full h-14 bg-foreground/[0.03] border border-border rounded-2xl pl-14 pr-8 text-sm font-black uppercase tracking-widest focus:outline-none transition-all placeholder:text-muted-foreground text-foreground shadow-inner ${activeOutlet === 'CAFE' ? 'focus:border-amber-500/50 focus:ring-4 focus:ring-amber-500/5' : 'focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/5'}`}
         />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 max-h-[500px] overflow-y-auto pr-3 custom-scrollbar p-1 pb-10 relative z-10">
        {filteredStocks.length === 0 ? (
          <div className="col-span-full py-32 text-center space-y-6 opacity-20">
             <Package className="w-20 h-20 mx-auto animate-pulse text-muted-foreground" />
             <p className="text-sm font-black uppercase tracking-[0.5em] italic">No Active Signal Match</p>
          </div>
        ) : (
          filteredStocks.map(stock => {
            const isCritical = stock.quantity === 0
            const isLow = stock.quantity <= (stock.Item.minStock || 5)
            const hasConversion = stock.Item.piecesPerBox > 0
            
            let statusColor = "text-emerald-500"
            let statusBg = "bg-emerald-500/5"
            let statusBorder = "border-emerald-500/10"
            let statusGlow = ""
            let StatusIcon = CheckCircle2

            if (isCritical) {
              statusColor = "text-red-500"
              statusBg = "bg-red-500/10"
              statusBorder = "border-red-500/30"
              statusGlow = "shadow-[0_0_20px_rgba(239,68,68,0.2)]"
              StatusIcon = AlertCircle
            } else if (isLow) {
              statusColor = "text-orange-500"
              statusBg = "bg-orange-500/10"
              statusBorder = "border-orange-500/30"
              statusGlow = "shadow-[0_0_20px_rgba(245,158,11,0.15)]"
              StatusIcon = AlertCircle
            }

            return (
              <div 
                key={stock.id} 
                className={`group/item p-6 rounded-[2rem] border transition-all duration-500 flex flex-col justify-between h-40 relative overflow-hidden ${statusBg} ${statusBorder} ${statusGlow} hover:scale-[1.03] hover:shadow-2xl active:scale-95`}
              >
                <div className={`absolute top-0 right-0 w-24 h-24 rounded-full blur-3xl -z-0 opacity-20 transition-all group-hover/item:opacity-40 ${statusColor.replace('text', 'bg')}`}></div>
                
                <div className="relative z-10 flex justify-between items-start">
                  <div className="min-w-0 pr-4">
                    <p className={`text-[8px] font-black uppercase tracking-[0.3em] mb-1.5 opacity-100 dark:opacity-40 truncate ${statusColor}`}>{stock.Item.category}</p>
                    <p className="text-sm font-black text-foreground uppercase truncate tracking-tight group-hover/item:text-foreground transition-colors leading-tight">{stock.Item.name}</p>
                  </div>
                  <StatusIcon className={`w-5 h-5 shrink-0 ${statusColor} ${isCritical ? 'animate-bounce' : ''}`} />
                </div>

                <div className="relative z-10 flex justify-between items-end border-t border-border pt-4 mt-auto">
                  <div className="flex flex-col">
                    <p className={`text-3xl font-black tracking-tighter ${statusColor} drop-shadow-2xl leading-none`}>
                      {stock.quantity}
                      <span className="text-[10px] text-muted-foreground ml-1.5 font-bold uppercase tracking-widest">{hasConversion ? 'PCS' : stock.Item.unit}</span>
                    </p>
                    {hasConversion && (
                      <p className="text-[9px] font-black text-muted-foreground/40 uppercase tracking-widest mt-1.5">
                        ({(stock.quantity / stock.Item.piecesPerBox).toFixed(1)} {stock.Item.unit})
                      </p>
                    )}
                  </div>
                  <div className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border ${statusBorder.replace('10', '20')} ${statusColor} bg-white/40 dark:bg-black/20`}>
                    {isCritical ? "DEPLETED" : isLow ? "LOW SIGNAL" : "OPTIMAL"}
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
