"use client"

import { useState, useMemo } from "react"
import { Layers, Search, Edit3, Trash2, ArrowRight, Package, ClipboardList, Info } from "lucide-react"
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

export function CategoryManagerClient({ initialCategories }: { initialCategories: any[] }) {
  const [categories, setCategories] = useState(initialCategories)
  const [searchTerm, setSearchTerm] = useState("")
  const [isEditing, setIsEditing] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<any>(null)
  const [newLabel, setNewLabel] = useState("")
  const [isDeleting, setIsDeleting] = useState(false)

  const filteredCategories = useMemo(() => {
    return categories.filter(c => 
      c.name.toLowerCase().includes(searchTerm.toLowerCase())
    ).sort((a, b) => (b.inventoryCount + b.menuCount) - (a.inventoryCount + a.menuCount))
  }, [categories, searchTerm])

  const stats = useMemo(() => {
    return {
      total: categories.length,
      topCategory: categories.sort((a, b) => (b.inventoryCount + b.menuCount) - (a.inventoryCount + a.menuCount))[0]?.name || "None",
      uncategorizedCount: categories.find(c => c.name === "Uncategorized")?.inventoryCount || 0
    }
  }, [categories])

  const handleRename = async () => {
    if (!newLabel.trim()) return
    try {
      toast.loading("Updating category globally...", { id: "category-update" })
      await updateCategoryLabel(selectedCategory.name, newLabel.trim())
      
      // Local state update
      const updated = categories.map(c => {
        if (c.name === selectedCategory.name) return { ...c, name: newLabel.trim() }
        return c
      })
      setCategories(updated)
      
      toast.success(`Category renamed to ${newLabel}`, { id: "category-update" })
      setIsEditing(false)
      setSelectedCategory(null)
      setNewLabel("")
    } catch (error) {
      toast.error("Failed to rename category", { id: "category-update" })
    }
  }

  const handleDelete = async () => {
    try {
      toast.loading("Cleaning up category...", { id: "category-delete" })
      await deleteCategory(selectedCategory.name)
      
      // Local state update: either remove or reset to Uncategorized logic
      const fresh = await getAggregatedCategories()
      setCategories(fresh)
      
      toast.success("Category cleaned up", { id: "category-delete" })
      setIsDeleting(false)
      setSelectedCategory(null)
    } catch (error) {
      toast.error("Failed to delete category", { id: "category-delete" })
    }
  }

  return (
    <div className="space-y-8 pb-20">
      {/* ELITE STATS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-panel p-6 rounded-3xl border border-white/10 relative overflow-hidden group">
           <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl -z-10 group-hover:bg-emerald-500/20 transition-all"></div>
           <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em] mb-3">Unique Categories</p>
           <p className="text-4xl font-black text-white tracking-tighter">{stats.total}</p>
        </div>
        <div className="glass-panel p-6 rounded-3xl border border-white/10 relative overflow-hidden group">
           <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl -z-10 group-hover:bg-amber-500/20 transition-all"></div>
           <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em] mb-3">Dominant Category</p>
           <p className="text-2xl font-black text-amber-500 tracking-tight uppercase truncate">{stats.topCategory}</p>
        </div>
        <div className="glass-panel p-6 rounded-3xl border border-white/10 relative overflow-hidden group">
           <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -z-10 group-hover:bg-blue-500/20 transition-all"></div>
           <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em] mb-3">Uncategorized Items</p>
           <p className="text-4xl font-black text-blue-400 tracking-tighter">{stats.uncategorizedCount}</p>
        </div>
      </div>

      {/* SEARCH AND FILTER BAR */}
      <div className="glass-panel p-4 rounded-2xl border border-white/10 flex items-center justify-between">
        <div className="relative flex-1 max-w-md">
           <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
           <Input 
             placeholder="Search classifications..." 
             value={searchTerm}
             onChange={e => setSearchTerm(e.target.value)}
             className="h-12 pl-12 bg-black/40 border-white/5 rounded-xl text-xs font-black uppercase tracking-widest placeholder:text-white/10"
           />
        </div>
      </div>

      {/* CATEGORY LEDGER */}
      <div className="grid grid-cols-1 gap-4">
        {filteredCategories.map((cat) => (
          <div key={cat.name} className="glass-panel p-6 rounded-3xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-all flex flex-col md:flex-row md:items-center justify-between gap-6 group">
            <div className="flex items-center gap-6">
               <div className="h-14 w-14 rounded-2xl bg-zinc-900 border border-white/10 flex items-center justify-center text-emerald-500 group-hover:scale-110 transition-transform">
                  <Layers className="w-6 h-6" />
               </div>
               <div>
                  <h4 className="text-xl font-black text-white tracking-tight">{cat.name}</h4>
                  <div className="flex items-center gap-4 mt-2">
                     <span className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-emerald-500/60 bg-emerald-500/5 px-2 py-1 rounded-lg">
                        <Package className="w-3 h-3" /> {cat.inventoryCount} Inventory
                     </span>
                     <span className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-teal-400/60 bg-teal-400/5 px-2 py-1 rounded-lg">
                        <ClipboardList className="w-3 h-3" /> {cat.menuCount} Menu Items
                     </span>
                  </div>
               </div>
            </div>

            <div className="flex items-center gap-3 pl-4 border-l border-white/10 shrink-0">
               <Button 
                 variant="ghost" 
                 size="icon" 
                 onClick={() => {
                   setSelectedCategory(cat)
                   setNewLabel(cat.name)
                   setIsEditing(true)
                 }}
                 className="rounded-xl hover:bg-white/10 text-white/40 hover:text-white transition-all"
               >
                  <Edit3 className="w-5 h-5" />
               </Button>
               <Button 
                 variant="ghost" 
                 size="icon" 
                 onClick={() => {
                   setSelectedCategory(cat)
                   setIsDeleting(true)
                 }}
                 className="rounded-xl hover:bg-red-500/10 text-white/40 hover:text-red-500 transition-all"
               >
                  <Trash2 className="w-5 h-5" />
               </Button>
            </div>
          </div>
        ))}
      </div>

      {/* RENAME DIALOG */}
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
         <DialogContent className="glass-panel border-white/10 rounded-[2.5rem] bg-zinc-950/90 backdrop-blur-3xl text-white max-w-md">
            <DialogHeader>
               <DialogTitle className="text-2xl font-black tracking-tight flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                     <Edit3 className="w-5 h-5" />
                  </div>
                  Global Refinement
               </DialogTitle>
            </DialogHeader>
            <div className="space-y-6 py-4">
               <div className="p-4 rounded-2xl bg-white/5 border border-white/5 text-[10px] uppercase font-bold text-white/40 tracking-widest">
                  Old Identity: <span className="text-white ml-2">{selectedCategory?.name}</span>
               </div>
               <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 ml-1">New Identity Name</label>
                  <Input 
                    value={newLabel}
                    onChange={e => setNewLabel(e.target.value)}
                    className="h-14 bg-black/40 border-white/10 rounded-2xl text-base font-black tracking-tight"
                  />
               </div>
               <div className="flex items-start gap-4 p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 text-[10px] text-emerald-400 font-bold leading-relaxed uppercase tracking-widest">
                  <Info className="w-4 h-4 shrink-0" />
                  This action will update all {selectedCategory?.inventoryCount + selectedCategory?.menuCount} items globally to this new category name.
               </div>
            </div>
            <DialogFooter className="gap-3">
               <Button variant="ghost" className="rounded-2xl h-12 text-white/40 font-black uppercase tracking-widest" onClick={() => setIsEditing(false)}>Cancel</Button>
               <Button className="rounded-2xl h-12 bg-emerald-500 hover:bg-emerald-600 text-black font-black uppercase tracking-widest px-8 shadow-xl shadow-emerald-500/20" onClick={handleRename}>Update Globally</Button>
            </DialogFooter>
         </DialogContent>
      </Dialog>

      {/* DELETE DIALOG */}
      <Dialog open={isDeleting} onOpenChange={setIsDeleting}>
         <DialogContent className="glass-panel border-white/10 rounded-[2.5rem] bg-zinc-950/90 backdrop-blur-3xl text-white max-w-md">
            <DialogHeader>
               <DialogTitle className="text-2xl font-black tracking-tight flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-red-500/10 flex items-center justify-center text-red-500">
                     <Trash2 className="w-5 h-5" />
                  </div>
                  Categorical Cleanup
               </DialogTitle>
            </DialogHeader>
            <div className="space-y-6 py-4 text-center">
               <p className="text-zinc-400 font-medium">Are you sure you want to remove <span className="text-white font-black underline decoration-red-500/50 decoration-4">"{selectedCategory?.name}"</span>?</p>
               <div className="p-5 rounded-2xl bg-red-500/5 border border-red-500/20 text-[10px] text-red-400 font-bold leading-relaxed uppercase tracking-[0.1em]">
                  ALL {selectedCategory?.inventoryCount + selectedCategory?.menuCount} ITEMS UNDER THIS CATEGORY WILL BE MOVED TO "UNCATEGORIZED".
               </div>
            </div>
            <DialogFooter className="gap-3 sm:justify-center">
               <Button variant="ghost" className="rounded-2xl h-12 text-white/40 font-black uppercase tracking-widest" onClick={() => setIsDeleting(false)}>Keep Category</Button>
               <Button className="rounded-2xl h-12 bg-red-500 hover:bg-red-600 text-white font-black uppercase tracking-widest px-8 shadow-xl shadow-red-500/20" onClick={handleDelete}>Perform Cleanup</Button>
            </DialogFooter>
         </DialogContent>
      </Dialog>
    </div>
  )
}
