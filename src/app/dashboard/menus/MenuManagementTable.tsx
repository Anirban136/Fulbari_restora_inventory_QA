"use client"

import { useState } from "react"
import { Search, Trash2, Coffee, Utensils, LayoutGrid } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { EditMenuItemDialog } from "./EditMenuItemDialog"
import { toggleMenuItem, deleteMenuItem } from "./actions"
import { cn } from "@/lib/utils"

export function MenuManagementTable({
  menuItems,
  outlets,
  globalItems,
  existingCategories,
}: {
  menuItems: any[]
  outlets: any[]
  globalItems: any[]
  existingCategories: string[]
}) {
  const [outletFilter, setOutletFilter] = useState<'ALL' | 'CAFE' | 'CHAI_JOINT'>('ALL')
  const [searchQuery, setSearchQuery] = useState("")

  const filteredMenuItems = menuItems.filter((item) => {
    const matchesOutlet = 
      outletFilter === 'ALL' || 
      (outletFilter === 'CAFE' && item.Outlet.type === 'CAFE') ||
      (outletFilter === 'CHAI_JOINT' && item.Outlet.type === 'CHAI_JOINT')
    
    const matchesSearch = 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.categoryId || "").toLowerCase().includes(searchQuery.toLowerCase())

    return matchesOutlet && matchesSearch
  })

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* FILTER BAR */}
      <div className="p-6 bg-muted/10 border-b border-border/10 flex flex-col sm:flex-row gap-4 sm:items-center justify-between sticky top-0 z-30 backdrop-blur-3xl">
        <div className="flex p-1 bg-black/40 rounded-2xl border border-white/5 w-fit">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setOutletFilter('ALL')}
            className={cn(
              "rounded-xl h-10 px-5 text-[10px] font-black uppercase tracking-widest transition-all gap-2",
              outletFilter === 'ALL' ? "bg-white text-black hover:bg-white" : "text-muted-foreground hover:text-white"
            )}
          >
            <LayoutGrid className="w-3.5 h-3.5" /> ALL View
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setOutletFilter('CAFE')}
            className={cn(
              "rounded-xl h-10 px-5 text-[10px] font-black uppercase tracking-widest transition-all gap-2",
              outletFilter === 'CAFE' ? "bg-amber-500 text-white hover:bg-amber-500" : "text-muted-foreground hover:text-white"
            )}
          >
            <Utensils className="w-3.5 h-3.5" /> Cafe Menu
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setOutletFilter('CHAI_JOINT')}
            className={cn(
              "rounded-xl h-10 px-5 text-[10px] font-black uppercase tracking-widest transition-all gap-2",
              outletFilter === 'CHAI_JOINT' ? "bg-blue-500 text-white hover:bg-blue-500" : "text-muted-foreground hover:text-white"
            )}
          >
            <Coffee className="w-3.5 h-3.5" /> Chai Joint
          </Button>
        </div>

        <div className="relative group w-full sm:w-64">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-indigo-400 transition-colors" />
          <Input 
            placeholder="Search item or category..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-12 pl-11 bg-black/40 border-white/10 rounded-2xl focus-visible:ring-indigo-500/50 text-xs font-bold uppercase tracking-widest"
          />
        </div>
      </div>

      <div className="flex-1 overflow-auto max-h-[700px]">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-border/10 hover:bg-transparent">
              <TableHead className="font-bold text-muted-foreground uppercase tracking-widest text-[10px] h-14 bg-muted/20 dark:bg-black/40 backdrop-blur-md sticky top-0 z-20">Outlet</TableHead>
              <TableHead className="font-bold text-muted-foreground uppercase tracking-widest text-[10px] h-14 bg-muted/20 dark:bg-black/40 backdrop-blur-md sticky top-0 z-20">Item Name</TableHead>
              <TableHead className="font-bold text-muted-foreground uppercase tracking-widest text-[10px] h-14 bg-muted/20 dark:bg-black/40 backdrop-blur-md sticky top-0 z-20">Category</TableHead>
              <TableHead className="font-bold text-muted-foreground uppercase tracking-widest text-[10px] h-14 bg-muted/20 dark:bg-black/40 backdrop-blur-md sticky top-0 z-20 text-right">Price</TableHead>
              <TableHead className="font-bold text-muted-foreground uppercase tracking-widest text-[10px] h-14 bg-muted/20 dark:bg-black/40 backdrop-blur-md sticky top-0 z-20 text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredMenuItems.length === 0 ? (
              <TableRow className="border-b border-white/10 hover:bg-transparent">
                <TableCell colSpan={5} className="h-40 text-center text-slate-500">
                  <span className="flex flex-col items-center justify-center">
                    <Search className="w-8 h-8 opacity-20 mb-2" />
                    No matching menu items found.
                  </span>
                </TableCell>
              </TableRow>
            ) : (
              filteredMenuItems.map((menuItem: any) => (
                <TableRow key={menuItem.id} className={`border-b border-border/5 hover:bg-muted/5 transition-colors group ${!menuItem.isAvailable ? "opacity-40 grayscale" : ""}`}>
                  <TableCell className="font-medium text-muted-foreground tracking-wide uppercase text-[10px]">
                    <span className={cn(
                      "px-2 py-0.5 rounded-md font-black tracking-tighter",
                      menuItem.Outlet.type === 'CAFE' ? "bg-amber-500/10 text-amber-500/80" : "bg-blue-500/10 text-blue-500/80"
                    )}>
                      {menuItem.Outlet.name}
                    </span>
                  </TableCell>
                  <TableCell className="font-bold text-foreground/90 text-base">{menuItem.name}</TableCell>
                  <TableCell className="text-muted-foreground font-black text-[10px] tracking-widest uppercase">{menuItem.categoryId}</TableCell>
                  <TableCell className="text-right">
                    <span className="inline-flex items-center text-emerald-600 dark:text-emerald-400 font-black text-lg">
                      ₹{menuItem.price.toFixed(2)}
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-2">
                      <EditMenuItemDialog menuItem={menuItem} outlets={outlets} globalItems={globalItems} existingCategories={existingCategories} />
                      <form action={toggleMenuItem.bind(null, menuItem.id, menuItem.isAvailable)}>
                        <Button 
                          type="submit" 
                          variant="outline" 
                          size="sm" 
                          className={`h-8 px-4 text-xs font-bold tracking-widest uppercase rounded-lg transition-all ${menuItem.isAvailable ? "border-indigo-500/30 bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20" : "border-white/10 text-slate-500 hover:bg-white/10 hover:text-white"}`}
                        >
                          {menuItem.isAvailable ? "Active" : "OOS"}
                        </Button>
                      </form>
                      <Dialog>
                        <DialogTrigger>
                          <div className="flex h-8 w-8 items-center justify-center text-red-500/70 hover:text-red-400 hover:bg-red-500/10 rounded-lg cursor-pointer">
                            <Trash2 className="h-4 w-4" />
                          </div>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[400px] bg-background backdrop-blur-2xl border-border rounded-3xl shadow-[0_0_50px_rgba(239,68,68,0.1)]">
                          <DialogHeader className="mb-2">
                            <div className="w-12 h-12 bg-red-500/10 rounded-2xl flex items-center justify-center mb-4 border border-red-500/20">
                              <Trash2 className="w-6 h-6 text-red-500 dark:text-red-400" />
                            </div>
                            <DialogTitle className="text-xl font-black text-foreground">Delete Menu Item?</DialogTitle>
                            <DialogDescription className="text-muted-foreground leading-relaxed">
                              Are you sure you want to delete <span className="text-foreground font-bold">{menuItem.name}</span> from the {menuItem.Outlet.name} menu? This action cannot be undone.
                            </DialogDescription>
                          </DialogHeader>
                          <form action={deleteMenuItem.bind(null, menuItem.id)} className="mt-4">
                            <Button type="submit" variant="destructive" className="w-full h-11 font-bold rounded-xl transition-all active:scale-95">
                              Yes, Delete Item
                            </Button>
                          </form>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
