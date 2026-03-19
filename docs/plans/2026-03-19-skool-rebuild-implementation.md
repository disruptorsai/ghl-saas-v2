# Sales Infra V2 — Skool-Style Community Rebuild Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Rebuild Sales Infra as a Skool (skool.com) clone — a video-first community platform for client onboarding with modules, steps, progress tracking, and support chat.

**Architecture:** React 19 SPA with React Router for 4 main tabs (Support, Classroom, Members, About) plus admin route. All data mocked via local constants — Supabase integration comes later. Reuse shadcn/ui components, Tailwind config, and build tooling from disruptors-las v1.

**Tech Stack:** React 19, Vite 7, TypeScript 5.9, TailwindCSS v4, shadcn/ui, Lucide React, React Router v7, Sonner

---

### Task 1: Scaffold New Project from v1

**Files:**
- Copy from `disruptors-las/`: `package.json`, `vite.config.ts`, `tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json`, `eslint.config.js`, `components.json`, `.gitignore`, `src/index.css`, `src/lib/utils.ts`
- Copy from `disruptors-las/src/components/ui/`: ALL 25 shadcn components
- Create: `src/main.tsx`
- Create: `src/App.tsx`
- Create: `index.html`

**Step 1: Create project root files**

Copy config files from v1 into the project root (same directory level as `disruptors-las/`). Update `package.json`:
- Change name to `"disruptors-sales-infra-v2"`
- Remove `@supabase/supabase-js` from dependencies (not needed for MVP)
- Keep all other deps (React, Tailwind, shadcn, Lucide, React Router, Sonner, etc.)

**Step 2: Copy shadcn/ui components**

Copy entire `disruptors-las/src/components/ui/` directory to `src/components/ui/`.
Copy `disruptors-las/src/lib/utils.ts` to `src/lib/utils.ts`.

**Step 3: Create index.html**

```html
<!DOCTYPE html>
<html lang="en" class="dark">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Disruptors Sales Infra</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

Note: Use Inter font (Skool uses a clean sans-serif), not Cousine monospace from v1. Update `src/index.css` body font-family accordingly.

**Step 4: Create src/main.tsx**

```tsx
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

**Step 5: Create minimal src/App.tsx**

```tsx
import { Routes, Route, Navigate } from 'react-router-dom'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/classroom" replace />} />
      <Route path="/classroom" element={<div>Classroom</div>} />
    </Routes>
  )
}
```

**Step 6: Install dependencies and verify dev server starts**

Run: `npm install && npm run dev`
Expected: Dev server starts on localhost:5173, shows "Classroom" text.

**Step 7: Initialize git and commit**

```bash
git init
git add -A
git commit -m "feat: scaffold v2 project with shadcn/ui components from v1"
```

---

### Task 2: Mock Data Layer

**Files:**
- Create: `src/data/types.ts`
- Create: `src/data/modules.ts`
- Create: `src/data/members.ts`
- Create: `src/data/community.ts`
- Create: `src/hooks/useProgress.ts`

**Step 1: Create type definitions**

`src/data/types.ts`:
```typescript
export interface Module {
  id: string
  title: string
  description: string
  thumbnail: string
  order: number
  steps: Step[]
}

export interface Step {
  id: string
  moduleId: string
  title: string
  description: string
  videoUrl: string | null
  instructions: string
  type: 'info' | 'setup' | 'config' | 'demo'
  order: number
}

export interface UserProgress {
  [stepId: string]: {
    completed: boolean
    completedAt: string | null
  }
}

export interface Member {
  id: string
  name: string
  avatar: string
  role: string
  company: string
  joinedAt: string
  online: boolean
}

export interface ChatMessage {
  id: string
  sender: 'user' | 'ai'
  content: string
  timestamp: string
}

export interface FeedbackItem {
  id: string
  moduleId: string
  stepId: string
  type: 'question' | 'bug' | 'change_request' | 'suggestion'
  priority: 'high' | 'medium' | 'low'
  message: string
  createdAt: string
}
```

**Step 2: Create modules mock data**

`src/data/modules.ts` — Define all 10 modules with their steps. Each module has 3-5 steps. Use placeholder videoUrl (null for now). Write real instruction markdown for each step describing what the agent does, how to customize, etc. Reference the v1 app's existing content from the transcript.

