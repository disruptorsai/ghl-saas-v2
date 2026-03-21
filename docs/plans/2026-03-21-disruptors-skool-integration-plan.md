# Disruptors Skool Integration — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Merge the Skool community (ghl-saas-v2) and the Lead Automation System (disruptors-las) into a single app called "Disruptors Skool", replacing the About tab with a Management tab that embeds the full SaaS, adding role-based auth for agency and client users.

**Architecture:** Single Vite+React app with Supabase Auth. TopNav provides 4 tabs (Support, Classroom, Members, Management). Management tab renders the LAS sidebar+pages. Role-based routing: agency users pick a client first, client users auto-scope to their assigned client. All data in one Supabase project with RLS.

**Tech Stack:** Vite 7, React 19, TypeScript 5.9, TailwindCSS v4, shadcn/ui, React Router v7, Supabase (auth + database + RLS), Sonner, Lucide React

**Working directory:** `C:\Users\alice\Documents\DISRUPTORSMEDIA\ghl-saas-v2`
**LAS source (copy from):** `C:\Users\alice\Documents\DISRUPTORSMEDIA\ghl-saas-v2\disruptors-las\src\`

---

## Phase 1: Branch + Dependencies + Supabase Setup

### Task 1: Create feature branch and install dependencies

**Files:**
- Modify: `package.json`

**Step 1: Create feature branch**

```bash
cd C:/Users/alice/Documents/DISRUPTORSMEDIA/ghl-saas-v2
git checkout -b feat/skool-saas-integration
```

**Step 2: Install Supabase + cmdk (from LAS deps)**

```bash
npm install @supabase/supabase-js cmdk
```

**Step 3: Create .env file**

Create `.env` in project root:
```
VITE_SUPABASE_URL=https://nssvviukveinrpwicyfw.supabase.co
VITE_SUPABASE_ANON_KEY=<paste from disruptors-las/.env>
```

**Step 4: Add .env to .gitignore if not already there**

Check `.gitignore` for `.env` entry. Add if missing.

**Step 5: Commit**

```bash
git add package.json package-lock.json .gitignore
git commit -m "chore: add supabase and cmdk dependencies for skool integration"
```

---

### Task 2: Create Supabase migration SQL

**Files:**
- Create: `supabase/migrations/001_skool_integration.sql`

**Step 1: Write the migration file**

```sql
-- Add role and client_id to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'agency' CHECK (role IN ('agency', 'client'));
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS client_id UUID REFERENCES clients(id) ON DELETE SET NULL;

-- Classroom modules (admin-managed content)
CREATE TABLE IF NOT EXISTS classroom_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  "order" INTEGER NOT NULL DEFAULT 0,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Classroom steps (lessons within modules)
CREATE TABLE IF NOT EXISTS classroom_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id UUID NOT NULL REFERENCES classroom_modules(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  media_url TEXT,
  media_type TEXT CHECK (media_type IN ('video', 'image', 'flowchart', 'embed')),
  instructions TEXT,
  type TEXT CHECK (type IN ('info', 'setup', 'config', 'demo')),
  "order" INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Progress tracking per user per step
CREATE TABLE IF NOT EXISTS classroom_progress (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  step_id UUID NOT NULL REFERENCES classroom_steps(id) ON DELETE CASCADE,
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  PRIMARY KEY (user_id, step_id)
);

-- Community members (profile for Skool members tab)
CREATE TABLE IF NOT EXISTS community_members (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  display_name TEXT,
  avatar_url TEXT,
  role_label TEXT,
  company TEXT,
  is_online BOOLEAN DEFAULT false,
  joined_at TIMESTAMPTZ DEFAULT now()
);

-- RLS Policies

-- classroom_modules: everyone reads, agency inserts/updates/deletes
ALTER TABLE classroom_modules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read modules" ON classroom_modules
  FOR SELECT USING (true);

CREATE POLICY "Agency can manage modules" ON classroom_modules
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'agency')
  );

-- classroom_steps: everyone reads, agency manages
ALTER TABLE classroom_steps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read steps" ON classroom_steps
  FOR SELECT USING (true);

CREATE POLICY "Agency can manage steps" ON classroom_steps
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'agency')
  );

-- classroom_progress: users manage their own
ALTER TABLE classroom_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own progress" ON classroom_progress
  FOR ALL USING (user_id = auth.uid());

-- community_members: everyone reads, users update own
ALTER TABLE community_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read members" ON community_members
  FOR SELECT USING (true);

CREATE POLICY "Users manage own member profile" ON community_members
  FOR ALL USING (user_id = auth.uid());
