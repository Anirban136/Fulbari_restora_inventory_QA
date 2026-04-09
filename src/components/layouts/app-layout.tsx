import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { UnifiedSidebar } from "@/components/navigation/unified-sidebar"

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect("/login")
  }

  return (
    <div className="flex h-[100dvh] lg:h-auto lg:min-h-screen bg-background selection:bg-emerald-500/30 overflow-hidden lg:overflow-visible">
      <UnifiedSidebar user={session.user} />
      
      <main className="flex-1 flex flex-col relative min-w-0">
        {/* Persistent background effects that stay consistent across pages */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay pointer-events-none z-10"></div>
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-emerald-900/5 rounded-full blur-[150px] pointer-events-none"></div>
        
        <div className="flex-1 z-20 pt-16 lg:pt-0 overflow-y-auto lg:overflow-visible custom-scrollbar">
          {children}
        </div>
      </main>
    </div>
  )
}
