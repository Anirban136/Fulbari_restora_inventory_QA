"use client"

import { useState, useMemo } from "react"
import { Search, Package, Trash2, AlertTriangle, Layers, Edit2, CheckCircle2, MoreHorizontal } from "lucide-react"
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
    <div className="space-y-6 lg:space-y-8 relative z-10">
      {/* 1. Filter & Search Controls */}
      <div className="flex flex-col gap-4 glass-panel p-4 lg:p-6 rounded-[2rem] lg:rounded-[3rem] border border-white/5 shadow-2xl relative overflow-hidden backdrop-blur-3xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[80px] -z-10"></div>
        
        <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center">
          <div className="flex-1 w-full relative group">
            <Search className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors duration-300 ${searchTerm ? 'text-primary' : 'text-muted-foreground/30'}`} />
            <input 
              type="text"
              placeholder="Filter catalog repository..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-12 bg-white/[0.03] border border-white/10 rounded-xl lg:rounded-2xl pl-11 pr-6 text-xs font-black uppercase tracking-widest focus:outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all outline-none text-white shadow-inner"
            />
          </div>
          
          <div className="flex items-center gap-3 shrink-0 px-5 py-3 bg-white/5 border border-white/10 rounded-xl lg:rounded-2xl">
             <Layers className="w-4 h-4 text-primary" />
             <span className="text-[10px] font-black text-white uppercase tracking-widest">{filteredItems.length} Entities Resolved</span>
          </div>
        </div>

        {/* Category Swipe Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 -mx-2 px-2 no-scrollbar">
          <button
            onClick={() => setActiveCategory("ALL")}
            className={`px-6 py-2 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] transition-all duration-300 shrink-0 border ${activeCategory === "ALL" ? "bg-primary text-primary-foreground border-primary shadow-lg scale-105" : "bg-white/5 text-muted-foreground/60 border-white/10 hover:border-white/20 hover:text-white"}`}
          >
            All Signal
          </button>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-6 py-2 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] transition-all duration-300 shrink-0 border ${activeCategory === cat ? "bg-white text-black border-white shadow-lg scale-105" : "bg-white/5 text-muted-foreground/60 border-white/10 hover:border-white/20 hover:text-white"}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Optimized Table View */}
      <div className="glass-panel overflow-hidden rounded-[2rem] lg:rounded-[3rem] border border-white/5 bg-white/[0.02] shadow-2xl relative">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent"></div>
        
        {/* Responsive Table Container */}
        <div className="overflow-x-auto custom-scrollbar-premium">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="bg-white/[0.03] border-b border-white/5">
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/40">Entity Description</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/40">Parity Status</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/40">Metric Unit</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/40 text-right">Input Credit</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/40 text-right">Output Credit</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/40">Redline</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/40 text-center">Ops</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.03]">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-32 text-center">
                    <Package className="w-16 h-16 text-muted-foreground/10 mx-auto mb-4 animate-pulse" />
                    <p className="text-muted-foreground/30 font-black uppercase tracking-[0.5em] text-xs">No Nodes Resolved</p>
                  </td>
                </tr>
              ) : (
                filteredItems.map(item => {
                  const isCritical = item.minStock > 0 && item.currentStock <= 0
                  const isLow = item.minStock > 0 && item.currentStock <= item.minStock
                  const hasConversion = item.piecesPerBox > 0
                  
                  return (
                    <tr 
                      key={item.id} 
                      className={`group hover:bg-white/[0.04] transition-all duration-300 ${isCritical ? 'bg-red-500/[0.03]' : isLow ? 'bg-amber-500/[0.03]' : ''}`}
                    >
                      <td className="px-8 py-5">
                        <div className="flex flex-col gap-1.5">
                          <span className={`text-[8px] font-black uppercase tracking-widest ${isCritical ? 'text-red-500' : isLow ? 'text-amber-500' : 'text-primary'}`}>
                            {item.category || "General"}
                          </span>
                          <span className="text-sm font-black text-white uppercase tracking-tight group-hover:text-primary transition-colors">
                            {item.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-xl border ${isCritical ? 'bg-red-500/10 border-red-500/30 text-red-500 glow-red' : isLow ? 'bg-amber-500/10 border-amber-500/30 text-amber-500' : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500'}`}>
                            {isCritical || isLow ? <AlertTriangle className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                          </div>
                          <div className="flex flex-col">
                            <span className={`text-xl font-black tracking-tighter ${isCritical ? 'text-red-500' : isLow ? 'text-amber-500' : 'text-white'}`}>
                              {item.currentStock}
                            </span>
                            {hasConversion && (
                              <span className="text-[9px] font-black text-muted-foreground/30 uppercase tracking-widest -mt-1">
                                {(item.currentStock / item.piecesPerBox).toFixed(1)} {item.unit}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                          {hasConversion ? 'PCS' : item.unit}
                        </span>
                      </td>
                      <td className="px-8 py-5 text-right font-black text-white">
                        <span className="text-muted-foreground/30 font-bold mr-1 text-[10px]">₹</span>
                        {item.costPerUnit?.toFixed(2) || "0.00"}
                      </td>
                      <td className="px-8 py-5 text-right font-black text-primary drop-shadow-[0_0_10px_rgba(16,185,129,0.3)]">
                        <span className="text-primary/30 font-bold mr-1 text-[10px]">₹</span>
                        {item.sellPrice?.toFixed(2) || "0.00"}
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex flex-col">
                          <span className={`text-xs font-black ${isLow ? 'text-amber-500' : 'text-muted-foreground/60'}`}>{item.minStock || 0}</span>
                          <span className="text-[7px] font-black text-muted-foreground/30 uppercase tracking-widest leading-none">Min Limit</span>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex items-center justify-center gap-2 opacity-20 group-hover:opacity-100 transition-opacity">
                          <EditItemDialog item={item} existingCategories={categories} />
                          
                          {isOwner && (
                            <Dialog>
                              <DialogTrigger render={
                                <button className="p-2 rounded-xl text-red-500/50 hover:text-red-500 hover:bg-red-500/10 transition-all border border-transparent hover:border-red-500/20" title={`Erase ${item.name}`}>
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              } />
                              <DialogContent className="sm:max-w-[420px] bg-zinc-950 border-white/10 rounded-[2.5rem] shadow-2xl p-10">
                                <DialogHeader>
                                  <div className="w-16 h-16 bg-red-500/10 rounded-[1.5rem] flex items-center justify-center mb-6 border border-red-500/20">
                                    <Trash2 className="w-8 h-8 text-red-500" />
                                  </div>
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
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