```

**Step 2: Write the down migration**

Create `supabase/migrations/001_skool_integration_down.sql`:
```sql
-- Revert skool integration
DROP POLICY IF EXISTS "Users manage own member profile" ON community_members;
DROP POLICY IF EXISTS "Anyone can read members" ON community_members;
DROP POLICY IF EXISTS "Users manage own progress" ON classroom_progress;
DROP POLICY IF EXISTS "Agency can manage steps" ON classroom_steps;
DROP POLICY IF EXISTS "Anyone can read steps" ON classroom_steps;
DROP POLICY IF EXISTS "Agency can manage modules" ON classroom_modules;
DROP POLICY IF EXISTS "Anyone can read modules" ON classroom_modules;

DROP TABLE IF EXISTS community_members;
DROP TABLE IF EXISTS classroom_progress;
DROP TABLE IF EXISTS classroom_steps;
DROP TABLE IF EXISTS classroom_modules;

ALTER TABLE profiles DROP COLUMN IF EXISTS client_id;
ALTER TABLE profiles DROP COLUMN IF EXISTS role;
```

**Step 3: Commit**

```bash
git add supabase/
git commit -m "feat: add Supabase migration for skool integration (classroom, progress, members)"
```

---

## Phase 2: Copy LAS Core Infrastructure

### Task 3: Copy Supabase client + auth context

**Files:**
- Create: `src/lib/supabase.ts`
- Create: `src/lib/user-supabase.ts`
- Create: `src/contexts/AuthContext.tsx`

**Step 1: Copy supabase client**

Copy from `disruptors-las/src/lib/supabase.ts` to `src/lib/supabase.ts` (exact same content):

```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

**Step 2: Copy user-supabase helper**

Copy `disruptors-las/src/lib/user-supabase.ts` to `src/lib/user-supabase.ts` as-is.

**Step 3: Create AuthContext with role support**

Create `src/contexts/AuthContext.tsx` — based on LAS version but adds `role` and `clientId` from profiles:

```typescript
import { createContext, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import type { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

export type UserRole = 'agency' | 'client'

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  role: UserRole | null
  clientId: string | null  // For client-role users, their assigned client
  signUp: (email: string, password: string, fullName: string) => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [role, setRole] = useState<UserRole | null>(null)
  const [clientId, setClientId] = useState<string | null>(null)

  const fetchProfile = async (userId: string) => {
    const { data } = await supabase
      .from('profiles')
      .select('role, client_id')
      .eq('id', userId)
      .single()
    if (data) {
      setRole(data.role as UserRole)
      setClientId(data.client_id)
    }
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchProfile(session.user.id).then(() => setLoading(false))
      } else {
        setLoading(false)
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchProfile(session.user.id).then(() => setLoading(false))
      } else {
        setRole(null)
        setClientId(null)
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const signUp = async (email: string, password: string, fullName: string) => {
    const { error } = await supabase.auth.signUp({
      email, password,
      options: { data: { full_name: fullName } }
    })
    if (error) throw error
  }

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut({ scope: 'global' })
    if (error) throw error
  }

  return (
    <AuthContext.Provider value={{ user, session, loading, role, clientId, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
```

**Step 4: Verify build compiles**

```bash
npm run build
```

