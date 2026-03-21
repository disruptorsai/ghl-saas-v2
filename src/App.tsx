import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from '@/contexts/AuthContext'
import { ClientProvider } from '@/contexts/ClientContext'
import { ProtectedRoute } from '@/components/layout/ProtectedRoute'
import { CommunityLayout } from '@/components/layout/CommunityLayout'
import { ManagementLayout } from '@/components/layout/ManagementLayout'
import { Skeleton } from '@/components/ui/skeleton'
import { Toaster } from 'sonner'

// Skool pages
const Classroom = lazy(() => import('./pages/Classroom'))
const ModuleDetail = lazy(() => import('./pages/ModuleDetail'))
const Support = lazy(() => import('./pages/Support'))
const Members = lazy(() => import('./pages/Members'))
const Admin = lazy(() => import('./pages/Admin'))

// Auth
const Auth = lazy(() => import('./pages/Auth'))

// Agency pages
const ClientList = lazy(() => import('./pages/ClientList'))
const CreateClient = lazy(() => import('./pages/CreateClient'))

// Management pages (from LAS)
const Dashboard = lazy(() => import('./pages/management/Dashboard'))
const WhatToDo = lazy(() => import('./pages/management/WhatToDo'))
const SetupSOP = lazy(() => import('./pages/management/SetupSOP'))
const SetupConnection = lazy(() => import('./pages/management/SetupConnection'))
const Campaigns = lazy(() => import('./pages/management/Campaigns'))
const CampaignDetail = lazy(() => import('./pages/management/CampaignDetail'))
const TextAiRep = lazy(() => import('./pages/management/TextAiRep'))
const TextAiRepConfig = lazy(() => import('./pages/management/TextAiRepConfig'))
const TextAiRepTemplates = lazy(() => import('./pages/management/TextAiRepTemplates'))
const VoiceAiRep = lazy(() => import('./pages/management/VoiceAiRep'))
const VoiceAiRepConfig = lazy(() => import('./pages/management/VoiceAiRepConfig'))
const VoiceAiRepTemplates = lazy(() => import('./pages/management/VoiceAiRepTemplates'))
const Prompts = lazy(() => import('./pages/management/Prompts'))
const TextPrompts = lazy(() => import('./pages/management/TextPrompts'))
const VoicePrompts = lazy(() => import('./pages/management/VoicePrompts'))
const KnowledgeBase = lazy(() => import('./pages/management/KnowledgeBase'))
const DeployAiReps = lazy(() => import('./pages/management/DeployAiReps'))
const DebugAiReps = lazy(() => import('./pages/management/DebugAiReps'))
const DebugTextAi = lazy(() => import('./pages/management/DebugTextAi'))
const DebugVoiceAi = lazy(() => import('./pages/management/DebugVoiceAi'))
const ClientPortal = lazy(() => import('./pages/management/ClientPortal'))
const ChatAnalytics = lazy(() => import('./pages/management/ChatAnalytics'))
const ChatbotDashboard = lazy(() => import('./pages/management/ChatbotDashboard'))
const ChatWithAi = lazy(() => import('./pages/management/ChatWithAi'))
const VoiceAiDashboard = lazy(() => import('./pages/management/VoiceAiDashboard'))
const VoiceAiChat = lazy(() => import('./pages/management/VoiceAiChat'))
const CallHistory = lazy(() => import('./pages/management/CallHistory'))
const Analytics = lazy(() => import('./pages/management/Analytics'))
const WebinarSetup = lazy(() => import('./pages/management/WebinarSetup'))
const WebinarChecklist = lazy(() => import('./pages/management/WebinarChecklist'))
const WebinarConfig = lazy(() => import('./pages/management/WebinarConfig'))
const WebinarCredentials = lazy(() => import('./pages/management/WebinarCredentials'))
const WebinarAnalytics = lazy(() => import('./pages/management/WebinarAnalytics'))
const WebinarPresAgent = lazy(() => import('./pages/management/WebinarPresAgent'))
const DemoPages = lazy(() => import('./pages/management/DemoPages'))
const DemoPageDetail = lazy(() => import('./pages/management/DemoPageDetail'))
const ClientSettings = lazy(() => import('./pages/management/ClientSettings'))
const AccountSettings = lazy(() => import('./pages/management/AccountSettings'))
const Credentials = lazy(() => import('./pages/management/Credentials'))
const ClientFeedback = lazy(() => import('./pages/management/ClientFeedback'))
const AuditLog = lazy(() => import('./pages/management/AuditLog'))

function PageLoader() {
  return (
    <div className="p-8">
      <Skeleton className="h-8 w-48" />
    </div>
  )
}

function S({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<PageLoader />}>{children}</Suspense>
}

/** Agency users see client list, client users go straight to their community */
function RoleRedirect() {
  const { role, clientId } = useAuth()
  if (role === 'client' && clientId) {
    return <Navigate to={`/c/${clientId}/classroom`} replace />
  }
  return <S><ClientList /></S>
}

