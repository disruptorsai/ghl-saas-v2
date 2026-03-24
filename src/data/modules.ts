import type { Module } from './types'

export const modules: Module[] = [
  // ─── MODULE 1: Welcome to Sales Infra ─────────────────────────────
  {
    id: 'welcome',
    title: 'Welcome to Sales Infra',
    description: 'Get oriented with the platform, meet your AI agents, and understand the journey ahead.',
    thumbnail: 'from-blue-500 to-purple-600',
    order: 1,
    steps: [
      {
        id: 'welcome-1',
        moduleId: 'welcome',
        title: 'Welcome Video',
        description: 'A personal welcome from the team and what to expect.',
        videoUrl: null,
        type: 'info',
        order: 1,
        instructions: `## Welcome to Disruptors Sales Infra

**Congratulations on joining!** You've just taken the most important step toward automating your sales pipeline and never missing another lead again.

### What You're Getting

- **8 AI-powered agents** installed directly into your business software
- **Full ownership** — everything lives in YOUR GoHighLevel account
- **Done-for-you deployment** — we handle the technical setup so you can focus on running your business
- **Ongoing support** — our team and AI assistant are here whenever you need help

### How This Platform Works

Think of this as your personal onboarding hub. You'll walk through each AI system one at a time, customize it for your business, and we'll deploy it for you. Each module takes about 15-20 minutes.

**Your next step:** Continue to the System Overview to see all 8 agents at a glance.`,
      },
      {
        id: 'welcome-2',
        moduleId: 'welcome',
        title: 'System Overview',
        description: 'High-level overview of all 8 AI agents and what they do.',
        videoUrl: null,
        type: 'info',
        order: 2,
        instructions: `## Your 8 AI Agents — At a Glance

Each agent handles a specific part of your sales and client communication process. Together, they create a fully automated infrastructure.

### The Agents

1. **AI Voice Receptionist** — Answers every call 24/7, qualifies callers, and books appointments on your calendar
2. **Database Reactivation** — Wakes up old leads sitting in your CRM and turns them into booked appointments
3. **Lead Follow-up** — Automated multi-step follow-up from first contact to booked meeting
4. **Appointment Reminders** — Reduces no-shows with smart, timed reminders before and after appointments
5. **Quote Follow-up** — Automatically follows up on sent quotes so nothing falls through the cracks
6. **Review Request** — Collects Google and Yelp reviews automatically after service is completed
7. **Website Chatbot** — Engages website visitors 24/7, qualifies them, and books appointments
8. **Prompt Playground** — Test and refine any AI prompt before deploying it live

### How They Work Together

These agents don't operate in isolation. A new lead might come through the **Website Chatbot**, get followed up by the **Lead Follow-up** agent, receive reminders from the **Appointment Reminder** agent, and after service, get a review request from the **Review Request** agent — all automatically.`,
      },
      {
        id: 'welcome-3',
        moduleId: 'welcome',
        title: 'Your Client Journey',
        description: 'The 4 phases from onboarding to growth.',
        videoUrl: null,
        type: 'info',
        order: 3,
        instructions: `## Your Journey: From Setup to Scale

Your experience is broken into 4 clear phases. Here's what to expect at each stage.

### Phase 1: Onboarding (You Are Here)
- Get your software and API keys connected
- Walk through each AI system in this platform
- Customize wording, tone, and behavior for your business

### Phase 2: Customize
- Review and approve all AI prompts and messaging
- Adjust follow-up timing and sequences
- Provide your business-specific knowledge (services, pricing, FAQs)

### Phase 3: Deploy
- **100% done-for-you deployment** — our team handles everything
- Full testing of every agent in your live environment
- Go-live confirmation and monitoring for the first 48 hours

### Phase 4: Marketing & Growth
- Monthly retainer kicks in for lead generation and growth
- New automations added as your business evolves
- Ongoing optimization based on real performance data

**The goal is simple:** You focus on delivering great service. We make sure your phone never stops ringing with qualified leads.`,
      },
    ],
  },

  // ─── MODULE 2: API Keys & Software Setup ──────────────────────────
  {
    id: 'api-setup',
    title: 'API Keys & Software Setup',
    description: 'Connect your software accounts so we can install your AI agents.',
    thumbnail: 'from-green-500 to-teal-600',
    order: 2,
    steps: [
      {
        id: 'api-setup-1',
        moduleId: 'api-setup',
        title: 'Why You Own Everything',
        description: 'Understand why your systems are built in your own software.',
        videoUrl: null,
        type: 'info',
        order: 1,
        instructions: `## You Own Everything We Build

This is one of the most important things to understand about working with us.

### The Disruptors Difference

Unlike most agencies that build systems on **their** accounts and hold your data hostage, **everything we build lives in YOUR software**. That means:

- **Your GoHighLevel account** — all automations, workflows, and contacts are yours
- **Your API keys** — you control access to every integration
- **Your data** — every lead, conversation, and appointment belongs to you
- **No lock-in** — if you ever leave, you keep 100% of what was built

### Why This Matters

We've seen too many businesses get burned by agencies that own the systems. When you leave, you lose everything. With us, you walk away with a fully functional AI sales infrastructure that you own outright.

**Bottom line:** We earn your business every month by delivering results, not by holding your systems hostage.`,
      },
      {
        id: 'api-setup-2',
        moduleId: 'api-setup',
        title: 'GoHighLevel Setup',
        description: 'Get your GHL API key, location ID, and account details.',
        videoUrl: null,
        type: 'setup',
        order: 2,
        instructions: `## GoHighLevel Setup

Choose your GoHighLevel path below, then follow the instructions for your option.

### Option A: Your Own GHL Account ($297/month)

You already have (or will create) your own GoHighLevel account. You get full control and direct billing.

**Steps:**
1. Log in to your GoHighLevel account at [app.gohighlevel.com](https://app.gohighlevel.com)
2. Navigate to **Settings** → **Business Profile** and copy your **Location ID**
3. Go to **Settings** → **API Keys** → click **Create API Key**
4. Name it **"Disruptors Sales Infra"**
5. Set permissions to **Full Access**
6. Click **Create** and copy the API key immediately

### Option B: Disruptors Media Sub-Account (Included)

We provide you a sub-account under our agency. No extra GHL subscription needed — it's included in your plan.

**Steps:**
1. Your CSM will create your sub-account and send you login credentials
2. Log in with the credentials provided
3. Your Location ID and API Key will be pre-configured
4. You still own all your data — you can export or migrate anytime

### What We Need From You

- **Location ID** — found in Settings → Business Profile
- **API Key** — generated from Settings → API Keys
- **Calendar ID** — go to Calendars → your main calendar → copy ID from URL

### Which Path Is Right for You?

- **Choose Option A** if you already have GHL or want direct control of billing
- **Choose Option B** if you want to keep things simple and save on the $297/month subscription`,
      },
      {
        id: 'api-setup-3',
        moduleId: 'api-setup',
        title: 'OpenAI API Setup',
        description: 'Get your OpenAI API key for AI-powered conversations.',
        videoUrl: null,
        type: 'setup',
        order: 3,
        instructions: `## OpenAI API Key Setup

OpenAI powers the conversational intelligence behind your AI agents. Here's how to set it up.

### Step-by-Step

1. Go to [platform.openai.com](https://platform.openai.com) and sign in (or create an account)
2. Click your profile icon → **View API keys**
3. Click **"Create new secret key"**
4. Name it **"Disruptors Sales Infra"**
5. Copy the key and save it somewhere safe — you won't see it again

### Billing Setup

- Navigate to **Settings** → **Billing** → **Add payment method**
- We recommend setting a **usage limit of $50/month** to start — most businesses use $10-30/month
- You can adjust this anytime as you scale

### Cost Expectations

| Agent | Estimated Monthly Cost |
|-------|----------------------|
| Voice Receptionist | $5-15 |
| Database Reactivation | $3-10 |
| Lead Follow-up | $2-8 |
| Website Chatbot | $2-5 |
| **Total** | **$12-38/month** |

**You pay OpenAI directly** — complete transparency on AI costs, no markup from us.`,
      },
      {
        id: 'api-setup-4',
        moduleId: 'api-setup',
        title: 'Retell.ai Voice Setup',
        description: 'Set up Retell for AI voice calling.',
        videoUrl: null,
        type: 'setup',
        order: 4,
        instructions: `## Retell.ai Voice Agent Setup

Retell powers the AI voice receptionist — the agent that answers calls, qualifies leads, and books appointments.

### Step-by-Step

1. Go to [retell.ai](https://www.retell.ai) and create an account
2. Once logged in, navigate to **Settings** → **API Keys**
3. Click **"Create API Key"** and name it **"Disruptors Sales Infra"**
4. Copy the API key and store it securely

### Phone Number Setup

- In Retell, go to **Phone Numbers** → **Buy Number**
- Choose a local number in your area code (builds trust with callers)
- Or select **Toll-Free** if you serve a national audience
- Note down the phone number — this will be your AI receptionist's line

### Voice Selection

- Browse the **Voice Library** and pick a voice that matches your brand
- We recommend a professional, friendly tone — avoid overly robotic options
- You can change the voice anytime, so don't overthink it

### Estimated Cost

Retell charges per minute of call time. Most businesses spend **$15-40/month** depending on call volume. You'll see exact usage in your Retell dashboard.`,
      },
      {
        id: 'api-setup-5',
        moduleId: 'api-setup',
        title: 'Verify All Connections',
        description: 'Confirm everything is connected and ready.',
        videoUrl: null,
        type: 'setup',
        order: 5,
        instructions: `## Connection Verification Checklist

Before moving forward, let's make sure everything is properly connected. Go through each item below.

### Checklist

- [ ] **GoHighLevel** — Location ID copied and API key generated
- [ ] **GoHighLevel Calendar** — Calendar ID noted for appointment booking
- [ ] **OpenAI** — API key created and billing method added
- [ ] **OpenAI** — Usage limit set (recommended: $50/month)
- [ ] **Retell.ai** — API key created
- [ ] **Retell.ai** — Phone number purchased and voice selected

### Common Issues

- **"API key not working"** — Make sure you copied the full key with no extra spaces. If in doubt, generate a new one.
- **"Can't find Location ID"** — Make sure you're in the correct GHL sub-account, not the agency view.
- **"Retell number not showing"** — New numbers can take 1-2 minutes to provision. Refresh the page.

### Next Steps

Once all items are checked, you're ready to start configuring your AI agents! The next module will walk you through your first agent — the AI Voice Receptionist.

**If you're stuck on any step, use the Support tab to chat with our AI assistant or submit a feedback request.**`,
      },
    ],
  },

  // ─── MODULE 3: Twilio Setup ──────────────────────────────────────
  {
    id: 'twilio-setup',
    title: 'Twilio Setup',
    description: 'Set up your Twilio account for phone and SMS with your Client Success Manager.',
    thumbnail: 'from-red-500 to-pink-600',
    order: 3,
    steps: [
      {
        id: 'twilio-setup-1',
        moduleId: 'twilio-setup',
        title: 'Why Twilio & What to Expect',
        description: 'Understand why Twilio is needed and how the setup works.',
        videoUrl: null,
        type: 'info' as const,
        order: 1,
        instructions: `## Twilio Setup — Overview

Twilio is the backbone of your phone and SMS infrastructure. It provides the phone numbers your AI agents use to make calls and send texts.

### Why Twilio?

- **Reliable delivery** — 99.95% uptime for calls and SMS
- **Local phone numbers** — Get a number in your area code for trust
- **Toll-free options** — For national reach
- **You own the number** — It lives in YOUR Twilio account

### Important: This Must Be Done Live

Twilio setup requires identity verification and compliance steps that must be completed with your **Client Success Manager (CSM)** on a live call. This ensures:

- Account is verified correctly the first time
- Phone number is provisioned in the right region
- A2P 10DLC registration is submitted (required for SMS)
- Messaging service is configured properly

### Cost

- Phone number: ~$1.15/month
- SMS: ~$0.0079/message
- Voice: ~$0.014/minute
- Most businesses spend **$15-40/month** on Twilio

### Next Step

Review the setup checklist, then schedule a call with your CSM to complete the setup together.`,
      },
      {
        id: 'twilio-setup-2',
        moduleId: 'twilio-setup',
        title: 'Twilio Account Setup',
        description: 'Create your Twilio account and enter credentials.',
        videoUrl: null,
        type: 'setup' as const,
        order: 2,
        instructions: `## Create Your Twilio Account

Follow these steps to create your Twilio account. Your CSM will walk through the rest on your live call.

### Before the Call

1. Go to [twilio.com](https://www.twilio.com) and click **Sign Up**
2. Use your business email to create the account
3. Verify your email and phone number
4. Navigate to **Account** → **API keys & tokens**
5. Copy your **Account SID** and **Auth Token** from the dashboard

### On the Call With Your CSM

Your CSM will help you:
- Upgrade from trial to a paid account
- Purchase a local or toll-free phone number
- Set up A2P 10DLC registration (required for business SMS)
- Create a Messaging Service
- Configure the phone number for AI voice calls
- Test the number with a live call

### Enter Your Credentials Below

After creating your account, enter your login and API credentials in the form below.`,
      },
      {
        id: 'twilio-setup-3',
        moduleId: 'twilio-setup',
        title: 'Schedule CSM Call',
        description: 'Book a live session to complete Twilio setup.',
        videoUrl: null,
        type: 'demo' as const,
        order: 3,
        instructions: `## Schedule Your Twilio Setup Call

This step must be completed with your Client Success Manager on a live call. They'll handle all the technical configuration.

### What to Have Ready

- Your Twilio account login (created in the previous step)
- A credit card for Twilio billing
- Your preferred area code for the phone number
- 30 minutes of uninterrupted time

### What Gets Done on the Call

1. Account upgrade and billing setup
2. Phone number purchase and configuration
3. A2P 10DLC registration submission
4. Messaging Service creation
5. Voice routing configuration
6. Live test call to verify everything works

### After the Call

Your CSM will confirm:
- Phone number is active and receiving calls
- SMS is configured and test message sent
- A2P registration is submitted (approval takes 1-5 business days)
- All credentials are saved in this platform`,
      },
    ],
  },

  // ─── MODULE 4: AI Voice Receptionist ──────────────────────────────
  {
    id: 'voice-receptionist',
    title: 'AI Voice Receptionist',
    description: 'Set up an AI agent that answers every call, qualifies leads, and books appointments 24/7.',
    thumbnail: 'from-violet-500 to-indigo-600',
    order: 4,
    steps: [
      {
        id: 'voice-receptionist-1',
        moduleId: 'voice-receptionist',
        title: 'What It Does & ROI',
        description: 'Understand the voice receptionist and its impact on your business.',
        videoUrl: null,
        type: 'info',
        order: 1,
        instructions: `## AI Voice Receptionist — Overview & ROI

Never miss another call. Your AI receptionist answers every call 24/7, qualifies the caller, and books appointments directly on your calendar.

### What It Does

- **Answers instantly** — no hold music, no voicemail, no missed calls
- **Qualifies callers** — asks the right questions to determine if they're a good fit
- **Books appointments** — schedules directly on your GoHighLevel calendar
- **Sends confirmations** — automatic SMS/email confirmation after booking
- **Handles FAQs** — answers common questions about services, pricing, and hours

### Real-World Example: Torres Plumbing

Before: Mike Torres was missing 40% of incoming calls while on job sites. Each missed call = $200-800 in lost revenue.

After: AI receptionist answers every call, books emergency and standard appointments, and sends job details to Mike's phone. **Result: 12 additional booked jobs in the first month — $6,400 in recovered revenue.**

### ROI Calculator

- Average missed calls per week: **8-15**
- Average job value: **$300-500**
- Monthly recovered revenue: **$4,800-15,000**
- Cost of AI receptionist: **~$50/month**`,
      },
      {
        id: 'voice-receptionist-2',
        moduleId: 'voice-receptionist',
        title: 'Workflow Walkthrough',
        description: 'See how the voice receptionist automation flows end-to-end.',
        videoUrl: null,
        type: 'info',
        order: 2,
        instructions: `## How the Voice Receptionist Works

Here's the complete automation flow from the moment a call comes in.

### The Flow

1. **Call comes in** → Retell AI answers within 2 rings with a professional greeting
2. **Qualification** → AI asks key questions: What service do you need? What's your timeline? What's the best contact info?
3. **Knowledge check** → AI references your business knowledge base to answer questions about services, pricing, availability
4. **Decision point:**
   - If qualified → **Books appointment** on your GHL calendar
   - If after-hours inquiry → **Captures info** and schedules callback
   - If not a fit → **Politely redirects** with helpful info
5. **Confirmation** → Caller receives SMS and email confirmation with appointment details
6. **Team notification** → You get an instant notification with caller details and appointment info

### Behind the Scenes

- The AI uses your custom prompt to match your brand voice and tone
- Call recordings are stored in your GHL account for quality review
- All contact info is automatically added to your CRM
- Follow-up workflows trigger automatically after the call ends

### What You'll Customize

In the next step, you'll adjust the AI's greeting, qualification questions, and knowledge base to match your specific business.`,
      },
      {
        id: 'voice-receptionist-3',
        moduleId: 'voice-receptionist',
        title: 'Customize Voice Prompt',
        description: 'Adjust the voice agent persona, greeting, and knowledge base.',
        videoUrl: null,
        type: 'config',
        order: 3,
        instructions: `## Customize Your Voice Receptionist

This is where you make the AI sound like your business. We'll adjust three key areas.

### 1. Greeting & Persona

Your AI needs a clear identity. Fill in:

- **Business name** — How should the AI introduce your company?
- **Greeting style** — Formal ("Thank you for calling...") or casual ("Hey! Thanks for calling...")?
- **Agent name** — Give your AI a name (e.g., "Sarah", "Alex") or keep it anonymous

### 2. Qualification Questions

These are the questions your AI asks every caller. Default set:

- "What service are you looking for today?"
- "Is this for a residential or commercial property?"
- "What's your preferred date and time?"
- "What's the best number to reach you at?"

**Customize these** to match your business. A dental office might ask about insurance. A plumber might ask about the urgency level.

### 3. Knowledge Base

Provide the AI with answers to your most common questions:

- **Services offered** — List your main services and brief descriptions
- **Pricing** — General ranges or "We provide free estimates"
- **Hours** — Business hours and emergency availability
- **Service area** — Cities/zip codes you serve
- **FAQs** — Any other common questions callers ask

**Tip:** The more context you give the AI, the better it handles calls. Don't worry about perfection — you can always update this later.`,
      },
      {
        id: 'voice-receptionist-4',
        moduleId: 'voice-receptionist',
        title: 'Contact Your CSM',
        description: 'Schedule a call with your CSM to test your AI voice receptionist live.',
        videoUrl: null,
        type: 'demo',
        order: 4,
        instructions: `## Test Your Voice Receptionist With Your CSM

Your Client Success Manager will walk you through testing the voice agent on a live call.

### What Happens on the Call

1. **Live call test** — Your CSM will call the AI receptionist with you on the line
2. **Quality check** — Listen to the greeting, qualification flow, and booking process together
3. **Real-time adjustments** — Any tweaks to the prompt or knowledge base can be made on the spot
4. **Deployment confirmation** — Once you're happy, your CSM deploys it to your live number

### Before the Call, Make Sure You've:

- Completed the "Customize Voice Prompt" step
- Provided your knowledge base (services, pricing, hours)
- Entered all required credentials

### Schedule Your Call

Use the button below to book a time with your CSM. Calls typically take 15-20 minutes.

**If anything needs adjustment,** note it in the feedback form on the next step. Our team will fine-tune the prompt and redeploy.`,
      },
      {
        id: 'voice-receptionist-5',
        moduleId: 'voice-receptionist',
        title: 'Review & Complete',
        description: 'Submit feedback and mark this module as done.',
        videoUrl: null,
        type: 'info',
        order: 5,
        instructions: `## Review & Complete — AI Voice Receptionist

Great work! You've reviewed and tested your AI Voice Receptionist.

### Before You Mark Complete

Make sure you've:
- [ ] Reviewed the greeting and persona settings
- [ ] Provided your qualification questions
- [ ] Added your knowledge base (services, pricing, hours, FAQs)
- [ ] Tested the agent by calling the demo number
- [ ] Submitted any feedback or change requests

### What Happens Next

1. **Our team reviews** your customizations and feedback
2. **We fine-tune** the AI prompt based on your notes
3. **We deploy** the agent to your live phone number
4. **You'll receive confirmation** when it's live and taking calls

### Submit Feedback

Use the feedback form below to share anything you'd like changed. Common requests:
- "Make the greeting more casual"
- "Add a question about insurance"
- "Change the agent name to Alex"
- "Add info about our weekend hours"

**No request is too small.** We want this to sound exactly like your business.`,
      },
    ],
  },

  // ─── MODULE 5: Database Reactivation ──────────────────────────────
  {
    id: 'db-reactivation',
    title: 'Database Reactivation',
    description: 'Re-engage cold leads in your CRM and turn old contacts into booked appointments.',
    thumbnail: 'from-orange-500 to-red-600',
    order: 5,
    steps: [
      {
        id: 'db-reactivation-1',
        moduleId: 'db-reactivation',
        title: 'What It Does & ROI',
        description: 'Understand database reactivation and its revenue potential.',
        videoUrl: null,
        type: 'info',
        order: 1,
        instructions: `## Database Reactivation — Overview & ROI

You're sitting on a goldmine of old leads. This agent wakes them up and turns them into booked appointments.

### What It Does

- **Scans your CRM** for contacts who haven't engaged in 30-90+ days
- **Sends personalized outreach** via SMS and email
- **Handles replies with AI** — carries on natural conversations
- **Books appointments** for interested leads automatically
- **Filters out** uninterested contacts so you don't waste time

### Real-World Example: Bright Smile Dental

Dr. Sarah Chen had 2,400 contacts in her CRM — patients who hadn't visited in 6+ months. She assumed they were gone.

After running Database Reactivation: **87 conversations started, 34 appointments booked in the first 2 weeks.** Average patient value: $450. **Result: $15,300 in recovered revenue from leads she already had.**

### ROI Calculator

- Contacts in your CRM: **500-5,000+**
- Typical response rate: **8-15%**
- Typical booking rate: **3-7%**
- Average customer value: **$200-1,000**
- **Expected revenue from one campaign: $3,000-25,000+**

The best part? These are people who already know your business. The AI just re-opens the conversation.`,
      },
      {
        id: 'db-reactivation-2',
        moduleId: 'db-reactivation',
        title: 'Workflow Walkthrough',
        description: 'See the end-to-end database reactivation automation.',
        videoUrl: null,
        type: 'info',
        order: 2,
        instructions: `## How Database Reactivation Works

Here's the complete flow from uploading contacts to booking appointments.

### The Flow

1. **Upload contacts** — CSV upload or pull directly from your GHL CRM
2. **Batch processing** — contacts are organized into sending batches (50-100/day to protect deliverability)
3. **Personalized outreach** — each contact receives a personalized SMS that references their history
4. **AI conversation** — when someone replies, the AI handles the full conversation naturally
5. **Booking** — interested leads are routed to your calendar booking link
6. **Follow-up** — non-responders get a second touch 3-5 days later
7. **Reporting** — you get a summary of conversations, bookings, and opt-outs

### Message Example

> "Hey [First Name], this is [Agent Name] from [Business]. We noticed it's been a while since your last visit. We have some availability this week and wanted to see if you'd like to come back in. Would you like me to find a time that works?"

### Smart Features

- **Do-not-contact filtering** — automatically respects opt-outs
- **Time-zone aware sending** — messages go out during business hours
- **Conversation handoff** — if the AI can't handle a question, it routes to your team
- **Duplicate prevention** — contacts already in an active campaign are excluded`,
      },
      {
        id: 'db-reactivation-3',
        moduleId: 'db-reactivation',
        title: 'Customize Text Templates',
        description: 'Adjust outreach messages, follow-up sequences, and tone.',
        videoUrl: null,
        type: 'config',
        order: 3,
        instructions: `## Customize Your Reactivation Messages

The default templates work great out of the box, but customizing them for your business will boost response rates.

### Initial Outreach Template

Adjust the first message contacts receive. Key principles:
- **Keep it short** — under 160 characters for SMS
- **Be personal** — use their first name
- **Create curiosity** — don't sell, just open a conversation
- **Include a question** — questions get 40% more responses

### Follow-Up Sequence

- **Day 0:** Initial outreach message
- **Day 3:** Gentle follow-up ("Just wanted to make sure you saw my message...")
- **Day 7:** Value-add message (share a tip, offer, or update)
- **Day 14:** Final check-in ("No worries if now isn't the right time...")

### Tone & Voice

Choose the tone that matches your brand:
- **Professional** — Best for medical, legal, financial services
- **Friendly & Casual** — Best for home services, fitness, salons
- **Urgent & Direct** — Best for limited-time offers or seasonal campaigns

### Pro Tips

- Mention something specific: "We just upgraded our [service]" performs better than generic messages
- Avoid ALL CAPS, excessive punctuation, or anything that feels spammy
- The AI will adapt its conversation style to match your templates`,
      },
      {
        id: 'db-reactivation-4',
        moduleId: 'db-reactivation',
        title: 'Contact Your CSM',
        description: 'Schedule a call with your CSM to test your database reactivation campaign.',
        videoUrl: null,
        type: 'demo',
        order: 4,
        instructions: `## Test Your Database Reactivation With Your CSM

Your Client Success Manager will walk you through testing the reactivation campaign on a live call.

### What Happens on the Call

1. **Small batch test** — Your CSM will launch a test batch of 5-10 contacts with you watching
2. **Message review** — See exactly what your past clients receive and how the AI responds
3. **Real-time adjustments** — Tweak messaging, timing, or follow-up sequences on the spot
4. **Campaign approval** — Once you're happy with the test, your CSM launches the full campaign

### Before the Call, Make Sure You've:

- Completed the "Customize Reactivation Prompts" step
- Prepared a small test list (5-10 contacts with phone and email)
- Entered all required credentials

### Schedule Your Call

Use the button below to book a time with your CSM. Calls typically take 20-30 minutes.`,
      },
      {
        id: 'db-reactivation-5',
        moduleId: 'db-reactivation',
        title: 'Review & Complete',
        description: 'Submit feedback and mark this module as done.',
        videoUrl: null,
        type: 'info',
        order: 5,
        instructions: `## Review & Complete — Database Reactivation

You've reviewed and tested the Database Reactivation agent.

### Before You Mark Complete

Make sure you've:
- [ ] Reviewed the outreach message templates
- [ ] Customized the follow-up sequence timing
- [ ] Set the tone that matches your brand
- [ ] Run a test campaign with sample contacts
- [ ] Submitted any feedback or change requests

### What Happens Next

1. **Our team reviews** your template customizations
2. **We prepare your contact list** — cleaning, deduplication, and segmentation
3. **We launch the campaign** in controlled batches
4. **You'll receive daily reports** on conversations and bookings

### Important Notes

- Campaigns run best with **500+ contacts** for meaningful results
- First results typically appear within **24-48 hours** of launch
- We monitor deliverability and adjust sending speed as needed

**Submit any final feedback below before marking complete.**`,
      },
    ],
  },

  // ─── MODULE 6: Lead Follow-up ─────────────────────────────────────
  {
    id: 'lead-followup',
    title: 'Lead Follow-up',
    description: 'Automated multi-step follow-up from first contact to booked appointment.',
    thumbnail: 'from-cyan-500 to-blue-600',
    order: 6,
    steps: [
      {
        id: 'lead-followup-1',
        moduleId: 'lead-followup',
        title: 'What It Does & ROI',
        description: 'How automated follow-up transforms your lead conversion.',
        videoUrl: null,
        type: 'info',
        order: 1,
        instructions: `## Lead Follow-up — Overview & ROI

The #1 reason businesses lose leads isn't bad marketing — it's slow or nonexistent follow-up. This agent solves that permanently.

### What It Does

- **Instant response** — new leads get a welcome message within 60 seconds
- **Multi-channel** — follows up via SMS, email, and voicemail drops
- **AI conversations** — handles replies and books appointments automatically
- **Smart timing** — escalates urgency over days 1-14 to maximize conversion
- **Never forgets** — every lead gets the full sequence, no exceptions

### Real-World Example: Spark Electric (Electrician)

Jake's team was generating 40 leads/month from Google Ads but only converting 8. Why? They were taking 4-6 hours to respond, and most leads had already called a competitor.

After Lead Follow-up: Response time dropped to **under 60 seconds**. AI handled initial conversations and booking. **Conversion jumped from 8 to 22 booked jobs/month — a 175% increase.** At $350 average job value, that's **$4,900/month in additional revenue.**

### The Data

- **78% of leads** go with the first business to respond
- **Responding in under 5 minutes** = 21x more likely to qualify a lead
- **Only 25% of companies** follow up more than once
- Your AI follows up **7-10 times** over 14 days automatically`,
      },
      {
        id: 'lead-followup-2',
        moduleId: 'lead-followup',
        title: 'Workflow Walkthrough',
        description: 'The complete follow-up sequence from first contact to final check-in.',
        videoUrl: null,
        type: 'info',
        order: 2,
        instructions: `## The Lead Follow-up Sequence

Here's the full automation timeline from the moment a new lead comes in.

### The Timeline

**Minute 1:** Instant welcome SMS + email
> "Hey [Name], thanks for reaching out to [Business]! I'm [Agent], and I'd love to help. What's the best time to chat?"

**Minute 30:** Video introduction link (if no reply)
> "Here's a quick 60-second video about how we work: [link]"

**Hour 4:** AI conversation starter
> "Hey [Name], just checking in — did you get a chance to look at what we offer? Happy to answer any questions."

**Day 2:** Value-add follow-up
> "Hi [Name], quick tip: [relevant industry insight]. If you'd like to learn more, I can schedule a quick call."

**Day 3:** Social proof
> "Just helped another [industry] business save $X on [service]. Would love to do the same for you."

**Day 5:** Urgency nudge
> "[Name], we have a couple of openings this week. Want me to hold a spot for you?"

**Day 7:** Final value offer
> "Last check-in for the week — if you're still considering [service], we're offering [incentive] this month."

**Day 10-14:** Graceful close
> "Hey [Name], just wanted to reach out one last time. No pressure at all — we're here whenever you're ready."

### At Any Point

If the lead replies, the AI picks up the conversation naturally and works toward booking an appointment. The sequence pauses automatically once a conversation starts.`,
      },
      {
        id: 'lead-followup-3',
        moduleId: 'lead-followup',
        title: 'Customize Follow-up Sequence',
        description: 'Adjust timing, messaging, and templates at each step.',
        videoUrl: null,
        type: 'config',
        order: 3,
        instructions: `## Customize Your Follow-up Sequence

Every business is different. Adjust the sequence timing and messaging to match your sales cycle.

### Timing Adjustments

For **high-urgency services** (plumbing, HVAC, emergency dental):
- Compress the sequence: Day 1-3 should be more aggressive
- Add a "same-day availability" message
- Follow up 3x in the first 24 hours

For **considered purchases** (legal, real estate, financial):
- Space out follow-ups more
- Focus on education and trust-building
- Extend the sequence to 21-30 days

### Message Customization

For each touchpoint, you can customize:
- **The message copy** — what you say
- **The channel** — SMS, email, or both
- **The timing** — when it goes out relative to the trigger
- **The condition** — only send if no reply yet / always send

### Templates to Provide

Help us personalize your sequence:
- **Your unique selling proposition** — what makes you different?
- **Common objections** — what do leads usually hesitate about?
- **Social proof** — any impressive stats, reviews, or case studies?
- **Current offers** — any promotions or incentives to mention?

**The more specific you are, the better your AI will convert.**`,
      },
      {
        id: 'lead-followup-4',
        moduleId: 'lead-followup',
        title: 'Contact Your CSM',
        description: 'Schedule a call with your CSM to test your lead follow-up sequence.',
        videoUrl: null,
        type: 'demo',
        order: 4,
        instructions: `## Test Your Lead Follow-up With Your CSM

Your Client Success Manager will walk you through testing the follow-up sequence on a live call.

### What Happens on the Call

1. **Trigger a test lead** — Your CSM will submit a test lead with you watching the sequence fire
2. **Watch the flow** — See the instant SMS, email, and follow-up touchpoints in real time
3. **Real-time adjustments** — Tweak timing, messaging, or AI conversation handling on the spot
4. **Go-live approval** — Once you're happy, your CSM activates the sequence for real leads

### Before the Call, Make Sure You've:

- Completed the "Customize Follow-up Prompts" step
- Configured your follow-up timing and sequence
- Entered all required credentials

### Schedule Your Call

Use the button below to book a time with your CSM. Calls typically take 20-30 minutes.`,
      },
      {
        id: 'lead-followup-5',
        moduleId: 'lead-followup',
        title: 'Review & Complete',
        description: 'Submit feedback and mark this module as done.',
        videoUrl: null,
        type: 'info',
        order: 5,
        instructions: `## Review & Complete — Lead Follow-up

You've reviewed and tested the Lead Follow-up agent.

### Before You Mark Complete

- [ ] Reviewed and customized the follow-up sequence
- [ ] Adjusted timing for your business type
- [ ] Provided your USP, objections, and social proof
- [ ] Tested the full sequence with a sample lead
- [ ] Verified AI conversation quality
- [ ] Submitted any change requests

### What Happens Next

1. **Our team fine-tunes** the sequence based on your input
2. **We connect it** to your lead sources (forms, ads, website)
3. **We deploy it live** so every new lead gets instant follow-up
4. **Weekly reporting** shows you conversion rates and improvements

### Pro Tip

The first week of data is the most valuable. After launch, review the AI conversations and let us know if any responses need adjusting. Most clients see optimal performance after 1-2 rounds of tuning.`,
      },
    ],
  },

  // ─── MODULE 7: Appointment Reminders ──────────────────────────────
  {
    id: 'appointment-reminders',
    title: 'Appointment Reminders',
    description: 'Reduce no-shows with automated, perfectly-timed reminders.',
    thumbnail: 'from-yellow-500 to-orange-600',
    order: 7,
    steps: [
      {
        id: 'appointment-reminders-1',
        moduleId: 'appointment-reminders',
        title: 'What It Does & ROI',
        description: 'How automated reminders dramatically reduce no-shows.',
        videoUrl: null,
        type: 'info',
        order: 1,
        instructions: `## Appointment Reminders — Overview & ROI

No-shows are one of the biggest revenue killers for service businesses. This agent makes sure people actually show up.

### What It Does

- **24-hour reminder** — SMS and email the day before the appointment
- **1-hour reminder** — SMS one hour before with address/directions
- **Confirmation request** — asks the client to confirm or reschedule
- **Post-appointment follow-up** — thank you message + review request link
- **Reschedule handling** — if they can't make it, AI helps reschedule

### Real-World Example: Peak Performance Chiropractic

Dr. Martinez was losing $3,200/month to no-shows (about 8 per week at $100/visit). His front desk staff couldn't keep up with reminder calls.

After Appointment Reminders: No-show rate dropped from **22% to 6%**. The AI handles all reminders and rescheduling automatically. **Result: $2,560/month in recovered revenue, plus freed up 5 hours/week of staff time.**

### The Math

- Average no-show rate without reminders: **20-30%**
- Average no-show rate with AI reminders: **5-10%**
- If you do 80 appointments/month at $150 average: that's **$1,500-3,000/month** in saved revenue`,
      },
      {
        id: 'appointment-reminders-2',
        moduleId: 'appointment-reminders',
        title: 'Workflow Walkthrough',
        description: 'The reminder automation from booking to post-appointment.',
        videoUrl: null,
        type: 'info',
        order: 2,
        instructions: `## How Appointment Reminders Work

Here's the complete flow from the moment an appointment is booked.

### The Timeline

**At Booking:** Confirmation SMS + email with all details
> "Your appointment with [Business] is confirmed for [Date] at [Time]. Reply C to confirm or R to reschedule."

**24 Hours Before:** Day-before reminder
> "Hi [Name], just a reminder that your appointment with [Business] is tomorrow at [Time]. See you then!"

**1 Hour Before:** Final reminder with logistics
> "[Name], your appointment is in 1 hour at [Address]. Here's a map: [link]. See you soon!"

**Post-Appointment (2 hours after):** Thank you + review
> "Thanks for visiting [Business] today! How was your experience? We'd love a quick review: [review link]"

### Smart Features

- **Reschedule handling** — if they reply "R" or "reschedule," the AI walks them through rebooking
- **Cancellation detection** — if they cancel, the slot opens up and waitlisted clients are notified
- **No-show follow-up** — if they don't show, the AI sends a friendly "We missed you" with rebooking link
- **Multi-appointment support** — handles recurring appointments (weekly, monthly)

### Integration

All reminders sync with your GoHighLevel calendar. Any changes to the appointment automatically update the reminder schedule.`,
      },
      {
        id: 'appointment-reminders-3',
        moduleId: 'appointment-reminders',
        title: 'Customize Reminders',
        description: 'Adjust reminder timing, messaging, and channels.',
        videoUrl: null,
        type: 'config',
        order: 3,
        instructions: `## Customize Your Reminders

Adjust the reminder system to match your appointment workflow.

### Timing Configuration

Choose when reminders go out:
- **48 hours before** — good for appointments that require preparation
- **24 hours before** — standard, works for most businesses
- **2 hours before** — good for same-day or next-day bookings
- **1 hour before** — final reminder with directions

### Message Customization

For each reminder, customize:
- **Tone** — professional, friendly, or casual
- **Content** — what details to include (address, prep instructions, what to bring)
- **Channel** — SMS only, email only, or both
- **Confirmation request** — require reply to confirm, or just inform

### Special Instructions

Add business-specific details to your reminders:
- "Please arrive 10 minutes early to fill out paperwork"
- "Bring your insurance card and photo ID"
- "Park in the rear lot, entrance is on Main Street"
- "Wear comfortable clothing for your session"

### Post-Appointment Customization

Adjust what happens after the visit:
- Thank you message timing (immediate, 1 hour, 2 hours after)
- Review platform preference (Google, Yelp, Facebook, or custom)
- Rebooking prompt for recurring services`,
      },
      {
        id: 'appointment-reminders-4',
        moduleId: 'appointment-reminders',
        title: 'Contact Your CSM',
        description: 'Schedule a call with your CSM to test your appointment reminders.',
        videoUrl: null,
        type: 'demo',
        order: 4,
        instructions: `## Test Your Appointment Reminders With Your CSM

Your Client Success Manager will walk you through testing the reminder flow on a live call.

### What Happens on the Call

1. **Create a test appointment** — Your CSM will book a test appointment and trigger the reminder sequence
2. **Watch the flow** — See the confirmation, 24-hour reminder, and 1-hour reminder fire in real time
3. **Test responses** — Try confirming, rescheduling, and cancelling to verify each path works
4. **Go-live approval** — Once you're happy, your CSM activates reminders for all future appointments

### Before the Call, Make Sure You've:

- Completed the "Customize Reminder Prompts" step
- Configured your reminder timing and messaging
- Entered all required credentials

### Schedule Your Call

Use the button below to book a time with your CSM. Calls typically take 15-20 minutes.`,
      },
      {
        id: 'appointment-reminders-5',
        moduleId: 'appointment-reminders',
        title: 'Review & Complete',
        description: 'Submit feedback and mark this module as done.',
        videoUrl: null,
        type: 'info',
        order: 5,
        instructions: `## Review & Complete — Appointment Reminders

You've reviewed and tested the Appointment Reminder system.

### Before You Mark Complete

- [ ] Configured reminder timing for your business
- [ ] Customized message content and tone
- [ ] Added any special instructions (parking, preparation, etc.)
- [ ] Tested the full reminder flow
- [ ] Verified confirm/reschedule responses work
- [ ] Submitted any feedback

### What Happens Next

1. **We connect the reminders** to your live GHL calendar
2. **Every new appointment** automatically gets the full reminder sequence
3. **No-show tracking** starts so we can measure improvement
4. **Monthly reports** show your no-show rate improvement

**Submit any final feedback below, then mark this module complete.**`,
      },
    ],
  },

  // ─── MODULE 8: Quote Follow-up ────────────────────────────────────
  {
    id: 'quote-followup',
    title: 'Quote Follow-up',
    description: 'Automatically follow up on sent quotes so nothing falls through the cracks.',
    thumbnail: 'from-emerald-500 to-green-600',
    order: 8,
    steps: [
      {
        id: 'quote-followup-1',
        moduleId: 'quote-followup',
        title: 'What It Does & ROI',
        description: 'How automated quote follow-up increases close rates.',
        videoUrl: null,
        type: 'info',
        order: 1,
        instructions: `## Quote Follow-up — Overview & ROI

You sent the quote. They said "looks great, let me think about it." Then silence. This agent makes sure those quotes actually close.

### What It Does

- **Tracks sent quotes** — monitors when quotes are sent and opened
- **Automated follow-up** — reaches out at strategic intervals
- **AI conversations** — handles objections and questions about the quote
- **Urgency creation** — adds time-sensitive elements to drive decisions
- **Handoff to team** — routes hot leads back to you when ready to sign

### Real-World Example: Summit Accounting

Lisa sent about 20 proposals/month. Her close rate was 35% — she was losing 13 potential clients every month simply because she was too busy to follow up consistently.

After Quote Follow-up: The AI followed up on every proposal automatically. Close rate jumped to **58%** — an additional 4-5 clients per month at $2,500 average annual value. **Result: $10,000-12,500 in additional annual contract value per month.**

### Why Quotes Go Cold

- **60% of prospects** need 3-5 follow-ups before making a decision
- **44% of salespeople** give up after one follow-up
- **Timing matters** — the right message at the right time closes deals
- Your AI never forgets, never gets busy, and always follows up on schedule`,
      },
      {
        id: 'quote-followup-2',
        moduleId: 'quote-followup',
        title: 'Workflow Walkthrough',
        description: 'The complete quote follow-up automation.',
        videoUrl: null,
        type: 'info',
        order: 2,
        instructions: `## How Quote Follow-up Works

Here's the sequence from the moment a quote is sent.

### The Timeline

**At Send:** Quote delivery confirmation
> "Hi [Name], I just sent over the quote for [service]. Let me know if you have any questions!"

**24 Hours:** Soft check-in
> "Hey [Name], just checking in — did you get a chance to review the quote I sent? Happy to walk through anything."

**Day 3:** Address common objections
> "[Name], a lot of our clients had similar questions when they first looked at our pricing. The biggest thing they found was [value statement]. Would it help to hop on a quick call?"

**Day 7:** Urgency + social proof
> "Quick update — we're getting booked up for [month]. If you want to lock in the pricing from your quote, now's a good time. We just onboarded [similar business] last week and they're already seeing results."

**Day 14:** Final offer
> "Hey [Name], your quote for [service] is still open. I can extend the current pricing through [date] if you'd like to move forward. After that, I'll close it out. No pressure either way!"

### Smart Behavior

- If the prospect **replies at any point**, the AI picks up the conversation
- If they say **"not right now"**, the AI asks when to follow up and sets a future reminder
- If they ask a **question**, the AI answers from your knowledge base
- If they're **ready to move forward**, the AI routes them to you for closing`,
      },
      {
        id: 'quote-followup-3',
        moduleId: 'quote-followup',
        title: 'Customize Follow-up Templates',
        description: 'Adjust the follow-up messaging and timing.',
        videoUrl: null,
        type: 'config',
        order: 3,
        instructions: `## Customize Your Quote Follow-up

Tailor the follow-up sequence to your sales process and typical deal timeline.

### Sales Cycle Configuration

How long does your typical prospect take to decide?
- **Quick decision (1-7 days)** — compress follow-ups, more urgency
- **Medium (7-30 days)** — standard timing with education focus
- **Long cycle (30-90 days)** — extended nurture with value-add content

### Message Customization

For each touchpoint, provide:
- **Common objections** — what hesitations do prospects usually have?
- **Value statements** — what's the strongest argument for choosing you?
- **Social proof** — recent wins, reviews, or case studies to reference
- **Urgency drivers** — seasonal demand, limited capacity, price changes

### Tone Settings

- **Consultative** — "I want to make sure this is the right fit for you"
- **Confident** — "Here's why our clients love working with us"
- **Casual** — "Just bumping this up — let me know what you think!"

### Special Rules

Set any business-specific rules:
- Don't follow up on weekends
- If quote is over $X, route to senior team member
- Include a discount offer on the final follow-up (or not)
- Stop follow-up after quote expires`,
      },
      {
        id: 'quote-followup-4',
        moduleId: 'quote-followup',
        title: 'Contact Your CSM',
        description: 'Schedule a call with your CSM to test your quote follow-up system.',
        videoUrl: null,
        type: 'demo',
        order: 4,
        instructions: `## Test Your Quote Follow-up With Your CSM

Your Client Success Manager will walk you through testing the quote follow-up system on a live call.

### What Happens on the Call

1. **Send a test quote** — Your CSM will create and send a test quote with you watching
2. **Watch the sequence** — See the confirmation, 24-hour check-in, and day-3 follow-up fire
3. **Test objection handling** — Reply with common objections and see how the AI responds
4. **Go-live approval** — Once you're happy, your CSM activates the follow-up for all future quotes

### Before the Call, Make Sure You've:

- Completed the "Customize Quote Follow-up Prompts" step
- Configured your follow-up timing and objection responses
- Entered all required credentials

### Schedule Your Call

Use the button below to book a time with your CSM. Calls typically take 20-30 minutes.`,
      },
      {
        id: 'quote-followup-5',
        moduleId: 'quote-followup',
        title: 'Review & Complete',
        description: 'Submit feedback and mark this module as done.',
        videoUrl: null,
        type: 'info',
        order: 5,
        instructions: `## Review & Complete — Quote Follow-up

You've reviewed and tested the Quote Follow-up agent.

### Before You Mark Complete

- [ ] Configured the sales cycle timing
- [ ] Provided common objections and value statements
- [ ] Customized the follow-up message templates
- [ ] Tested the sequence with a sample quote
- [ ] Verified AI conversation quality for objection handling
- [ ] Submitted any feedback

### What Happens Next

1. **We connect the agent** to your GHL quote/proposal pipeline
2. **Every sent quote** automatically triggers the follow-up sequence
3. **Close rate tracking** begins so we can measure improvement
4. **We optimize** the messaging based on real response data

**Submit any final feedback below, then mark this module complete.**`,
      },
    ],
  },

  // ─── MODULE 9: Review Request ─────────────────────────────────────
  {
    id: 'review-request',
    title: 'Review Request',
    description: 'Automatically collect Google and Yelp reviews after every service.',
    thumbnail: 'from-pink-500 to-rose-600',
    order: 9,
    steps: [
      {
        id: 'review-request-1',
        moduleId: 'review-request',
        title: 'What It Does & ROI',
        description: 'How automated review collection builds your online reputation.',
        videoUrl: null,
        type: 'info',
        order: 1,
        instructions: `## Review Request — Overview & ROI

Online reviews are the new word-of-mouth. This agent automates the entire process so you consistently build a stellar online reputation.

### What It Does

- **Triggers after service** — automatically sends a review request after each appointment
- **Sentiment routing** — asks "how was it?" first, then routes based on the answer
- **Positive responses** → direct link to leave a Google/Yelp review
- **Negative responses** → routed to your support team privately (keeps bad reviews off public platforms)
- **Thank you follow-up** — sends a thank you after the review is posted

### Real-World Example: Serenity Day Spa

Maria's spa had 23 Google reviews after 3 years in business. She knew her clients loved the experience, but nobody remembered to leave a review.

After Review Request: The AI asked every client for feedback after their visit. In 60 days, she went from **23 to 89 Google reviews** with a 4.9 average rating. **Result: 40% increase in new client bookings from Google search.**

### Why Reviews Matter

- **93% of consumers** read online reviews before choosing a local business
- **Businesses with 50+ reviews** earn 266% more leads than those with fewer
- **Star rating improvement** of just 0.5 stars can increase revenue by 5-9%
- Most happy clients WILL leave a review — they just need to be asked`,
      },
      {
        id: 'review-request-2',
        moduleId: 'review-request',
        title: 'Workflow Walkthrough',
        description: 'The review request flow from service completion to thank you.',
        videoUrl: null,
        type: 'info',
        order: 2,
        instructions: `## How Review Request Works

Here's the complete automation from service completion to review collection.

### The Flow

**Step 1: Service Complete (24 hours after appointment)**
> "Hi [Name], thanks for visiting [Business] yesterday! How was your experience? Reply with a number: 1-5 (5 being amazing)"

**Step 2a: Positive Response (4-5 rating)**
> "That's awesome to hear! We'd love if you could share your experience with others. It takes less than 60 seconds: [Google Review Link]"

**Step 2b: Neutral/Negative Response (1-3 rating)**
> "Thank you for your honesty. We're sorry it wasn't perfect. Our team will reach out to make it right. Is there anything specific we can improve?"
*→ Alert sent to your team with the client's feedback*

**Step 3: Follow-up (3 days after positive response, if no review posted)**
> "Hey [Name], just a gentle reminder — if you have 60 seconds, we'd really appreciate a quick review: [link]. It helps other people find us!"

**Step 4: Thank You (after review is detected)**
> "Thank you so much for leaving a review, [Name]! It means the world to us. See you next time!"

### Smart Features

- **Platform detection** — knows if they've already reviewed and doesn't double-ask
- **Timing optimization** — sends requests when open rates are highest (typically 10am-2pm)
- **Multi-platform** — can direct to Google, Yelp, Facebook, or any custom URL`,
      },
      {
        id: 'review-request-3',
        moduleId: 'review-request',
        title: 'Customize Review Templates',
        description: 'Adjust the review request messaging and platform links.',
        videoUrl: null,
        type: 'config',
        order: 3,
        instructions: `## Customize Your Review Requests

Set up your review collection to match your brand and preferred platforms.

### Review Platform Links

Provide your direct review links:
- **Google Business Profile** — your Google review link (we'll show you how to find it)
- **Yelp** — your Yelp business page URL
- **Facebook** — your Facebook page review section
- **Custom** — any other review platform you use

### Finding Your Google Review Link

1. Search for your business on Google
2. Click "Write a review" on your business listing
3. Copy the URL from your browser — that's your direct review link
4. Or use: \`https://search.google.com/local/writereview?placeid=YOUR_PLACE_ID\`

### Message Customization

- **Timing** — how long after the appointment should the request go out? (Default: 24 hours)
- **Tone** — match your brand voice
- **Incentive** — some businesses offer a small thank-you (discount on next visit, etc.)
- **Primary platform** — which review site matters most to you?

### Negative Feedback Routing

When someone reports a poor experience:
- Who should receive the alert? (name and phone/email)
- What's your preferred response time? (we'll set expectations with the client)
- Any standard recovery offers? (discount, redo, refund policy)`,
      },
      {
        id: 'review-request-4',
        moduleId: 'review-request',
        title: 'Contact Your CSM',
        description: 'Schedule a call with your CSM to test your review request system.',
        videoUrl: null,
        type: 'demo',
        order: 4,
        instructions: `## Test Your Review Request System With Your CSM

Your Client Success Manager will walk you through testing the review request flow on a live call.

### What Happens on the Call

1. **Trigger a test request** — Your CSM will simulate a completed appointment and fire the review request
2. **Test both paths** — See what happens with positive ratings (review link) and negative ratings (team alert)
3. **Real-time adjustments** — Tweak messaging, timing, or review platform links on the spot
4. **Go-live approval** — Once you're happy, your CSM activates review requests for all completed appointments

### Before the Call, Make Sure You've:

- Completed the "Customize Review Request Prompts" step
- Added your review platform links (Google, Yelp, etc.)
- Entered all required credentials

### Schedule Your Call

Use the button below to book a time with your CSM. Calls typically take 15-20 minutes.`,
      },
      {
        id: 'review-request-5',
        moduleId: 'review-request',
        title: 'Review & Complete',
        description: 'Submit feedback and mark this module as done.',
        videoUrl: null,
        type: 'info',
        order: 5,
        instructions: `## Review & Complete — Review Request

You've reviewed and tested the Review Request agent.

### Before You Mark Complete

- [ ] Provided your review platform links (Google, Yelp, etc.)
- [ ] Set the request timing after appointments
- [ ] Customized the message tone and content
- [ ] Configured negative feedback routing
- [ ] Tested both positive and negative response paths
- [ ] Submitted any feedback

### What Happens Next

1. **We connect the agent** to your appointment completions
2. **Every completed service** triggers the review sequence automatically
3. **Review tracking dashboard** shows your collection rate
4. **Monthly reports** track your rating improvement over time

**Your online reputation is about to grow on autopilot. Submit any final feedback below.**`,
      },
    ],
  },

  // ─── MODULE 10: Website Chatbot ───────────────────────────────────
  {
    id: 'website-chatbot',
    title: 'Website Chatbot',
    description: '24/7 website engagement — qualify visitors, answer questions, and book appointments.',
    thumbnail: 'from-indigo-500 to-blue-600',
    order: 10,
    steps: [
      {
        id: 'website-chatbot-1',
        moduleId: 'website-chatbot',
        title: 'What It Does & ROI',
        description: 'How a website chatbot captures leads you are currently losing.',
        videoUrl: null,
        type: 'info',
        order: 1,
        instructions: `## Website Chatbot — Overview & ROI

Most website visitors leave without taking action. Your AI chatbot engages them in real-time and turns visitors into booked appointments.

### What It Does

- **Greets every visitor** — proactive engagement within seconds of landing
- **Answers questions** — pulls from your knowledge base to answer FAQs instantly
- **Qualifies leads** — asks the right questions to determine fit
- **Books appointments** — routes qualified visitors directly to your calendar
- **Captures contact info** — even if they don't book, you get their details for follow-up

### Real-World Example: Pinnacle Real Estate

David's real estate website was getting 1,200 visitors/month but only 15 were filling out the contact form. Most people browsed listings and left.

After adding the AI chatbot: The chat widget engaged visitors proactively. **142 conversations started in the first month, 38 qualified leads captured, 12 appointments booked.** That's a **700% increase** in lead capture — from the same traffic.

### Why Chatbots Work

- **79% of consumers** prefer live chat over other contact methods
- **Average response time** with forms is 24-48 hours. With chat, it's instant.
- **Visitors who chat** are 2.8x more likely to convert
- The chatbot works **24/7** — capturing leads even at 2am`,
      },
      {
        id: 'website-chatbot-2',
        moduleId: 'website-chatbot',
        title: 'Workflow Walkthrough',
        description: 'The chatbot flow from visitor landing to booking.',
        videoUrl: null,
        type: 'info',
        order: 2,
        instructions: `## How the Website Chatbot Works

Here's the flow from the moment a visitor lands on your website.

### The Flow

1. **Visitor lands on site** → chatbot appears after 5 seconds with a friendly greeting
2. **Proactive engagement** → "Hey! Looking for [service]? I can help you find what you need."
3. **Visitor asks a question** → AI answers from your knowledge base instantly
4. **Qualification** → AI naturally works in qualifying questions during the conversation
5. **Decision point:**
   - Qualified + ready → **Books appointment** directly in GHL calendar
   - Qualified + not ready → **Captures contact info** for follow-up
   - Not qualified → **Provides helpful info** and directs to resources
6. **Handoff** → if the visitor asks for a human, the AI alerts your team and transfers

### Knowledge Base

The chatbot answers questions from a custom knowledge base you provide:
- Services and pricing
- Hours and location
- Process and timeline
- Common FAQs
- Any other info visitors typically ask about

### Multi-Page Awareness

The chatbot knows which page the visitor is on and tailors the conversation:
- **Home page** → general greeting and service overview
- **Service page** → specific questions about that service
- **Pricing page** → addresses cost concerns and value
- **Contact page** → offers to book right there`,
      },
      {
        id: 'website-chatbot-3',
        moduleId: 'website-chatbot',
        title: 'Customize Chatbot Prompt',
        description: 'Adjust persona, greeting, knowledge base, and goals.',
        videoUrl: null,
        type: 'config',
        order: 3,
        instructions: `## Customize Your Website Chatbot

Make the chatbot sound and behave exactly like your brand.

### 1. Persona & Identity

- **Name** — give your chatbot a name (e.g., "Alex from [Business]")
- **Tone** — professional, friendly, casual, or a mix
- **Avatar** — we'll set up a branded chat icon

### 2. Greeting Message

The first thing visitors see. Examples:
- "Hey! Welcome to [Business]. How can I help you today?"
- "Hi there! Looking for [service]? I can answer any questions or help you book."
- "Welcome! I'm [Name], your virtual assistant. What brings you here today?"

### 3. Knowledge Base Content

Provide comprehensive answers for:
- **Services** — what you offer, brief descriptions of each
- **Pricing** — ranges, packages, or "free consultation" messaging
- **Process** — how you work, what to expect
- **Location & Hours** — where you are, when you're open
- **Differentiators** — what makes you different from competitors
- **FAQs** — the top 10-15 questions visitors ask

### 4. Conversation Goals

What should the chatbot prioritize?
- **Book an appointment** (primary for most businesses)
- **Capture contact info** (name, email, phone)
- **Answer questions** (education-focused businesses)
- **Route to team member** (complex sales processes)

### 5. Widget Appearance

- Position: bottom-right (standard) or bottom-left
- Color scheme: match your brand colors
- Auto-open vs. click-to-open`,
      },
      {
        id: 'website-chatbot-4',
        moduleId: 'website-chatbot',
        title: 'Contact Your CSM',
        description: 'Schedule a call with your CSM to test your website chatbot.',
        videoUrl: null,
        type: 'demo',
        order: 4,
        instructions: `## Test Your Website Chatbot With Your CSM

Your Client Success Manager will walk you through testing the chatbot on a live call.

### What Happens on the Call

1. **Live chat test** — Your CSM will open the chat widget with you and run through test conversations
2. **Scenario testing** — Test common questions, booking flow, and edge cases together
3. **Real-time adjustments** — Tweak the greeting, knowledge base responses, or booking flow on the spot
4. **Deployment confirmation** — Once you're happy, your CSM deploys the widget to your live website

### Before the Call, Make Sure You've:

- Completed the "Customize Chatbot Prompts" step
- Provided your knowledge base (services, pricing, FAQs)
- Entered all required credentials

### Schedule Your Call

Use the button below to book a time with your CSM. Calls typically take 15-20 minutes.`,
      },
      {
        id: 'website-chatbot-5',
        moduleId: 'website-chatbot',
        title: 'Review & Complete',
        description: 'Submit feedback and mark this module as done.',
        videoUrl: null,
        type: 'info',
        order: 5,
        instructions: `## Review & Complete — Website Chatbot

You've reviewed and tested the Website Chatbot.

### Before You Mark Complete

- [ ] Set up the chatbot persona and greeting
- [ ] Provided comprehensive knowledge base content
- [ ] Configured conversation goals and priorities
- [ ] Tested multiple conversation scenarios
- [ ] Verified booking and contact capture flows
- [ ] Submitted any feedback

### What Happens Next

1. **We install the chat widget** on your website
2. **We fine-tune** the AI based on your test feedback
3. **We go live** and start engaging visitors 24/7
4. **Weekly reports** show conversation volume, leads captured, and appointments booked

### Installation

The chatbot is added to your website with a small code snippet. If you use WordPress, Wix, Squarespace, or any other platform, we handle the installation for you.

**Submit any final feedback below, then mark this module complete.**`,
      },
    ],
  },

  // ─── MODULE 11: Prompt Playground ─────────────────────────────────
  {
    id: 'prompt-playground',
    title: 'Prompt Playground',
    description: 'Test and refine AI prompts before deploying them live.',
    thumbnail: 'from-fuchsia-500 to-purple-600',
    order: 11,
    steps: [
      {
        id: 'prompt-playground-1',
        moduleId: 'prompt-playground',
        title: 'What It Is',
        description: 'Understand the Prompt Playground and why it matters.',
        videoUrl: null,
        type: 'info',
        order: 1,
        instructions: `## Prompt Playground — What It Is

The Prompt Playground is your sandbox for testing and refining AI prompts before they go live in your business.

### Why It Matters

Every AI agent in your system is powered by a carefully crafted prompt — instructions that tell the AI how to behave, what to say, and how to handle different situations. The Prompt Playground lets you:

- **Test prompts safely** — see how the AI responds without affecting real customers
- **Iterate quickly** — make changes and see results in seconds
- **Compare versions** — try different approaches side by side
- **Build confidence** — know exactly how your AI will behave before going live

### When to Use It

- Before launching any new AI agent
- When you want to adjust an agent's behavior
- When you get feedback that an AI response wasn't quite right
- When adding new services, pricing, or business information
- Anytime you want to experiment with how your AI communicates

### No Technical Skills Needed

You don't need to be an AI expert. The Playground uses plain English — just describe how you want the AI to behave, and test it. Our team is here to help if you get stuck.`,
      },
      {
        id: 'prompt-playground-2',
        moduleId: 'prompt-playground',
        title: 'How to Use It',
        description: 'Learn the interface and testing workflow.',
        videoUrl: null,
        type: 'info',
        order: 2,
        instructions: `## How to Use the Prompt Playground

Here's a walkthrough of the interface and the testing process.

### The Interface

1. **Agent Selector** — choose which AI agent's prompt to test (Voice Receptionist, Lead Follow-up, etc.)
2. **Prompt Editor** — view and edit the AI's instructions
3. **Test Input** — type a message as if you were a customer
4. **AI Response** — see how the AI responds in real-time
5. **History** — review past tests and compare responses

### Testing Workflow

1. **Select an agent** from the dropdown
2. **Review the current prompt** — this is what's driving the AI right now
3. **Enter a test message** — "Hi, I need a plumber for a leaky faucet"
4. **Read the response** — does it sound right? Is the tone correct?
5. **Adjust the prompt** if needed — change wording, add context, refine instructions
6. **Test again** — see if the changes improved the response
7. **Repeat** until you're happy with the behavior

### Pro Tips

- **Be specific in prompts** — "Be friendly" is vague. "Greet warmly, use the customer's name, keep responses under 3 sentences" is specific.
- **Test edge cases** — what happens when someone asks something weird?
- **Include examples** — giving the AI example conversations helps it learn your preferred style
- **Test in batches** — run 5-10 different test messages to cover various scenarios`,
      },
      {
        id: 'prompt-playground-3',
        moduleId: 'prompt-playground',
        title: 'Try It Yourself',
        description: 'Interactive prompt testing area.',
        videoUrl: null,
        type: 'config',
        order: 3,
        instructions: `## Try It Yourself

Use the interactive area below to test prompts in real-time.

### Quick Start Exercises

**Exercise 1: Test Your Voice Receptionist**
- Select "Voice Receptionist" from the agent dropdown
- Enter: "Hi, I need to schedule an appointment for next Tuesday"
- Review the response — does it match your brand voice?

**Exercise 2: Test Objection Handling**
- Select "Lead Follow-up" from the agent dropdown
- Enter: "Your prices are too high"
- Review how the AI handles the price objection

**Exercise 3: Test Knowledge Accuracy**
- Select "Website Chatbot" from the agent dropdown
- Enter: "What services do you offer?"
- Verify the response includes your actual services

### Prompt Writing Tips

When editing prompts, include these sections:
- **Role** — "You are a friendly receptionist for [Business]..."
- **Goal** — "Your goal is to qualify the caller and book an appointment..."
- **Rules** — "Never discuss competitor pricing. Always ask for their name..."
- **Knowledge** — "Our services include... Our hours are... Our pricing is..."
- **Examples** — "When someone asks about pricing, respond like this..."

### Common Prompt Fixes

| Problem | Fix |
|---------|-----|
| Too robotic | Add "Be conversational and natural" |
| Too verbose | Add "Keep responses under 2-3 sentences" |
| Off-topic | Add stricter rules about staying focused |
| Wrong info | Update the knowledge section with correct details |`,
      },
      {
        id: 'prompt-playground-4',
        moduleId: 'prompt-playground',
        title: 'Save & Deploy',
        description: 'Lock in your best prompt version and deploy it.',
        videoUrl: null,
        type: 'info',
        order: 4,
        instructions: `## Save & Deploy

Once you're happy with a prompt, here's how to lock it in and push it live.

### Saving Your Work

- **Save as draft** — keep your changes without deploying (good for work-in-progress)
- **Save as version** — create a named version you can roll back to later
- **Deploy** — push the prompt live to your active AI agent

### Version Control

Every prompt change is saved with:
- **Version number** — v1, v2, v3, etc.
- **Timestamp** — when the change was made
- **Notes** — what you changed and why
- **Rollback option** — one-click return to any previous version

### Deployment Process

1. Click **"Deploy"** on your finalized prompt
2. Confirm the change — you'll see a before/after comparison
3. The new prompt goes live within **60 seconds**
4. Monitor the first few interactions to make sure everything looks good

### Best Practices

- **Always test before deploying** — run at least 5 test scenarios
- **Make one change at a time** — easier to identify what improved (or broke)
- **Keep notes** — document why you made each change
- **Review weekly** — prompts should evolve as your business grows

### Need Help?

If you're not sure about a prompt change, submit it as a suggestion through the feedback form. Our team will review it and help you refine it before going live.

**Congratulations — you've completed the Prompt Playground module!**`,
      },
    ],
  },
]
