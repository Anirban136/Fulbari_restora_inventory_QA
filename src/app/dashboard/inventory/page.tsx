import { prisma } from "@/lib/prisma"
export const dynamic = 'force-dynamic'
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { AddItemDialog } from "./AddItemDialog"
import { GlobalCatalogFeed } from "./GlobalCatalogFeed"
import { Layers } from "lucide-react"

export default async function GlobalCatalogPage() {
  const session = await getServerSession(authOptions)
  const role = session?.user?.role || ""
  const isOwner = role === "OWNER"
  const isManager = role === "INV_MANAGER"

  const items = await prisma.item.findMany({
    orderBy: { name: 'asc' }
  })

  // Gather unique categories dynamically from the existing catalog
  const existingCategories = Array.from(new Set(items.map((item: any) => item.category).filter(Boolean))) as string[]

  return (
    <div className="space-y-12 relative px-4 pt-6 pb-20 max-w-[1600px] mx-auto">
      {/* Background Decorators */}
      <div className="absolute top-[-100px] right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[150px] pointer-events-none -z-10"></div>
      <div className="absolute bottom-0 left-[-100px] w-[400px] h-[400px] bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none -z-10"></div>

      {/* Header Section */}
      <header className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-8 pt-4 lg:pt-0">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
             <div className="p-4 bg-primary/10 rounded-3xl border border-primary/20 shadow-[0_0_30px_rgba(16,185,129,0.1)]">
               <Layers className="text-primary w-8 h-8" />
             </div>
             <div>
               <h2 className="text-4xl lg:text-7xl font-black tracking-tighter text-white leading-none">
                 GLOBAL <span className="text-primary">CATALOG</span>
               </h2>
               <p className="text-muted-foreground mt-3 font-black text-[10px] lg:text-xs tracking-[0.4em] uppercase opacity-60">
                 Central Repository Control • Node Management
               </p>
             </div>
          </div>
        </div>
        
        <div className="flex flex-col gap-3 min-w-[240px] w-full sm:w-auto self-start md:self-end">
          <AddItemDialog existingCategories={existingCategories} />
        </div>
      </header>

      {/* Main Dynamic Feed (Client Component) */}
      <GlobalCatalogFeed 
        items={items} 
        categories={existingCategories} 
        isOwner={isOwner}
        isManager={isManager}
      />
    </div>
  )
}
