# CSM Module Permissions — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Let CSMs control which classroom modules each client can access, with tier-based defaults and per-client overrides, and secure module content so locked content never reaches the browser.

**Architecture:** Add `tier` and `module_overrides` columns to the `clients` table. Move module step content (instructions, video URLs) from the hardcoded `modules.ts` into a `module_content` Supabase table with RLS. Frontend shows locked modules as greyed with a lock icon. CSMs manage access via toggle grid in client settings.

**Tech Stack:** Supabase (Postgres + RLS), React, TypeScript, TailwindCSS, shadcn/ui

**Design Doc:** `docs/plans/2026-03-31-csm-module-permissions-design.md`

---

### Task 1: Add tier and module_overrides columns to clients table

**Files:**
- Create: `supabase/migrations/004_module_permissions.sql`
- Modify: `src/contexts/UserSupabaseContext.tsx:9-58` (ClientData interface)
- Modify: `supabase/setup/main-supabase.sql:35-92` (add columns to CREATE TABLE)

**Step 1: Write the migration SQL**

Create `supabase/migrations/004_module_permissions.sql`:

```sql
-- Add tier and module access overrides to clients table
ALTER TABLE clients
  ADD COLUMN IF NOT EXISTS tier text NOT NULL DEFAULT 'full_suite',
  ADD COLUMN IF NOT EXISTS module_overrides jsonb NOT NULL DEFAULT '{}';

-- Validate tier values
ALTER TABLE clients
  ADD CONSTRAINT clients_tier_check
  CHECK (tier IN ('starter', 'growth', 'full_suite'));
```

Note: Default to `full_suite` so existing clients see all modules (non-breaking migration).

**Step 2: Update ClientData interface**

In `src/contexts/UserSupabaseContext.tsx`, add to the `ClientData` interface after the `// Meta` comment block (before `created_at`):

```typescript
  // Module access
  tier: string
  module_overrides: Record<string, boolean>
```

**Step 3: Update main-supabase.sql**

In `supabase/setup/main-supabase.sql`, add after the webhook URL columns (before `created_at`):

```sql
  -- Module access
  tier text not null default 'full_suite',
  module_overrides jsonb not null default '{}',
```

**Step 4: Run migration on Supabase**

Run this SQL in the Supabase SQL editor for the main project (URL from `.env` VITE_SUPABASE_URL).

**Step 5: Commit**

```bash
git add supabase/migrations/004_module_permissions.sql src/contexts/UserSupabaseContext.tsx supabase/setup/main-supabase.sql
git commit -m "feat: add tier and module_overrides columns to clients table"
```

---

### Task 2: Create tier definitions and access resolution hook

**Files:**
- Create: `src/hooks/useModuleAccess.ts`

**Step 1: Create the hook**

Create `src/hooks/useModuleAccess.ts`:

```typescript
import { useMemo } from 'react'
import { useClientSupabase } from '@/contexts/UserSupabaseContext'
import { useAuth } from '@/contexts/AuthContext'

export const TIER_MODULES: Record<string, string[]> = {
  starter: [
    'welcome',
    'api-setup',
    'twilio-setup',
    'voice-receptionist',
  ],
  growth: [
    'welcome',
    'api-setup',
    'twilio-setup',
    'voice-receptionist',
    'db-reactivation',
    'lead-followup',
    'appointment-reminders',
  ],
  full_suite: [
    'welcome',
    'api-setup',
    'twilio-setup',
    'voice-receptionist',
    'db-reactivation',
    'lead-followup',
    'appointment-reminders',
    'quote-followup',
    'review-request',
    'website-chatbot',
    'a2p-registration',
    'knowledge-base',
    'testing',
    'management',
    'prompt-playground',
  ],
}

export function useModuleAccess() {
  const { connection } = useClientSupabase()
  const { role } = useAuth()

  const tier = connection?.tier ?? 'full_suite'
  const overrides = (connection?.module_overrides ?? {}) as Record<string, boolean>

  const isModuleUnlocked = useMemo(() => {
    return (moduleId: string): boolean => {
      // Agency users always see everything
      if (role === 'agency') return true

      // Explicit override takes priority
      if (overrides[moduleId] === true) return true
      if (overrides[moduleId] === false) return false

      // Fall back to tier defaults
      const tierModules = TIER_MODULES[tier] ?? TIER_MODULES.full_suite
      return tierModules.includes(moduleId)
    }
  }, [tier, overrides, role])

  return { tier, overrides, isModuleUnlocked }
}
```

