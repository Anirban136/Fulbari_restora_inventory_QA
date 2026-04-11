"use client"

import { useState } from "react"
import { 
  StoreIcon, 
  Search, 
  History, 
  TrendingDown, 
  ChevronRight, 
  LayoutGrid, 
  PlusCircle 
} from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { AdjustStockForm } from "./AdjustStockForm"
import { cn } from "@/lib/utils"

export function OutletStockClient({ 
  outlets, 
  recentConsumptions 
}: { 
  outlets: any[], 
  recentConsumptions: any[] 
}) {
  const [selectedOutletId, setSelectedOutletId] = useState(outlets[0]?.id || "")
  const [isAdjustOpen, setIsAdjustOpen] = useState(false)

  const selectedOutlet = outlets.find(o => o.id === selectedOutletId)

  return (
    <div className="space-y-8 pb-20 max-w-[1400px] mx-auto animate-in fade-in duration-700">
      {/* 1. HEADER SECTION */}
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 glass-panel p-6 lg:p-10 rounded-[2.5rem] border border-white/5 bg-white/[0.01] backdrop-blur-xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-purple-500/20 to-transparent"></div>
        <div className="relative z-10">
          <h1 className="text-3xl lg:text-5xl font-black text-white tracking-tighter flex items-center gap-4">
            Outlet Inventory
            <span className="px-3 py-1 bg-purple-500/20 text-purple-400 text-[10px] font-black uppercase tracking-[0.3em] rounded-lg border border-purple-500/30">
              Live
            </span>
          </h1>
          <p className="text-muted-foreground mt-3 font-medium text-xs lg:text-sm tracking-wide uppercase opacity-60">
            Select an outlet to manage its stock levels.
          </p>
        </div>

        {/* Adjust Stock Button (Triggers Dialog) */}
        <Dialog open={isAdjustOpen} onOpenChange={setIsAdjustOpen}>
          <DialogTrigger
            render={
              <button className="flex items-center gap-3 px-8 py-4 bg-purple-600 hover:bg-purple-500 text-white rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-[0_10px_40px_-10px_rgba(168,85,247,0.5)] transition-all active:scale-95 group">
                <PlusCircle className="w-5 h-5 transition-transform group-hover:rotate-90 duration-300" />
                Adjust Stock
              </button>
            }
          />
          <DialogContent className="max-w-2xl bg-[#09090b] border-white/5 p-0 overflow-hidden rounded-[2rem]">
            <AdjustStockForm 
              outlets={outlets} 
              onSuccess={() => setIsAdjustOpen(false)} 
            />
          </DialogContent>
        </Dialog>
      </header>

      {/* 2. TAB NAVIGATION */}
      <nav className="flex items-center gap-2 p-2 bg-white/5 rounded-3xl border border-white/5 backdrop-blur-md overflow-x-auto no-scrollbar">
        {outlets.map((outlet) => (
          <button
            key={outlet.id}
            onClick={() => setSelectedOutletId(outlet.id)}
            className={cn(
              "px-6 py-4 rounded-2xl text-[10px] lg:text-[11px] font-black uppercase tracking-[0.2em] transition-all whitespace-nowrap flex items-center gap-3 relative overflow-hidden group",
              selectedOutletId === outlet.id 
                ? "text-white bg-purple-600/20 border border-purple-500/30 shadow-[0_0_20px_rgba(168,85,247,0.2)]" 
                : "text-muted-foreground hover:text-white hover:bg-white/5 border border-transparent"
            )}
          >
            {selectedOutletId === outlet.id && (
              <span className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-transparent to-transparent animate-pulse"></span>
            )}
            <StoreIcon className={cn("w-4 h-4", selectedOutletId === outlet.id ? "text-purple-400" : "text-muted-foreground")} />
            {outlet.name}
          </button>
        ))}
      </nav>

      {/* 3. SELECTED OUTLET STOCK VIEW */}
      <main className="animate-in slide-in-from-bottom-4 duration-500 delay-150">
        {selectedOutlet ? (
          <section className="glass-panel rounded-[2.5rem] overflow-hidden flex flex-col border border-white/5 bg-white/[0.01]">
            <div className="bg-white/[0.03] px-8 py-6 border-b border-white/5 flex justify-between items-center backdrop-blur-md relative">
              <div className="flex items-center gap-4">
                 <div className="p-3 bg-purple-500/10 rounded-2xl">
                    <LayoutGrid className="w-6 h-6 text-purple-400" />
                 </div>
                 <div>
                    <h2 className="text-2xl font-black text-white tracking-tight uppercase">{selectedOutlet.name}</h2>
                    <p className="text-[10px] text-purple-400 font-black tracking-widest uppercase opacity-80">{selectedOutlet.type}</p>
                 </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block mb-1">Total Items</span>
                <span className="text-2xl font-black text-white">{selectedOutlet.Stock.length}</span>
              </div>
            </div>

            <div className="p-0 overflow-auto custom-scrollbar-premium max-h-[600px]">
              <Table>
                <TableHeader className="sticky top-0 z-10 bg-[#09090b]/80 backdrop-blur-3xl shadow-sm">
                  <TableRow className="border-b border-white/5 hover:bg-transparent">
                    <TableHead className="font-black text-muted-foreground/40 uppercase tracking-[0.3em] text-[10px] h-14 px-10 border-r border-white/5">Item Detail</TableHead>
                    <TableHead className="font-black text-muted-foreground/40 uppercase tracking-[0.3em] text-[10px] h-14 px-10 text-right">Current Stock</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedOutlet.Stock.length === 0 ? (
                    <TableRow className="hover:bg-transparent">
                      <TableCell colSpan={2} className="text-center py-32">
                        <div className="flex flex-col items-center justify-center space-y-4 opacity-10">
                          <Search className="w-16 h-16" />
                          <p className="font-black uppercase tracking-[0.5em] text-xs">Stock Catalog Empty</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    selectedOutlet.Stock.map((stock: any) => (
                      <TableRow key={stock.id} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors group/row">
                        <TableCell className="px-10 py-6 border-r border-white/[0.03]">
                          <div className="flex flex-col gap-1">
                             <span className="text-sm font-black text-white/90 uppercase tracking-tight group-hover/row:text-purple-400 transition-colors">
                               {stock.Item.name}
                             </span>
                             <span className="text-[9px] font-bold text-muted-foreground/40 uppercase tracking-widest">
                               {stock.Item.category || "General"}
                             </span>
                          </div>
                        </TableCell>
                        <TableCell className="px-10 py-6 text-right">
                           <div className={cn(
                             "inline-flex flex-col items-end px-5 py-3 rounded-2xl font-black tracking-widest shadow-inner transition-all",
                             stock.quantity <= (stock.Item.minStock || 0) 
                               ? "bg-red-500/10 border border-red-500/20 text-red-500" 
                               : "bg-white/5 border border-white/10 text-white group-hover/row:border-purple-500/30"
                           )}>
                             <span className="text-base font-black tracking-tighter">
                               {stock.quantity} <span className="text-[10px] ml-1 opacity-50 uppercase">{stock.Item.piecesPerBox ? 'pcs' : stock.Item.unit}</span>
                             </span>
                             {stock.Item.piecesPerBox && (
                               <span className="text-[9px] opacity-30 font-bold uppercase tracking-tighter mt-1">
                                 ({(stock.quantity / stock.Item.piecesPerBox).toFixed(1)} {stock.Item.unit})
                               </span>
                             )}
                           </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </section>
        ) : (
          <div className="glass-panel text-center py-32 rounded-[2.5rem] opacity-20">
             <StoreIcon className="w-16 h-16 mx-auto mb-4" />
             <p className="font-black uppercase tracking-[0.3em]">Select an outlet above</p>
          </div>
        )}
      </main>

      {/* 4. RECENT ACTIVITY (FOOTER) */}
      <section className="space-y-6">
        <div className="flex items-center justify-between px-4">
           <div className="flex items-center gap-3">
             <div className="p-2 bg-purple-500/10 rounded-xl border border-purple-500/20">
               <History className="w-4 h-4 text-purple-400" />
             </div>
             <h3 className="text-xl font-black text-white tracking-tight uppercase">Recent Stock Changes</h3>
           </div>
           <div className="h-px flex-1 bg-white/5 mx-6"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recentConsumptions.length === 0 ? (
            <div className="col-span-full py-12 text-center glass-panel rounded-3xl opacity-20 uppercase tracking-widest text-[10px] font-black">
              No recent history found
            </div>
          ) : (
            recentConsumptions.map(entry => (
              <div key={entry.id} className="glass-panel p-6 rounded-3xl border border-white/5 hover:bg-white/[0.04] transition-all group flex items-center justify-between relative overflow-hidden">
                <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-purple-500/5 to-transparent"></div>
                <div className="flex flex-col gap-2 relative z-10">
                  <span className="text-xs font-black text-white uppercase group-hover:text-purple-400 transition-colors">{entry.Item.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-black text-muted-foreground uppercase opacity-60 bg-white/5 px-2 py-0.5 rounded-md border border-white/5">{entry.Outlet?.name}</span>
                    <span className="text-[8px] font-bold text-muted-foreground/40">{new Date(entry.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="text-right items-end flex flex-col relative z-10">
                   <span className={cn(
                     "text-lg font-black tracking-tighter",
                     entry.type === 'CONSUMPTION' ? "text-red-400" : "text-emerald-400"
                   )}>
                    {entry.type === 'CONSUMPTION' ? '-' : '+'}{entry.quantity}
                   </span>
                   <span className="text-[8px] font-black uppercase text-muted-foreground/30 px-2 py-0.5 border border-white/5 rounded-md">{entry.type}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  )
}
