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

export default async function ActiveTabsPage({ searchParams }: { searchParams: Promise<{ target?: string }> }) {
  const { target } = await searchParams || {}

  const session = await getServerSession(authOptions)
  if (!session) return null

  const roleTypeMap: Record<string, string> = { CAFE_STAFF: "CAFE", CHAI_STAFF: "CHAI_JOINT" } 
  let outletSearch: any = {}
  
  if (session.user.role === "OWNER") {
    outletSearch = target ? { type: target } : {}
  } else {
    outletSearch = { type: roleTypeMap[session.user.role] }
  }

  const outlet = await prisma.outlet.findFirst({ where: outletSearch })

  let activeTabs: any[] = []
  if (outlet) {
    activeTabs = await prisma.tab.findMany({
      where: { outletId: outlet.id, status: "OPEN" },
      include: { Items: { include: { MenuItem: true } } },
      orderBy: { openedAt: "desc" }
    })
  }

  const isCafe = session.user.role === "CAFE_STAFF" || (session.user.role === "OWNER" && target === "CAFE")
  const isChai = session.user.role === "CHAI_STAFF" || (session.user.role === "OWNER" && target === "CHAI_JOINT")

  return (
    <AppLayout user={session?.user}>
      <div className={`${isCafe ? "selection:bg-orange-500/30 selection:text-orange-100" : "selection:bg-sky-500/30 selection:text-sky-100"} relative overflow-hidden flex flex-col items-center p-4 sm:p-8 min-h-full w-full`}>
        
        {/* Background Decorators */}
        <div className={`absolute top-[10%] left-[-10%] w-[500px] h-[500px] ${isCafe ? "bg-orange-600/10" : "bg-sky-600/10"} rounded-full blur-[150px] pointer-events-none z-0`}></div>
        <div className={`absolute bottom-[10%] right-[-10%] w-[500px] h-[500px] ${isCafe ? "bg-amber-500/10" : "bg-blue-500/10"} rounded-full blur-[150px] pointer-events-none z-0`}></div>

        <div className="max-w-7xl w-full mx-auto space-y-8 relative z-10 flex-1 flex flex-col">
          
          <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b border-white/10 gap-4">
            <div className="flex items-center gap-4">
             <div className={`h-14 w-14 bg-gradient-to-br ${isCafe ? "from-orange-500 to-amber-600 shadow-[0_0_30px_-5px_oklch(0.65_0.22_25_/_0.5)]" : "from-sky-500 to-blue-600 shadow-[0_0_30px_-5px_rgba(14,165,233,0.5)]"} rounded-2xl flex items-center justify-center border border-white/10 p-1`}>
               <div className="h-full w-full bg-background/50 rounded-xl flex items-center justify-center backdrop-blur-md">
                 {isCafe ? <Utensils className="text-orange-400 w-6 h-6" /> : <Coffee className="text-sky-400 w-6 h-6" />}
               </div>
             </div>
            <div>
              <h1 className="text-4xl font-black text-white tracking-tight">POS Terminal</h1>
              <p className={`${isCafe ? "text-orange-400" : "text-sky-400"} font-bold mt-1 tracking-widest uppercase text-xs`}>{outlet?.name || "Global"} Registers</p>
            </div>
          </div>
          <div className="flex flex-wrap justify-end gap-2 sm:gap-4 items-center mt-4 sm:mt-0">
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

        <div className={`flex flex-col md:flex-row justify-between items-center glass-panel p-6 rounded-3xl border border-white/10 ${isCafe ? "shadow-[0_20px_60px_-15px_rgba(245,158,11,0.1)]" : "shadow-[0_20px_60px_-15px_rgba(14,165,233,0.1)]"} gap-6`}>
           <div className="flex items-center gap-4">
             <div className={`w-14 h-14 rounded-2xl ${isCafe ? "bg-orange-500/20 border-orange-500/30" : "bg-sky-500/20 border-sky-500/30"} border flex items-center justify-center shadow-inner`}>
               <span className={`text-2xl font-black ${isCafe ? "text-orange-400" : "text-sky-400"}`}>{activeTabs.length}</span>
             </div>
             <div>
               <h2 className="text-xl font-bold text-white tracking-tight">Running Tabs</h2>
               <p className="text-slate-400 text-sm font-medium tracking-wide uppercase mt-1">Currently serving orders.</p>
             </div>
           </div>
           
           <form action={createTab} className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto mt-4 md:mt-0">
             {outlet && <input type="hidden" name="outletId" value={outlet.id} />}
             {isCafe && (
               <Input name="tableName" placeholder="Table No." required className={`w-full sm:w-32 h-14 bg-black/40 border-white/10 text-white placeholder:text-slate-600 rounded-xl ${isCafe ? "focus-visible:ring-orange-500/50" : "focus-visible:ring-sky-500/50"} shadow-inner font-bold text-center`} />
             )}
             <Input name="customerName" placeholder={isCafe ? "Customer Name (Opt)" : "Customer Name"} required={!isCafe} className={`w-full sm:w-48 xl:w-64 h-14 bg-black/40 border-white/10 text-white placeholder:text-slate-600 rounded-xl ${isCafe ? "focus-visible:ring-orange-500/50" : "focus-visible:ring-sky-500/50"} shadow-inner font-medium pl-4`} />
             
             <Button type="submit" className={`w-full sm:w-auto h-14 px-8 text-lg font-black tracking-widest uppercase bg-gradient-to-r ${isCafe ? "from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 shadow-[0_0_30px_-5px_rgba(245,158,11,0.5)]" : "from-sky-500 to-blue-500 hover:from-sky-400 hover:to-blue-400 shadow-[0_0_30px_-5px_rgba(14,165,233,0.5)]"} text-black rounded-xl transition-all active:scale-95`}>
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
