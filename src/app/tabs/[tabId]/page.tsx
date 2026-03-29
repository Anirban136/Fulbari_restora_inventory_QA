import { prisma } from "@/lib/prisma"
export const dynamic = 'force-dynamic'
import Link from "next/link"
import { notFound } from "next/navigation"
import { addTabItem, removeTabItem, closeTab } from "./actions"
import { Button } from "@/components/ui/button"
import { ArrowLeft, ShoppingCart, CreditCard, Banknote, SplitSquareHorizontal } from "lucide-react"

export default async function TabTerminal({ params }: { params: Promise<{ tabId: string }> }) {
  const { tabId } = await params
  
  const tab = await prisma.tab.findUnique({
    where: { id: tabId },
    include: {
      Items: { include: { MenuItem: true } },
      Outlet: true
    }
  })

  if (!tab || tab.status !== "OPEN") return notFound()

  const availableMenu = await prisma.menuItem.findMany({
    where: { outletId: tab.outletId, isAvailable: true },
    orderBy: { categoryId: 'asc' }
  })

  // Group menu by category
  const categorizedMenu = availableMenu.reduce((acc: any, item) => {
    const defaultCat = item.categoryId || 'GENERAL'
    const categoryName = defaultCat.toUpperCase().trim()
    if (!acc[categoryName]) acc[categoryName] = []
    acc[categoryName].push(item)
    return acc
  }, {})

  return (
    <div className="h-screen bg-background flex flex-col lg:flex-row overflow-hidden selection:bg-emerald-500/30 selection:text-emerald-100 relative">
      
      {/* Background Decorators */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay pointer-events-none z-0"></div>
      <div className="absolute top-1/2 left-1/4 w-[600px] h-[600px] bg-emerald-900/10 rounded-full blur-[150px] pointer-events-none -translate-y-1/2 z-0"></div>

      {/* Left Pane: MENU GRID */}
      <div className="flex-1 flex flex-col pt-4 z-10 relative min-h-0 overflow-hidden">
        <header className="p-4 sm:px-8 sm:pb-6 border-b border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between bg-background/50 backdrop-blur-md shrink-0">
          <Link href="/tabs">
            <Button variant="outline" className="text-slate-300 border-white/10 hover:bg-white/10 hover:text-white rounded-xl h-10 sm:h-12 px-4 sm:px-6 gap-2 font-bold backdrop-blur-md">
              <ArrowLeft className="w-4 h-4" /> <span className="hidden sm:inline">Back to Terminal</span><span className="sm:hidden">Back</span>
            </Button>
          </Link>
          <div className="flex items-center gap-3 sm:gap-4 shrink-0 mt-4 sm:mt-0">
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_#10b981]"></div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight uppercase truncate">{tab.Outlet.name} <span className="text-emerald-500/50">POS</span></h2>
          </div>
        </header>
        
        <div className="flex-1 overflow-auto p-8 space-y-12 pb-32">
          {Object.keys(categorizedMenu).map(category => (
            <section key={category}>
              <h3 className="text-xs font-black tracking-[0.2em] text-emerald-400 uppercase mb-6 flex items-center gap-4">
                {category}
                <div className="h-px bg-white/10 flex-1"></div>
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                {categorizedMenu[category].map((item: any) => (
                  <form key={item.id} action={addTabItem.bind(null, tab.id, item.id, item.price)}>
                    <button type="submit" className="w-full text-left bg-white/5 backdrop-blur-md hover:bg-emerald-500/10 border border-white/10 hover:border-emerald-500/50 rounded-2xl p-5 transition-all active:scale-95 group shadow-lg hover:shadow-[0_0_25px_-5px_oklch(0.55_0.16_150_/_0.3)]">
                      <div className="font-bold text-slate-200 group-hover:text-emerald-300 text-lg mb-2 truncate transition-colors">{item.name}</div>
                      <div className="text-emerald-500 font-extrabold text-xl">₹{item.price.toFixed(2)}</div>
                    </button>
                  </form>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>

      {/* Right Pane: CART / BILL */}
      <div className="w-full lg:w-1/3 lg:min-w-[400px] lg:max-w-[500px] h-[50vh] lg:h-auto bg-black/40 backdrop-blur-2xl flex flex-col border-t lg:border-t-0 lg:border-l border-white/10 shadow-[0_-20px_80px_rgba(0,0,0,0.8)] lg:shadow-[-20px_0_40px_rgba(0,0,0,0.5)] z-20 shrink-0 relative">
        <header className="p-3 sm:p-8 border-b border-white/10 bg-white/5 relative overflow-hidden shrink-0">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-[40px] pointer-events-none"></div>
          <h2 className="text-xl sm:text-3xl font-black text-white tracking-tight break-words relative z-10 text-glow">{tab.customerName}</h2>
          <p className="text-emerald-400/80 font-bold text-[10px] sm:text-xs tracking-widest mt-0 sm:mt-2 uppercase relative z-10">Tab #{tab.id.slice(-6)}</p>
        </header>

        <div className="flex-1 overflow-auto p-4">
          {tab.Items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-500 animate-in fade-in duration-500">
              <ShoppingCart className="w-16 h-16 mb-4 opacity-20" />
              <p className="font-medium tracking-wide">Awaiting Order</p>
            </div>
          ) : (
            <ul className="space-y-3">
              {tab.Items.map(item => (
                <li key={item.id} className="p-2 sm:p-4 flex gap-2 sm:gap-4 bg-white/5 border border-white/10 rounded-2xl animate-in slide-in-from-right-4 duration-300 hover:border-white/20 transition-colors">
                  <div className="font-black text-emerald-950 bg-emerald-400 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg h-fit shadow-[0_0_15px_-3px_#34d399] tracking-wider w-8 sm:w-12 text-center text-xs sm:text-base">{item.quantity}x</div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-200 text-sm sm:text-lg truncate">{item.MenuItem.name}</p>
                    <p className="text-slate-500 font-medium text-xs sm:text-sm">₹{item.priceAtTime.toFixed(2)} each</p>
                  </div>
                  <div className="text-right flex flex-col items-end shrink-0">
                    <p className="font-black text-white text-sm sm:text-xl">₹{(item.quantity * item.priceAtTime).toFixed(2)}</p>
                    <form action={removeTabItem.bind(null, item.id, tab.id, item.quantity * item.priceAtTime)}>
                      <button type="submit" className="text-[10px] sm:text-xs text-red-400/70 hover:text-red-400 mt-1 sm:mt-2 font-bold tracking-widest uppercase hover:underline transition-all">Remove</button>
                    </form>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="p-3 sm:p-8 bg-black/60 border-t border-white/10 z-10 backdrop-blur-xl shrink-0">
          <div className="flex justify-between items-center mb-2 sm:mb-8">
            <span className="text-slate-400 text-xs sm:text-sm font-bold tracking-widest uppercase">Total Due</span>
            <span className="text-2xl sm:text-5xl font-black text-white text-glow">₹{tab.totalAmount.toFixed(2)}</span>
          </div>

          <form action={closeTab} className="space-y-3 sm:space-y-6">
            <input type="hidden" name="tabId" value={tab.id} />
            
            <div className="space-y-1 sm:space-y-3">
              <label className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-widest">Select Payment Method</label>
              <div className="grid grid-cols-3 gap-3">
                <label className="cursor-pointer group">
                  <input type="radio" name="paymentMode" value="CASH" className="peer sr-only" required />
                  <div className="flex flex-col items-center justify-center gap-2 py-2 sm:py-4 rounded-xl border-2 border-white/10 bg-white/5 font-bold text-slate-400 peer-checked:border-emerald-500 peer-checked:bg-emerald-500/10 peer-checked:text-emerald-400 peer-checked:shadow-[0_0_20px_-5px_#10b981] group-hover:bg-white/10 transition-all text-[10px] sm:text-xs">
                    <Banknote className="w-4 h-4 sm:w-5 sm:h-5 mb-1" />
                    CASH
                  </div>
                </label>
                <label className="cursor-pointer group">
                  <input type="radio" name="paymentMode" value="ONLINE" className="peer sr-only" required />
                  <div className="flex flex-col items-center justify-center gap-2 py-2 sm:py-4 rounded-xl border-2 border-white/10 bg-white/5 font-bold text-slate-400 peer-checked:border-emerald-500 peer-checked:bg-emerald-500/10 peer-checked:text-emerald-400 peer-checked:shadow-[0_0_20px_-5px_#10b981] group-hover:bg-white/10 transition-all text-[10px] sm:text-xs text-center leading-tight">
                    <CreditCard className="w-4 h-4 sm:w-5 sm:h-5 mb-1" />
                    UPI/CARD
                  </div>
                </label>
                <label className="cursor-pointer group">
                  <input type="radio" name="paymentMode" value="SPLIT" className="peer sr-only" required />
                  <div className="flex flex-col items-center justify-center gap-2 py-2 sm:py-4 rounded-xl border-2 border-white/10 bg-white/5 font-bold text-slate-400 peer-checked:border-emerald-500 peer-checked:bg-emerald-500/10 peer-checked:text-emerald-400 peer-checked:shadow-[0_0_20px_-5px_#10b981] group-hover:bg-white/10 transition-all text-[10px] sm:text-xs">
                    <SplitSquareHorizontal className="w-4 h-4 sm:w-5 sm:h-5 mb-1" />
                    SPLIT
                  </div>
                </label>
              </div>
            </div>
            
            <Button 
               type="submit" 
               disabled={tab.Items.length === 0}
               className="w-full h-12 sm:h-16 text-sm sm:text-xl font-black tracking-widest uppercase bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_40px_-5px_oklch(0.55_0.16_150_/_0.5)] rounded-xl sm:rounded-2xl transition-all disabled:opacity-20 disabled:cursor-not-allowed disabled:shadow-none active:scale-[0.98]"
            >
              Checkout & Close Tab
            </Button>
          </form>
        </div>
      </div>

    </div>
  )
}
