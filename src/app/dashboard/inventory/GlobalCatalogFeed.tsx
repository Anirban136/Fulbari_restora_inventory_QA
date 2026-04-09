"use client"

import { useState, useMemo } from "react"
import { Search, Package, Trash2, AlertTriangle, Layers, Edit2, CheckCircle2, IndianRupee, BarChart2, ShieldAlert } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { EditItemDialog } from "./EditItemDialog"
import { removeItem } from "./actions"

export function GlobalCatalogFeed({ 
  items, 
  categories, 
  isOwner, 
  isManager 
}: { 
  items: any[]
  categories: string[]
  isOwner: boolean
  isManager: boolean
}) {
  const [searchTerm, setSearchTerm] = useState("")
  const [activeCategory, setActiveCategory] = useState("ALL")

  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCategory = activeCategory === "ALL" || item.category === activeCategory
      return matchesSearch && matchesCategory
    })
  }, [items, searchTerm, activeCategory])

  return (
    <div className="space-y-6 lg:space-y-8 relative z-10 w-full overflow-x-visible">
      {/* 1. Universal Search & Filter Hub */}
      <div className="flex flex-col gap-4 glass-panel p-4 lg:p-6 rounded-[2rem] border border-white/5 shadow-2xl relative overflow-hidden backdrop-blur-3xl mx-0">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[80px] -z-10"></div>
        
        <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center">
          <div className="flex-1 w-full relative group">
            <Search className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors duration-300 ${searchTerm ? 'text-primary' : 'text-muted-foreground/30'}`} />
            <input 
              type="text"
              placeholder="Filter central repository..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-12 bg-white/[0.03] border border-white/10 rounded-xl lg:rounded-2xl pl-11 pr-6 text-xs font-black uppercase tracking-widest focus:outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all outline-none text-white shadow-inner"
            />
          </div>
          
          <div className="flex items-center gap-3 shrink-0 px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl lg:rounded-2xl w-full lg:w-auto justify-center lg:justify-start">
             <Layers className="w-3.5 h-3.5 text-primary" />
             <span className="text-[10px] font-black text-white uppercase tracking-widest">{filteredItems.length} Active Nodes</span>
          </div>
        </div>

        {/* Global Category Scroller */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 -mx-2 px-2 no-scrollbar">
          <button
            onClick={() => setActiveCategory("ALL")}
            className={`px-5 py-2 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] transition-all duration-300 shrink-0 border ${activeCategory === "ALL" ? "bg-primary text-primary-foreground border-primary shadow-lg" : "bg-white/5 text-muted-foreground/60 border-white/10 hover:border-white/20 hover:text-white"}`}
          >
            All Signal
          </button>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-5 py-2 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] transition-all duration-300 shrink-0 border ${activeCategory === cat ? "bg-white text-black border-white shadow-lg" : "bg-white/5 text-muted-foreground/60 border-white/10 hover:border-white/20 hover:text-white"}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Hybrid Repository Grid (Mobile Cards / Desktop Table) */}
      <div className="space-y-4 w-full">
        {/* Desktop Table Header - Hidden on Mobile */}
        <div className="hidden md:grid md:grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr_0.5fr] gap-4 px-8 py-4 bg-white/[0.03] border border-white/5 rounded-2xl mb-4">
          <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 text-left">Entity Description</span>
          <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 text-center">Status</span>
          <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 text-center">Unit</span>
          <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 text-right">Input Credit</span>
          <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 text-right">Output Credit</span>
          <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 text-center">Redline</span>
          <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 text-center">Ops</span>
        </div>

        {filteredItems.length === 0 ? (
          <div className="py-32 text-center glass-panel rounded-[2rem] border border-white/5 bg-white/5">
             <Package className="w-16 h-16 text-muted-foreground/10 mx-auto mb-4 animate-pulse" />
             <p className="text-muted-foreground/30 font-black uppercase tracking-[0.5em] text-xs">No Data Nodes Found</p>
          </div>
        ) : (
          filteredItems.map(item => {
            const isCritical = item.minStock > 0 && item.currentStock <= 0
            const isLow = item.minStock > 0 && item.currentStock <= item.minStock
            const hasConversion = item.piecesPerBox > 0
            
            return (
              <div key={item.id} className="relative group w-full">
                {/* Visual Status Indicator (Glow Border) */}
                <div className={`absolute -inset-[1px] rounded-[1.8rem] opacity-0 group-hover:opacity-100 transition-opacity blur-[2px] -z-10 ${isCritical ? 'bg-red-500/20' : isLow ? 'bg-amber-500/20' : 'bg-primary/20'}`}></div>
                
                {/* Main Content Node */}
                <div className={`glass-panel p-4 lg:p-6 lg:px-8 rounded-[1.8rem] border transition-all duration-300 flex flex-col md:grid md:grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr_0.5fr] items-center gap-4 lg:gap-4 relative overflow-hidden h-auto w-full ${isCritical ? 'border-red-500/30 bg-red-500/[0.03]' : isLow ? 'border-amber-500/30 bg-amber-500/[0.03]' : 'border-white/5 bg-white/[0.02]'}`}>
                  
                  {/* MOBILE HEADER: Name & Ops */}
                  <div className="w-full md:w-auto flex justify-between items-start md:block">
                    <div className="flex flex-col gap-1.5 min-w-0 pr-2 md:pr-0">
                      <span className={`text-[8px] font-black uppercase tracking-[0.2em] ${isCritical ? 'text-red-500' : isLow ? 'text-amber-500' : 'text-primary'}`}>
                        {item.category || "General"}
                      </span>
                      <h4 className="text-sm lg:text-base font-black text-white uppercase tracking-tight truncate group-hover:text-primary transition-colors leading-tight">
                        {item.name}
                      </h4>
                    </div>
                    {/* Mobile Ops - Optimized for no clipping */}
                    <div className="md:hidden flex items-center gap-0.5 shrink-0">
                       <EditItemDialog item={item} existingCategories={categories} />
                       {isOwner && (
                         <div onClick={() => removeItem(item.id)} className="p-2 text-red-500/30 hover:text-red-500 transition-colors">
                           <Trash2 className="w-4 h-4" />
                         </div>
                       )}
                    </div>
                  </div>

                  {/* MOBILE GRID: The data fields */}
                  <div className="w-full md:w-auto grid grid-cols-2 md:contents gap-2.5 border-t md:border-0 border-white/5 pt-3.5 md:pt-0">
                    
                    {/* Parity Status */}
                    <div className="flex items-center gap-2.5 md:justify-center">
                       <div className={`p-1.5 rounded-lg border ${isCritical ? 'text-red-500 bg-red-500/10 border-red-500/20 shadow-[0_0_10px_rgba(239,68,68,0.2)]' : isLow ? 'text-amber-500 bg-amber-500/10 border-amber-500/20 animate-pulse' : 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20'}`}>
                         {isCritical || isLow ? <AlertTriangle className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                       </div>
                       <div className="flex flex-col">
                          <span className={`text-base md:text-xl font-black tracking-tighter leading-none ${isCritical ? 'text-red-500' : isLow ? 'text-amber-500' : 'text-white'}`}>
                            {item.currentStock}
                          </span>
                          {hasConversion && (
                            <span className="text-[7.5px] font-black text-muted-foreground/30 uppercase tracking-widest self-start md:self-center">
                              {(item.currentStock / item.piecesPerBox).toFixed(1)} {item.unit}
                            </span>
                          )}
                       </div>
                    </div>

                    {/* Metric Unit */}
                    <div className="flex items-center md:justify-center">
                       <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-[9px] font-black text-muted-foreground uppercase tracking-widest w-fit">
                         {hasConversion ? 'PCS' : item.unit}
                       </span>
                    </div>

                    {/* Input Credit */}
                    <div className="flex flex-col md:items-end justify-center bg-black/20 p-2 md:p-0 rounded-xl md:bg-transparent border border-white/5 md:border-0">
                       <span className="md:hidden text-[7px] font-black text-muted-foreground/40 uppercase tracking-widest mb-1 flex items-center gap-1"><IndianRupee className="w-2 h-2 text-white/20" /> Input</span>
                       <span className="text-xs md:text-base font-black text-white/60 tracking-tight">
                         ₹{item.costPerUnit?.toFixed(2) || "0.00"}
                       </span>
                    </div>

                    {/* Output Credit */}
                    <div className="flex flex-col md:items-end justify-center bg-primary/5 p-2 md:p-0 rounded-xl md:bg-transparent border border-primary/10 md:border-0">
                       <span className="md:hidden text-[7px] font-black text-primary/60 uppercase tracking-widest mb-1 flex items-center gap-1"><IndianRupee className="w-2 h-2 text-primary/40" /> Output</span>
                       <span className="text-xs md:text-base font-black text-primary tracking-tight">
                         ₹{item.sellPrice?.toFixed(2) || "0.00"}
                       </span>
                    </div>

                    {/* Redline Alert Level */}
                    <div className="flex flex-col md:items-center justify-center col-span-2 md:col-auto bg-amber-500/5 p-2 md:p-0 rounded-xl md:bg-transparent border border-amber-500/10 md:border-0">
                       <span className="md:hidden text-[7px] font-black text-amber-500/60 uppercase tracking-widest mb-1 flex items-center gap-1"><ShieldAlert className="w-2 h-2" /> Min Alert Threshold</span>
                       <div className="flex items-center gap-1.5">
                         <span className={`text-[11px] md:text-sm font-black ${isLow ? 'text-amber-500' : 'text-white/60'}`}>{item.minStock || 0}</span>
                         <span className="hidden md:inline text-[7px] font-black text-muted-foreground/30 uppercase tracking-widest ml-1">Limit</span>
                       </div>
                    </div>

                  </div>

                  {/* Desktop Ops - Hidden on Mobile */}
                  <div className="hidden md:flex items-center justify-center gap-2">
                    <EditItemDialog item={item} existingCategories={categories} />
                    {isOwner && (
                      <Dialog>
                        <DialogTrigger render={
                          <button className="p-2 rounded-xl text-red-500/30 hover:text-red-500 hover:bg-red-500/10 transition-all border border-transparent hover:border-red-500/20" title={`Erase ${item.name}`}>
                            <Trash2 className="w-4 h-4" />
                          </button>
                        } />
                        <DialogContent className="sm:max-w-[420px] bg-zinc-950 border-white/10 rounded-[2.5rem] p-10">
                          <DialogHeader>
                            <Trash2 className="w-10 h-10 text-red-500 mb-6" />
                            <DialogTitle className="text-2xl font-black text-white tracking-tighter uppercase">Purge Entity</DialogTitle>
                            <DialogDescription className="text-slate-400 text-sm font-medium mt-3 leading-relaxed">
                              Permanently remove <span className="text-white font-bold">{item.name}</span> from the repository?
                            </DialogDescription>
                          </DialogHeader>
                          <form action={removeItem} className="mt-8">
                            <input type="hidden" name="itemId" value={item.id} />
                            <button type="submit" className="w-full h-14 bg-red-600 hover:bg-red-500 text-white font-black uppercase tracking-widest rounded-xl transition-all shadow-xl active:scale-95">Execute Removal</button>
                          </form>
                        </DialogContent>
                      </Dialog>
                    )}
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
