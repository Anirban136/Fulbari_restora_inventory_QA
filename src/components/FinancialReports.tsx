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
      const url = `/api/export/transactions?from=${from}&to=${to}`;
      window.location.assign(url);
      setOpen(false); // Close modal on success
    } catch (error) {
      console.error("Export failed", error);
      alert("Failed to generate report. Please try again.");
    } finally {
      setTimeout(() => setLoading(false), 2000);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger 
        render={
          <button className="flex items-center gap-3 px-8 py-4 bg-foreground text-background rounded-3xl text-xs font-black uppercase tracking-[0.2em] hover:scale-105 transition-all active:scale-95 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.3)] group overflow-hidden relative" />
        }
      >
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-blue-500/20 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
        <Download className="w-4 h-4" />
        Download Report
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-md bg-background border-border/40 p-0 overflow-hidden rounded-[2.5rem] shadow-2xl">
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/10 rounded-full blur-[80px] pointer-events-none"></div>
        
        <DialogHeader className="px-8 pt-8 pb-4 relative z-10">
          <div className="flex items-center gap-4 mb-2">
            <div className="p-3 bg-primary/10 rounded-2xl">
              <FileSpreadsheet className="w-6 h-6 text-primary" />
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
                  className="w-full bg-muted/30 border border-border/40 rounded-2xl px-10 py-3 text-xs font-bold text-foreground focus:ring-2 focus:ring-primary/50 outline-none transition-all hover:bg-muted/50"
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
                  className="w-full bg-muted/30 border border-border/40 rounded-2xl px-10 py-3 text-xs font-bold text-foreground focus:ring-2 focus:ring-primary/50 outline-none transition-all hover:bg-muted/50"
                />
              </div>
            </div>
          </div>

          <div className="p-4 bg-muted/20 border border-border/20 rounded-2xl">
             <p className="text-[10px] text-muted-foreground font-medium leading-relaxed italic opacity-80">
               Your CSV includes daily summaries, multi-mode sub-totals, and a full item breakdown for the selected range.
             </p>
          </div>
        </div>

        <DialogFooter className="px-8 py-6 bg-muted/30 border-t border-border/10 flex flex-col sm:flex-row gap-3">
          <Button 
            onClick={handleExport}
            disabled={loading || !from || !to}
            className={cn(
               "flex-1 h-14 rounded-2xl font-black uppercase tracking-widest text-xs transition-all active:scale-95 shadow-xl",
               loading ? "bg-muted cursor-not-allowed" : "bg-primary text-primary-foreground hover:scale-[1.02]"
            )}
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                Generating...
              </>
            ) : (
              <>
                <Download className="w-5 h-5 mr-3" />
                Download CSV Report
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
