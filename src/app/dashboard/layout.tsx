import AppLayout from "@/components/layouts/app-layout"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AppLayout>
      <div className="p-8 lg:p-12">
        {children}
      </div>
    </AppLayout>
  )
}
