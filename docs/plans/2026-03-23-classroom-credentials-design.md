# Classroom Credential Fields — Design

**Date:** 2026-03-23
**Status:** Approved

## Overview

Add credential input fields at the bottom of each classroom step page, mapped to the relevant module. Fields read/write from the `clients` table on main Supabase. No new tables needed.

## Module → Field Mapping

| Module | Fields from `clients` table |
|--------|---------------------------|
| welcome | None |
| api-setup | `openrouter_api_key`, `openai_api_key` |
| voice-receptionist | `retell_api_key`, `retell_inbound_agent_id`, `retell_phone_1` |
| db-reactivation | `campaign_webhook_url`, `database_reactivation_inbound_webhook_url` |
| lead-followup | `text_engine_webhook`, `text_engine_followup_webhook` |
| appointment-reminders | `ghl_api_key`, `ghl_calendar_id`, `ghl_location_id` |
| quote-followup | `save_reply_webhook_url`, `update_pipeline_webhook_url` |
| review-request | `lead_score_webhook_url` |
| website-chatbot | `ai_chat_webhook_url` |
| prompt-playground | None |

## Component

`ClassroomCredentials` — placed in `ModuleDetail.tsx` between `StepInstructions` and `MarkComplete`.

- Reads current values from `useClientSupabase().connection`
- Writes to `clients` table via `supabase.from('clients').update()`
- Password-style inputs with show/hide toggle for API keys
- Green checkmark next to filled fields
- Save button with inline success toast
- Modules with no mapped fields render nothing

## Data Flow

- Read: `connection?.openrouter_api_key` etc.
- Write: `supabase.from('clients').update({ field: value }).eq('id', clientId)`
- Refetch connection after save
