import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { createTab, cancelTab } from "./actions"
import Link from "next/link"
import { UserControls } from "@/components/user-controls"
import { Utensils, Coffee, X } from "lucide-react"

export default async function ActiveTabsPage() {
  const session = await getServerSession(authOptions)
  if (!session) return null

  const roleTypeMap: Record<string, string> = { CAFE_STAFF: "CAFE", CHAI_STAFF: "CHAI_JOINT" } 
  const outletSearch = session.user.role === "OWNER" ? {} : { type: roleTypeMap[session.user.role] }

  const outlet = await prisma.outlet.findFirst({ where: outletSearch })

  let activeTabs: any[] = []
  if (outlet) {
    activeTabs = await prisma.tab.findMany({
      where: { outletId: outlet.id, status: "OPEN" },
      include: { Items: { include: { MenuItem: true } } },
      orderBy: { openedAt: "desc" }
    })
  }

  const isCafe = session.user.role === "CAFE_STAFF"
  const isChai = session.user.role === "CHAI_STAFF"

  return (
    <div className="min-h-screen bg-background selection:bg-emerald-500/30 relative overflow-hidden flex flex-col items-center p-8">
      
      {/* Background Decorators */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay pointer-events-none z-0"></div>
      <div className="absolute top-[10%] left-[-10%] w-[500px] h-[500px] bg-emerald-600/10 rounded-full blur-[150px] pointer-events-none z-0"></div>
      <div className="absolute bottom-[10%] right-[-10%] w-[500px] h-[500px] bg-teal-500/10 rounded-full blur-[150px] pointer-events-none z-0"></div>

      <div className="max-w-7xl w-full mx-auto space-y-8 relative z-10 flex-1 flex flex-col">
        
        <header className="flex items-center justify-between pb-6 border-b border-white/10">
          <div className="flex items-center gap-4">
             <div className="h-14 w-14 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center border border-white/10 shadow-[0_0_30px_-5px_rgba(16,185,129,0.5)] p-1">
               <div className="h-full w-full bg-background/50 rounded-xl flex items-center justify-center backdrop-blur-md">
                 {isCafe ? <Utensils className="text-emerald-400 w-6 h-6" /> : <Coffee className="text-emerald-400 w-6 h-6" />}
               </div>
             </div>
            <div>
              <h1 className="text-4xl font-black text-white tracking-tight">POS Terminal</h1>
              <p className="text-emerald-400 font-bold mt-1 tracking-widest uppercase text-xs">{outlet?.name || "Global"} Registers</p>
            </div>
          </div>
          <div className="flex gap-4 items-center">
            {session.user.role === "OWNER" && (
               <Link href="/dashboard"><Button variant="outline" className="border-white/10 text-slate-300 hover:bg-white/10 hover:text-white backdrop-blur-md">Back to Dashboard</Button></Link>
            )}
            {session.user.role === "CAFE_STAFF" && (
               <Link href="/cafe"><Button variant="outline" className="border-white/10 text-slate-300 hover:bg-white/10 hover:text-white backdrop-blur-md">Back to Cafe Hub</Button></Link>
            )}
            {session.user.role === "CHAI_STAFF" && (
               <Link href="/chai"><Button variant="outline" className="border-white/10 text-slate-300 hover:bg-white/10 hover:text-white backdrop-blur-md">Back to Chai Hub</Button></Link>
            )}
            <UserControls />
          </div>
        </header>

        <div className="flex flex-col md:flex-row justify-between items-center glass-panel p-6 rounded-3xl border border-white/10 shadow-[0_20px_60px_-15px_rgba(16,185,129,0.1)] gap-6">
           <div className="flex items-center gap-4">
             <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shadow-inner">
               <span className="text-2xl font-black text-emerald-400">{activeTabs.length}</span>
             </div>
             <div>
               <h2 className="text-xl font-bold text-white tracking-tight">Running Tabs</h2>
               <p className="text-slate-400 text-sm font-medium tracking-wide uppercase mt-1">Currently serving orders.</p>
             </div>
           </div>
           
           <form action={createTab} className="flex gap-3 w-full md:w-auto">
             {isCafe && (
               <Input name="tableName" placeholder="Table No." required className="w-32 h-14 bg-black/40 border-white/10 text-white placeholder:text-slate-600 rounded-xl focus-visible:ring-emerald-500/50 shadow-inner font-bold text-center" />
             )}
             <Input name="customerName" placeholder={isCafe ? "Customer Name (Opt)" : "Customer Name"} required={!isCafe} className="w-48 xl:w-64 h-14 bg-black/40 border-white/10 text-white placeholder:text-slate-600 rounded-xl focus-visible:ring-emerald-500/50 shadow-inner font-medium pl-4" />
             
             <Button type="submit" className="h-14 px-8 text-lg font-black tracking-widest uppercase bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black rounded-xl transition-all shadow-[0_0_30px_-5px_rgba(16,185,129,0.5)] active:scale-95">
                + Open Tab
             </Button>
           </form>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 flex-1 content-start pb-20">
           {activeTabs.map(tab => {
             const itemsCount = tab.Items.reduce((acc: number, item: any) => acc + item.quantity, 0)
             return (
               <div key={tab.id} className="glass-panel rounded-3xl flex flex-col hover:border-emerald-500/50 transition-all duration-300 hover:shadow-[0_10px_40px_-10px_rgba(16,185,129,0.2)] hover:-translate-y-1 group overflow-hidden relative">
                 
                 <div className="p-6 border-b border-white/10 flex-1 relative z-10 bg-gradient-to-br from-white/5 to-transparent">
                   <div className="flex justify-between items-start mb-4">
                     <div>
                       {(tab.tableName) && <div className="text-xs font-black tracking-widest text-emerald-400 mb-1.5 px-2 py-0.5 bg-emerald-500/10 rounded-md border border-emerald-500/20 w-fit">TABLE {tab.tableName}</div>}
                       <h3 className="text-2xl font-black text-white truncate pr-2 tracking-tight group-hover:text-emerald-300 transition-colors">
                         {tab.customerName || "Walk-in"}
                       </h3>
                     </div>
                     <span className="text-[10px] text-slate-400 font-black tracking-widest bg-black/40 px-2 py-1.5 rounded-lg border border-white/10 shadow-inner">
                       {tab.openedAt.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                     </span>
                   </div>
                   
                   <div className="inline-flex items-center gap-2 mb-6 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-lg">
                     <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                     <p className="text-xs font-black text-emerald-400 tracking-widest uppercase">{itemsCount} items total</p>
                   </div>
                   
                   <div className="space-y-2">
                     {tab.Items.slice(0, 3).map((item: any) => (
                       <div key={item.id} className="text-sm font-medium text-slate-400 flex justify-between bg-black/40 p-2.5 rounded-xl border border-white/5 shadow-inner">
                         <span className="truncate pr-2 text-slate-300 tracking-wide"><span className="text-emerald-500 font-black bg-emerald-500/10 px-1.5 py-0.5 rounded mr-1 leading-none">{item.quantity}x</span> {item.MenuItem.name}</span>
                         <span className="text-emerald-500/70 font-black">₹{(item.quantity * item.priceAtTime).toFixed(2)}</span>
                       </div>
                     ))}
                     {tab.Items.length > 3 && (
                       <div className="text-xs text-slate-500 font-black text-emerald-500/50 uppercase tracking-widest pt-2 text-center bg-black/20 rounded-lg py-1 mt-2">And {tab.Items.length - 3} more...</div>
                     )}
                     {tab.Items.length === 0 && (
                       <div className="text-xs font-bold tracking-widest uppercase text-slate-500/50 py-4 text-center bg-black/20 rounded-xl border border-white/5 border-dashed">Empty Cart</div>
                     )}
                   </div>
                 </div>

                 <div className="p-4 bg-black/60 backdrop-blur-xl flex gap-3 relative z-10 border-t items-center border-white/5">
                   <Link href={`/tabs/${tab.id}`} className="flex-1">
                     <Button className="w-full h-12 font-bold tracking-widest uppercase text-xs bg-white/10 hover:bg-white text-white hover:text-black border border-white/20 transition-all rounded-xl">View & Bill</Button>
                   </Link>
                   <form action={cancelTab.bind(null, tab.id)}>
                     <Button variant="outline" className="w-12 h-12 bg-red-500/10 border-red-500/30 text-red-500 hover:bg-red-500 hover:text-white rounded-xl transition-all p-0 flex items-center justify-center shadow-inner active:scale-95">
                       <X className="w-5 h-5" />
                     </Button>
                   </form>
                 </div>
               </div>
             )
           })}
        </div>

      </div>
    </div>
  )
}
