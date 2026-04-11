import { prisma } from "@/lib/prisma"
export const dynamic = 'force-dynamic'
import { TransactionsFeed } from "./_components/TransactionsFeed"

export default async function AdminTransactionsPage() {
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const transactions = await prisma.tab.findMany({
    where: { 
      status: { in: ["CLOSED", "CANCELLED", "OPEN"] }, 
      openedAt: { gte: thirtyDaysAgo } 
    },
    include: { 
      User: true,
      Outlet: true
    },
    orderBy: { openedAt: "desc" }
  })

  return (
    <div className="space-y-12 relative pb-20">
      <div className="absolute top-[10%] left-[30%] w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[150px] pointer-events-none -translate-y-1/2"></div>
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10 glass-panel p-8 rounded-[2.5rem] border border-white/10 shadow-2xl">
        <div>
          <h2 className="text-4xl font-black text-white tracking-tighter flex items-center gap-4">
            Auditorium
            <div className="h-3 w-3 rounded-full bg-emerald-500 shadow-[0_0_15px_#10b981]"></div>
          </h2>
          <p className="text-muted-foreground/60 mt-2 font-bold text-sm tracking-widest uppercase flex items-center gap-2">
            <span className="text-emerald-500/80">RECORDS</span> • TRANSACTION HISTORY & RECTIFICATION HUB
          </p>
        </div>
      </div>

      <div className="relative z-10">
        <TransactionsFeed initialTransactions={transactions} />
      </div>
    </div>
  )
}