**Step 2: Commit**

```bash
git add src/hooks/useModuleAccess.ts
git commit -m "feat: add useModuleAccess hook with tier definitions"
```

---

### Task 3: Split modules.ts into metadata + content

**Files:**
- Modify: `src/data/modules.ts` (strip instructions and videoUrl from steps)
- Modify: `src/data/types.ts` (make instructions and videoUrl optional)
- Create: `src/hooks/useModuleContent.ts` (fetch content from Supabase)

**Step 1: Update types to make content fields optional**

In `src/data/types.ts`, change the Step interface:

```typescript
export interface Step {
  id: string
  moduleId: string
  title: string
  description: string
  videoUrl?: string | null
  instructions?: string
  type: 'info' | 'setup' | 'config' | 'demo'
  order: number
}
```

**Step 2: Create a script to extract content and strip modules.ts**

This is a large manual step. For each module in `src/data/modules.ts`, for each step:
- Copy out `instructions` and `videoUrl` values (these will be seeded into Supabase later)
- Replace `instructions` with an empty string `''`
- Replace `videoUrl` with `null`

The metadata (id, title, description, type, order) stays in modules.ts.

**Important:** Keep the original modules.ts content in a separate file for seeding:

Create `supabase/seeds/module_content_seed.ts` — a Node script that reads the OLD modules.ts content and inserts into module_content table. (This will be created in Task 4.)

**Step 3: Create useModuleContent hook**

Create `src/hooks/useModuleContent.ts`:

```typescript
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useModuleAccess } from './useModuleAccess'

interface StepContent {
  step_id: string
  instructions: string
  video_url: string | null
}

export function useModuleContent(moduleId: string) {
  const { isModuleUnlocked } = useModuleAccess()
  const [content, setContent] = useState<Record<string, StepContent>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!moduleId || !isModuleUnlocked(moduleId)) {
      setLoading(false)
      return
    }

    const fetchContent = async () => {
      setLoading(true)
      const { data } = await supabase
        .from('module_content')
        .select('step_id, instructions, video_url')
        .eq('module_id', moduleId)

      if (data) {
        const mapped: Record<string, StepContent> = {}
        for (const row of data) {
          mapped[row.step_id] = row
        }
        setContent(mapped)
      }
      setLoading(false)
    }

    fetchContent()
  }, [moduleId, isModuleUnlocked])

  const getStepContent = (stepId: string) => content[stepId] ?? null

  return { content, loading, getStepContent }
}
```

**Step 4: Commit**

```bash
git add src/data/types.ts src/data/modules.ts src/hooks/useModuleContent.ts
git commit -m "feat: split module content from metadata, add useModuleContent hook"
```

---

### Task 4: Create module_content table and seed data

**Files:**
- Create: `supabase/migrations/005_module_content.sql`
- Create: `supabase/seeds/seed-module-content.sql` (generated from current modules.ts before stripping)

**Step 1: Write the migration**

Create `supabase/migrations/005_module_content.sql`:

```sql
CREATE TABLE IF NOT EXISTS module_content (
  module_id TEXT NOT NULL,
  step_id TEXT NOT NULL,
  instructions TEXT NOT NULL DEFAULT '',
  video_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (module_id, step_id)
);

-- RLS: Agency users get full access
ALTER TABLE module_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "agency_full_access" ON module_content
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'agency'
    )
  );

-- RLS: Client users can only read content for unlocked modules
CREATE POLICY "client_module_access" ON module_content
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM profiles p
      JOIN clients c ON c.id = p.client_id
      WHERE p.id = auth.uid()
      AND p.role = 'client'
      AND (
        -- Check explicit override first
        (c.module_overrides ? module_content.module_id
         AND (c.module_overrides->>module_content.module_id)::boolean = true)
        OR
        -- Check tier (no explicit override)
        (
          NOT (c.module_overrides ? module_content.module_id)
          AND (
            c.tier = 'full_suite'
            OR (c.tier = 'growth' AND module_content.module_id IN (
              'welcome','api-setup','twilio-setup','voice-receptionist',
              'db-reactivation','lead-followup','appointment-reminders'
            ))
            OR (c.tier = 'starter' AND module_content.module_id IN (
              'welcome','api-setup','twilio-setup','voice-receptionist'
            ))
          )
        )
      )
      -- Exclude explicitly locked modules
      AND NOT (
        c.module_overrides ? module_content.module_id
        AND (c.module_overrides->>module_content.module_id)::boolean = false
      )
    )
  );
```

