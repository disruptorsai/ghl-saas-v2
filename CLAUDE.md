# Disruptors Sales Infra V2 — Skool-Style Community

## Project Overview
A Skool (skool.com) clone rebuilt as the client-facing experience for Disruptors Media's AI sales infrastructure. Clients onboard through video-first modules, track progress, and get support.

**Repo:** https://github.com/disruptorsai/ghl-saas-v2.git

## Tech Stack
- **Frontend:** Vite 7 + React 19 + TypeScript 5.9 + TailwindCSS v4 + shadcn/ui
- **Font:** Inter (sans-serif)
- **Icons:** Lucide React
- **Routing:** React Router v7
- **Toast:** Sonner
- **Data:** Mock data (Supabase integration planned)
- **Deploy:** Vercel

## Architecture
- Frontend-only MVP with mock data in `src/data/`
- Progress tracking via localStorage (`src/hooks/useProgress.ts`)
- 4 main tabs: Support, Classroom, Members, About
- Admin dashboard at `/admin`
- All routes lazy-loaded with React.lazy + Suspense

## Key Directories
- `src/components/ui/` — shadcn/ui components (reused from v1)
- `src/components/layout/` — TopNav, CommunityLayout
- `src/components/classroom/` — ModuleCard, StepSidebar, VideoPlayer, etc.
- `src/components/support/` — Chat components
- `src/components/members/` — MemberCard
- `src/components/admin/` — ClientProgressTable
- `src/pages/` — All page components
- `src/data/` — Mock data (modules, members, community, admin, chat-responses)
- `src/hooks/` — useProgress hook
- `docs/plans/` — Design and implementation docs

## Routes
```
/                    → Redirect to /classroom
/support             → AI support chat
/classroom           → Module list with progress
/classroom/:moduleId → Module detail with steps
/classroom/:moduleId/:stepId → Step detail
/members             → Member grid
/about               → About page
/admin               → Admin dashboard (standalone)
```

## Classroom Modules
1. Welcome to Sales Infra
2. API Keys & Software Setup
3. AI Voice Receptionist
4. Database Reactivation
5. Lead Follow-up
6. Appointment Reminders
7. Quote Follow-up
8. Review Request
9. Website Chatbot
10. Prompt Playground

## Commands
```bash
npm run dev       # Start dev server (http://localhost:5173)
npm run build     # Production build
npm run lint      # ESLint check
npm run preview   # Preview production build
```

## Future (Post-MVP)
- Supabase auth + database
- IP-based access control (max 3 devices/client)
- Real AI chatbot (Support tab)
- HeyGen video embeds
- n8n webhook integration
- Custom domain
