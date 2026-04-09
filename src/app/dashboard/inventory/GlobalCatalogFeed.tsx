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
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-12 bg-white/[0.03] border border-white/10 rounded-xl lg:rounded-2xl pl-11 pr-6 text-xs font-black uppercase tracking-widest focus:outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all outline-none text-white shadow-inner"
            />
          </div>
          
          <div className="flex items-center gap-3 shrink-0 px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl lg:rounded-2xl w-full lg:w-auto justify-center lg:justify-start">
             <Layers className="w-3.5 h-3.5 text-primary" />
             <span className="text-[10px] font-black text-white uppercase tracking-widest">{filteredItems.length} ACTIVE PRODUCTS</span>
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

      {/* 2. Global Product Table (Responsive Horizontal Scroll) */}
      <div className="glass-panel overflow-hidden rounded-[2rem] border border-white/5 bg-white/[0.02] shadow-2xl relative w-full">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent"></div>
        
        {/* Horizontal Scroll Wrapper - Ensures fit to screen while keeping table format */}
        <div className="overflow-x-auto custom-scrollbar-premium w-full">
          <table className="w-full text-left border-collapse min-w-[1200px]">
            <thead>
              <tr className="bg-white/[0.03] border-b border-white/5">
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/40">ITEM NAME</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/40">CATEGORY</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/40 text-center">CURRENT STOCK</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/40 text-center">UNIT</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/40 text-right">BUY PRICE</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/40 text-right">SELL PRICE</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/40 text-center">LOW STOCK ALERT</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/40 text-center">OPS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.03]">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-32 text-center">
                    <Package className="w-16 h-16 text-muted-foreground/10 mx-auto mb-4 animate-pulse" />
                    <p className="text-muted-foreground/30 font-black uppercase tracking-[0.5em] text-xs">NO PRODUCTS FOUND</p>
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
                      <td className="px-8 py-6">
                        <span className="text-sm font-black text-white uppercase tracking-tight group-hover:text-primary transition-colors">
                          {item.name}
                        </span>
                      </td>
                      <td className="px-8 py-6">
                        <span className={`text-[10px] font-black uppercase tracking-widest ${isCritical ? 'text-red-500' : isLow ? 'text-amber-500' : 'text-primary'}`}>
                          {item.category || "GENERAL"}
                        </span>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center justify-center gap-3">
                          <div className={`p-2 rounded-xl border ${isCritical ? 'bg-red-500/10 border-red-500/30 text-red-500 shadow-[0_0_15px_rgba(239,68,68,0.2)]' : isLow ? 'bg-amber-500/10 border-amber-500/30 text-amber-500 animate-pulse' : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500'}`}>
                            {isCritical || isLow ? <AlertTriangle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                          </div>
                          <div className="flex flex-col items-center">
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
                      <td className="px-8 py-6 text-center">
                        <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                          {hasConversion ? 'PCS' : item.unit}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-right font-black text-white/60">
                        <span className="text-muted-foreground/30 font-bold mr-1 text-[10px]">₹</span>
                        {item.costPerUnit?.toFixed(2) || "0.00"}
                      </td>
                      <td className="px-8 py-6 text-right font-black text-primary drop-shadow-[0_0_10px_rgba(16,185,129,0.3)]">
                        <span className="text-primary/30 font-bold mr-1 text-[10px]">₹</span>
                        {item.sellPrice?.toFixed(2) || "0.00"}
                      </td>
                      <td className="px-8 py-6 text-center">
                        <div className="flex flex-col items-center">
                          <span className={`text-sm font-black ${isLow ? 'text-amber-500' : 'text-muted-foreground/60'}`}>{item.minStock || 0}</span>
                          <span className="text-[7px] font-black text-muted-foreground/30 uppercase tracking-widest leading-none">LIMIT</span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center justify-center gap-2 opacity-20 group-hover:opacity-100 transition-opacity">
                          <EditItemDialog item={item} existingCategories={categories} />
                          
                          {isOwner && (
                            <button 
                              onClick={() => removeItem(item.id)}
                              className="p-2 rounded-xl text-red-500/50 hover:text-red-500 hover:bg-red-500/10 transition-all border border-transparent hover:border-red-500/20" 
                              title={`Delete ${item.name}`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
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
