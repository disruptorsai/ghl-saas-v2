import { Outlet } from 'react-router-dom'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { AppSidebar } from './AppSidebar'
import { CampaignExecutorProvider } from '@/contexts/CampaignExecutorContext'

export function ManagementLayout() {
  return (
    <CampaignExecutorProvider>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <main className="flex-1 p-6">
            <Outlet />
          </main>
        </SidebarInset>
      </SidebarProvider>
    </CampaignExecutorProvider>
  )
}
