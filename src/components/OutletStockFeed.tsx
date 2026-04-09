"use client"

import { useState } from "react"
import { Package, Coffee, Activity, Search } from "lucide-react"

export function OutletStockFeed({ stocks }: { stocks: any[] }) {
  const [activeOutlet, setActiveOutlet] = useState<"CAFE" | "CHAI">("CAFE")
  const [searchTerm, setSearchTerm] = useState("")

  const filteredStocks = stocks.filter(s => {
    const isOutlet = s.Outlet.name.toUpperCase().includes(activeOutlet)
    const matchesSearch = s.Item.name.toLowerCase().includes(searchTerm.toLowerCase())
    return isOutlet && matchesSearch
  })

  return (
    <div className="glass-panel p-8 rounded-[3rem] relative overflow-hidden group border border-white/5 h-full">
      <div className="absolute -top-10 -right-10 w-64 h-64 bg-primary/10 rounded-full blur-[80px]"></div>
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
        <div>
          <h3 className="text-2xl font-black text-foreground tracking-tight uppercase">Outlet Stock Levels</h3>
          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mt-1 opacity-60">Real-time inventory capture</p>
        </div>
        
        <div className="flex items-center gap-2 bg-zinc-900/50 p-1 rounded-2xl border border-white/5">
          <button 
            onClick={() => setActiveOutlet("CAFE")}
            className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 flex items-center gap-2 ${activeOutlet === 'CAFE' ? 'bg-amber-500 text-white shadow-lg' : 'text-muted-foreground hover:text-white'}`}
          >
            <Coffee className="w-3.5 h-3.5" />
            Cafe
          </button>
          <button 
            onClick={() => setActiveOutlet("CHAI")}
            className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 flex items-center gap-2 ${activeOutlet === 'CHAI' ? 'bg-indigo-500 text-white shadow-lg' : 'text-muted-foreground hover:text-white'}`}
          >
            <Activity className="w-3.5 h-3.5" />
            Chai Joint
          </button>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative mb-8 group/search">
         <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within/search:text-primary transition-colors" />
         <input 
          type="text"
          placeholder="Lookup an item..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full h-12 bg-white/5 border border-white/10 rounded-2xl pl-12 pr-6 text-sm font-medium focus:outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all placeholder:text-muted-foreground/30 text-white"
         />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
        {filteredStocks.length === 0 ? (
          <div className="col-span-full py-20 text-center space-y-4 opacity-20">
             <Package className="w-12 h-12 mx-auto" />
             <p className="text-xs font-black uppercase tracking-widest italic">No matching stock found</p>
          </div>
        ) : (
          filteredStocks.map(stock => (
            <div key={stock.id} className="p-5 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 transition-all flex justify-between items-center group/item">
              <div className="min-w-0 pr-4">
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-50 mb-1 truncate">{stock.Item.category}</p>
                <p className="text-sm font-black text-foreground uppercase truncate group-hover/item:text-primary transition-colors">{stock.Item.name}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-xl font-black text-foreground">
                  {stock.quantity}
                  <span className="text-[9px] text-muted-foreground ml-1 font-bold">{stock.Item.unit}</span>
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
