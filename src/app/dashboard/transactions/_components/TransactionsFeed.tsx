"use client"

import { useState, useMemo } from "react"
import { Coffee, CupSoda, Calendar, Filter, FileDown, Search, ArrowRight, CreditCard, Banknote, Layers } from "lucide-react"
import { formatTimeIST, formatDateIST } from "@/lib/utils"
import { EditTransactionDialog } from "./edit-transaction-dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { generateTransactionPDF } from "@/lib/report-generator"

export function TransactionsFeed({ initialTransactions }: { initialTransactions: any[] }) {
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0])
  const [paymentFilter, setPaymentFilter] = useState<"ALL" | "CASH" | "ONLINE">("ALL")
  const [searchTerm, setSearchTerm] = useState("")

  const filteredTransactions = useMemo(() => {
    return initialTransactions.filter(t => {
      const tDate = new Date(t.closedAt || t.openedAt);
      
      // 4 AM IST Logic for filtering specific date
      // Shift to IST wall clock
      const istDate = new Date(tDate.getTime() + 5.5 * 3600000);
      if (istDate.getUTCHours() < 4) istDate.setUTCDate(istDate.getUTCDate() - 1);
      const bizDay = istDate.toISOString().split('T')[0];

      const matchesDate = bizDay === selectedDate;
      const matchesPayment = paymentFilter === "ALL" || 
        (paymentFilter === "CASH" && t.paymentMode === "CASH") ||
        (paymentFilter === "ONLINE" && (t.paymentMode === "ONLINE" || t.paymentMode === "UPI"));
      const matchesSearch = t.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) || false;
      
      return matchesDate && matchesPayment && (searchTerm === "" || matchesSearch);
    });
  }, [initialTransactions, selectedDate, paymentFilter, searchTerm]);

  const cafeTransactions = filteredTransactions.filter(t => t.Outlet.name.toUpperCase().includes("CAFE"));
  const chaiTransactions = filteredTransactions.filter(t => t.Outlet.name.toUpperCase().includes("CHAI"));

  const totals = {
    total: filteredTransactions.reduce((s, t) => s + t.totalAmount, 0),
    cash: filteredTransactions.filter(t => t.paymentMode === "CASH").reduce((s, t) => s + t.totalAmount, 0),
    online: filteredTransactions.filter(t => t.paymentMode === "ONLINE" || t.paymentMode === "UPI").reduce((s, t) => s + t.totalAmount, 0),
  };

  const handleDownloadReport = () => {
    const reportData = {
      transactions: filteredTransactions
    };
    generateTransactionPDF(reportData, selectedDate, selectedDate);
  }

  const renderSection = (title: string, icon: any, colorClass: string, trans: any[], accentBg: string) => (
    <div className="glass-panel p-6 rounded-3xl relative overflow-hidden group">
      <div className={cn("absolute top-0 right-0 w-64 h-64 rounded-full blur-[80px] pointer-events-none transition-all", accentBg)}></div>
      <div className="flex items-center justify-between mb-8 border-b border-white/10 pb-4">
        <div className="flex items-center gap-4">
          <div className={cn("h-12 w-12 rounded-xl flex items-center justify-center border", colorClass)}>
            {icon}
          </div>
          <div>
            <h3 className="text-2xl font-black text-white tracking-tight">{title}</h3>
            <p className="text-muted-foreground/60 font-bold tracking-widest uppercase text-[10px]">{trans.length} Records Found</p>
          </div>
        </div>
        <div className="text-right">
             <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Section Yield</p>
             <p className={cn("text-xl font-black tabular-nums", colorClass.split(' ')[2])}>
                ₹{trans.reduce((s, t) => s + t.totalAmount, 0).toLocaleString()}
             </p>
        </div>
      </div>

      <div className="space-y-4">
        {trans.length === 0 ? (
          <div className="p-12 text-center text-slate-500 font-bold uppercase tracking-widest text-xs bg-black/20 rounded-2xl border border-white/5 opacity-40">
            No Transactions for this filter
          </div>
        ) : (
          trans.map(tab => (
            <div key={tab.id} className="flex flex-col md:flex-row md:items-center justify-between p-5 rounded-2xl border border-white/5 bg-white/[0.03] hover:bg-white/5 transition-all group gap-4 relative">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">{formatTimeIST(new Date(tab.closedAt || tab.openedAt))}</span>
                  {tab.status === "CANCELLED" && <span className="text-[8px] font-black tracking-widest bg-red-500/10 text-red-500 px-2 py-0.5 rounded-md uppercase border border-red-500/10">Cancelled</span>}
                  {tab.status === "CLOSED" && <span className="text-[8px] font-black tracking-widest bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded-md uppercase border border-emerald-500/10">Closed</span>}
                  {tab.status === "OPEN" && <span className="text-[8px] font-black tracking-widest bg-blue-500/10 text-blue-500 px-2 py-0.5 rounded-md uppercase border border-blue-500/10">Open</span>}
                </div>
                <h4 className="font-black text-white text-lg tracking-tight">{tab.customerName || "Walk-in Customer"}</h4>
                <div className="flex items-center gap-3 mt-1.5">
                    <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest">Billed by: <span className="text-white/60">{tab.User.name}</span></p>
                </div>
              </div>
              
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <div className={cn(
                    "font-black tracking-tighter px-4 py-1.5 rounded-xl text-xl",
                    tab.status === "CANCELLED" ? "text-white/20 bg-white/5" : "text-white bg-white/5 border border-white/10"
                  )}>
                    ₹{tab.totalAmount.toFixed(0)}
                  </div>
                  <div className="flex items-center justify-end gap-1.5 mt-2">
                     {tab.paymentMode === 'CASH' ? <Banknote className="w-3 h-3 text-emerald-500/50" /> : <CreditCard className="w-3 h-3 text-blue-500/50" />}
                     <p className="text-[9px] text-white/40 font-black uppercase tracking-widest">{tab.paymentMode || "UNKNOWN"}</p>
                  </div>
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
          ))
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-8 pb-32">
      {/* ELITE CONTROL CENTER */}
      <div className="glass-panel p-6 rounded-[2.5rem] border border-white/10 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent"></div>
        
        <div className="flex flex-col lg:flex-row gap-6 items-center justify-between relative z-10">
          <div className="flex flex-wrap items-center gap-3">
             <div className="relative group">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
                <input 
                  type="date" 
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="h-12 pl-12 pr-6 bg-black/40 border border-white/10 rounded-2xl text-[10px] font-black text-white uppercase tracking-widest focus:ring-2 focus:ring-primary/40 focus:border-primary/50 transition-all outline-none"
                />
             </div>

             <div className="flex p-1 bg-black/40 rounded-2xl border border-white/5 items-center">
                {(['ALL', 'CASH', 'ONLINE'] as const).map(mode => (
                  <button
                    key={mode}
                    onClick={() => setPaymentFilter(mode)}
                    className={cn(
                      "px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all",
                      paymentFilter === mode ? "bg-primary text-primary-foreground shadow-lg" : "text-white/40 hover:text-white"
                    )}
                  >
                    {mode}
                  </button>
                ))}
             </div>

             <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-primary transition-colors" />
                <Input 
                  placeholder="Search Customers..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="h-12 pl-12 bg-black/40 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest w-[200px] lg:w-[240px]"
                />
             </div>
          </div>

          <Button 
            onClick={handleDownloadReport}
            className="h-12 px-8 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-black font-black uppercase tracking-widest transition-all active:scale-95 gap-3 shadow-[0_10px_20px_-10px_rgba(16,185,129,0.5)]"
          >
            <FileDown className="w-4 h-4" /> Download Performance Report
          </Button>
        </div>

        {/* Real-time Stats Strip */}
        <div className="flex flex-wrap gap-8 mt-8 pt-6 border-t border-white/5">
           <div>
              <p className="text-[9px] font-black text-white/30 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                 <Layers className="w-3 h-3" /> Total Volume
              </p>
              <p className="text-xl font-black text-white tabular-nums">₹{totals.total.toLocaleString()}</p>
           </div>
           <div className="w-[1px] h-10 bg-white/5" />
           <div>
              <p className="text-[9px] font-black text-emerald-500/50 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                 <Banknote className="w-3 h-3" /> Cash Collection
              </p>
              <p className="text-xl font-black text-emerald-400 tabular-nums">₹{totals.cash.toLocaleString()}</p>
           </div>
           <div className="w-[1px] h-10 bg-white/5" />
           <div>
              <p className="text-[9px] font-black text-blue-500/50 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                 <CreditCard className="w-3 h-3" /> UPI / Online
              </p>
              <p className="text-xl font-black text-blue-400 tabular-nums">₹{totals.online.toLocaleString()}</p>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-10">
        {renderSection(
            "Cafe Operations", 
            <Coffee className="w-6 h-6 text-amber-400" />, 
            "bg-amber-500/20 border-amber-500/30 text-amber-400", 
            cafeTransactions,
            "bg-amber-500/5"
        )}

        {renderSection(
            "Tea Joint Hub", 
            <CupSoda className="w-6 h-6 text-teal-400" />, 
            "bg-teal-500/20 border-teal-500/30 text-teal-400", 
            chaiTransactions,
            "bg-teal-500/5"
        )}
      </div>
    </div>
  )
}
