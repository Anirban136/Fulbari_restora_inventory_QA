import { prisma } from "@/lib/prisma"
export const dynamic = 'force-dynamic'
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { Users, Truck, IndianRupee, Package, Search, Phone, MapPin } from "lucide-react"
import { getISTMonthBounds, formatDateIST } from "@/lib/utils"
import { AddVendorDialog } from "../inventory/AddVendorDialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export default async function VendorsPage() {
  const session = await getServerSession(authOptions)
  const isOwner = session?.user?.role === "OWNER"

  if (!isOwner) {
    return <div className="p-8 text-center text-red-400">Unauthorized</div>
  }

  const { startUTC, endUTC } = getISTMonthBounds()

  // Fetch vendors with their items and stock-in logs for the current month
  const vendors = await prisma.vendor.findMany({
    include: {
      Items: {
        include: {
          Ledger: {
            where: {
              type: "STOCK_IN",
              createdAt: { gte: startUTC, lte: endUTC }
            }
          }
        }
      }
    },
    orderBy: { name: 'asc' }
  })

  // Calculate monthly stats for each vendor
  const vendorStats = vendors.map(vendor => {
    let monthlyCollection = 0
    let monthlyPayment = 0

    vendor.Items.forEach(item => {
      item.Ledger.forEach(log => {
        monthlyCollection += log.quantity
        // Use the item's costPerUnit at calculation time
        monthlyPayment += log.quantity * (item.costPerUnit || 0)
      })
    })

    return {
      ...vendor,
      monthlyCollection,
      monthlyPayment
    }
  })

  const totalMonthlyPayment = vendorStats.reduce((sum, v) => sum + v.monthlyPayment, 0)

  return (
    <div className="space-y-8 relative">
      {/* Background Decorators */}
      <div className="absolute top-[-50px] right-[-50px] w-[400px] h-[400px] bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10 glass-panel p-6 rounded-3xl">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
            Vendor Management
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-bounce shadow-[0_0_10px_#10b981]"></div>
          </h2>
          <p className="text-muted-foreground mt-1 font-medium text-sm tracking-wide uppercase">Track supplier performance and monthly payment obligations.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="px-6 py-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex flex-col items-center sm:items-end">
             <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-1">Total Monthly Payout</span>
             <span className="text-xl font-black text-white">₹{totalMonthlyPayment.toLocaleString('en-IN')}</span>
          </div>
          <AddVendorDialog />
        </div>
      </div>

      <div className="glass-panel rounded-3xl overflow-hidden relative z-10 shadow-2xl">
        <div className="p-0 max-h-[75vh] overflow-auto custom-scrollbar-premium">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-white/10 hover:bg-transparent">
                <TableHead className="font-bold text-slate-400 uppercase tracking-widest text-xs h-14 bg-black/40 backdrop-blur-md sticky top-0 z-20 px-6">Vendor Details</TableHead>
                <TableHead className="font-bold text-slate-400 uppercase tracking-widest text-xs h-14 bg-black/40 backdrop-blur-md sticky top-0 z-20 px-6">Contact Info</TableHead>
                <TableHead className="font-bold text-slate-400 uppercase tracking-widest text-xs h-14 bg-black/40 backdrop-blur-md sticky top-0 z-20 text-right px-6">Monthly Collection</TableHead>
                <TableHead className="font-bold text-slate-400 uppercase tracking-widest text-xs h-14 bg-black/40 backdrop-blur-md sticky top-0 z-20 text-right px-6">Monthly Payment</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vendorStats.length === 0 ? (
                <TableRow className="border-b border-white/10">
                  <TableCell colSpan={4} className="h-40 text-center text-slate-500">
                    <span className="flex flex-col items-center justify-center">
                      <Truck className="w-10 h-10 opacity-20 mb-3" />
                      No vendors registered yet.
                    </span>
                  </TableCell>
                </TableRow>
              ) : (
                vendorStats.map((vendor) => (
                  <TableRow key={vendor.id} className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                    <TableCell className="px-6 py-5">
                      <div className="flex flex-col">
                        <span className="font-black text-slate-100 group-hover:text-emerald-400 transition-colors text-base">{vendor.name}</span>
                        <div className="flex items-center gap-1.5 mt-1 opacity-60">
                           <MapPin className="w-3 h-3" />
                           <span className="text-xs text-slate-400 truncate max-w-[200px]">{vendor.address || 'No address provided'}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-5">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-slate-300">
                           <Phone className="w-3.5 h-3.5 text-emerald-500/70" />
                           <span className="text-sm font-medium">{vendor.contact || 'No contact'}</span>
                        </div>
                        {vendor.email && (
                          <div className="text-xs text-slate-500 lowercase ml-5">{vendor.email}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right px-6 py-5">
                      <div className="inline-flex flex-col items-end">
                        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary-foreground font-black text-sm">
                          <Package className="w-3.5 h-3.5" />
                          {vendor.monthlyCollection.toFixed(1)}
                        </span>
                        <span className="text-[10px] text-slate-500 uppercase tracking-tighter mt-1">units received</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right px-6 py-5">
                      <div className="inline-flex flex-col items-end">
                        <span className="text-xl font-black text-white flex items-center gap-1 drop-shadow-sm">
                          <IndianRupee className="w-4 h-4 text-emerald-400" />
                          {vendor.monthlyPayment.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </span>
                        <span className="text-[10px] text-emerald-500/60 font-medium uppercase tracking-widest mt-1">estimated due</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
        <div className="glass-panel p-6 rounded-3xl border-white/5 bg-white/[0.02] flex flex-col items-center text-center">
           <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center mb-4 border border-amber-500/20">
              <ClipboardList className="w-6 h-6 text-amber-400" />
           </div>
           <h4 className="text-sm font-bold text-slate-300 uppercase tracking-widest mb-2">Automated Billing</h4>
           <p className="text-xs text-slate-500 px-4">Payments are calculated based on the cost price specified during stock intake.</p>
        </div>
        <div className="glass-panel p-6 rounded-3xl border-white/5 bg-white/[0.02] flex flex-col items-center text-center">
           <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center mb-4 border border-blue-500/20">
              <Activity className="w-6 h-6 text-blue-400" />
           </div>
           <h4 className="text-sm font-bold text-slate-300 uppercase tracking-widest mb-2">Performance Tracking</h4>
           <p className="text-xs text-slate-500 px-4">Monitor which vendors provide the most stock volume month-over-month.</p>
        </div>
        <div className="glass-panel p-6 rounded-3xl border-white/5 bg-white/[0.02] flex flex-col items-center text-center">
           <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center mb-4 border border-purple-500/20">
              <History className="w-6 h-6 text-purple-400" />
           </div>
           <h4 className="text-sm font-bold text-slate-300 uppercase tracking-widest mb-2">Cycle: {new Date().toLocaleString('default', { month: 'long' })}</h4>
           <p className="text-xs text-slate-500 px-4">Current reporting period: {new Date().getDate()} days elapsed in this cycle.</p>
        </div>
      </div>
    </div>
  )
}

// Re-using icons from lucide-react that might not be imported above
import { ClipboardList, Activity, History } from "lucide-react"
