"use client";

import { useState } from "react";
import { Download, Calendar, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function FinancialReports() {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    if (!from || !to) {
      alert("Please select both From and To dates");
      return;
    }

    setLoading(true);
    try {
      const url = `/api/export/transactions?from=${from}&to=${to}`;
      // Use window.location.assign for direct download or create a hidden anchor
      window.location.assign(url);
    } catch (error) {
      console.error("Export failed", error);
      alert("Failed to generate report. Please try again.");
    } finally {
      // Small delay to ensure browser triggers the download
      setTimeout(() => setLoading(false), 2000);
    }
  };

  return (
    <div className="glass-panel p-8 rounded-[3rem] relative overflow-hidden group border-white/5 bg-white/[0.01]">
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-all duration-700 pointer-events-none"></div>
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Download className="w-4 h-4 text-primary" />
            </div>
            <h3 className="text-xl font-black text-foreground tracking-tight uppercase">Custom Range Export</h3>
          </div>
          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] opacity-60">
            Generate detailed CSV reports for any date range
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[9px] font-black text-muted-foreground uppercase tracking-widest ml-1">From Date</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50 pointer-events-none" />
              <input 
                type="date" 
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-xl px-10 py-2.5 text-xs font-bold text-foreground focus:ring-2 focus:ring-primary/50 outline-none transition-all w-full md:w-auto hover:bg-white/[0.08]"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[9px] font-black text-muted-foreground uppercase tracking-widest ml-1">To Date</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50 pointer-events-none" />
              <input 
                type="date" 
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-xl px-10 py-2.5 text-xs font-bold text-foreground focus:ring-2 focus:ring-primary/50 outline-none transition-all w-full md:w-auto hover:bg-white/[0.0102]"
              />
            </div>
          </div>

          <Button 
            onClick={handleExport}
            disabled={loading || !from || !to}
            className={cn(
               "mt-auto h-[46px] px-8 rounded-xl font-black uppercase tracking-widest text-[10px] shadow-lg transition-all active:scale-95",
               loading ? "bg-muted cursor-not-allowed" : "bg-primary text-primary-foreground hover:scale-105"
            )}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Processing...
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                Generate Report
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