Modules:
1. Welcome to Sales Infra (3 steps: welcome video, system overview, client journey)
2. API Keys & Software Setup (5 steps: overview video, GHL, OpenAI, Retell, n8n)
3. AI Voice Receptionist (5 steps: video, workflow, customize prompt, test/demo, feedback)
4. Database Reactivation (5 steps: same pattern)
5. Lead Follow-up (5 steps: same pattern)
6. Appointment Reminders (5 steps: same pattern)
7. Quote Follow-up (5 steps: same pattern)
8. Review Request (5 steps: same pattern)
9. Website Chatbot (5 steps: same pattern)
10. Prompt Playground (4 steps: video, interactive editor, test, save)

**Step 3: Create members mock data**

`src/data/members.ts` — 8-10 mock members with names, avatars (use ui-avatars.com URLs), roles, companies.

**Step 4: Create community/about data**

`src/data/community.ts` — Static content for About page (company info, differentiators, team, client journey phases).

**Step 5: Create useProgress hook**

`src/hooks/useProgress.ts` — Manages step completion state in localStorage. Functions: `getProgress()`, `toggleStep(stepId)`, `getModuleProgress(moduleId)`, `getOverallProgress()`.

**Step 6: Commit**

```bash
git add src/data/ src/hooks/useProgress.ts
git commit -m "feat: add mock data layer with modules, members, and progress tracking"
```

---

### Task 3: Layout Shell — Skool-Style Top Nav

**Files:**
- Create: `src/components/layout/TopNav.tsx`
- Create: `src/components/layout/CommunityLayout.tsx`
- Modify: `src/App.tsx`
- Modify: `src/index.css` (update font to Inter, adjust Skool-specific styles)

**Step 1: Update index.css for Skool aesthetic**

Change body font from Cousine to Inter. Add Skool-specific CSS variables for the slightly different dark palette (Skool uses a warmer dark gray). Keep the gold shimmer effects from v1.

**Step 2: Build TopNav component**