/** Management routes shared between agency and client views */
function ManagementRoutes() {
  return (
    <Route path="management" element={<ManagementLayout />}>
      <Route index element={<Navigate to="dashboard" replace />} />
      <Route path="dashboard" element={<S><Dashboard /></S>} />
      <Route path="what-to-do" element={<S><WhatToDo /></S>} />
      <Route path="setup-guide" element={<S><SetupSOP /></S>} />
      <Route path="setup" element={<S><SetupConnection /></S>} />
      <Route path="campaigns" element={<S><Campaigns /></S>} />
      <Route path="campaigns/:campaignId" element={<S><CampaignDetail /></S>} />
      <Route path="text-ai-rep" element={<S><TextAiRep /></S>} />
      <Route path="text-ai-rep/configuration" element={<S><TextAiRepConfig /></S>} />
      <Route path="text-ai-rep/templates" element={<S><TextAiRepTemplates /></S>} />
      <Route path="voice-ai-rep" element={<S><VoiceAiRep /></S>} />
      <Route path="voice-ai-rep/configuration" element={<S><VoiceAiRepConfig /></S>} />
      <Route path="voice-ai-rep/templates" element={<S><VoiceAiRepTemplates /></S>} />
      <Route path="prompts" element={<S><Prompts /></S>} />
      <Route path="prompts/text" element={<S><TextPrompts /></S>} />
      <Route path="prompts/voice" element={<S><VoicePrompts /></S>} />
      <Route path="knowledge-base" element={<S><KnowledgeBase /></S>} />
      <Route path="deploy-ai-reps" element={<S><DeployAiReps /></S>} />
      <Route path="debug-ai-reps" element={<S><DebugAiReps /></S>} />
      <Route path="debug-ai-reps/text" element={<S><DebugTextAi /></S>} />
      <Route path="debug-ai-reps/voice" element={<S><DebugVoiceAi /></S>} />
      <Route path="client-portal" element={<S><ClientPortal /></S>} />
      <Route path="chat-analytics" element={<S><ChatAnalytics /></S>} />
      <Route path="chatbot/dashboard" element={<S><ChatbotDashboard /></S>} />
      <Route path="chatbot/chat-with-ai" element={<S><ChatWithAi /></S>} />
      <Route path="voice-ai/dashboard" element={<S><VoiceAiDashboard /></S>} />
      <Route path="voice-ai/chat-with-ai" element={<S><VoiceAiChat /></S>} />
      <Route path="voice-ai/call-history" element={<S><CallHistory /></S>} />
      <Route path="analytics" element={<S><Analytics /></S>} />
      <Route path="webinar-setup" element={<S><WebinarSetup /></S>} />
      <Route path="webinar-setup/checklist" element={<S><WebinarChecklist /></S>} />
      <Route path="webinar-setup/configuration" element={<S><WebinarConfig /></S>} />
      <Route path="webinar-setup/credentials" element={<S><WebinarCredentials /></S>} />
      <Route path="webinar-setup/analytics" element={<S><WebinarAnalytics /></S>} />
      <Route path="webinar-presentation-agent" element={<S><WebinarPresAgent /></S>} />
      <Route path="demo-pages" element={<S><DemoPages /></S>} />
      <Route path="demo-pages/:pageId" element={<S><DemoPageDetail /></S>} />
      <Route path="settings" element={<S><ClientSettings /></S>} />
      <Route path="account-settings" element={<S><AccountSettings /></S>} />
      <Route path="credentials" element={<S><Credentials /></S>} />
      <Route path="feedback" element={<S><ClientFeedback /></S>} />
      <Route path="audit-log" element={<S><AuditLog /></S>} />
    </Route>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <Toaster theme="dark" position="bottom-right" />
      <Routes>
        {/* Public */}
        <Route path="/auth" element={<S><Auth /></S>} />

        {/* Protected */}
        <Route element={<ProtectedRoute />}>
          {/* Agency: client list or client redirect */}
          <Route path="/" element={<RoleRedirect />} />
          <Route path="/create" element={<S><CreateClient /></S>} />
          <Route path="/admin" element={<S><Admin /></S>} />

          {/* Community shell with client context (agency: clientId in URL) */}
          <Route path="/c/:clientId" element={<ClientProvider><CommunityLayout /></ClientProvider>}>
            <Route index element={<Navigate to="classroom" replace />} />
            <Route path="support" element={<S><Support /></S>} />
            <Route path="classroom" element={<S><Classroom /></S>} />
            <Route path="classroom/:moduleId" element={<S><ModuleDetail /></S>} />
            <Route path="classroom/:moduleId/:stepId" element={<S><ModuleDetail /></S>} />
            <Route path="members" element={<S><Members /></S>} />
            {ManagementRoutes()}
          </Route>
        </Route>
      </Routes>
    </AuthProvider>
  )
}
