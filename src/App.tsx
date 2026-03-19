import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { CommunityLayout } from './components/layout/CommunityLayout'
import { Skeleton } from '@/components/ui/skeleton'
import { Toaster } from 'sonner'

const Classroom = lazy(() => import('./pages/Classroom'))
const ModuleDetail = lazy(() => import('./pages/ModuleDetail'))
const Support = lazy(() => import('./pages/Support'))
const Members = lazy(() => import('./pages/Members'))
const About = lazy(() => import('./pages/About'))
const Admin = lazy(() => import('./pages/Admin'))

function PageLoader() {
  return (
    <div className="p-8">
      <Skeleton className="h-8 w-48" />
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
          <Route path="/support" element={<Suspense fallback={<PageLoader />}><Support /></Suspense>} />
          <Route path="/classroom" element={<Suspense fallback={<PageLoader />}><Classroom /></Suspense>} />
          <Route path="/classroom/:moduleId" element={<Suspense fallback={<PageLoader />}><ModuleDetail /></Suspense>} />
          <Route path="/classroom/:moduleId/:stepId" element={<Suspense fallback={<PageLoader />}><ModuleDetail /></Suspense>} />
          <Route path="/members" element={<Suspense fallback={<PageLoader />}><Members /></Suspense>} />
          <Route path="/about" element={<Suspense fallback={<PageLoader />}><About /></Suspense>} />
        </Route>
        <Route path="/admin" element={<Suspense fallback={<PageLoader />}><Admin /></Suspense>} />
      </Routes>
    </>
  )
}
