# Debug Text AI Rep — Redesign

**Date:** 2026-04-01
**Status:** Approved

## Problem

Current Debug Text AI page hits an n8n webhook endpoint, which causes CORS issues and requires the backend to be running. Users want to test their agent prompts directly in the browser using LLM APIs.

## Design

### Overview

Replace the webhook-based chat with a local LLM chat that uses the client's prompts directly. User picks an agent type, selects a model, and chats — no webhook needed.

### UI Layout

**Top bar:**
- Agent selector dropdown — shows only text agents with content (from `usePrompts('text')`, skip empty slots)
- Provider toggle — OpenRouter / OpenAI (auto-select based on available keys)
- Model selector dropdown — uses `useModelList` hook, with default model and reset button

**Chat area:** Message bubbles with streaming responses, same layout as current.

### System Message Assembly

```
[Bot Persona (ID 0) content]

---

[Selected Agent content]
```

### Provider Selection Logic

- If only `openai_api_key` exists → default to OpenAI, hide toggle
- If only `openrouter_api_key` exists → default to OpenRouter, hide toggle
- If both exist → show toggle, default to OpenRouter
- If neither → show alert "No API key configured"

### Data Flow

1. `usePrompts('text')` fetches all text prompts from client DB
2. `useCredentials()` gets API keys
3. User selects agent → system message assembled from persona + agent prompt
4. On send → streaming POST to OpenAI or OpenRouter API (reuse PromptPlayground pattern)
5. Full conversation history sent as messages array
6. No `/api/proxy` or webhook involved

### Default Model

- OpenAI: `gpt-4o`
- OpenRouter: `openai/gpt-4o`
- User can change model, "Reset to default" button restores it

### Reuse from Existing Code

- Streaming logic from `src/components/PromptPlayground.tsx`
- Model list from `src/hooks/useModelList.ts`
- Prompts from `src/hooks/usePrompts.ts`
- Credentials from `src/hooks/useCredentials.ts`
