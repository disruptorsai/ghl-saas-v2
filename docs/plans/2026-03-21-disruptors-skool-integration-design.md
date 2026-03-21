# Disruptors Skool — SaaS + Community Integration Design

**Date:** 2026-03-21
**Status:** Approved

## Overview

Merge the Skool-style community (ghl-saas-v2) and the Lead Automation System (disruptors-las) into a single app called **Disruptors Skool**. The "About" tab becomes the "Management" tab embedding the full SaaS. Academy inside LAS is removed (Skool's Classroom replaces it). Clients get username/password access scoped to their own project.

## Decisions

| Decision | Answer |
|----------|--------|
| Client experience | Full Skool + Management dashboard |
| Management placement | Tab replacing About |
| Content management | Agency-only for now, scalable for others later |
| Client login | Agency creates credentials, single `/auth` page, role-based routing |
| Client workspace | Always one, skip straight to dashboard |
| Media in Classroom | External URLs (paste links) |
| Architecture | Full merge into ghl-saas-v2 |
| Branch | Separate branch (main untouched) |
| Supabase | Same project (`nssvviukveinrpwicyfw`), additive changes only |
| Reversibility | Fully reversible (git branch + down migrations) |

## Auth & Roles

Single Supabase Auth with role-based routing.

| Role | Description | Experience |
|------|-------------|------------|
| `agency` | Admin users | Full Skool + Management for ALL clients, Admin page, client creation |
| `client` | Client users | Full Skool + Management for THEIR client only, no client picker |

### Login Flow

1. User hits `/auth`, enters email + password
2. Supabase authenticates → app reads `profiles.role`
3. `agency` → `/` (client list) → pick client → Skool shell
4. `client` → `/classroom` (Skool shell, auto-scoped to their `client_id`)

### Client Account Creation

- Agency goes to client settings → "Create Login"
- Sets email + password
- Creates Supabase auth user + profile with `role='client'`, `client_id` linked

## App Shell & Navigation

**Rebrand:** "Disruptors Sales Infra" → "Disruptors Skool"

### Top Nav (4 tabs)

| Tab | Route | Content |
|-----|-------|---------|
| Support | `/support` | AI support chat |
| Classroom | `/classroom` | Modules with progress |
| Members | `/members` | Member grid |
| Management | `/management` | Full SaaS (replaces About) |

### Management Tab Behavior

- Clicking "Management" switches to LAS layout with sidebar nav
- Top nav stays visible for switching back to Skool tabs
- Routes: `/management/dashboard`, `/management/campaigns`, etc.

### Role-Based Visibility

- `agency`: client picker dropdown before entering shell
- `client`: no picker, auto-scoped
- `/admin` page: agency-only, accessible via icon in top nav

### Removals

- About page + tab → replaced by Management
- Academy pages inside LAS → Classroom replaces this

## Route Structure

```
/auth                              → Login (role-based redirect)

Agency-only:
  /                                → Client list
  /create                          → Create new client
  /admin                           → Admin dashboard

Skool Shell:
  /support                         → AI support chat
  /classroom                       → Module list
  /classroom/:moduleId             → Module detail
  /classroom/:moduleId/:stepId     → Step detail
  /members                         → Member grid

  /management                      → Redirect to /management/dashboard
  /management/dashboard            → Dashboard
  /management/campaigns            → Campaign list
  /management/text-ai-rep          → Text AI overview
  /management/text-ai-rep/configuration
  /management/text-ai-rep/templates
  /management/voice-ai-rep         → Voice AI overview
  /management/voice-ai-rep/configuration
  /management/voice-ai-rep/templates
  /management/prompts/text         → Text prompts CRUD
  /management/prompts/voice        → Voice prompts CRUD
  /management/knowledge-base       → KB CRUD
  /management/deploy-ai-reps       → Deploy
  /management/debug-ai-reps/text   → Debug text
  /management/debug-ai-reps/voice  → Debug voice
  /management/analytics            → Analytics
  /management/credentials          → API credentials
  /management/settings             → Client settings
  /management/chatbot/*            → Chatbot dashboard/chat
  /management/voice-ai/*           → Voice AI dashboard/chat
```

## Data Architecture

Single Supabase project (`nssvviukveinrpwicyfw`). Additive changes only.

### profiles table (modify)

```sql
ALTER TABLE profiles ADD COLUMN role TEXT DEFAULT 'client' CHECK (role IN ('agency', 'client'));
ALTER TABLE profiles ADD COLUMN client_id UUID REFERENCES clients(id);
```

### classroom_modules table (new)

```sql
CREATE TABLE classroom_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  "order" INTEGER NOT NULL DEFAULT 0,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### classroom_steps table (new)

```sql
CREATE TABLE classroom_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id UUID REFERENCES classroom_modules(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  media_url TEXT,
  media_type TEXT CHECK (media_type IN ('video', 'image', 'flowchart', 'embed')),
  instructions TEXT,
  type TEXT CHECK (type IN ('info', 'setup', 'config', 'demo')),
  "order" INTEGER NOT NULL DEFAULT 0
);
```

### classroom_progress table (new)

```sql
CREATE TABLE classroom_progress (
  user_id UUID REFERENCES auth.users(id),
  step_id UUID REFERENCES classroom_steps(id) ON DELETE CASCADE,
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  PRIMARY KEY (user_id, step_id)
);
```

### community_members table (new)

```sql
CREATE TABLE community_members (
  user_id UUID REFERENCES auth.users(id) PRIMARY KEY,
  display_name TEXT,
  avatar_url TEXT,
  role_label TEXT,
  company TEXT,
  is_online BOOLEAN DEFAULT false,
  joined_at TIMESTAMPTZ DEFAULT now()
);
```

### RLS Policies

- `classroom_modules` / `classroom_steps`: everyone reads, only `agency` role inserts/updates/deletes
- `classroom_progress`: users read/write their own rows only
- `community_members`: everyone reads, users update their own row only
- All existing LAS tables: unchanged (`client_id` scoping stays)

## Merge Strategy

1. **Base:** ghl-saas-v2 (React 19, Router v7, Tailwind v4)
2. **Import from LAS:** contexts, hooks, management pages, components (skip Academy)
3. **Upgrade LAS code:** React 18→19, Router v6→v7 (minor import changes)
4. **Delete:** Academy pages from LAS, About page from Skool, mock data files
5. **Wire up:** Unified App.tsx, shared TopNav, Management tab renders LAS sidebar + pages
6. **Add deps:** `@supabase/supabase-js` and any LAS-specific packages

## Down Migration (Revert)

```sql
DROP TABLE IF EXISTS classroom_progress;
DROP TABLE IF EXISTS classroom_steps;
DROP TABLE IF EXISTS classroom_modules;
DROP TABLE IF EXISTS community_members;
ALTER TABLE profiles DROP COLUMN IF EXISTS role;
ALTER TABLE profiles DROP COLUMN IF EXISTS client_id;
```
