import { Outlet } from 'react-router-dom'
import { TopNav } from './TopNav'

export function CommunityLayout() {
  return (
    <div className="min-h-screen bg-background">
      <TopNav />
      <main className="max-w-7xl mx-auto">
        <Outlet />
      </main>
    </div>
  )
}
