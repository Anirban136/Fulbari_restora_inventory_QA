import { prisma } from "@/lib/prisma"
export const dynamic = 'force-dynamic'
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { createTab } from "./actions"
import Link from "next/link"
import { UserControls } from "@/components/user-controls"
import { Utensils, Coffee } from "lucide-react"
import { TabItem } from "@/components/tab-item"
import AppLayout from "@/components/layouts/app-layout"

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
    <AppLayout>
      <div className="selection:bg-emerald-500/30 relative overflow-hidden flex flex-col items-center p-4 sm:p-8 min-h-full w-full">
        
        {/* Background Decorators */}
        <div className="absolute top-[10%] left-[-10%] w-[500px] h-[500px] bg-emerald-600/10 rounded-full blur-[150px] pointer-events-none z-0"></div>
        <div className="absolute bottom-[10%] right-[-10%] w-[500px] h-[500px] bg-teal-500/10 rounded-full blur-[150px] pointer-events-none z-0"></div>

        <div className="max-w-7xl w-full mx-auto space-y-8 relative z-10 flex-1 flex flex-col">
          
          <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b border-white/10 gap-4">
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
             return <TabItem key={tab.id} tab={tab} itemsCount={itemsCount} />
           })}
        </div>
        </div>
      </div>
    </AppLayout>
  )
}