Expected: Build succeeds (pages don't use auth yet, so no errors).

**Step 5: Commit**

```bash
git add src/lib/supabase.ts src/lib/user-supabase.ts src/contexts/AuthContext.tsx
git commit -m "feat: add Supabase client and AuthContext with role support"
```

---

### Task 4: Copy UserSupabaseContext (client data provider)

**Files:**
- Create: `src/contexts/UserSupabaseContext.tsx`
- Create: `src/contexts/CampaignExecutorContext.tsx`

**Step 1: Copy UserSupabaseContext**

Copy `disruptors-las/src/contexts/UserSupabaseContext.tsx` to `src/contexts/UserSupabaseContext.tsx` as-is. The imports already use `@/` paths which will resolve correctly.

**Step 2: Copy CampaignExecutorContext**

Copy `disruptors-las/src/contexts/CampaignExecutorContext.tsx` to `src/contexts/CampaignExecutorContext.tsx` as-is.

**Step 3: Copy any remaining contexts from LAS**

Check `disruptors-las/src/contexts/` for any other context files and copy them all.

**Step 4: Commit**

```bash
git add src/contexts/
git commit -m "feat: add UserSupabaseContext and CampaignExecutorContext from LAS"
```

---

### Task 5: Copy all LAS hooks

**Files:**
- Create: `src/hooks/` (copy all hooks from LAS)

**Step 1: Copy all hook files from LAS**

Copy every file from `disruptors-las/src/hooks/` to `src/hooks/`, preserving existing `useProgress.ts`:

Files to copy:
- `use-mobile.ts`
- `useAnalytics.ts`
- `useAuditLog.ts`
- `useCallHistory.ts`
- `useCampaignExecutor.ts`
- `useCampaigns.ts`
- `useChatThreads.ts`
- `useClientConfig.ts`
- `useClientPortal.ts`
- `useClients.ts`
- `useCredentialStatus.ts`
- `useCredentials.ts`
- `useDashboard.ts`
- `useDemoPages.ts`
- `useFeedback.ts`
- `useKnowledgeBase.ts`
- `useLeads.ts`
- `useMigration.ts`
- `useModelList.ts`
- `useNotifications.ts`
- `usePrompts.ts`
- `useWebinarSetup.ts`

**Step 2: Verify no import conflicts**

All hooks use `@/` imports pointing to contexts and lib. Since we copied those in Task 3-4, imports should resolve.

**Step 3: Commit**

```bash
git add src/hooks/
git commit -m "feat: copy all LAS data hooks (campaigns, prompts, KB, analytics, etc.)"
```

---

### Task 6: Copy LAS UI components (sidebar, command, etc.)

**Files:**
- Create/overwrite: `src/components/ui/sidebar.tsx`
- Create: `src/components/ui/command.tsx`
- Copy: LAS-specific components

**Step 1: Copy missing UI components from LAS**

The v2 project is missing `sidebar.tsx` and `command.tsx` from shadcn. Copy from `disruptors-las/src/components/ui/`:
- `sidebar.tsx` → `src/components/ui/sidebar.tsx`
- `command.tsx` → `src/components/ui/command.tsx`

**Step 2: Copy LAS app components**

Copy these from `disruptors-las/src/components/` to `src/components/`:
- `ErrorBoundary.tsx`
- `CredentialGate.tsx`
- `CredentialStatusBanner.tsx`
- `NotificationBell.tsx`
- `PromptPlayground.tsx`
- `SupportChat.tsx`
- `WorkflowFeedbackCard.tsx`
- `AnalyticsCharts.tsx`

**Step 3: Commit**

```bash
git add src/components/
git commit -m "feat: copy LAS UI components (sidebar, command, app components)"
```

---

## Phase 3: Copy LAS Pages

### Task 7: Copy all management pages from LAS

**Files:**
- Create: `src/pages/management/` directory with all LAS pages

**Step 1: Create management pages directory**

```bash
mkdir -p src/pages/management
```

**Step 2: Copy all LAS page files into management/**

Copy every file from `disruptors-las/src/pages/` to `src/pages/management/` EXCEPT:
- `Auth.tsx` (we'll create our own)
- `ClientList.tsx` (we'll adapt this separately)
- `CreateClient.tsx` (we'll adapt this separately)
- `NotFound.tsx` (v2 doesn't need a duplicate)

Pages to copy (rename not needed, just move into management/):
- `Dashboard.tsx`, `WhatToDo.tsx`, `SetupSOP.tsx`
- `Campaigns.tsx`, `CampaignDetail.tsx`
- `TextAiRep.tsx`, `TextAiRepConfig.tsx`, `TextAiRepTemplates.tsx`
- `VoiceAiRep.tsx`, `VoiceAiRepConfig.tsx`, `VoiceAiRepTemplates.tsx`
- `Prompts.tsx`, `TextPrompts.tsx`, `VoicePrompts.tsx`
- `KnowledgeBase.tsx`
- `DeployAiReps.tsx`
- `DebugAiReps.tsx`, `DebugTextAi.tsx`, `DebugVoiceAi.tsx`
- `ClientPortal.tsx`
- `ChatAnalytics.tsx`, `ChatbotDashboard.tsx`, `ChatWithAi.tsx`
- `VoiceAiDashboard.tsx`, `VoiceAiChat.tsx`, `CallHistory.tsx`
- `Analytics.tsx`
- `WebinarSetup.tsx`, `WebinarChecklist.tsx`, `WebinarConfig.tsx`, `WebinarCredentials.tsx`, `WebinarAnalytics.tsx`, `WebinarPresAgent.tsx`
- `DemoPages.tsx`, `DemoPageDetail.tsx`, `DemoPublic.tsx`
- `ClientSettings.tsx`, `AccountSettings.tsx`, `Credentials.tsx`
- `ClientFeedback.tsx`, `AuditLog.tsx`
- `SetupConnection.tsx`
- `ApiOverview.tsx`, `ApiConfig.tsx`, `ApiCredentials.tsx`, `WorkflowImports.tsx`

**Step 3: Commit**

```bash
git add src/pages/management/
git commit -m "feat: copy all LAS management pages"
```

---

### Task 8: Copy LAS layout components (AppSidebar, TopBar, ProtectedRoute)

**Files:**
- Create: `src/components/layout/AppSidebar.tsx`
- Create: `src/components/layout/ManagementLayout.tsx`
- Create: `src/components/layout/TopBar.tsx`
- Create: `src/components/layout/ProtectedRoute.tsx`

**Step 1: Copy AppSidebar from LAS**

Copy `disruptors-las/src/components/layout/AppSidebar.tsx` to `src/components/layout/AppSidebar.tsx`.

Modify the `basePath` logic. Change:
```typescript
const basePath = `/client/${clientId}`
```
to:
```typescript
const basePath = '/management'
```

Also update the sidebar header — remove the client switcher dropdown for now (it will be in TopNav instead). Change the brand name from "Disruptors Infra" to "Disruptors Skool".

**Step 2: Create ManagementLayout**

Create `src/components/layout/ManagementLayout.tsx` — this replaces `ClientLayout.tsx` but lives inside the Skool shell (no BrowserRouter, no AuthProvider — those are at root):

```typescript
import { Outlet } from 'react-router-dom'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { AppSidebar } from './AppSidebar'
import { ClientSupabaseProvider } from '@/contexts/UserSupabaseContext'
import { CampaignExecutorProvider } from '@/contexts/CampaignExecutorContext'

export function ManagementLayout() {
  return (
    <ClientSupabaseProvider>
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
    </ClientSupabaseProvider>
  )
}
```

Note: The `ClientSupabaseProvider` currently reads `clientId` from URL params (`useParams`). We need to modify it so it can also receive `clientId` from AuthContext for client-role users. This is handled in Task 10.

**Step 3: Copy TopBar from LAS**

Copy `disruptors-las/src/components/layout/TopBar.tsx` to `src/components/layout/TopBar.tsx`. This is the breadcrumb bar inside the management section.

**Step 4: Create ProtectedRoute**

Create `src/components/layout/ProtectedRoute.tsx`:

```typescript
import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Loader2 } from 'lucide-react'

export function ProtectedRoute() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/auth" replace />
  }

  return <Outlet />
}
```

**Step 5: Commit**

```bash
git add src/components/layout/
git commit -m "feat: add ManagementLayout, AppSidebar, TopBar, ProtectedRoute"
```

---

## Phase 4: Auth Page + Routing

### Task 9: Create Auth page

**Files:**
- Create: `src/pages/Auth.tsx`

**Step 1: Create the auth page**

Create `src/pages/Auth.tsx` — adapted from the LAS Auth page with the Disruptors Skool branding. Same tabbed login/signup form, but after login it checks `role`:
- `agency` → navigate to `/`  (client list)
- `client` → navigate to `/classroom`

Copy the LAS `Auth.tsx` and modify the post-login redirect:

```typescript
// After successful signIn:
const { data: profile } = await supabase
  .from('profiles')
  .select('role')
  .eq('id', session.user.id)
  .single()

if (profile?.role === 'client') {
  navigate('/classroom')
} else {
  navigate('/')
}
```

**Step 2: Commit**

```bash
git add src/pages/Auth.tsx
git commit -m "feat: add Auth page with role-based redirect"
```

---

### Task 10: Create ClientProvider wrapper for role-based client scoping

**Files:**
- Create: `src/contexts/ClientContext.tsx`
- Modify: `src/contexts/UserSupabaseContext.tsx`

**Step 1: Create ClientContext**

This context provides the active `clientId` regardless of how it was determined (URL param for agency, profile for client users):

```typescript
import { createContext, useContext } from 'react'
import type { ReactNode } from 'react'
import { useAuth } from './AuthContext'
import { useParams } from 'react-router-dom'

interface ClientContextType {
  activeClientId: string | null
}

const ClientContext = createContext<ClientContextType>({ activeClientId: null })

export function ClientProvider({ children }: { children: ReactNode }) {
  const { role, clientId: profileClientId } = useAuth()
  const { clientId: urlClientId } = useParams<{ clientId: string }>()

  // Client users: always use their assigned client
  // Agency users: use URL param (from client picker)
  const activeClientId = role === 'client' ? profileClientId : (urlClientId || null)

  return (
    <ClientContext.Provider value={{ activeClientId }}>
      {children}
    </ClientContext.Provider>
  )
}

export const useActiveClient = () => useContext(ClientContext)
```

**Step 2: Modify UserSupabaseContext to use activeClientId**

Update `src/contexts/UserSupabaseContext.tsx` so the `ClientSupabaseProvider` can get `clientId` from `ClientContext` instead of only from URL params. Replace:

```typescript
const { clientId } = useParams<{ clientId: string }>()
```

with:

```typescript
const { activeClientId: clientId } = useActiveClient()
```

Import `useActiveClient` from `./ClientContext`.

**Step 3: Commit**

```bash
git add src/contexts/ClientContext.tsx src/contexts/UserSupabaseContext.tsx
git commit -m "feat: add ClientContext for role-based client ID resolution"
```

---

### Task 11: Copy ClientList and CreateClient pages for agency users

**Files:**
- Create: `src/pages/ClientList.tsx`
- Create: `src/pages/CreateClient.tsx`

**Step 1: Copy ClientList from LAS**

Copy `disruptors-las/src/pages/ClientList.tsx` to `src/pages/ClientList.tsx`. This is the agency-only page where they pick a client.

Modify the navigation links: when clicking a client card, navigate to `/management` instead of `/client/${clientId}/dashboard`. The client selection needs to be stored — either via URL param or via a state context.

For now, use URL: agency users navigate to `/c/${clientId}/classroom` where `/c/:clientId` is a wrapper that sets the active client.

**Step 2: Copy CreateClient from LAS**

Copy `disruptors-las/src/pages/CreateClient.tsx` to `src/pages/CreateClient.tsx`. Update navigation on success to go to `/c/${newClientId}/classroom`.

**Step 3: Commit**

```bash
git add src/pages/ClientList.tsx src/pages/CreateClient.tsx
git commit -m "feat: add ClientList and CreateClient pages for agency users"
```

---

### Task 12: Rewrite App.tsx with unified route structure

**Files:**
- Modify: `src/App.tsx`

**Step 1: Rewrite App.tsx**

Replace the entire `src/App.tsx` with the unified route structure:

```typescript
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
const SetupConnection = lazy(() => import('./pages/management/SetupConnection'))

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

function RoleRedirect() {
  const { role, clientId } = useAuth()
  if (role === 'client' && clientId) return <Navigate to="/classroom" replace />
  return <S><ClientList /></S>
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
          {/* Agency: client list */}
          <Route path="/" element={<RoleRedirect />} />
          <Route path="/create" element={<S><CreateClient /></S>} />
          <Route path="/admin" element={<S><Admin /></S>} />

          {/* Skool shell — with optional clientId for agency users */}
          <Route path="/c/:clientId?" element={<ClientProvider><CommunityLayout /></ClientProvider>}>
            <Route index element={<Navigate to="classroom" replace />} />
            <Route path="support" element={<S><Support /></S>} />
            <Route path="classroom" element={<S><Classroom /></S>} />
            <Route path="classroom/:moduleId" element={<S><ModuleDetail /></S>} />
            <Route path="classroom/:moduleId/:stepId" element={<S><ModuleDetail /></S>} />
            <Route path="members" element={<S><Members /></S>} />

            {/* Management tab — LAS pages with sidebar */}
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
          </Route>

          {/* Client-role shortcut routes (no clientId in URL) */}
          <Route path="/classroom" element={<ClientProvider><CommunityLayout /></ClientProvider>}>
            <Route index element={<S><Classroom /></S>} />
          </Route>
          <Route path="/support" element={<ClientProvider><CommunityLayout /></ClientProvider>}>
            <Route index element={<S><Support /></S>} />
          </Route>
          <Route path="/members" element={<ClientProvider><CommunityLayout /></ClientProvider>}>
            <Route index element={<S><Members /></S>} />
          </Route>
          <Route path="/management/*" element={<ClientProvider><CommunityLayout /></ClientProvider>}>
            {/* Same management routes for client-role users */}
          </Route>
        </Route>
      </Routes>
    </AuthProvider>
  )
}
```

Note: The exact route structure for client-role users (no clientId in URL) may need refinement during implementation. The key pattern is that `ClientProvider` resolves the client ID from either URL or profile.

**Step 2: Verify build**

```bash
npm run build
```

Expected: May have import errors from management pages — that's expected and will be fixed in Task 13.

**Step 3: Commit**

```bash
git add src/App.tsx
git commit -m "feat: rewrite App.tsx with unified Skool + Management route structure"
```

---

## Phase 5: Update Navigation

### Task 13: Update TopNav — rename About to Management, rebrand

**Files:**
- Modify: `src/components/layout/TopNav.tsx`

**Step 1: Update nav items and branding**

In `src/components/layout/TopNav.tsx`, change:

1. Replace the `navItems` array — change About to Management:
```typescript
const navItems = [
  { to: '/support', label: 'Support', icon: MessageCircle },
  { to: '/classroom', label: 'Classroom', icon: GraduationCap },
  { to: '/members', label: 'Members', icon: Users },
  { to: '/management', label: 'Management', icon: Settings },
]
```

Add `Settings` to the lucide imports, remove `Info`.

2. Change brand name from "Disruptors Sales Infra" to "Disruptors Skool".

3. Add user avatar logic — replace hardcoded "KP" with initials from `useAuth()`:
```typescript
const { user, signOut } = useAuth()
const initials = user?.user_metadata?.full_name
  ?.split(' ')
  .map((n: string) => n[0])
  .join('')
  .toUpperCase() || '??'
