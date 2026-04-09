import { prisma } from "@/lib/prisma"
export const dynamic = 'force-dynamic'
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { DispatchForm } from "./DispatchForm"
import { DispatchHistoryTable } from "./DispatchHistoryTable"

export default async function DispatchPage() {
  const session = await getServerSession(authOptions)
  const isOwner = session?.user?.role === "OWNER"

  const [items, outlets, recentDispatches] = await Promise.all([
    prisma.item.findMany({ 
      orderBy: { name: 'asc' } 
    }),
    prisma.outlet.findMany({ orderBy: { name: 'asc' } }),
    prisma.inventoryLedger.findMany({
      where: { type: "DISPATCH" },
      include: { Item: true },
      orderBy: { createdAt: 'desc' },
      take: 50 // Increased limit for better filtering experience
    })
  ])

  return (
    <div className="space-y-8 relative">
      <div className="absolute top-[50%] left-[10%] w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-[130px] pointer-events-none -translate-y-1/2"></div>
      
      <div className="glass-panel p-6 rounded-3xl relative z-10 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-foreground tracking-tight flex items-center gap-3">
            Dispatch Stock
            <div className="h-2 w-2 rounded-full bg-blue-500 shadow-[0_0_10px_#3b82f6]"></div>
          </h2>
          <p className="text-muted-foreground mt-1 font-medium text-sm tracking-wide uppercase">Send inventory from Central Store to Outlets.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10">
        {/* Client form with error handling */}
        <DispatchForm items={items} outlets={outlets} />

        <div className="lg:col-span-2 glass-panel rounded-3xl overflow-hidden flex flex-col min-h-[500px]">
          <div className="p-6 border-b border-border/50 bg-white/5 backdrop-blur-md flex items-center justify-between">
            <h3 className="text-lg font-bold text-foreground tracking-wide">Dispatch History LEDGER</h3>
            {isOwner && (
              <span className="text-[10px] font-black tracking-widest bg-amber-500/10 border border-amber-500/20 text-amber-400 px-3 py-1 rounded-full uppercase">
                Revert available
              </span>
            )}
          </div>
          
          <DispatchHistoryTable 
            recentDispatches={recentDispatches} 
            outlets={outlets} 
            isOwner={isOwner} 
          />
        </div>
      </div>
    </div>
  )
}