**Step 2: Generate seed SQL**

Before stripping modules.ts (Task 3 Step 2), extract ALL step content into SQL INSERT statements. This should be done by reading the current modules.ts and generating:

```sql
INSERT INTO module_content (module_id, step_id, instructions, video_url) VALUES
  ('welcome', 'welcome-1', E'## Welcome to Disruptors Sales Infrastructure\n\n...', NULL),
  ('welcome', 'welcome-2', E'## System Overview\n\n...', NULL),
  -- ... all steps for all modules
ON CONFLICT (module_id, step_id) DO UPDATE
  SET instructions = EXCLUDED.instructions,
      video_url = EXCLUDED.video_url,
      updated_at = NOW();
```

Save as `supabase/seeds/seed-module-content.sql`.

**Step 3: Run migration and seed on Supabase**

Execute both SQL files in the Supabase SQL editor.

**Step 4: Commit**

```bash
git add supabase/migrations/005_module_content.sql supabase/seeds/seed-module-content.sql
git commit -m "feat: create module_content table with RLS and seed data"
```

---

### Task 5: Update Classroom.tsx to show locked modules

**Files:**
- Modify: `src/pages/Classroom.tsx` (use useModuleAccess)
- Modify: `src/components/classroom/ModuleCard.tsx` (add locked state with lock icon)

**Step 1: Update Classroom.tsx**

In `src/pages/Classroom.tsx`:

- Add import: `import { useModuleAccess } from '@/hooks/useModuleAccess'`
- Inside component, add: `const { isModuleUnlocked } = useModuleAccess()`
- Change the `isLocked` logic in the map to include access check:

```typescript
{visibleModules.map((module, index) => {
  const accessLocked = !isModuleUnlocked(module.id)
  const progressLocked =
    index > 0 &&
    getModuleProgress(visibleModules[index - 1].id).percentage < 100
  return (
    <ModuleCard
      key={module.id}
      module={module}
      isLocked={progressLocked}
      isAccessLocked={accessLocked}
    />
  )
})}
```

**Step 2: Update ModuleCard.tsx**

Add `isAccessLocked` prop. When true:
- Show lock icon overlay
- Grey out the card with `opacity-50 pointer-events-none`
- Show text "Your CSM will unlock this when you're ready" below the title
- Do NOT link to the module detail page

Read the current ModuleCard.tsx first to understand the exact structure, then add the locked state.

**Step 3: Commit**

```bash
git add src/pages/Classroom.tsx src/components/classroom/ModuleCard.tsx
git commit -m "feat: show locked modules with lock icon in classroom"
```

---

### Task 6: Update ModuleDetail.tsx to gate content and fetch from Supabase

**Files:**
- Modify: `src/pages/ModuleDetail.tsx` (access check + content fetching)
- Modify: `src/components/classroom/StepInstructions.tsx` (accept content prop)

**Step 1: Update ModuleDetail.tsx**

- Add imports: `useModuleAccess`, `useModuleContent`, `toast` from sonner
- After finding the module, check access:

```typescript
const { isModuleUnlocked } = useModuleAccess()
const { getStepContent, loading: contentLoading } = useModuleContent(moduleId!)

if (module && !isModuleUnlocked(module.id)) {
  toast.error('This module is locked')
  return <Navigate to={classroomBase} replace />
}
```

- When rendering step content, merge fetched content with step metadata:

```typescript
const stepContent = getStepContent(currentStep.id)
const instructions = stepContent?.instructions ?? currentStep.instructions ?? ''
const videoUrl = stepContent?.video_url ?? currentStep.videoUrl ?? null
```