```

4. Add sign out button to the avatar dropdown.

5. For agency users, the nav links should include the clientId: `/c/${clientId}/support`, etc. For client users, just `/support`, `/classroom`, etc.

**Step 2: Update CommunityLayout if needed**

The `CommunityLayout` may need to conditionally remove `max-w-7xl` constraint when on management routes (since the sidebar needs full width).

**Step 3: Commit**

```bash
git add src/components/layout/TopNav.tsx src/components/layout/CommunityLayout.tsx
git commit -m "feat: update TopNav with Management tab, rebrand to Disruptors Skool"
```

---

### Task 14: Update AppSidebar for management routes

**Files:**
- Modify: `src/components/layout/AppSidebar.tsx`

**Step 1: Update base path**

Change `basePath` from `/client/${clientId}` to use the current route context. For agency users inside `/c/:clientId/management`, the base is `/c/${clientId}/management`. For client users at `/management`, the base is `/management`.

Read the current URL to determine:
```typescript
const location = useLocation()
const { clientId } = useParams()
const basePath = clientId ? `/c/${clientId}/management` : '/management'
```

**Step 2: Update sidebar header branding**

Change "Disruptors Infra" to "Disruptors Skool". The client switcher dropdown should only show for agency users.

**Step 3: Commit**

```bash
git add src/components/layout/AppSidebar.tsx
git commit -m "feat: update AppSidebar paths for management route structure"
```

---

## Phase 6: Delete Removed Content + Cleanup

### Task 15: Remove About page and mock data migration

**Files:**
- Delete: `src/pages/About.tsx`
- Delete: `src/data/community.ts` (About page data)

**Step 1: Delete About page**

```bash
rm src/pages/About.tsx
rm src/data/community.ts
```

**Step 2: Verify no remaining imports**

Search for `About` and `community` imports in the codebase. Remove any stale references.

**Step 3: Commit**

```bash
git add -A
git commit -m "feat: remove About page (replaced by Management tab)"
```

---

### Task 16: Create Supabase-backed hooks for Classroom and Members

**Files:**
- Create: `src/hooks/useClassroom.ts`
- Create: `src/hooks/useClassroomProgress.ts`
- Create: `src/hooks/useCommunityMembers.ts`
- Modify: `src/hooks/useProgress.ts` (keep as fallback, but add Supabase version)

**Step 1: Create useClassroom hook**

```typescript
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export interface ClassroomModule {
  id: string
  title: string
  description: string | null
  thumbnail_url: string | null
  order: number
  created_at: string
  steps: ClassroomStep[]
}

