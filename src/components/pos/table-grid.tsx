"use client"

import { useState, useTransition } from "react"
import { createTab, cancelTab } from "@/app/tabs/actions"
import Link from "next/link"
import { Loader2, Plus, Users, Utensils, Coffee, X } from "lucide-react"

interface TableGridProps {
  activeTabs: any[]
  outletId: string
  isCafe: boolean
}

export function TableGrid({ activeTabs, outletId, isCafe }: TableGridProps) {
  const [isPending, startTransition] = useTransition()
  const [loadingTable, setLoadingTable] = useState<string | null>(null)
  const [cancellingTable, setCancellingTable] = useState<string | null>(null)

  const handleOpenTable = (tableName: string) => {
    setLoadingTable(tableName)
    const formData = new FormData()
    formData.append("tableName", tableName)
    formData.append("outletId", outletId)
    formData.append("customerName", "Walk-in")

    startTransition(async () => {
      // Note: We don't try/catch around createTab because it redirects, 
      // which throws a conflict error that breaks the client side alert.
      // If there's a real field error, the server action should handle it.
      await createTab(formData)
    })
  }

  const handleCancel = (e: React.MouseEvent, tabId: string, tableName: string) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (!window.confirm(`Are you sure you want to cancel Table ${tableName} and make it vacant?`)) return

    setCancellingTable(tableName)
    startTransition(async () => {
      try {
        await cancelTab(tabId)
      } catch (error) {
        console.error("Failed to cancel table:", error)
        alert("Failed to cancel table")
      } finally {
        setCancellingTable(null)
      }
    })
  }

  // Create array of 20 tables as requested
  const tables = Array.from({ length: 20 }, (_, i) => (i + 1).toString())

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 w-full pb-10">
      {tables.map((tableNum) => {
        const activeTab = activeTabs.find((t) => t.tableName === tableNum)
        const isOccupied = !!activeTab
        const isLoading = loadingTable === tableNum && isPending
        const isCancelling = cancellingTable === tableNum && isPending

        if (isOccupied) {
          const itemsCount = activeTab.Items.reduce((acc: number, item: any) => acc + item.quantity, 0)
          
          return (
            <div key={tableNum} className="relative group h-44 animate-in fade-in zoom-in duration-500">
                <Link href={`/tabs/${activeTab.id}`} className="block h-full">
                    <div className="relative h-full bg-gradient-to-br from-red-600/20 to-transparent border-2 border-red-500/40 hover:border-red-500 rounded-[2rem] p-5 transition-all duration-500 hover:shadow-[0_20px_50px_-10px_rgba(239,68,68,0.4)] hover:-translate-y-2 flex flex-col justify-between overflow-hidden backdrop-blur-md">
                        
                        {/* Decorator */}
                        <div className="absolute -right-4 -top-4 w-24 h-24 bg-red-600/10 rounded-full blur-2xl group-hover:bg-red-500/20 transition-all duration-500"></div>
                        
                        <div className="flex justify-between items-start relative z-10">
                            <div className="flex flex-col">
                                <span className="text-3xl font-black text-white group-hover:text-red-400 transition-colors">T-{tableNum}</span>
                                <div className="flex items-center gap-1.5 mt-1">
                                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                                    <span className="text-[10px] font-black text-red-500 tracking-[0.2em] uppercase">Occupied</span>
                                </div>
                            </div>
                            <div className="bg-black/60 backdrop-blur-md border border-white/10 p-2 rounded-xl group-hover:border-red-500/50 transition-colors">
                                {isCafe ? <Utensils className="w-5 h-5 text-red-400" /> : <Coffee className="w-5 h-5 text-red-400" />}
                            </div>
                        </div>

                        <div className="flex flex-col relative z-10">
                            <div className="flex items-center gap-2 mb-1.5">
                                <Users className="w-3.5 h-3.5 text-red-400/70" />
                                <span className="text-white font-bold text-sm truncate group-hover:text-red-200 transition-colors">{activeTab.customerName || "Walk-in"}</span>
                            </div>
                            <div className="flex justify-between items-center bg-black/60 p-2.5 rounded-xl border border-white/5 shadow-inner group-hover:border-red-500/20 transition-colors">
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Running Bill</span>
                                <span className="text-xs font-black text-red-400">{itemsCount} Items</span>
                            </div>
                        </div>

                        {/* Hover Glow */}
                        <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    </div>
                </Link>
                
                {/* Quick Cancel Button */}
                <button 
                    onClick={(e) => handleCancel(e, activeTab.id, tableNum)}
                    disabled={isPending}
                    className="absolute -top-2 -right-2 w-10 h-10 bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-red-500 hover:scale-110 transition-all z-20 border-2 border-[#0a0a0a] disabled:opacity-50 disabled:cursor-not-allowed group/cancel"
                    title="Cancel Table (Make Vacant)"
                >
                    {isCancelling ? <Loader2 className="w-5 h-5 animate-spin" /> : <X className="w-5 h-5 group-hover/cancel:rotate-90 transition-transform" />}
                </button>
            </div>
          )
        }

        return (
          <button
            key={tableNum}
            disabled={isPending}
            onClick={() => handleOpenTable(tableNum)}
            className="relative group bg-gradient-to-br from-white/5 to-transparent border-2 border-dashed border-white/10 hover:border-emerald-500/50 hover:bg-emerald-500/10 rounded-[2rem] p-5 transition-all duration-500 hover:shadow-[0_20px_50px_-10px_rgba(16,185,129,0.25)] hover:-translate-y-2 h-44 flex flex-col justify-between items-center text-center disabled:opacity-50 backdrop-blur-sm overflow-hidden animate-in fade-in zoom-in duration-500"
          >
            <div className="flex justify-between w-full items-start relative z-10">
              <span className="text-3xl font-black text-slate-600 group-hover:text-emerald-500 transition-colors">T-{tableNum}</span>
              <div className="bg-white/5 text-slate-500 text-[10px] font-black px-2.5 py-1.5 rounded-lg border border-white/5 tracking-widest uppercase group-hover:text-emerald-500 group-hover:bg-emerald-500/10 group-hover:border-emerald-500/20 transition-all">Vacant</div>
            </div>
            
            {isLoading ? (
              <div className="flex flex-col items-center animate-in fade-in zoom-in duration-300">
                <Loader2 className="w-12 h-12 text-emerald-500 animate-spin mb-3" />
                <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Starting Bill...</span>
              </div>
            ) : (
              <div className="flex flex-col items-center group-hover:scale-110 transition-transform duration-500">
                <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center group-hover:bg-emerald-500/20 group-hover:rotate-12 transition-all duration-500 border border-white/5 group-hover:border-emerald-500/30 shadow-inner">
                    <Plus className="w-7 h-7 text-slate-400 group-hover:text-emerald-500 transition-all" />
                </div>
                <span className="text-[10px] font-black text-slate-500 group-hover:text-emerald-500 uppercase tracking-[0.25em] mt-4">Open Table</span>
              </div>
            )}
            
            <div className="w-full relative z-10">
                <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 group-hover:w-full w-0 transition-all duration-1000 ease-out"></div>
                </div>
            </div>

            {/* Subtle background T number on hover */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-[0.05] transition-opacity duration-1000 pointer-events-none">
                <span className="text-[10rem] font-black text-emerald-500 leading-none">{tableNum}</span>
            </div>
          </button>
        )
      })}
    </div>
  )
}