- Show a loading skeleton while `contentLoading` is true

**Step 2: Commit**

```bash
git add src/pages/ModuleDetail.tsx src/components/classroom/StepInstructions.tsx
git commit -m "feat: gate module detail access and fetch content from Supabase"
```

---

### Task 7: Build CSM module access management UI

**Files:**
- Create: `src/components/ModuleAccessManager.tsx`
- Modify: Client edit/settings page (wherever client details are edited — likely within the client card flow in `src/pages/ClientList.tsx` or a settings modal)

**Step 1: Create ModuleAccessManager component**

Create `src/components/ModuleAccessManager.tsx`:

```typescript
// Component with:
// - Tier dropdown (starter / growth / full_suite) using shadcn Select
// - Module toggle grid showing all 15 modules
// - Each toggle shows 3 states:
//   - Default (from tier): dimmed toggle, shows "From tier" label
//   - Force unlocked: green, shows "Override: unlocked"
//   - Force locked: red, shows "Override: locked"
// - Clicking cycles: default → force unlock → force lock → default
// - Save button that updates clients table with new tier + module_overrides
// - Uses supabase.from('clients').update({ tier, module_overrides }).eq('id', clientId)
```

Props: `clientId: string`, `currentTier: string`, `currentOverrides: Record<string, boolean>`, `onSave: () => void`

Use `modules` metadata from `@/data/modules` to render the module list.

Import TIER_MODULES from `@/hooks/useModuleAccess` to show which modules are included in each tier.

**Step 2: Integrate into client management**

Add the ModuleAccessManager to the client detail/edit flow. Read `src/pages/ClientList.tsx` to find the right insertion point — likely as a new section in the client card dropdown menu or as a modal triggered from the menu.

Alternatively, if there's a settings page at `/c/:clientId/settings`, add it there.

**Step 3: Commit**

```bash
git add src/components/ModuleAccessManager.tsx src/pages/ClientList.tsx
git commit -m "feat: add CSM module access management UI with tier and overrides"
```

---

### Task 8: Update OverallProgress to only count unlocked modules

**Files:**
- Modify: `src/components/classroom/OverallProgress.tsx`
- Modify: `src/hooks/useProgress.tsx` (getOverallProgress should accept module filter)

**Step 1: Update progress calculation**

The overall progress bar and "X of Y steps completed" should only count steps from unlocked modules. Update `getOverallProgress()` to accept an optional list of module IDs to include.

In Classroom.tsx, pass only unlocked module IDs to the progress calculation.

**Step 2: Commit**

```bash
git add src/components/classroom/OverallProgress.tsx src/hooks/useProgress.tsx
git commit -m "feat: only count unlocked modules in progress calculation"
```

---

### Task 9: End-to-end verification

**Step 1: Test as agency user**
- Log in as agency (bryansumait.automate@gmail.com)
- Open a client, set tier to "starter"
- Verify client classroom shows locked modules with lock icon
- Verify clicking a locked module route redirects with toast
- Verify network tab shows no content fetched for locked modules
- Override a module to unlocked, verify it becomes accessible

**Step 2: Test as client user**
- Log in as a client user (if one exists) or create a test profile
- Verify locked modules show correctly
- Verify browser dev tools / network tab shows no content for locked modules
- Verify RLS blocks direct Supabase queries for locked content

**Step 3: Test tier changes**
- Change tier from starter → growth → full_suite
- Verify module access updates correctly each time

**Step 4: Final commit and push**

```bash
git push origin master master:main
```

---

## Execution Order Summary

| Task | Description | Dependencies |
|------|-------------|-------------|
| 1 | Add DB columns | None |
| 2 | useModuleAccess hook | Task 1 |
| 3 | Split modules.ts + useModuleContent hook | None |
| 4 | Create module_content table + seed | Task 3 |
| 5 | Locked module UI in Classroom | Tasks 2, 3 |
| 6 | Gate ModuleDetail + fetch content | Tasks 2, 3, 4 |
| 7 | CSM management UI | Tasks 1, 2 |
| 8 | Update progress calculation | Task 2 |
| 9 | End-to-end testing | All |

Tasks 1-2 and 3-4 can be done in parallel. Tasks 5-8 depend on the first group.