export interface ClassroomStep {
  id: string
  module_id: string
  title: string
  description: string | null
  media_url: string | null
  media_type: 'video' | 'image' | 'flowchart' | 'embed' | null
  instructions: string | null
  type: 'info' | 'setup' | 'config' | 'demo' | null
  order: number
}

export function useClassroom() {
  const [modules, setModules] = useState<ClassroomModule[]>([])
  const [loading, setLoading] = useState(true)

  const fetchModules = async () => {
    const { data } = await supabase
      .from('classroom_modules')
      .select('*, steps:classroom_steps(*)')
      .order('order')
    if (data) {
      setModules(data.map(m => ({
        ...m,
        steps: (m.steps || []).sort((a: ClassroomStep, b: ClassroomStep) => a.order - b.order)
      })))
    }
    setLoading(false)
  }

  useEffect(() => { fetchModules() }, [])

  // CRUD for agency admin
  const createModule = async (module: Partial<ClassroomModule>) => {
    const { error } = await supabase.from('classroom_modules').insert(module)
    if (error) throw error
    await fetchModules()
  }

  const updateModule = async (id: string, updates: Partial<ClassroomModule>) => {
    const { error } = await supabase.from('classroom_modules').update(updates).eq('id', id)
    if (error) throw error
    await fetchModules()
  }

  const deleteModule = async (id: string) => {
    const { error } = await supabase.from('classroom_modules').delete().eq('id', id)
    if (error) throw error
    await fetchModules()
  }

  // Step CRUD
  const createStep = async (step: Partial<ClassroomStep>) => {
    const { error } = await supabase.from('classroom_steps').insert(step)
    if (error) throw error
    await fetchModules()
  }

  const updateStep = async (id: string, updates: Partial<ClassroomStep>) => {
    const { error } = await supabase.from('classroom_steps').update(updates).eq('id', id)
    if (error) throw error
    await fetchModules()
  }

  const deleteStep = async (id: string) => {
    const { error } = await supabase.from('classroom_steps').delete().eq('id', id)
    if (error) throw error
    await fetchModules()
  }

  return { modules, loading, createModule, updateModule, deleteModule, createStep, updateStep, deleteStep, refetch: fetchModules }
}
```

**Step 2: Create useClassroomProgress hook**

```typescript
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'

