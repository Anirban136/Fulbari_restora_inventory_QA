import { prisma } from "@/lib/prisma"
export const dynamic = 'force-dynamic'
import { Receipt, Coffee, CupSoda } from "lucide-react"
import { EditTransactionDialog } from "./_components/edit-transaction-dialog"
import { formatTimeIST, formatDateIST } from "@/lib/utils"
import Link from "next/link"

export default async function AdminTransactionsPage(props: { searchParams: Promise<{ showAllCafe?: string, showAllChai?: string }> }) {
  const searchParams = await props.searchParams;
  const showAllCafe = searchParams?.showAllCafe === 'true';
  const showAllChai = searchParams?.showAllChai === 'true';

  const threeDaysAgo = new Date()
  threeDaysAgo.setDate(threeDaysAgo.getDate() - 3)

  // Fetch Cafe Hub and Chai Hub transactions together OR sequentially
  const [cafeOutlet, chaiOutlet] = await Promise.all([
    prisma.outlet.findFirst({ where: { type: "CAFE" } }),
    prisma.outlet.findFirst({ where: { type: "CHAI_JOINT" } })
  ])

  const [cafeTabs, chaiTabs] = await Promise.all([
    cafeOutlet ? prisma.tab.findMany({
      where: { outletId: cafeOutlet.id, status: { in: ["CLOSED", "CANCELLED", "OPEN"] }, openedAt: { gte: threeDaysAgo } },
      include: { User: true },
      orderBy: { openedAt: "desc" },
      ...(showAllCafe ? {} : { take: 5 })
    }) : Promise.resolve([]),
    
    chaiOutlet ? prisma.tab.findMany({
      where: { outletId: chaiOutlet.id, status: { in: ["CLOSED", "CANCELLED", "OPEN"] }, openedAt: { gte: threeDaysAgo } },
      include: { User: true },
      orderBy: { openedAt: "desc" },
      ...(showAllChai ? {} : { take: 5 })
    }) : Promise.resolve([])
  ])

  const renderTabRows = (tabs: typeof cafeTabs, accentClass: string) => {
    if (tabs.length === 0) {
      return (
        <div className="p-8 text-center text-slate-500 font-medium bg-black/20 rounded-2xl border border-white/5">
          No recent transactions found.
        </div>
      )
    }
    
    return (
      <div className="space-y-4">
        {tabs.map(tab => (
          <div key={tab.id} className="flex flex-col md:flex-row md:items-center justify-between p-5 rounded-2xl border border-white/5 bg-white/5 hover:bg-white/10 hover:border-white/20 transition-all group shadow-sm gap-4">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <p className="text-xs font-bold text-slate-500">{formatDateIST(tab.closedAt || tab.openedAt)} at {formatTimeIST(tab.closedAt || tab.openedAt)}</p>
                {tab.status === "CANCELLED" && <span className="text-[9px] font-black tracking-widest bg-red-500/20 text-red-400 px-2 py-0.5 rounded uppercase border border-red-500/20">Cancelled</span>}
                {tab.status === "CLOSED" && <span className="text-[9px] font-black tracking-widest bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded uppercase border border-emerald-500/20">Closed</span>}
                {tab.status === "OPEN" && <span className="text-[9px] font-black tracking-widest bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded uppercase border border-blue-500/20">Open</span>}
              </div>
              <span className="font-bold text-slate-200 group-hover:text-white text-lg transition-colors">{tab.customerName || "Walk-in Customer"}</span>
              <p className="text-xs text-slate-500 mt-1 font-medium">Billed by: <span className="text-slate-400">{tab.User.name}</span></p>
            </div>
            
            <div className="flex items-center gap-6 self-start md:self-auto">
              <div className="text-right">
                <span className={`font-black tracking-widest px-4 py-2 rounded-xl text-xl drop-shadow-[0_0_5px_rgba(255,255,255,0.1)] ${tab.status === "CANCELLED" ? "text-slate-500 bg-white/5 border border-white/5" : accentClass}`}>
                  ₹{tab.totalAmount.toFixed(2)}
                </span>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-2">{tab.paymentMode || "UNKNOWN"}</p>
              </div>
              
              <div className="pl-4 border-l border-white/10 shrink-0">
                <EditTransactionDialog tab={{
                  id: tab.id,
                  totalAmount: tab.totalAmount,
                  paymentMode: tab.paymentMode,
                  status: tab.status,
                  customerName: tab.customerName
                }} />
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-12 relative pb-20">
      <div className="absolute top-[10%] left-[30%] w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[150px] pointer-events-none -translate-y-1/2"></div>
      
      <div className="glass-panel p-6 rounded-3xl relative z-10 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
            Transactions History
            <div className="h-2 w-2 rounded-full bg-blue-500 shadow-[0_0_10px_#3b82f6]"></div>
          </h2>
          <p className="text-muted-foreground mt-1 font-medium text-sm tracking-wide uppercase">Audit and rectify transaction records from operation hubs.</p>
        </div>
      </div>

      <div className="space-y-10 relative z-10">
        {/* Cafe Hub Section */}
        <section className="glass-panel p-6 rounded-3xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-[80px] pointer-events-none transition-all"></div>
          <div className="flex items-center gap-4 mb-8 border-b border-white/10 pb-4">
            <div className="h-12 w-12 bg-amber-500/20 rounded-xl flex items-center justify-center border border-amber-500/30">
              <Coffee className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <h3 className="text-2xl font-black text-white tracking-tight">Cafe Hub</h3>
              <p className="text-amber-400 font-bold tracking-widest uppercase text-xs">Recent Transactions</p>
            </div>
          </div>
          {renderTabRows(cafeTabs, "text-amber-400 bg-amber-500/10 border border-amber-500/20")}
          {!showAllCafe && cafeTabs.length >= 5 && (
            <div className="mt-6 flex justify-center">
              <Link href="?showAllCafe=true" scroll={false} className="px-6 py-3 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 rounded-xl text-sm font-bold uppercase tracking-widest transition-all hover:scale-105 active:scale-95 shadow-[0_0_15px_-3px_rgba(245,158,11,0.3)]">
                See All Transactions
              </Link>
            </div>
          )}
        </section>

        {/* Chai Joint Hub Section */}
        <section className="glass-panel p-6 rounded-3xl relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-64 h-64 bg-teal-500/10 rounded-full blur-[80px] pointer-events-none transition-all"></div>
          <div className="flex items-center gap-4 mb-8 border-b border-white/10 pb-4">
            <div className="h-12 w-12 bg-teal-500/20 rounded-xl flex items-center justify-center border border-teal-500/30">
              <CupSoda className="w-6 h-6 text-teal-400" />
            </div>
            <div>
              <h3 className="text-2xl font-black text-white tracking-tight">Tea Joint Hub</h3>
              <p className="text-teal-400 font-bold tracking-widest uppercase text-xs">Recent Transactions</p>
            </div>
          </div>
          {renderTabRows(chaiTabs, "text-teal-400 bg-teal-500/10 border border-teal-500/20")}
          {!showAllChai && chaiTabs.length >= 5 && (
            <div className="mt-6 flex justify-center">
              <Link href="?showAllChai=true" scroll={false} className="px-6 py-3 bg-teal-500/10 hover:bg-teal-500/20 border border-teal-500/30 text-teal-400 rounded-xl text-sm font-bold uppercase tracking-widest transition-all hover:scale-105 active:scale-95 shadow-[0_0_15px_-3px_rgba(20,184,166,0.3)]">
                See All Transactions
              </Link>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
