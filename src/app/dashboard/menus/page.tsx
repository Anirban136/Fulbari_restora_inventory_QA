import { prisma } from "@/lib/prisma"
export const dynamic = 'force-dynamic'
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { addMenuItem, toggleMenuItem, deleteMenuItem } from "./actions"
import { MenuSquare, Settings2, Search, Trash2 } from "lucide-react"
import { EditMenuItemDialog } from "./EditMenuItemDialog"
import { AddMenuItemForm } from "./AddMenuItemForm"
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

export default async function MenusPage() {
  const outlets = await prisma.outlet.findMany({
    where: { type: { in: ["CAFE", "CHAI_JOINT"] } },
    orderBy: { name: 'asc' }
  })
  
  const menuItems = await prisma.menuItem.findMany({
    include: { Outlet: true },
    orderBy: [ { Outlet: { name: 'asc' } }, { categoryId: 'asc' }, { name: 'asc' } ]
  })

  const globalItems = await prisma.item.findMany({ orderBy: { name: 'asc' } })

  const existingCategories = Array.from(new Set(menuItems.map((item: any) => item.categoryId).filter(Boolean)))

  return (
    <div className="space-y-8 relative">
      <div className="absolute top-[30%] left-[80%] w-[400px] h-[400px] bg-indigo-500/10 rounded-full blur-[130px] pointer-events-none -translate-x-1/2"></div>
      
      <div className="glass-panel p-6 rounded-3xl relative z-10 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
            Menu Management
            <div className="h-2 w-2 rounded-full bg-indigo-500 shadow-[0_0_10px_#6366f1]"></div>
          </h2>
          <p className="text-muted-foreground mt-1 font-medium text-sm tracking-wide uppercase">Configure pricing and establish POS menus for the Cafe and Chai Joint.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 relative z-10">
        
        {/* ADD MENU FORM */}
        <div className="xl:col-span-1 glass-panel p-8 rounded-3xl self-start hover:border-white/20 transition-all">
          <div className="flex items-center gap-4 mb-8">
             <div className="h-12 w-12 bg-indigo-500/20 rounded-2xl flex items-center justify-center border border-indigo-500/30 shadow-[0_0_15px_-3px_rgba(99,102,241,0.3)]">
               <MenuSquare className="w-6 h-6 text-indigo-400" />
             </div>
             <h3 className="text-xl font-bold text-white">Add Menu Item</h3>
          </div>
          
          <AddMenuItemForm outlets={outlets} globalItems={globalItems} />
        </div>

        {/* MENU LIST */}
        <div className="xl:col-span-2 glass-panel rounded-3xl overflow-hidden flex flex-col">
          <div className="p-0 flex-1 overflow-auto max-h-[700px]">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-white/10 hover:bg-transparent">
                  <TableHead className="font-bold text-slate-400 uppercase tracking-widest text-xs h-14 bg-black/40 backdrop-blur-md sticky top-0 z-20">Outlet</TableHead>
                  <TableHead className="font-bold text-slate-400 uppercase tracking-widest text-xs h-14 bg-black/40 backdrop-blur-md sticky top-0 z-20">Item Name</TableHead>
                  <TableHead className="font-bold text-slate-400 uppercase tracking-widest text-xs h-14 bg-black/40 backdrop-blur-md sticky top-0 z-20">Category</TableHead>
                  <TableHead className="font-bold text-slate-400 uppercase tracking-widest text-xs h-14 bg-black/40 backdrop-blur-md sticky top-0 z-20 text-right">Price</TableHead>
                  <TableHead className="font-bold text-slate-400 uppercase tracking-widest text-xs h-14 bg-black/40 backdrop-blur-md sticky top-0 z-20 text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                 {menuItems.length === 0 ? (
                  <TableRow className="border-b border-white/10">
                    <TableCell colSpan={5} className="h-40 text-center text-slate-500">
                      <span className="flex flex-col items-center justify-center">
                        <Search className="w-8 h-8 opacity-20 mb-2" />
                        No menu items configured yet.
                      </span>
                    </TableCell>
                  </TableRow>
                 ) : (
                  menuItems.map((menuItem: any) => (
                    <TableRow key={menuItem.id} className={`border-b border-white/5 hover:bg-white/5 transition-colors group ${!menuItem.isAvailable ? "opacity-40 grayscale" : ""}`}>
                      <TableCell className="font-medium text-slate-400 tracking-wide uppercase text-xs">{menuItem.Outlet.name}</TableCell>
                      <TableCell className="font-bold text-slate-200 text-base">{menuItem.name}</TableCell>
                      <TableCell className="text-slate-500 font-medium text-sm tracking-wide">{menuItem.categoryId}</TableCell>
                      <TableCell className="text-right">
                         <span className="inline-flex items-center text-emerald-400 font-black text-lg drop-shadow-[0_0_8px_rgba(52,211,153,0.3)]">
                           ₹{menuItem.price.toFixed(2)}
                         </span>
                      </TableCell>
                      <TableCell className="text-center">
                         <div className="flex items-center justify-center gap-2">
                           <EditMenuItemDialog menuItem={menuItem} outlets={outlets} globalItems={globalItems} existingCategories={existingCategories as string[]} />
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
                             <DialogContent className="sm:max-w-[400px] bg-black/90 backdrop-blur-2xl border-red-500/20 rounded-3xl shadow-[0_0_50px_rgba(239,68,68,0.15)]">
                               <DialogHeader className="mb-2">
                                 <div className="w-12 h-12 bg-red-500/10 rounded-2xl flex items-center justify-center mb-4 border border-red-500/20">
                                   <Trash2 className="w-6 h-6 text-red-400" />
                                 </div>
                                 <DialogTitle className="text-xl font-black text-white">Delete Menu Item?</DialogTitle>
                                 <DialogDescription className="text-slate-400 leading-relaxed">
                                   Are you sure you want to delete <span className="text-white font-bold">{menuItem.name}</span> from the {menuItem.Outlet.name} menu? This action cannot be undone.
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
      </div>
    </div>
  )
}