export function useClassroomProgress() {
  const { user } = useAuth()
  const [progress, setProgress] = useState<Record<string, boolean>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    supabase
      .from('classroom_progress')
      .select('step_id, completed')
      .eq('user_id', user.id)
      .then(({ data }) => {
        const map: Record<string, boolean> = {}
        data?.forEach(p => { map[p.step_id] = p.completed })
        setProgress(map)
        setLoading(false)
      })
  }, [user])

  const toggleStep = async (stepId: string) => {
    if (!user) return
    const current = progress[stepId] || false
    const { error } = await supabase
      .from('classroom_progress')
      .upsert({
        user_id: user.id,
        step_id: stepId,
        completed: !current,
        completed_at: !current ? new Date().toISOString() : null,
      })
    if (error) throw error
    setProgress(prev => ({ ...prev, [stepId]: !current }))
  }

  const isStepCompleted = (stepId: string) => progress[stepId] || false

  return { progress, loading, toggleStep, isStepCompleted }
}
```

**Step 3: Create useCommunityMembers hook**

```typescript
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export interface CommunityMember {
  user_id: string
  display_name: string | null
  avatar_url: string | null
  role_label: string | null
  company: string | null
  is_online: boolean
  joined_at: string
}

export function useCommunityMembers() {
  const [members, setMembers] = useState<CommunityMember[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('community_members')
      .select('*')
      .order('joined_at', { ascending: false })
      .then(({ data }) => {
        setMembers(data || [])
        setLoading(false)
      })
  }, [])

  return { members, loading }
}
```

**Step 4: Commit**

```bash
git add src/hooks/useClassroom.ts src/hooks/useClassroomProgress.ts src/hooks/useCommunityMembers.ts
git commit -m "feat: add Supabase-backed hooks for classroom and community members"
```

---

## Phase 7: Client Account Management

### Task 17: Add "Create Client Login" to client settings

**Files:**
- Create: `src/components/management/CreateClientLogin.tsx`
- Modify: `src/pages/management/ClientSettings.tsx`

**Step 1: Create the CreateClientLogin component**

This component lets an agency user create a login for a client. It:
1. Takes email + password input
2. Calls Supabase Auth admin API to create the user (via an Edge Function or direct insert)
3. Sets `role = 'client'` and `client_id` on the new user's profile

Since Supabase client-side can't create users for others, we need to use `supabase.auth.admin.createUser()` which requires a service role key. Options:
- Use a Supabase Edge Function that accepts the request and creates the user
- Or use the service role key from the client's credentials (already stored)

For now, create via a simple Edge Function call:

```typescript
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'
import { useClientSupabase } from '@/contexts/UserSupabaseContext'

