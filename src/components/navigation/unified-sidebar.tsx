"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { 
  LayoutDashboard, 
  Package, 
  ArrowLeftRight, 
  Store, 
  ClipboardList, 
  Receipt,
  Menu,
  X,
  Home,
  Coffee,
  History,
  Settings,
  LogOut,
  ChevronRight,
  Users,
  ShieldCheck,
  AlertTriangle,
  Trash2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { UserControls } from "@/components/user-controls"
import { cn } from "@/lib/utils"

interface NavItem {
  name: string
  href: string
  icon: any
  roles?: string[]
}

export function UnifiedSidebar({ user }: { user: any }) {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  // Close sidebar when route changes
  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  const navItems: NavItem[] = [
    { name: "Home Dashboard", href: "/dashboard", icon: Home, roles: ["OWNER"] },
    { name: "Database Reset", href: "/dashboard/wipe", icon: AlertTriangle, roles: ["OWNER"] },
    { name: "Global Catalog", href: "/dashboard/inventory", icon: Package, roles: ["OWNER", "INV_MANAGER"] },
    { name: "Global Menus", href: "/dashboard/menus", icon: ClipboardList, roles: ["OWNER", "INV_MANAGER"] },
    { name: "Stock In", href: "/dashboard/inventory/stock-in", icon: Package, roles: ["OWNER", "INV_MANAGER"] },
    { name: "Dispatch", href: "/dashboard/inventory/dispatch", icon: ArrowLeftRight, roles: ["OWNER", "INV_MANAGER"] },
    { name: "Vendors", href: "/dashboard/vendors", icon: Users, roles: ["OWNER"] },
    { name: "Outlets Stock", href: "/dashboard/stores", icon: Store, roles: ["OWNER", "INV_MANAGER"] },
    { name: "Chai Hub", href: "/chai", icon: Coffee, roles: ["OWNER", "CHAI_STAFF"] },
    { name: "Cafe Hub", href: "/cafe", icon: Coffee, roles: ["OWNER", "CAFE_STAFF"] },
    { name: "Restaurant", href: "/restaurant", icon: Store, roles: ["OWNER", "REST_STAFF"] },
    { name: "Transactions", href: "/dashboard/transactions", icon: Receipt, roles: ["OWNER"] },
    { name: "Waste Tracking", href: "/dashboard/inventory/waste", icon: Trash2, roles: ["OWNER", "INV_MANAGER"] },
    { name: "Passcode Control", href: "/dashboard/settings/passwords", icon: ShieldCheck, roles: ["OWNER"] },
  ]

  const filteredItems = navItems.filter(item => 
    !item.roles || item.roles.includes(user.role)
  )

  return (
    <>
      {/* Mobile Top Header (Fixed) */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-20 px-6 flex items-center justify-between border-b border-white/10 bg-black/40 backdrop-blur-xl z-[45] pointer-events-none">
        <h1 className="text-xl font-black text-emerald-400 tracking-tighter">FULBARI</h1>
        <Button 
          variant="outline" 
          size="icon" 
          onClick={() => setIsOpen(!isOpen)}
          className="rounded-full w-12 h-12 border-white/10 bg-emerald-500/10 backdrop-blur-xl shadow-2xl text-emerald-400 border-emerald-500/20 pointer-events-auto"
        >
          {isOpen ? <X className="w-6 h-6 text-red-400" /> : <Menu className="w-6 h-6" />}
        </Button>
      </div>

      {/* Desktop Sidebar / Mobile Overaly */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-40 w-72 transform transition-transform duration-500 ease-in-out lg:translate-x-0 lg:static lg:inset-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {/* Backdrop for mobile */}
        {isOpen && (
          <div 
            className="fixed inset-0 bg-black/80 backdrop-blur-sm lg:hidden" 
            onClick={() => setIsOpen(false)}
          />
        )}

        <aside className="relative h-full flex flex-col border-r border-white/10 bg-black/95 lg:bg-black/20 backdrop-blur-3xl lg:backdrop-blur-none z-50 overflow-hidden shadow-[20px_0_50px_rgba(0,0,0,0.5)] lg:shadow-none">
          {/* Grain Overlay */}
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5 mix-blend-overlay pointer-events-none"></div>

          <div className="p-8 border-b border-white/10 shrink-0">
            <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-200 tracking-tighter text-glow">FULBARI</h1>
            <p className="text-[10px] font-black tracking-[0.2em] uppercase text-muted-foreground mt-2 opacity-60">Operations Unit</p>
          </div>
          
          <div className="p-6 border-b border-white/10 bg-white/5 shrink-0">
             <div className="flex items-center gap-3">
               <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 p-0.5 shadow-lg">
                 <div className="w-full h-full rounded-[10px] bg-black flex items-center justify-center font-black text-emerald-400 text-lg">
                   {user.name?.[0].toUpperCase()}
                 </div>
               </div>
               <div className="flex-1 min-w-0">
                 <p className="font-bold text-white text-sm truncate">{user.name}</p>
                 <p className="text-[10px] font-black tracking-widest uppercase text-emerald-400/80 mt-0.5">{user.role.replace('_', ' ')}</p>
               </div>
             </div>
          </div>

          <nav className="flex-1 overflow-y-auto p-4 space-y-1 custom-scrollbar">
            {filteredItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link 
                  key={item.href} 
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-300 group relative overflow-hidden",
                    isActive 
                      ? "bg-emerald-500/10 text-white border border-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.1)]" 
                      : "text-slate-400 hover:text-white hover:bg-white/5"
                  )}
                >
                  <item.icon className={cn(
                    "w-5 h-5 transition-transform group-hover:scale-110",
                    isActive ? "text-emerald-400" : "text-slate-500 group-hover:text-slate-300"
                  )} />
                  <span className="font-bold tracking-tight text-sm">{item.name}</span>
                  {isActive && (
                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,1)]" />
                  )}
                  {/* Subtle hover sweep */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                </Link>
              )
            })}
          </nav>

          <div className="p-6 border-t border-white/10 bg-black/40 shrink-0">
            <UserControls role={user.role} />
          </div>
        </aside>
      </div>
    </>
  )
}
