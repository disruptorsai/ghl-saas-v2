# Classroom Step Image Prompts

47 AI-generated diagram images for the classroom steps that don't have videos yet. Generate each image, save with the correct filename, drop into the assets folder — the app auto-discovers them.

## Where to put images

```
src/assets/steps/
```

## Naming convention

`<step-id>.<ext>` — exact step ID, lowercased, hyphenated, matching the IDs in `src/data/modules.ts`.

- ✅ `welcome-2.png`
- ✅ `api-setup-3.webp`
- ❌ `Welcome 2.png`
- ❌ `welcome-2-system-overview.png`

Supported extensions: `.png`, `.jpg`, `.jpeg`, `.webp`. PNG or WebP recommended.

## Image specs

- **Aspect ratio:** 16:9
- **Recommended size:** 1280×720 or 1920×1080
- **Background:** light / white (the player frame is `bg-muted` so dark images will look like a hole)
- **No text in the image** — AI tools mangle text, and the step title already shows above the image. Keep it purely visual.

## Style prefix (paste at the start of every prompt)

> Modern flat vector infographic illustration, 16:9 aspect ratio, isometric or side-view perspective, soft pastel palette of cool blues, lavender and mint with a single indigo accent (#6366F1), rounded shapes with subtle drop shadows, thin connecting lines with arrowheads, generous whitespace, light/white background, professional SaaS aesthetic, clean vector style, NO text or letters anywhere in the image.

The per-step content below should be appended after that prefix.

---

## Welcome to Sales Infra

### `welcome-2.png` — System Overview
Central glowing AI brain icon connected by thin arrows to seven satellite icons arranged in a half-circle: a phone receiver, a chat bubble, a calendar, an envelope, a star, a database cylinder, and a microphone. On the left an inbound arrow from a generic person silhouette; on the right an outbound arrow to a calendar with a checkmark.

### `welcome-3.png` — Your Client Journey
Horizontal timeline with five rounded milestone cards connected by a curved path: a settings gear (setup), a sliders icon (configure), a magnifying glass (test), a rocket (launch), and an upward trending graph (optimize). Subtle progress dots between milestones.

---

## API Keys & Software Setup

### `api-setup-3.png` — OpenAI API Setup
Four sequential rounded cards connected by right-arrows: a person-plus silhouette (sign up), a credit card with a checkmark (billing), a key with a glowing tip (generate API key), a clipboard being inserted into a CRM box (paste into platform).

### `api-setup-4.png` — Retell.ai Voice Setup
Three sequential rounded cards with arrows: a profile silhouette next to a microphone (create voice account), a stack of voice waveforms suggesting voice selection, a key icon with sound waves emanating (API key with voice tag).

### `api-setup-5.png` — Verify All Connections
Four connection nodes arranged in a square — each represented by an abstract icon (CRM box, chat bubble, microphone, phone receiver) — all wired to a central hub with green check marks. Soft glow around each verified link.

---

## Twilio Setup

### `twilio-setup-2.png` — Twilio Account Setup
Three sequential rounded cards: a document with an official stamp (verify business), a phone receiver with a stylized number badge (buy number), a plug connecting to a CRM box (link to platform).

### `twilio-setup-3.png` — Schedule CSM Call
A clean calendar with one highlighted date, a clock face beside it, and a small headshot avatar with a chat bubble. Represents booking a 1-on-1 call with a customer success manager.

---

## AI Voice Receptionist

### `voice-receptionist-2.png` — Workflow Walkthrough
Left: inbound phone receiver with a notification dot. Center: AI bot avatar with concentric sound waves. Right: branching into three small cards — a calendar (book), a CRM database (route to team), a voicemail tape icon (after-hours).

### `voice-receptionist-4.png` — Contact Your CSM
Two chat bubbles arcing between a customer silhouette on the left and a headset-wearing agent silhouette on the right. Subtle microphone icon in the corner.

### `voice-receptionist-5.png` — Review & Complete
A clipboard with five checked rows on the left, a confetti burst around a glowing ribbon/medal on the right. Subtle microphone watermark in the corner.

---

## Database Reactivation Agent

### `db-reactivation-2.png` — Workflow Walkthrough
Left: a database cylinder with arrows pointing right. Middle: a filter funnel splitting old leads into segments. Right: AI bot sending personalized SMS bubbles. Far right: a calendar with a checkmark (booked).

### `db-reactivation-4.png` — Contact Your CSM
Two chat bubbles between a customer and headset agent silhouette. Subtle database cylinder watermark in the corner.

### `db-reactivation-5.png` — Review & Complete
Clipboard with five checked rows, confetti burst around a glowing ribbon. Subtle database cylinder watermark.

---

## Follow-Up Agent

### `lead-followup-2.png` — Workflow Walkthrough
Left: new lead silhouette appearing. Center: a clock with a 5-minute mark, then an AI bot sending a sequence of three chat bubbles staggered over time. Right: an upward arrow to a "converted" tag with a checkmark.

### `lead-followup-4.png` — Contact Your CSM
Two chat bubbles between a customer and headset agent silhouette. Subtle clock watermark in the corner.

### `lead-followup-5.png` — Review & Complete
Clipboard with checked rows, confetti burst around a ribbon. Subtle clock watermark.

---

## Appointment Setter Agent

### `appointment-reminders-2.png` — Workflow Walkthrough
Left: calendar with a circled appointment. Middle: two clock icons (24h and 1h before) with bell notifications. Right: branching to two outcomes — a green checkmark (confirmed) or a calendar arrow (rescheduled).

### `appointment-reminders-4.png` — Contact Your CSM
Two chat bubbles between a customer and headset agent silhouette. Subtle calendar watermark.

### `appointment-reminders-5.png` — Review & Complete
Clipboard with checked rows, confetti burst around a ribbon. Subtle calendar watermark.

---

## Quote Follow-up

### `quote-followup-1.png` — What It Does & ROI
Bar chart with two bars: a small bar labeled "before" and a tall bar labeled "after" with a glowing dollar sign at the top. A document with a price tag in the foreground.

### `quote-followup-2.png` — Workflow Walkthrough
Left: a quote document with a dollar sign. Center: a clock indicating wait time, then an AI bot icon. Right: a chat bubble showing "objection handled" (green check), arrow to a "won" badge.

### `quote-followup-3.png` — Customize Follow-up Templates
A document template with editable text placeholders, surrounded by tool icons (paintbrush, dropdown selector, toggle). Subtle dollar sign accent.

### `quote-followup-4.png` — Contact Your CSM
Two chat bubbles between a customer and headset agent. Subtle price-tag watermark.

### `quote-followup-5.png` — Review & Complete
Clipboard with checked rows, confetti burst around a ribbon. Subtle price-tag watermark.

---

## Review Request

### `review-request-1.png` — What It Does & ROI
A storefront or business sign with five glowing star icons rising above it; the rating going from 3 stars to 5 stars via an upward arrow. Background shows public review platforms as small abstract badges.

### `review-request-2.png` — Workflow Walkthrough
Left: "job complete" checkmark. Center: AI bot sending a chat bubble. Right: branching — 5-star path leads to a public review icon, 1-4 star path leads to an internal feedback inbox.

### `review-request-3.png` — Customize Review Templates
A document template with star rating placeholders, editable text fields, surrounded by paintbrush and toggle icons.

### `review-request-4.png` — Contact Your CSM
Two chat bubbles between customer and headset agent. Subtle star watermark.

### `review-request-5.png` — Review & Complete
Clipboard with checked rows, confetti burst around a ribbon. Subtle star watermark.

---

## Engagement Agent (Website Chatbot)

### `website-chatbot-2.png` — Workflow Walkthrough
Left: a browser window with a visitor cursor. Center: a chat bot avatar in the corner of the browser, with a chat bubble greeting. Right: branching to a calendar (booked) or a contact form (lead captured).

### `website-chatbot-4.png` — Contact Your CSM
Two chat bubbles between customer and headset agent. Subtle browser-window watermark.

### `website-chatbot-5.png` — Review & Complete
Clipboard with checked rows, confetti burst around a ribbon. Subtle browser-window watermark.

---

## A2P Registration

### `a2p-2.png` — Business Information
A business profile card with abstract logo placeholder, address pin, and tax-ID document, all neatly stacked. A submission arrow pointing to a "submit" tray.

### `a2p-3.png` — Campaign Details
A campaign brief document with sections for use case, message volume, and sample messages represented as labeled rows. A megaphone icon in the corner.

### `a2p-4.png` — Registration Status & Approval
A status tracker with three nodes: submitted (filled), under review (filled), approved (glowing green checkmark). Confetti burst around the approval node.

---

## Knowledge Base Setup

### `kb-2.png` — FAQs
Three Q-and-A speech bubble pairs stacked vertically, with a brain or library book icon connecting them on the left.

### `kb-3.png` — Services & Pricing
A catalog or pricing sheet with three rounded cards each showing a service icon and a price tag. Subtle dollar accent.

### `kb-4.png` — Policies
A folded document with a shield emblem, a stamp, and a small lock icon. Suggests official rules and protection.

### `kb-5.png` — Common Objections
Left: a customer silhouette with a frowning chat bubble. Center: a shield with a checkmark deflecting the bubble. Right: a smiling chat bubble — represents handling objections.

### `kb-6.png` — Review & Finalize
An open binder/library with completed sections (checked), with a glowing "finalized" seal stamped on the cover.

---

## Testing Your Agents

### `testing-2.png` — Test Your Lead Qualification Agent
A test tube or beaker icon with a checklist to its right. Inside the beaker, three chat bubbles representing test conversations. A green checkmark on top.

### `testing-5.png` — Test Your Lead Nurture Agent
Same beaker-and-checklist motif, with a heart-shaped chat bubble inside (suggesting nurture).

### `testing-8.png` — Test Your Customer Support Agent
Same beaker-and-checklist motif, with a headset / help bubble inside (suggesting support).

---

## Management & Handoff

### `management-1.png` — Your Management Dashboard
A clean analytics dashboard with three KPI cards (numbers + small upward graph), a bar chart, and a circular progress ring. Tabs and sidebar visible as abstract shapes.

### `management-2.png` — Demo to Live Transition
A toggle switch in mid-flip from "demo" to "live", with stylized lightning bolts emanating from the live position. Surrounding icons represent connected agents.

### `management-3.png` — Ongoing Optimization
A circular loop arrow connecting four nodes: a magnifying glass (analyze), a slider (adjust), a play button (deploy), and an upward graph (improve). The loop suggests iteration.

---

## Prompt Playground

### `prompt-playground-1.png` — What It Is
A sandbox-with-playground-equipment metaphor: a chat-bubble swing, a slider seesaw, an experiment beaker. Represents a safe space to test prompts.

### `prompt-playground-2.png` — How to Use It
An interface mockup with a left input panel, an arrow to a right output panel, and three knob/slider controls between them. Suggests prompt → tweak → output.

### `prompt-playground-3.png` — Try It Yourself
An input text box with a glowing cursor, an arrow pointing to an output box with stylized response text. Hand cursor poised to click "run".

### `prompt-playground-4.png` — Save & Deploy
A floppy disk save icon merging with a rocket launching upward. Trailing stars suggest deployment to production.

---

## Step IDs that already have videos (do NOT generate images for these)

`welcome-1`, `api-setup-1`, `api-setup-2`, `twilio-setup-1`, `voice-receptionist-1`, `voice-receptionist-3`, `db-reactivation-1`, `db-reactivation-3`, `lead-followup-1`, `lead-followup-3`, `appointment-reminders-1`, `appointment-reminders-3`, `website-chatbot-1`, `website-chatbot-3`, `a2p-1`, `kb-1`, `testing-1`, `testing-3`, `testing-4`, `testing-6`, `testing-7`, `management-4`.
