"use client";

import { useState } from "react";
import { Download, Calendar, Loader2, FileText, X, FileSpreadsheet } from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { generateTransactionPDF } from "@/lib/report-generator";

export function FinancialReports() {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const handleExport = async () => {
    if (!from || !to) {
      alert("Please select both From and To dates");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/export/transactions/data?from=${from}&to=${to}`);
      if (!response.ok) throw new Error("Failed to fetch report data");
      
      const data = await response.json();
      await generateTransactionPDF(data, from, to);
      
      setOpen(false); 
    } catch (error) {
      console.error("Export failed", error);
      alert("Failed to generate PDF report. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger 
        render={
          <button className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/20 px-8 py-4 rounded-full backdrop-blur-xl group hover:bg-emerald-500/20 transition-all active:scale-95 shadow-[0_10px_30px_-5px_rgba(16,185,129,0.1)]" />
        }
      >
        <Download className="w-5 h-5 text-emerald-500 group-hover:scale-110 transition-transform" />
        <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-[0.2em]">Download Report</span>
      </DialogTrigger>
      
      <DialogContent showCloseButton={false} className="sm:max-w-md bg-background border-border/40 p-0 overflow-hidden rounded-[2.5rem] shadow-2xl">
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-emerald-500/10 rounded-full blur-[80px] pointer-events-none"></div>
        
        <DialogHeader className="px-8 pt-8 pb-4 relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-emerald-500/10 rounded-2xl">
                <FileSpreadsheet className="w-6 h-6 text-emerald-500" />
              </div>
              <div>
                <DialogTitle className="text-2xl font-black text-foreground tracking-tight uppercase leading-none">
                  Export Reports
                </DialogTitle>
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mt-1 opacity-60">
                  Financial Transaction Analysis
                </p>
              </div>
            </div>
            
            {/* Larger Custom Close Button */}
            <button 
              onClick={() => setOpen(false)}
              className="p-3 bg-muted/50 hover:bg-muted rounded-2xl text-muted-foreground hover:text-foreground transition-all active:scale-90"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </DialogHeader>

        <div className="px-8 py-6 space-y-6 relative z-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">From Date</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/30 pointer-events-none" />
                <input 
                  type="date" 
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                  className="w-full bg-muted/30 border border-border/40 rounded-2xl px-10 py-3 text-xs font-bold text-foreground focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all hover:bg-muted/50"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">To Date</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/30 pointer-events-none" />
                <input 
                  type="date" 
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  className="w-full bg-muted/30 border border-border/40 rounded-2xl px-10 py-3 text-xs font-bold text-foreground focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all hover:bg-muted/50"
                />
              </div>
            </div>
          </div>

          <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl">
             <p className="text-[10px] text-muted-foreground font-medium leading-relaxed italic opacity-80">
               Your PDF includes branded daily summaries, outlet-specific breakdown (Cafe & Chai), and high-visibility financial analysis.
             </p>
          </div>
        </div>

        <DialogFooter className="px-8 py-8 bg-muted/30 border-t border-border/10">
          <Button 
            onClick={handleExport}
            disabled={loading || !from || !to}
            className={cn(
               "w-full h-16 rounded-full font-black uppercase tracking-[0.2em] text-sm transition-all active:scale-95 shadow-[0_20px_40px_-10px_rgba(16,185,129,0.4)]",
               loading ? "bg-muted cursor-not-allowed" : "bg-emerald-500 text-white hover:bg-emerald-600 hover:scale-[1.02]"
            )}
          >
            {loading ? (
              <>
                <Loader2 className="w-6 h-6 animate-spin mr-3" />
                Generating Analysis...
              </>
            ) : (
              <>
                <FileText className="w-6 h-6 mr-3" />
                Download PDF Report
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
