# Sales Infra V2 — Skool-Style Community Rebuild

**Date:** 2026-03-19
**Status:** Approved
**Source:** Bryan × Tyler × Kyle meeting transcript (March 19)

## Overview

Complete rebuild of the Sales Infra client-facing UI as a Skool (skool.com) clone. The existing Sales Infra is too complex for non-technical clients. The new version models the entire experience after Skool's community platform: modules, steps, video-first content, progress tracking.

Kyle: *"Make it exactly like Skool. Like exactly like Skool."*

## Tech Stack

- **React 19 + Vite + TypeScript** (reuse from v1)
- **TailwindCSS v4 + shadcn/ui** (reuse from v1)
- **Mock data** via local constants (Supabase wired later)
- **Deploy on Vercel**

### Reused from v1 (disruptors-las)
- shadcn/ui component library (`components/ui/`)
- TailwindCSS config and global styles
- Vite config with manual chunking
- TypeScript config
- ESLint config
- Package dependencies (React, Vite, Tailwind, shadcn, Lucide icons, etc.)

## Layout

### Top Navigation Bar (Skool-style)
- **Left:** Community logo + name ("Disruptors Sales Infra")
- **Center:** 4 tabs — Support | Classroom | Members | About
- **Right:** User avatar, notifications bell, search
- Dark theme matching Skool's aesthetic

### Routes
```
/                    → Redirect to /classroom
/support             → AI chat support
/classroom           → Module list with progress
/classroom/:moduleId → Module detail with steps
/classroom/:moduleId/:stepId → Step detail (video + instructions)
/members             → Member grid
/about               → About page
/admin               → Admin dashboard (client progress tracking)
```

## Tab 1: Support

AI chatbot interface replacing Skool's "Community" tab.

- Full-page chat UI
- Answers questions, points to relevant modules/steps
- Escalates to team via email when it can't help
- **MVP:** Chat UI with mock responses, wire to real AI later

## Tab 2: Classroom (Core Feature)

### Module List View (`/classroom`)
- Grid of module cards (matching Skool's card layout)
- Each card: thumbnail, title, description, progress bar, step count
- Overall progress bar at top ("You're 40% through the setup")

### Module Detail View (`/classroom/:moduleId`)
- Left sidebar: ordered list of steps with completion checkmarks
- Right/main area: currently selected step content
- Module-level progress bar

### Step Detail View (`/classroom/:moduleId/:stepId`)
- **Video player** at top (placeholder embed for HeyGen/YouTube)
- **Instructions** below (rendered markdown)
- **Action area** (varies by step type):
  - `setup`: Checklist of items to complete
  - `config`: Prompt editor / template editor
  - `demo`: Embedded demo page to test agent
  - `info`: Just video + text
- **"Mark as Complete"** button → advances progress bar
- **Feedback form** → send changes/bugs to team

### Modules & Steps

**Module 1: Welcome to Sales Infra**
- Step 1: Welcome video (intro from Kyle)
- Step 2: System overview — what you're getting
- Step 3: Your client journey (Onboarding → Customize → Deploy → Marketing)

**Module 2: API Keys & Software Setup**
- Step 1: Video — why you own everything
- Step 2: GoHighLevel setup + API key
- Step 3: OpenAI API key
- Step 4: Retell.ai setup (voice)
- Step 5: n8n access verification

**Module 3: AI Voice Receptionist**
- Step 1: Video — what it does, ROI, example for service business
- Step 2: Workflow diagram
- Step 3: Customize voice prompt
- Step 4: Test/demo the agent
- Step 5: Submit feedback or mark complete

**Module 4: Database Reactivation**
- Step 1: Video — re-engage cold leads, ROI
- Step 2: Workflow diagram
- Step 3: Customize text templates
- Step 4: Upload test leads / demo
- Step 5: Submit feedback or mark complete

**Module 5: Lead Follow-up**
- Step 1: Video — multi-step nurture sequence, ROI
- Step 2: Workflow diagram (welcome SMS → video → AI convo → follow-ups)
- Step 3: Customize templates (welcome SMS, emails, follow-up messages)
- Step 4: Test/demo
- Step 5: Submit feedback or mark complete

**Module 6: Appointment Reminders**
- Step 1: Video — reduce no-shows
- Step 2: Workflow diagram
- Step 3: Customize reminder templates
- Step 4: Test/demo
- Step 5: Submit feedback or mark complete

**Module 7: Quote Follow-up**
- Step 1: Video — convert quotes to sales
- Step 2: Workflow diagram
- Step 3: Customize follow-up templates
- Step 4: Test/demo
- Step 5: Submit feedback or mark complete

**Module 8: Review Request**
- Step 1: Video — automate review collection, social proof
- Step 2: Workflow diagram (service complete → sentiment check → review link or support)
- Step 3: Customize review request templates
- Step 4: Test/demo
- Step 5: Submit feedback or mark complete

**Module 9: Website Chatbot**
- Step 1: Video — 24/7 website engagement
- Step 2: Workflow diagram
- Step 3: Customize chatbot prompt & knowledge base
- Step 4: Test/demo (embedded chat widget)
- Step 5: Submit feedback or mark complete

**Module 10: Prompt Playground**
- Step 1: Video — how to test and refine AI prompts
- Step 2: Interactive prompt editor (reuse PromptPlayground component concept)
- Step 3: Test prompts against live models
- Step 4: Save optimized prompts

## Tab 3: Members

- Grid of member cards matching Skool's layout
- Avatar, name, role/company, join date
- Online status indicator
- MVP: Mock data

## Tab 4: About

- Hero section: Disruptors Media overview
- What makes us different:
  - No long-term contracts
  - No renting systems — you own everything
  - Complete transparency on AI software costs
  - "Either I make you money or you boot me and keep the systems"
- Team section (Kyle, Tyler, Bryan)
- Client journey visual (Onboarding → Customize → Deploy → Marketing)

## Admin Dashboard (`/admin`)

- Table of all clients with:
  - Name, company
  - Overall progress percentage
  - Current module/step
  - Last active date
  - Days since signup
- Purpose: Tyler can see "Client X is at 5%, any roadblocks?" and follow up

## Data Model (Mock → Supabase Later)

```typescript
interface Module {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  order: number;
  steps: Step[];
}

interface Step {
  id: string;
  moduleId: string;
  title: string;
  videoUrl: string | null; // placeholder until HeyGen videos ready
  instructions: string; // markdown
  type: 'info' | 'setup' | 'config' | 'demo';
  order: number;
}

interface UserProgress {
  userId: string;
  stepId: string;
  completed: boolean;
  completedAt: string | null;
}

interface Member {
  id: string;
  name: string;
  avatar: string;
  role: string;
  company: string;
  joinedAt: string;
}

interface FeedbackItem {
  id: string;
  userId: string;
  moduleId: string;
  stepId: string;
  type: 'question' | 'bug' | 'change_request' | 'suggestion';
  priority: 'high' | 'medium' | 'low';
  message: string;
  createdAt: string;
}
```

## Future (Post-MVP)

- Supabase auth + database
- IP-based access control (max 3 devices per client)
- Real AI chatbot in Support tab
- HeyGen video embeds (once editors deliver)
- n8n webhook integration for campaign execution
- Real-time notifications
- Custom domain (disruptorsmedia.com/infra)
