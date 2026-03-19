import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { CommunityLayout } from './components/layout/CommunityLayout'
import { Skeleton } from '@/components/ui/skeleton'
import { Toaster } from 'sonner'

const Classroom = lazy(() => import('./pages/Classroom'))
const ModuleDetail = lazy(() => import('./pages/ModuleDetail'))

// Placeholder pages (will be replaced in later tasks)
function PlaceholderPage({ title }: { title: string }) {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-foreground">{title}</h1>
      <p className="text-muted-foreground mt-2">Coming soon...</p>
    </div>
  )
}

export default function App() {
  return (
    <>
      <Toaster theme="dark" position="bottom-right" />
      <Routes>
        <Route element={<CommunityLayout />}>
          <Route path="/" element={<Navigate to="/classroom" replace />} />
          <Route path="/support" element={<PlaceholderPage title="Support" />} />
          <Route
            path="/classroom"
            element={
              <Suspense
                fallback={
                  <div className="p-8">
                    <Skeleton className="h-8 w-48" />
                  </div>
                }
              >
                <Classroom />
              </Suspense>
            }
          />
          <Route
            path="/classroom/:moduleId"
            element={
              <Suspense fallback={<div className="p-8"><Skeleton className="h-8 w-48" /></div>}>
                <ModuleDetail />
              </Suspense>
            }
          />
          <Route
            path="/classroom/:moduleId/:stepId"
            element={
              <Suspense fallback={<div className="p-8"><Skeleton className="h-8 w-48" /></div>}>
                <ModuleDetail />
              </Suspense>
            }
          />
          <Route path="/members" element={<PlaceholderPage title="Members" />} />
          <Route path="/about" element={<PlaceholderPage title="About" />} />
        </Route>
        <Route path="/admin" element={<PlaceholderPage title="Admin Dashboard" />} />
      </Routes>
    </>
  )
}
