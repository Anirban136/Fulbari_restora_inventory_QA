"use client"

import { useState, useMemo } from "react"
import { Layers, Search, Edit3, Trash2, ArrowRight, Package, ClipboardList, Info, LayoutGrid, Store, Warehouse } from "lucide-react"
import { 
  getAggregatedCategories, 
  updateCategoryLabel, 
  deleteCategory 
} from "./actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"

type FilterScope = "ALL" | "CATALOG" | "MENU"

export function CategoryManagerClient({ initialCategories }: { initialCategories: any[] }) {
  const [categories, setCategories] = useState(initialCategories)
  const [searchTerm, setSearchTerm] = useState("")
  const [scope, setScope] = useState<FilterScope>("ALL")
  
  const [isEditing, setIsEditing] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<any>(null)
  const [newLabel, setNewLabel] = useState("")
  const [isDeleting, setIsDeleting] = useState(false)

  const filteredCategories = useMemo(() => {
    return categories.filter(c => {
      const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesScope = 
        scope === "ALL" || 
        (scope === "CATALOG" && c.inventoryCount > 0) ||
        (scope === "MENU" && c.menuCount > 0)
      
      return matchesSearch && matchesScope
    }).sort((a, b) => (b.inventoryCount + b.menuCount) - (a.inventoryCount + a.menuCount))
  }, [categories, searchTerm, scope])

  const stats = useMemo(() => {
    return {
      total: categories.length,
      topCategory: categories[0]?.name || "NONE",
      uncategorizedCount: categories.find(c => c.name === "UNCATEGORIZED")?.inventoryCount || 0
    }
  }, [categories])

  const handleRename = async () => {
    if (!newLabel.trim()) return
    const standardizedNew = newLabel.trim().toUpperCase()
    try {
      toast.loading("Standardizing labels globally...", { id: "category-update" })
      await updateCategoryLabel(selectedCategory.name, standardizedNew)
      
      // Local state update: Fetch fresh normalized data
      const fresh = await getAggregatedCategories()
      setCategories(fresh)
      
      toast.success(`Category standardized to ${standardizedNew}`, { id: "category-update" })
      setIsEditing(false)
      setSelectedCategory(null)
      setNewLabel("")
    } catch (error) {
      toast.error("Failed to update category", { id: "category-update" })
    }
  }

  const handleDelete = async () => {
    try {
      toast.loading("Performing categorical cleanup...", { id: "category-delete" })
      await deleteCategory(selectedCategory.name)
      
      const fresh = await getAggregatedCategories()
      setCategories(fresh)
      
      toast.success("Category cleaned up", { id: "category-delete" })
      setIsDeleting(false)
      setSelectedCategory(null)
    } catch (error) {
      toast.error("Cleanup failed", { id: "category-delete" })
    }
  }

  return (
    <div className="space-y-8 pb-20">
      {/* ELITE STATS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-panel p-6 rounded-3xl border border-white/10 relative overflow-hidden group hover:border-emerald-500/30 transition-all">
           <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl -z-10 group-hover:bg-emerald-500/20 transition-all"></div>
           <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em] mb-3">Audited Classes</p>
           <p className="text-4xl font-black text-white tracking-tighter">{stats.total}</p>
        </div>
        <div className="glass-panel p-6 rounded-3xl border border-white/10 relative overflow-hidden group hover:border-amber-500/30 transition-all">
           <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl -z-10 group-hover:bg-amber-500/20 transition-all"></div>
           <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em] mb-3">Primary Category</p>
           <p className="text-2xl font-black text-amber-500 tracking-tight uppercase truncate">{stats.topCategory}</p>
        </div>
        <div className="glass-panel p-6 rounded-3xl border border-white/10 relative overflow-hidden group hover:border-blue-500/30 transition-all">
           <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -z-10 group-hover:bg-blue-500/20 transition-all"></div>
           <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em] mb-3">Catalog Gaps</p>
           <p className="text-4xl font-black text-blue-400 tracking-tighter">{stats.uncategorizedCount}</p>
        </div>
      </div>

      {/* FILTER BAR: PERSPECTIVE SWITCHING */}
      <div className="flex flex-col lg:flex-row items-center gap-6 justify-between glass-panel p-4 rounded-3xl border border-white/10">
        <div className="flex p-1.5 bg-black/60 rounded-2xl border border-white/5 w-full lg:w-fit group">
           {[
             { id: "ALL", label: "Total Audit", icon: LayoutGrid },
             { id: "CATALOG", label: "Global Catalog", icon: Warehouse },
             { id: "MENU", label: "Outlet Menus", icon: Store },
           ].map((item) => (
             <button
               key={item.id}
               onClick={() => setScope(item.id as FilterScope)}
               className={cn(
                 "flex-1 lg:flex-none px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2",
                 scope === item.id 
                   ? "bg-emerald-500 text-black shadow-lg shadow-emerald-500/20" 
                   : "text-white/40 hover:text-white"
               )}
             >
               <item.icon className="w-4 h-4" />
               <span className="hidden sm:inline">{item.label}</span>
             </button>
           ))}
        </div>

        <div className="relative w-full lg:max-w-md">
           <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
           <Input 
             placeholder="Search classifications..." 
             value={searchTerm}
             onChange={e => setSearchTerm(e.target.value)}
             className="h-14 pl-12 bg-black/40 border-white/5 rounded-2xl text-[10px] font-black uppercase tracking-widest placeholder:text-white/10 focus-visible:ring-emerald-500/30"
           />
        </div>
      </div>

      {/* CATEGORY LEDGER */}
      <div className="grid grid-cols-1 gap-4">
        {filteredCategories.length === 0 ? (
          <div className="py-20 text-center opacity-30">
             <div className="flex justify-center mb-6"><Search className="w-16 h-16" /></div>
             <p className="text-sm font-black uppercase tracking-[0.5em]">No matching classifications found</p>
          </div>
        ) : (
          filteredCategories.map((cat) => (
            <div key={cat.name} className="glass-panel p-6 rounded-[2rem] border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-all flex flex-col md:flex-row md:items-center justify-between gap-6 group">
              <div className="flex items-center gap-6">
                 <div className="h-16 w-16 rounded-[1.25rem] bg-zinc-900 border border-white/10 flex items-center justify-center text-emerald-500 group-hover:scale-110 transition-transform shadow-inner">
                    <Layers className="w-7 h-7" />
                 </div>
                 <div>
                    <h4 className="text-2xl font-black text-white tracking-tighter uppercase">{cat.name}</h4>
                    <div className="flex items-center gap-4 mt-3">
                       <span className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-[0.2em] text-emerald-400 bg-emerald-500/5 px-3 py-1.5 rounded-lg border border-emerald-500/10">
                          <Warehouse className="w-3.5 h-3.5 opacity-60" /> {cat.inventoryCount} Catalog Items
                       </span>
                       <span className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-[0.2em] text-teal-400 bg-teal-400/5 px-3 py-1.5 rounded-lg border border-teal-500/10">
                          <Store className="w-3.5 h-3.5 opacity-60" /> {cat.menuCount} Menu Entries
                       </span>
                    </div>
                 </div>
              </div>

              <div className="flex items-center gap-3 pl-0 md:pl-6 border-l-0 md:border-l border-white/10 shrink-0">
                 <Button 
                   variant="ghost" 
                   size="icon" 
                   onClick={() => {
                     setSelectedCategory(cat)
                     setNewLabel(cat.name)
                     setIsEditing(true)
                   }}
                   className="h-12 w-12 rounded-2xl hover:bg-white/10 text-white/40 hover:text-white transition-all active:scale-90"
                 >
                    <Edit3 className="w-6 h-6" />
                 </Button>
                 <Button 
                   variant="ghost" 
                   size="icon" 
                   onClick={() => {
                     setSelectedCategory(cat)
                     setIsDeleting(true)
                   }}
                   className="h-12 w-12 rounded-2xl hover:bg-red-500/10 text-white/40 hover:text-red-500 transition-all active:scale-90"
                 >
                    <Trash2 className="w-6 h-6" />
                 </Button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* RENAME DIALOG (Standardizing to UPPERCASE) */}
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
         <DialogContent className="glass-panel border-white/10 rounded-[2.5rem] bg-zinc-950/90 backdrop-blur-3xl text-white max-w-md">
            <DialogHeader>
               <DialogTitle className="text-2xl font-black tracking-tighter flex items-center gap-3 uppercase">
                  <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                     <Edit3 className="w-5 h-5" />
                  </div>
                  Standardize Identity
               </DialogTitle>
            </DialogHeader>
            <div className="space-y-6 py-4">
               <div className="p-4 rounded-2xl bg-white/5 border border-white/5 text-[10px] uppercase font-bold text-white/40 tracking-widest">
                  Current Name: <span className="text-white ml-2">{selectedCategory?.name}</span>
               </div>
               <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 ml-1">New Global Identity</label>
                  <Input 
                    value={newLabel}
                    onChange={e => setNewLabel(e.target.value)}
                    className="h-14 bg-black/40 border-white/10 rounded-2xl text-base font-black tracking-tight uppercase"
                    placeholder="E.G. BEVERAGES"
                  />
               </div>
               <div className="flex items-start gap-4 p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 text-[10px] text-emerald-400 font-bold leading-relaxed uppercase tracking-widest">
                  <Info className="w-4 h-4 shrink-0" />
                  Updating will synchronize all {selectedCategory?.inventoryCount + selectedCategory?.menuCount} catalog items and menu entries instantly.
               </div>
            </div>
            <DialogFooter className="gap-3">
               <Button variant="ghost" className="rounded-2xl h-12 text-white/40 font-black uppercase tracking-widest" onClick={() => setIsEditing(false)}>Cancel</Button>
               <Button className="rounded-2xl h-12 bg-emerald-500 hover:bg-emerald-600 text-black font-black uppercase tracking-widest px-8 shadow-xl shadow-emerald-500/20 active:scale-95 transition-all" onClick={handleRename}>Verify & Standardization</Button>
            </DialogFooter>
         </DialogContent>
      </Dialog>

      {/* DELETE DIALOG */}
      <Dialog open={isDeleting} onOpenChange={setIsDeleting}>
         <DialogContent className="glass-panel border-white/10 rounded-[2.5rem] bg-zinc-950/90 backdrop-blur-3xl text-white max-w-md">
            <DialogHeader>
               <DialogTitle className="text-2xl font-black tracking-tighter flex items-center gap-3 uppercase text-red-500">
                  <div className="h-10 w-10 rounded-xl bg-red-500/10 flex items-center justify-center text-red-500">
                     <Trash2 className="w-5 h-5" />
                  </div>
                  Cleanse Catalog
               </DialogTitle>
            </DialogHeader>
            <div className="space-y-6 py-4 text-center">
               <p className="text-zinc-400 font-medium tracking-tight">Are you ready to dissolve <span className="text-white font-black underline decoration-red-500/50 decoration-4">"{selectedCategory?.name}"</span>?</p>
               <div className="p-5 rounded-2xl bg-red-500/5 border border-red-500/20 text-[10px] text-red-400 font-black leading-relaxed uppercase tracking-[0.15em]">
                  ALL {selectedCategory?.inventoryCount + selectedCategory?.menuCount} ASSOCIATED ITEMS WILL BE RECLASSIFIED AS "UNCATEGORIZED".
               </div>
            </div>
            <DialogFooter className="gap-3 sm:justify-center">
               <Button variant="ghost" className="rounded-2xl h-12 text-white/40 font-black uppercase tracking-widest" onClick={() => setIsDeleting(false)}>Abort Cleanup</Button>
               <Button className="rounded-2xl h-12 bg-red-500 hover:bg-red-600 text-white font-black uppercase tracking-widest px-8 shadow-xl shadow-red-500/20 active:scale-95 transition-all" onClick={handleDelete}>Confirm Dissolution</Button>
            </DialogFooter>
         </DialogContent>
      </Dialog>
    </div>
  )
}
