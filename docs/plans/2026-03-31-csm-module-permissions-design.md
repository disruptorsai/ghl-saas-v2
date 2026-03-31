# CSM Module Permissions & Access Control — Design Doc

**Date:** 2026-03-31
**Status:** Approved
**Author:** Claude + Bryan

## Problem

All 15 classroom modules are visible and accessible to every client. CSMs (Kyle, Tyler) need to control which modules each client sees, unlock modules over time, and ensure locked module content is not accessible via browser dev tools.

## Revert Instructions

To revert this feature entirely:
1. `git log --oneline` to find the commits from this feature
2. `git revert <commit-hash>` for each commit (newest first), OR
3. `git revert <oldest-hash>..<newest-hash>` to revert the range
4. Remove the `tier` and `module_overrides` columns from the `clients` table in Supabase
5. Drop the `module_content` table if created
6. The original `src/data/modules.ts` with full content is preserved in git history

## Design

### Data Model

**Existing `clients` table — 2 new columns:**
- `tier` — TEXT, one of `'starter'`, `'growth'`, `'full_suite'`, default `'starter'`
- `module_overrides` — JSONB, default `{}`. Keys are module IDs, values are booleans. Example: `{"website-chatbot": true, "voice-receptionist": false}`

**New `module_content` table (main Supabase):**
```sql
CREATE TABLE module_content (
  id TEXT PRIMARY KEY,            -- matches module ID from modules.ts
  step_id TEXT NOT NULL,          -- matches step ID
  instructions TEXT,              -- markdown content
  video_url TEXT,                 -- video embed URL
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(id, step_id)
);
```

**RLS Policy on `module_content`:**
- Agency users: full read access (for management)
- Client users: read only if module is unlocked for their client (check tier + overrides via a Postgres function)

### Tier Definitions (hardcoded in frontend)

```typescript
const TIER_MODULES: Record<string, string[]> = {
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
```

### Access Resolution

```
function isModuleUnlocked(moduleId, tier, overrides):
  if overrides[moduleId] === true  → UNLOCKED (forced)
  if overrides[moduleId] === false → LOCKED (forced)
  if TIER_MODULES[tier].includes(moduleId) → UNLOCKED (from tier)
  else → LOCKED
```

### Client Experience

**Classroom page (`/c/:clientId/classroom`):**
- Unlocked modules: render normally (clickable, show progress)
- Locked modules: visible with lock icon, greyed out card, text "Your CSM will unlock this when you're ready." Not clickable.

**Module detail routes (`/c/:clientId/classroom/:moduleId`):**
- Check access before rendering
- If locked: redirect to `/c/:clientId/classroom` with toast "This module is locked"
- If unlocked: fetch content from `module_content` table, show loading skeleton while fetching

**Security:**
- `src/data/modules.ts` contains ONLY public metadata: id, title, description, thumbnail, order, step titles/IDs
- All instructional content (markdown, video URLs) stored in `module_content` table
- RLS ensures locked module content never reaches the browser
- Network tab inspection shows nothing for locked modules

### CSM Management UI

**Location:** Inside existing client card/edit flow on agency dashboard

**Components:**
- Tier dropdown: Starter / Growth / Full Suite
- Module toggle grid: shows all 15 modules
  - Each toggle has 3 visual states:
    - Dimmed/default: inherited from tier (no override)
    - Green override: explicitly unlocked (override = true)
    - Red override: explicitly locked (override = false)
  - Clicking a toggle cycles: default → force unlock → force lock → default
- Save button: updates `tier` and `module_overrides` on the `clients` row

### Migration Path

1. Add columns to `clients` table (non-breaking, both nullable with defaults)
2. Create `module_content` table and seed from current `modules.ts` data
3. Add RLS policies
4. Strip `modules.ts` down to metadata only
5. Update frontend to fetch content from Supabase
6. Add locked module UI to classroom
7. Add CSM toggle UI to client management
8. All existing clients default to `full_suite` tier so nothing changes for current users

## Architecture Diagram

```
┌─────────────────────────────────┐
│   Agency Dashboard (CSM view)   │
│  ┌───────────────────────────┐  │
│  │ Client Card               │  │
│  │ - Tier dropdown           │  │
│  │ - Module toggle grid      │  │
│  │ - Save → updates clients  │  │
│  └───────────────────────────┘  │
└─────────────────────────────────┘
              │ writes
              ▼
┌─────────────────────────────────┐
│   Supabase (main DB)            │
│  ┌───────────────────────────┐  │
│  │ clients table             │  │
│  │ + tier (text)             │  │
│  │ + module_overrides (jsonb)│  │
│  └───────────────────────────┘  │
│  ┌───────────────────────────┐  │
│  │ module_content table      │  │
│  │ - id, step_id             │  │
│  │ - instructions, video_url │  │
│  │ RLS: check tier+overrides │  │
│  └───────────────────────────┘  │
└─────────────────────────────────┘
              │ reads (gated by RLS)
              ▼
┌─────────────────────────────────┐
│   Client Classroom              │
│  - Metadata from modules.ts     │
│  - Content fetched per-module   │
│  - Locked modules: lock icon    │
│  - Unlocked: full content       │
└─────────────────────────────────┘
```

## Out of Scope

- Client self-service module requests (no "Request Access" button)
- Billing integration (tiers are manual, not tied to payments)
- Per-step access control (access is per-module only)
- CSM role separation from agency role (agency = CSM for now)
