"use client"

import { useState, useMemo } from "react"
import { Search, Package, Trash2, AlertTriangle, Layers, ChevronRight, CheckCircle2 } from "lucide-react"
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
    <div className="space-y-10 relative z-10">
      {/* 1. Header Filter Controls */}
      <div className="flex flex-col gap-6 glass-panel p-6 rounded-[2.5rem] border border-white/5 shadow-2xl relative overflow-hidden backdrop-blur-3xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[80px] -z-10"></div>
        
        <div className="flex flex-col lg:flex-row gap-6 justify-between items-start lg:items-center">
          <div className="flex-1 w-full relative group">
            <Search className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors duration-300 ${searchTerm ? 'text-primary' : 'text-muted-foreground/30'}`} />
            <input 
              type="text"
              placeholder="Search global repository..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-14 bg-white/[0.03] border border-white/10 rounded-2xl pl-12 pr-6 text-sm font-black uppercase tracking-widest focus:outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all outline-none text-white shadow-inner"
            />
          </div>
          
          <div className="flex items-center gap-3 shrink-0">
             <div className="px-5 py-3 bg-white/5 border border-white/10 rounded-2xl flex items-center gap-3 shadow-inner">
               <Layers className="w-4 h-4 text-primary" />
               <span className="text-[10px] font-black text-white uppercase tracking-widest">{filteredItems.length} Nodes Resolved</span>
             </div>
          </div>
        </div>

        {/* Category Swipe Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 pt-2 -mx-2 px-2 custom-scrollbar-premium no-scrollbar">
          <button
            onClick={() => setActiveCategory("ALL")}
            className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 shrink-0 border ${activeCategory === "ALL" ? "bg-primary text-primary-foreground border-primary shadow-[0_10px_25px_-5px_rgba(16,185,129,0.4)] scale-105" : "bg-white/5 text-muted-foreground/60 border-white/10 hover:border-white/20 hover:text-white"}`}
          >
            All Signal
          </button>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 shrink-0 border ${activeCategory === cat ? "bg-white text-black border-white shadow-xl scale-105" : "bg-white/5 text-muted-foreground/60 border-white/10 hover:border-white/20 hover:text-white"}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Item Grid - Mobile Friendly */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredItems.length === 0 ? (
          <div className="col-span-full py-48 text-center glass-panel rounded-[3rem] border border-white/5 bg-white/5 flex flex-col items-center gap-6">
             <Package className="w-24 h-24 text-muted-foreground/20 animate-pulse" />
             <div className="space-y-2">
               <p className="text-muted-foreground font-black uppercase tracking-[0.4em] opacity-40">No Signal Detected</p>
               <p className="text-[10px] text-muted-foreground/20 font-bold uppercase tracking-widest">Awaiting catalog population</p>
             </div>
          </div>
        ) : (
          filteredItems.map(item => {
            const isCritical = item.minStock > 0 && item.currentStock <= 0
            const isLow = item.minStock > 0 && item.currentStock <= item.minStock

            return (
              <div 
                key={item.id} 
                className={`glass-panel p-6 rounded-[2.5rem] border transition-all duration-500 flex flex-col justify-between group h-[280px] relative overflow-hidden hover:scale-[1.03] active:scale-95 hover:shadow-2xl ${isCritical ? 'border-red-500/40 bg-red-500/10' : isLow ? 'border-amber-500/40 bg-amber-500/10' : 'border-white/5 hover:border-primary/20 bg-white/[0.03]'}`}
              >
                {/* Glow Background Indicator */}
                <div className={`absolute -top-10 -right-10 w-32 h-32 rounded-full blur-[80px] opacity-20 -z-10 transition-all duration-700 group-hover:scale-150 ${isCritical ? 'bg-red-500' : isLow ? 'bg-amber-500' : 'bg-primary'}`}></div>
                
                <div className="space-y-4 relative z-10">
                  <div className="flex justify-between items-start">
                    <div className="min-w-0 pr-4">
                      <p className={`text-[9px] font-black uppercase tracking-[0.3em] mb-2 ${isCritical ? 'text-red-500' : isLow ? 'text-amber-500' : 'text-primary'}`}>{item.category || "General"}</p>
                      <h4 className="text-xl font-black text-white uppercase truncate tracking-tighter leading-none group-hover:text-primary transition-colors">{item.name}</h4>
                    </div>
                    <div className={`p-2.5 rounded-2xl border transition-colors ${isCritical ? 'bg-red-500/20 border-red-500/30 text-red-500' : isLow ? 'bg-amber-500/20 border-amber-500/30 text-amber-500 animate-pulse' : 'bg-white/5 border-white/10 text-muted-foreground/20 group-hover:text-primary group-hover:border-primary/30'}`}>
                      {isCritical || isLow ? <AlertTriangle className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
                    </div>
                  </div>

                  {/* Stock Metrics Row */}
                  <div className="grid grid-cols-2 gap-3 mt-6">
                    <div className={`bg-black/40 border p-4 rounded-3xl flex flex-col justify-center gap-1 ${isLow || isCritical ? 'border-amber-500/10' : 'border-white/5'}`}>
                      <span className="text-[9px] font-black text-muted-foreground/60 uppercase tracking-widest opacity-60">Status</span>
                      <div className="flex items-center gap-2">
                         <span className={`text-2xl font-black tracking-tighter ${isCritical ? 'text-red-500 glow-red' : isLow ? 'text-amber-500' : 'text-white'}`}>
                           {item.currentStock}
                         </span>
                         <span className="text-[9px] font-black text-muted-foreground/60 uppercase tracking-tighter self-end mb-1.5">{item.unit}</span>
                      </div>
                    </div>
                    <div className="bg-black/40 border border-white/5 p-4 rounded-3xl flex flex-col justify-center gap-1">
                      <span className="text-[9px] font-black text-muted-foreground/60 uppercase tracking-widest opacity-60">Credit</span>
                      <div className="flex items-center gap-1">
                         <span className="text-2xl font-black text-white tracking-tighter">₹{item.sellPrice?.toFixed(0) || "0"}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Operations Footer */}
                <div className="mt-auto flex justify-between items-center relative z-10 pt-4 border-t border-white/5">
                  <div className="flex flex-col">
                    <span className="text-[8px] font-black text-muted-foreground/40 uppercase tracking-widest">Min Alert Level</span>
                    <span className={`text-xs font-black ${isLow ? 'text-amber-500' : 'text-white/60'}`}>{item.minStock || 0} {item.unit}</span>
                  </div>
                  
                  {(isOwner || isManager) && (
                    <div className="flex items-center gap-3">
                      <EditItemDialog item={item} existingCategories={categories} />
                      
                      {isOwner && (
                        <Dialog>
                          <DialogTrigger render={
                            <button className="p-2.5 rounded-2xl text-red-400/30 hover:text-red-500 hover:bg-red-500/10 transition-all border border-transparent hover:border-red-500/20" title={`Erase ${item.name}`}>
                              <Trash2 className="w-4 h-4" />
                            </button>
                          } />
                          <DialogContent className="sm:max-w-[420px] bg-zinc-950/95 backdrop-blur-3xl border-white/10 rounded-[3rem] shadow-2xl p-10 overflow-hidden">
                            <div className="absolute top-0 right-0 w-40 h-40 bg-red-500/10 rounded-full blur-[80px] -z-10"></div>
                            <DialogHeader>
                              <div className="w-20 h-20 bg-red-500/10 rounded-[2rem] flex items-center justify-center mb-8 border border-red-500/20 shadow-inner">
                                <Trash2 className="w-10 h-10 text-red-500" />
                              </div>
                              <DialogTitle className="text-3xl font-black text-white tracking-tighter uppercase leading-none">Purge Node</DialogTitle>
                              <DialogDescription className="text-slate-400 text-sm font-medium mt-4 leading-relaxed">
                                Proceeding will permanently erase <span className="text-white font-bold">{item.name}</span> from the central catalog. This action cannot be reversed within the current deployment cycle.
                              </DialogDescription>
                            </DialogHeader>
                            <form action={removeItem} className="mt-10">
                              <input type="hidden" name="itemId" value={item.id} />
                              <button type="submit" className="w-full h-16 bg-red-600 hover:bg-red-500 text-white font-black uppercase tracking-widest rounded-2xl transition-all shadow-xl active:scale-95">Execute Removal</button>
                            </form>
                          </DialogContent>
                        </Dialog>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