`src/components/layout/TopNav.tsx`:
- Left: Community icon/avatar + "Disruptors Sales Infra" text
- Center: 4 tab buttons — Support, Classroom, Members, About (use NavLink for active state)
- Right: Search icon, notification bell, user avatar dropdown
- Active tab has a gold underline indicator (matching Skool)
- Sticky top, dark background (hsl 220 13% 10% — Skool's dark navy)
- Mobile: tabs collapse into a horizontal scroll or hamburger

**Step 3: Build CommunityLayout wrapper**

`src/components/layout/CommunityLayout.tsx`:
- Renders TopNav at top
- `<Outlet />` for child routes
- Full-width content area below nav

**Step 4: Update App.tsx with all routes**

```tsx
import { Routes, Route, Navigate } from 'react-router-dom'
import CommunityLayout from './components/layout/CommunityLayout'
// Lazy imports for pages (create placeholder components)

export default function App() {
  return (
    <Routes>
      <Route element={<CommunityLayout />}>
        <Route path="/" element={<Navigate to="/classroom" replace />} />
        <Route path="/support" element={<div>Support</div>} />
        <Route path="/classroom" element={<div>Classroom</div>} />
        <Route path="/classroom/:moduleId" element={<div>Module</div>} />
        <Route path="/classroom/:moduleId/:stepId" element={<div>Step</div>} />
        <Route path="/members" element={<div>Members</div>} />
        <Route path="/about" element={<div>About</div>} />
      </Route>
      <Route path="/admin" element={<div>Admin</div>} />
    </Routes>
  )
}
```

**Step 5: Verify navigation works**

Run: `npm run dev`
Expected: TopNav renders with 4 tabs, clicking each navigates to the correct route, active tab has gold indicator.

**Step 6: Commit**

```bash
git add src/components/layout/ src/App.tsx src/index.css
git commit -m "feat: add Skool-style top navigation and layout shell"
```

---

### Task 4: Classroom — Module List View

**Files:**
- Create: `src/pages/Classroom.tsx`
- Create: `src/components/classroom/ModuleCard.tsx`
- Create: `src/components/classroom/OverallProgress.tsx`
- Modify: `src/App.tsx` (wire up lazy import)

**Step 1: Build OverallProgress component**

Shows: "Your Setup Progress" heading, progress bar (gold fill), percentage text, "X of Y modules completed" subtitle.

**Step 2: Build ModuleCard component**

Matches Skool's card layout:
- Thumbnail image (placeholder gradient or icon for now)
- Module title (bold)
- Module description (muted text, 2 lines max)
- Progress bar (gold, thin)
- "X of Y steps completed" text
- Lock icon if previous module not completed (optional for MVP — can skip)
- Hover: subtle border glow

**Step 3: Build Classroom page**

`src/pages/Classroom.tsx`:
- OverallProgress at top
- Grid of ModuleCards (responsive: 1 col mobile, 2 col tablet, 3 col desktop)
- Click card navigates to `/classroom/:moduleId`

**Step 4: Wire into App.tsx routes**

Replace placeholder `<div>Classroom</div>` with lazy-loaded Classroom component.

**Step 5: Verify**

Run: `npm run dev`
Expected: Classroom shows 10 module cards with progress bars, clicking a card navigates to module detail.

**Step 6: Commit**

```bash
git add src/pages/Classroom.tsx src/components/classroom/
git commit -m "feat: add classroom module list with progress tracking"
```

---

### Task 5: Classroom — Module Detail & Step View

**Files:**
- Create: `src/pages/ModuleDetail.tsx`
- Create: `src/pages/StepDetail.tsx`
- Create: `src/components/classroom/StepSidebar.tsx`
- Create: `src/components/classroom/VideoPlayer.tsx`
- Create: `src/components/classroom/MarkComplete.tsx`
- Create: `src/components/classroom/StepInstructions.tsx`

**Step 1: Build StepSidebar**

Left sidebar matching Skool's step list:
- Module title at top
- Module progress bar
- Ordered list of steps with:
  - Checkmark icon (green) if completed, circle outline if not
  - Step title
  - Active step highlighted with gold left border
- Click step navigates to `/classroom/:moduleId/:stepId`

**Step 2: Build VideoPlayer**

Placeholder video player component:
- 16:9 aspect ratio container
- Dark background with play icon overlay
- Text: "Video coming soon"
- When `videoUrl` is provided, renders an iframe embed (YouTube/Vimeo/HeyGen)

**Step 3: Build StepInstructions**

Renders markdown instruction content:
- Use a simple markdown renderer (or just render pre-formatted HTML)
- Styled with Tailwind prose-like classes
- Supports headings, lists, bold, code blocks

**Step 4: Build MarkComplete button**

- Large button at bottom of step
- "Mark as Complete" when incomplete → toggles to "Completed ✓" (green) when done
- Calls `useProgress().toggleStep(stepId)`
- Auto-navigates to next step when marked complete

**Step 5: Build ModuleDetail page**

`src/pages/ModuleDetail.tsx`:
- Two-column layout: StepSidebar (left, 280px) | StepContent (right, flex-1)
- If no stepId in URL, redirect to first step
- Reads module data from mock, renders sidebar + current step

**Step 6: Build StepDetail page (or integrate into ModuleDetail)**

The step content area within ModuleDetail:
- VideoPlayer at top
- StepInstructions below
- Action area based on step type:
  - `info`: Just video + text
  - `setup`: Checklist with checkboxes
  - `config`: Textarea for prompt editing (read-only mock for MVP)
  - `demo`: Placeholder "Demo coming soon" card
- MarkComplete button at bottom
- Feedback link ("Have feedback? Let us know")

**Step 7: Wire routes and verify**

Click module card → see module with step sidebar → click steps → see video + instructions → mark complete → progress updates.

**Step 8: Commit**

```bash
git add src/pages/ModuleDetail.tsx src/pages/StepDetail.tsx src/components/classroom/
git commit -m "feat: add module detail view with steps, video player, and completion tracking"
```

---

### Task 6: Support Tab — Chat Interface

**Files:**
- Create: `src/pages/Support.tsx`
- Create: `src/components/support/ChatWindow.tsx`
- Create: `src/components/support/ChatMessage.tsx`
- Create: `src/components/support/ChatInput.tsx`
- Create: `src/data/chat-responses.ts`

**Step 1: Create mock chat responses**

`src/data/chat-responses.ts` — Map of keyword patterns to responses. E.g., "api" → points to Module 2, "voice" → points to Module 3, default → "I'll connect you with our team."

**Step 2: Build ChatMessage component**

- AI messages: left-aligned, dark card with gold accent
- User messages: right-aligned, muted card
- Avatar + name + timestamp

**Step 3: Build ChatInput**

- Text input with send button
- Enter to send
- Placeholder: "Ask a question about your setup..."

**Step 4: Build ChatWindow**

- Scrollable message area
- Welcome message from AI on load
- Type a message → mock response appears after 500ms delay

**Step 5: Build Support page**

Full-page chat layout matching Skool's community feel but as a support chat.

**Step 6: Commit**

```bash
git add src/pages/Support.tsx src/components/support/ src/data/chat-responses.ts
git commit -m "feat: add support chat tab with mock AI responses"
```

---

### Task 7: Members Tab

**Files:**
- Create: `src/pages/Members.tsx`
- Create: `src/components/members/MemberCard.tsx`

**Step 1: Build MemberCard**

Skool-style member card:
- Avatar (circular)
- Name (bold)
- Role / Company
- "Joined [date]"
- Online indicator (green dot)

**Step 2: Build Members page**

- Search bar at top
- Member count
- Grid of MemberCards (responsive)
- Uses mock member data

**Step 3: Commit**

```bash
git add src/pages/Members.tsx src/components/members/
git commit -m "feat: add members tab with member cards"
```

---

### Task 8: About Tab

**Files:**
- Create: `src/pages/About.tsx`

**Step 1: Build About page**

Sections:
1. **Hero**: "Disruptors Sales Infra" + tagline about AI-powered sales systems
2. **What Makes Us Different**: 4 cards
   - No long-term contracts
   - You own everything
   - Complete transparency on costs
   - "Either I make you money or you boot me and keep the systems"
3. **Your Journey**: 4-phase visual (Onboarding → Customize → Deploy → Marketing)
4. **The Team**: Kyle (CEO), Tyler (Client Success), Bryan (AI Engineer)

Use the gold gradient accents from v1's design system.

**Step 2: Commit**

```bash
git add src/pages/About.tsx
git commit -m "feat: add about page with company info and client journey"
```

---

### Task 9: Admin Dashboard

**Files:**
- Create: `src/pages/Admin.tsx`
- Create: `src/components/admin/ClientProgressTable.tsx`
- Create: `src/data/admin.ts`

**Step 1: Create admin mock data**

`src/data/admin.ts` — 5-6 mock clients with name, company, progress %, current module, last active date, days since signup.

**Step 2: Build ClientProgressTable**

Table with columns: Client, Company, Progress (bar + %), Current Module, Last Active, Days Since Signup.
Color-code progress: red (<25%), yellow (25-75%), green (>75%).

**Step 3: Build Admin page**

- Top: "Client Progress Dashboard" heading + stats summary cards (total clients, avg progress, clients needing attention)
- Below: ClientProgressTable
- Separate route `/admin` (no community nav)
- Simple back link to main app

**Step 4: Commit**

```bash
git add src/pages/Admin.tsx src/components/admin/ src/data/admin.ts
git commit -m "feat: add admin dashboard with client progress tracking"
```

---

### Task 10: Responsive Design & Polish

**Files:**
- Modify: Multiple component files for responsive tweaks
- Modify: `src/index.css` for additional Skool-specific styling

**Step 1: Mobile nav**

TopNav on mobile: tabs become horizontally scrollable or use a bottom tab bar. Ensure all 4 tabs accessible on small screens.

**Step 2: Module detail mobile layout**

StepSidebar becomes a collapsible drawer on mobile (hamburger toggle). Step content takes full width.

**Step 3: Skool visual polish**

- Card hover effects (subtle elevation/border glow)
- Smooth transitions on tab switches
- Progress bar animations (fill with gold gradient)
- Consistent spacing matching Skool's density
- Toast notifications via Sonner for step completion ("Step completed! 🎉")

**Step 4: Verify build**

Run: `npm run build`
Expected: Clean build with no errors. Check chunk sizes.

**Step 5: Commit**

```bash
git add -A
git commit -m "feat: responsive design and Skool-style visual polish"
```

---

### Task 11: Vercel Deployment Setup

**Files:**
- Create: `vercel.json`

**Step 1: Create vercel.json**

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/" }
  ]
}
```

This ensures client-side routing works (all paths serve index.html).

**Step 2: Build verification**

Run: `npm run build && npm run preview`
Expected: Preview server works, all routes accessible, no 404s on refresh.

**Step 3: Push to GitHub**

```bash
git remote add origin https://github.com/disruptorsai/ghl-saas-v2.git
git push -u origin main
```

**Step 4: Deploy on Vercel**

Connect GitHub repo to Vercel. Settings:
- Framework: Vite
- Build command: `npm run build`
- Output directory: `dist`

**Step 5: Final commit**

```bash
git add vercel.json
git commit -m "feat: add Vercel deployment config"
git push
```

---

## Task Summary

| # | Task | Estimate |
|---|------|----------|
| 1 | Scaffold project from v1 | 5 min |
| 2 | Mock data layer | 10 min |
| 3 | Layout shell — Skool top nav | 10 min |
| 4 | Classroom — Module list | 8 min |
| 5 | Classroom — Module detail & steps | 15 min |
| 6 | Support chat tab | 8 min |
| 7 | Members tab | 5 min |
| 8 | About tab | 5 min |
| 9 | Admin dashboard | 8 min |
| 10 | Responsive & polish | 10 min |
| 11 | Vercel deployment | 3 min |

**Total: 11 tasks**
