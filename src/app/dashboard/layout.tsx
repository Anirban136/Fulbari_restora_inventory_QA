import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { UserControls } from "@/components/user-controls"
import { LayoutDashboard, Package, ArrowLeftRight, Store, ClipboardList, Receipt } from "lucide-react"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect("/login")
  }

  // Define navigation based on active roles
  const navItems = []
  if (session.user.role === "OWNER") {
    navItems.push(
      { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
      { name: "Global Menus", href: "/dashboard/menus", icon: ClipboardList }
    )
  }
  
  if (["OWNER", "INV_MANAGER"].includes(session.user.role)) {
    navItems.push(
      { name: "Central Catalog", href: "/dashboard/inventory", icon: Package },
      { name: "Stock In", href: "/dashboard/inventory/stock-in", icon: Package },
      { name: "Dispatch", href: "/dashboard/inventory/dispatch", icon: ArrowLeftRight },
      { name: "Outlets Stock", href: "/dashboard/stores", icon: Store },
      { name: "Transactions", href: "/dashboard/transactions", icon: Receipt }
    )
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden selection:bg-emerald-500/30">
      
      {/* Premium Glass Sidebar */}
      <aside className="w-72 flex flex-col border-r border-white/10 glass-panel z-20 shadow-[10px_0_30px_rgba(0,0,0,0.5)]">
        <div className="p-8 border-b border-white/10">
          <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-200 tracking-tight text-glow">FULBARI</h1>
          <p className="text-xs font-bold tracking-widest uppercase text-muted-foreground mt-2">Operations Hub</p>
        </div>
        
        <div className="p-6 border-b border-white/10 bg-black/20">
           <p className="text-sm font-medium text-slate-400">Logged in as</p>
           <p className="font-bold text-white text-lg mt-1 truncate">{session.user.name}</p>
           <div className="inline-flex items-center px-2 py-1 rounded bg-primary/20 border border-primary/30 text-primary-foreground text-[10px] font-black tracking-widest uppercase mt-2">
             {session.user.role.replace('_', ' ')}
           </div>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-2">
          {navItems.map((item) => (
            <Link 
              key={item.href} 
              href={item.href}
              className="flex items-center gap-3 px-4 py-3 text-slate-300 hover:text-white hover:bg-white/10 rounded-xl transition-all font-medium group"
            >
              <item.icon className="w-5 h-5 text-slate-500 group-hover:text-emerald-400 transition-colors" />
              {item.name}
            </Link>
          ))}
          {/* Outlet Links for testing */}
          {(session.user.role === "OWNER" || session.user.role === "REST_STAFF") && (
            <Link href="/restaurant" className="flex items-center gap-3 px-4 py-3 text-emerald-400 hover:bg-emerald-500/10 rounded-xl transition-all font-medium mt-4 border border-emerald-500/20">
              <Store className="w-5 h-5" /> Restaurant Terminal
            </Link>
          )}
          {(session.user.role === "OWNER" || session.user.role === "CAFE_STAFF" || session.user.role === "CHAI_STAFF") && (
            <Link href="/tabs" className="flex items-center gap-3 px-4 py-3 text-emerald-400 hover:bg-emerald-500/10 rounded-xl transition-all font-medium mt-2 border border-emerald-500/20">
              <ClipboardList className="w-5 h-5" /> POS Terminal
            </Link>
          )}
        </nav>

        <div className="p-6 border-t border-white/10 bg-black/20">
          <UserControls />
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay pointer-events-none z-10"></div>
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-teal-900/10 rounded-full blur-[150px] pointer-events-none"></div>
        <div className="flex-1 overflow-y-auto p-8 lg:p-12 z-20">
          {children}
        </div>
      </main>
    </div>
  )
}
