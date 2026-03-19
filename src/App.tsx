import { Routes, Route, Navigate } from 'react-router-dom'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/classroom" replace />} />
      <Route path="/classroom" element={<div className="p-8 text-foreground">Classroom — Coming Soon</div>} />
      <Route path="/support" element={<div className="p-8 text-foreground">Support — Coming Soon</div>} />
      <Route path="/members" element={<div className="p-8 text-foreground">Members — Coming Soon</div>} />
      <Route path="/about" element={<div className="p-8 text-foreground">About — Coming Soon</div>} />
    </Routes>
  )
}