export function CreateClientLogin() {
  const { clientId, connection } = useClientSupabase()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleCreate = async () => {
    if (!email || !password || !clientId) return
    setLoading(true)
    try {
      const { data, error } = await supabase.functions.invoke('create-client-user', {
        body: { email, password, clientId, clientName: connection?.name }
      })
      if (error) throw error
      toast.success(`Login created for ${email}`)
      setEmail('')
      setPassword('')
    } catch (err: any) {
      toast.error(err.message || 'Failed to create login')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Client Access</CardTitle>
        <CardDescription>Create login credentials for this client to access their dashboard</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="client-email">Email</Label>
          <Input id="client-email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="client@example.com" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="client-password">Password</Label>
          <Input id="client-password" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Minimum 6 characters" />
        </div>
        <Button onClick={handleCreate} disabled={loading || !email || !password}>
          {loading ? 'Creating...' : 'Create Client Login'}
        </Button>
      </CardContent>
    </Card>
  )
}
```

**Step 2: Create Supabase Edge Function**

Create `supabase/functions/create-client-user/index.ts`:

```typescript
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

Deno.serve(async (req) => {
  const { email, password, clientId, clientName } = await req.json()

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  // Create the auth user
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: clientName || email }
  })

  if (authError) {
    return new Response(JSON.stringify({ error: authError.message }), { status: 400 })
  }

  // Update their profile with role and client_id
  const { error: profileError } = await supabase
    .from('profiles')
    .update({ role: 'client', client_id: clientId })
    .eq('id', authData.user.id)

  if (profileError) {
    return new Response(JSON.stringify({ error: profileError.message }), { status: 400 })
  }

  // Create community_members entry
  await supabase.from('community_members').insert({
    user_id: authData.user.id,
    display_name: clientName || email,
    role_label: 'Client',
  })

  return new Response(JSON.stringify({ success: true, userId: authData.user.id }), { status: 200 })
})
```

**Step 3: Add CreateClientLogin to ClientSettings page**

Import and render the `CreateClientLogin` component in the ClientSettings page.

**Step 4: Commit**

```bash
git add src/components/management/CreateClientLogin.tsx supabase/functions/ src/pages/management/ClientSettings.tsx
git commit -m "feat: add Create Client Login for agency users to grant client access"
```

---

## Phase 8: Fix Imports + Build

### Task 18: Fix all import path issues in copied files

**Files:**
- Modify: All files in `src/pages/management/` that have broken imports

**Step 1: Audit imports**

Run `npm run build` and fix each import error. Common issues:
- LAS pages import from `@/components/layout/TopBar` — this exists now
- LAS pages import from `@/hooks/useXxx` — these exist now
- LAS pages may import from paths that need adjustment

**Step 2: Fix each broken import one by one**

This is an iterative process. Run build, fix the first error, repeat.

**Step 3: Commit when build passes**

```bash
git add -A
git commit -m "fix: resolve all import paths for management pages"
```

---

### Task 19: Verify build and fix TypeScript errors

**Files:**
- Various

**Step 1: Run full build**

```bash
npm run build
```

**Step 2: Fix any remaining TypeScript errors**

Common issues:
- React 18 vs 19 type differences (minimal)
- Router v6 vs v7 API differences (check `useNavigate`, `NavLink` render props)
- Missing type exports

**Step 3: Commit**

```bash
git add -A
git commit -m "fix: resolve TypeScript errors for clean build"
```

---

## Phase 9: Seed Data + Final Polish

### Task 20: Seed classroom modules from mock data

**Files:**
- Create: `supabase/seed/classroom_seed.sql`

**Step 1: Convert mock data to SQL inserts**

Take the 10 modules from `src/data/modules.ts` and convert them to SQL INSERT statements for `classroom_modules` and `classroom_steps` tables.

**Step 2: Commit**

```bash
git add supabase/seed/
git commit -m "feat: add classroom seed data from mock modules"
```

---

### Task 21: Update main.tsx to wrap with AuthProvider

**Files:**
- Modify: `src/main.tsx`

**Step 1: Verify main.tsx**

The `AuthProvider` is already in `App.tsx` (added in Task 12), so `main.tsx` just needs `BrowserRouter`:

```typescript
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
```

This is already correct. No changes needed.

**Step 2: Commit if changed**

---

### Task 22: Final build verification and deploy prep

**Step 1: Run clean build**

```bash
rm -rf dist
npm run build
```

Expected: Build succeeds with no errors.

**Step 2: Run dev server and smoke test**

```bash
npm run dev
```

Test:
- `/auth` — login page renders
- After login as agency — redirects to client list
- Select client — Skool shell with 4 tabs
- Click Management — sidebar appears with LAS nav items
- Click Classroom — module list renders
- Click Support — chat renders
- Click Members — member grid renders

**Step 3: Final commit**

```bash
git add -A
git commit -m "feat: Disruptors Skool integration complete — Skool + SaaS merged"
```

---

## Task Summary

| Phase | Tasks | Description |
|-------|-------|-------------|
| 1 | 1-2 | Branch, deps, Supabase migration |
| 2 | 3-6 | Copy LAS core (supabase, auth, contexts, hooks, components) |
| 3 | 7-8 | Copy LAS pages + layout components |
| 4 | 9-12 | Auth page, client context, routing |
| 5 | 13-14 | Update TopNav + AppSidebar |
| 6 | 15-16 | Remove About, add Supabase classroom/member hooks |
| 7 | 17 | Client account creation |
| 8 | 18-19 | Fix imports + build |
| 9 | 20-22 | Seed data, final verification |
