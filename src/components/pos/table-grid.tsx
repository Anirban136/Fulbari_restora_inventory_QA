"use client"

import { useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { createTab } from "@/app/tabs/actions"
import Link from "next/link"
import { Loader2, Plus, Users, Utensils, Coffee } from "lucide-react"

interface TableGridProps {
  activeTabs: any[]
  outletId: string
  isCafe: boolean
}

export function TableGrid({ activeTabs, outletId, isCafe }: TableGridProps) {
  const [isPending, startTransition] = useTransition()
  const [loadingTable, setLoadingTable] = useState<string | null>(null)

  const handleOpenTable = (tableName: string) => {
    setLoadingTable(tableName)
    const formData = new FormData()
    formData.append("tableName", tableName)
    formData.append("outletId", outletId)
    formData.append("customerName", "Walk-in")

    startTransition(async () => {
      try {
        await createTab(formData)
      } catch (error) {
        console.error("Failed to open table:", error)
        alert("Failed to open table")
        setLoadingTable(null)
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

        if (isOccupied) {
          const itemsCount = activeTab.Items.reduce((acc: number, item: any) => acc + item.quantity, 0)
          
          return (
            <Link key={tableNum} href={`/tabs/${activeTab.id}`} className="block">
              <div className="relative group bg-red-500/10 border-2 border-red-500/40 hover:border-red-500 rounded-[2rem] p-5 transition-all duration-500 hover:shadow-[0_20px_50px_-10px_rgba(239,68,68,0.3)] hover:-translate-y-2 h-44 flex flex-col justify-between overflow-hidden backdrop-blur-sm">
                
                {/* Decorator */}
                <div className="absolute -right-4 -top-4 w-24 h-24 bg-red-500/10 rounded-full blur-2xl group-hover:bg-red-500/20 transition-all duration-500"></div>
                
                <div className="flex justify-between items-start relative z-10">
                  <div className="flex flex-col">
                    <span className="text-3xl font-black text-white group-hover:text-red-400 transition-colors">T-{tableNum}</span>
                    <div className="flex items-center gap-1.5 mt-1">
                        <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                        <span className="text-[10px] font-black text-red-500 tracking-[0.2em] uppercase">Occupied</span>
                    </div>
                  </div>
                  <div className="bg-black/40 backdrop-blur-md border border-white/10 p-2 rounded-xl">
                    {isCafe ? <Utensils className="w-5 h-5 text-red-400" /> : <Coffee className="w-5 h-5 text-red-400" />}
                  </div>
                </div>

                <div className="flex flex-col relative z-10">
                    <div className="flex items-center gap-2 mb-1">
                        <Users className="w-3 h-3 text-slate-400" />
                        <span className="text-white font-bold text-sm truncate group-hover:text-red-200 transition-colors">{activeTab.customerName || "Walk-in"}</span>
                    </div>
                    <div className="flex justify-between items-center bg-black/40 p-2 rounded-xl border border-white/5 shadow-inner">
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Running Bill</span>
                        <span className="text-xs font-black text-red-400">{itemsCount} Items</span>
                    </div>
                </div>

                {/* Hover Glow */}
                <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </div>
            </Link>
          )
        }

        return (
          <button
            key={tableNum}
            disabled={isPending}
            onClick={() => handleOpenTable(tableNum)}
            className="relative group bg-white/5 border-2 border-dashed border-white/10 hover:border-emerald-500/50 hover:bg-emerald-500/5 rounded-[2rem] p-5 transition-all duration-500 hover:shadow-[0_20px_50px_-10px_rgba(16,185,129,0.2)] hover:-translate-y-2 h-44 flex flex-col justify-between items-center text-center disabled:opacity-50 backdrop-blur-sm"
          >
            <div className="flex justify-between w-full items-start relative z-10">
              <span className="text-3xl font-black text-slate-600 group-hover:text-emerald-500/50 transition-colors">T-{tableNum}</span>
              <div className="bg-white/5 text-slate-500 text-[10px] font-black px-2 py-1 rounded-lg border border-white/5 tracking-widest uppercase">Vacant</div>
            </div>
            
            {isLoading ? (
              <div className="flex flex-col items-center animate-in fade-in zoom-in duration-300">
                <Loader2 className="w-10 h-10 text-emerald-500 animate-spin mb-2" />
                <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Provisioning...</span>
              </div>
            ) : (
              <div className="flex flex-col items-center group-hover:scale-110 transition-transform duration-500">
                <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center group-hover:bg-emerald-500/20 group-hover:rotate-12 transition-all duration-500 border border-white/5 group-hover:border-emerald-500/30">
                    <Plus className="w-6 h-6 text-slate-400 group-hover:text-emerald-500 transition-all" />
                </div>
                <span className="text-[10px] font-black text-slate-500 group-hover:text-emerald-500 uppercase tracking-[0.2em] mt-3">Open Table</span>
              </div>
            )}
            
            <div className="w-full relative z-10">
                <div className="h-0.5 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 group-hover:w-full w-0 transition-all duration-700 ease-out"></div>
                </div>
            </div>

            {/* Subtle background T number on hover */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-[0.03] transition-opacity duration-700 pointer-events-none">
                <span className="text-[8rem] font-black text-white">{tableNum}</span>
            </div>
          </button>
        )
      })}
    </div>
  )
}
