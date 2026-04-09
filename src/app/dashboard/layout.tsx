import AppLayout from "@/components/layouts/app-layout"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AppLayout>
      <div className="p-4 sm:p-6 lg:p-10">
        {children}
      </div>
    </AppLayout>
  )
}
