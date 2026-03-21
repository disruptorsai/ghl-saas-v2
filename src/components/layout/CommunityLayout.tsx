import { Outlet, useLocation } from 'react-router-dom'
import { TopNav } from './TopNav'

export function CommunityLayout() {
  const location = useLocation()
  const isManagement = location.pathname.includes('/management')

  return (
    <div className="min-h-screen bg-background">
      <TopNav />
      <main className={isManagement ? '' : 'max-w-7xl mx-auto'}>
        <Outlet />
      </main>
    </div>
  )
}
