import { SubscriptionStatusAlert } from "@/components/subscription-status-alert"
import { AppSidebar, MobileHeader } from "@/components/app-sidebar"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <MobileHeader />
        <main className="flex-1 overflow-auto p-4 md:p-6 lg:p-8">
          <SubscriptionStatusAlert />
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
