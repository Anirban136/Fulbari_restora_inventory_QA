"use client";

import { useEffect, useState, useCallback } from "react";
import { X, TrendingUp, Loader2, Activity } from "lucide-react";

type DayData = {
  date: string;
  cash: number;
  online: number;
  split: number;
  total: number;
};

export function GrossRevenueModal({ totalRevenue }: { totalRevenue: number }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [days, setDays] = useState<DayData[]>([]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/revenue/weekly");
      const json = await res.json();
      setDays(json.days || []);
    } catch {
      setDays([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleOpen = () => {
    setOpen(true);
    fetchData();
  };

  // Close on Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const grandTotal = days.reduce((s, d) => s + d.total, 0);
  const grandCash = days.reduce((s, d) => s + d.cash, 0);
  const grandOnline = days.reduce((s, d) => s + d.online, 0);
  const grandSplit = days.reduce((s, d) => s + d.split, 0);

  return (
    <>
      {/* Trigger — wraps just the card */}
      <div
        id="gross-revenue-card"
        onClick={handleOpen}
        className="glass-panel emerald-glow p-8 rounded-[2rem] relative overflow-hidden group hover:-translate-y-2 transition-all duration-500 cursor-pointer select-none border-emerald-500/20 shadow-[0_20px_50px_-15px_rgba(16,185,129,0.2)]"
        title="Click to view 7-day revenue report"
      >
        <div className="absolute -right-10 -top-10 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl group-hover:bg-emerald-500/20 transition-all duration-700" />
        
        <div className="flex justify-between items-start mb-6">
          <div className="space-y-1">
            <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] opacity-70">
              Executive Sale
            </h3>
            <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">Chai + Cafe Today</p>
          </div>
          <div className="p-3 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 group-hover:rotate-12 transition-transform">
            <TrendingUp className="text-emerald-500 w-6 h-6" />
          </div>
        </div>

        <div className="relative">
          <p className="text-5xl lg:text-6xl font-black text-foreground tracking-tighter text-gradient-emerald">
            ₹{totalRevenue.toFixed(0)}
          </p>
        </div>

        {/* Premium History Badge */}
        <div className="mt-8 flex items-center justify-between">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 dark:bg-emerald-500/20 border border-emerald-500/20 rounded-full">
            <Activity className="w-3 h-3 text-emerald-500 animate-pulse" />
            <span className="text-[9px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">Live Feed</span>
          </div>
          
          <button className="flex items-center gap-2 px-4 py-2 bg-foreground text-background rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all active:scale-95 shadow-lg">
            View 7-Day History <TrendingUp className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Modal backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={(e) => e.target === e.currentTarget && setOpen(false)}
          style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)" }}
        >
          <div
            className="relative w-full max-w-2xl rounded-3xl border border-border bg-background shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-7 py-5 border-b border-border bg-muted/30 backdrop-blur-xl">
              <div className="flex items-center gap-3">
                <TrendingUp className="text-emerald-500 dark:text-emerald-400 w-5 h-5" />
                <div>
                  <h2 className="text-base font-black text-foreground uppercase tracking-widest">
                    Today's Sales Report
                  </h2>
                  <p className="text-[11px] text-muted-foreground font-medium mt-0.5">
                    Last 7 Days · Daily Breakdown
                  </p>
                </div>
              </div>
              <button
                id="close-revenue-modal"
                onClick={() => setOpen(false)}
                className="p-2 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6">
              {loading ? (
                <div className="flex items-center justify-center py-16 gap-3 text-slate-400">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span className="text-sm font-medium">Loading report…</span>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-2xl border border-border">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="bg-muted/50 dark:bg-black/40 text-[11px] font-black uppercase tracking-widest text-muted-foreground">
                        <th className="px-5 py-3.5 text-left rounded-tl-2xl">Date</th>
                        <th className="px-5 py-3.5 text-right">
                          <span className="text-amber-500 dark:text-amber-400">💵</span> Cash
                        </th>
                        <th className="px-5 py-3.5 text-right">
                          <span className="text-blue-500 dark:text-blue-400">💳</span> UPI / Card
                        </th>
                        <th className="px-5 py-3.5 text-right rounded-tr-2xl">
                          Total
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                      {days.map((d, i) => (
                        <tr
                          key={d.date}
                          className={`hover:bg-muted/5 transition-colors ${
                            i === days.length - 1
                              ? "bg-emerald-500/5 border-t border-emerald-500/20"
                              : ""
                          }`}
                        >
                          <td className="px-5 py-3.5 font-black text-foreground/90">
                            {d.date}
                            {i === days.length - 1 && (
                              <span className="ml-2 text-[9px] bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-black uppercase tracking-widest">
                                Today
                              </span>
                            )}
                          </td>
                          <td className="px-5 py-3.5 text-right text-amber-700 dark:text-amber-300 font-bold">
                            ₹{d.cash.toFixed(2)}
                          </td>
                          <td className="px-5 py-3.5 text-right text-blue-700 dark:text-blue-300 font-bold">
                            ₹{d.online.toFixed(2)}
                          </td>
                          <td className="px-5 py-3.5 text-right font-black text-foreground text-base">
                            ₹{d.total.toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>

                    {/* Grand-total footer */}
                    <tfoot>
                      <tr className="bg-muted/50 dark:bg-black/50 border-t-2 border-border/50 text-[11px] font-black uppercase tracking-widest">
                        <td className="px-5 py-3.5 text-muted-foreground rounded-bl-2xl">
                          7-Day Total
                        </td>
                        <td className="px-5 py-3.5 text-right text-amber-600 dark:text-amber-400">
                          ₹{grandCash.toFixed(2)}
                        </td>
                        <td className="px-5 py-3.5 text-right text-blue-600 dark:text-blue-400">
                          ₹{grandOnline.toFixed(2)}
                        </td>
                        <td className="px-5 py-3.5 text-right text-emerald-600 dark:text-emerald-400 text-sm rounded-br-2xl">
                          ₹{grandTotal.toFixed(2)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}

              {/* Split note */}
              {!loading && grandSplit > 0 && (
                <p className="mt-3 text-[11px] text-purple-400/70 text-right font-medium">
                  * Includes ₹{grandSplit.toFixed(2)} in split payments (distributed across modes)
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
