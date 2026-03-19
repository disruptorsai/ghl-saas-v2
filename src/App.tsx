import { Routes, Route, Navigate } from 'react-router-dom'
import { CommunityLayout } from './components/layout/CommunityLayout'
import { Toaster } from 'sonner'

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
          <Route path="/classroom" element={<PlaceholderPage title="Classroom" />} />
          <Route path="/classroom/:moduleId" element={<PlaceholderPage title="Module" />} />
          <Route path="/classroom/:moduleId/:stepId" element={<PlaceholderPage title="Step" />} />
          <Route path="/members" element={<PlaceholderPage title="Members" />} />
          <Route path="/about" element={<PlaceholderPage title="About" />} />
        </Route>
        <Route path="/admin" element={<PlaceholderPage title="Admin Dashboard" />} />
      </Routes>
    </>
  )
}
