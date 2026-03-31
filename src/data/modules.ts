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
        type: 'info',
        order: 1,
      },
      {
        id: 'welcome-2',
        moduleId: 'welcome',
        title: 'System Overview',
        description: 'High-level overview of all 8 AI agents and what they do.',
        type: 'info',
        order: 2,
      },
      {
        id: 'welcome-3',
        moduleId: 'welcome',
        title: 'Your Client Journey',
        description: 'The 4 phases from onboarding to growth.',
        type: 'info',
        order: 3,
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
        type: 'info',
        order: 1,
      },
      {
        id: 'api-setup-2',
        moduleId: 'api-setup',
        title: 'GoHighLevel Setup',
        description: 'Get your GHL API key, location ID, and account details.',
        type: 'setup',
        order: 2,
      },
      {
        id: 'api-setup-3',
        moduleId: 'api-setup',
        title: 'OpenAI API Setup',
        description: 'Get your OpenAI API key for AI-powered conversations.',
        type: 'setup',
        order: 3,
      },
      {
        id: 'api-setup-4',
        moduleId: 'api-setup',
        title: 'Retell.ai Voice Setup',
        description: 'Set up Retell for AI voice calling.',
        type: 'setup',
        order: 4,
      },
      {
        id: 'api-setup-5',
        moduleId: 'api-setup',
        title: 'Verify All Connections',
        description: 'Confirm everything is connected and ready.',
        type: 'setup',
        order: 5,
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
        type: 'info' as const,
        order: 1,
      },
      {
        id: 'twilio-setup-2',
        moduleId: 'twilio-setup',
        title: 'Twilio Account Setup',
        description: 'Create your Twilio account and enter credentials.',
        type: 'setup' as const,
        order: 2,
      },
      {
        id: 'twilio-setup-3',
        moduleId: 'twilio-setup',
        title: 'Schedule CSM Call',
        description: 'Book a live session to complete Twilio setup.',
        type: 'demo' as const,
        order: 3,
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
        type: 'info',
        order: 1,
      },
      {
        id: 'voice-receptionist-2',
        moduleId: 'voice-receptionist',
        title: 'Workflow Walkthrough',
        description: 'See how the voice receptionist automation flows end-to-end.',
        type: 'info',
        order: 2,
      },
      {
        id: 'voice-receptionist-3',
        moduleId: 'voice-receptionist',
        title: 'Customize Your AI Voice Receptionist',
        description: 'Configure greeting, qualification questions, voice tone, and call flow.',
        type: 'config',
        order: 3,
      },
      {
        id: 'voice-receptionist-4',
        moduleId: 'voice-receptionist',
        title: 'Contact Your CSM',
        description: 'Schedule a call with your CSM to test your AI voice receptionist live.',
        type: 'demo',
        order: 4,
      },
      {
        id: 'voice-receptionist-5',
        moduleId: 'voice-receptionist',
        title: 'Review & Complete',
        description: 'Submit feedback and mark this module as done.',
        type: 'info',
        order: 5,
      },
    ],
  },

  // ─── MODULE 5: Database Reactivation ──────────────────────────────
  {
    id: 'db-reactivation',
    title: 'Database Reactivation Agent',
    description: 'Revive dormant leads from your CRM through personalized, batched outreach at scale.',
    thumbnail: 'from-orange-500 to-red-600',
    order: 5,
    steps: [
      {
        id: 'db-reactivation-1',
        moduleId: 'db-reactivation',
        title: 'What It Does & ROI',
        description: 'Understand database reactivation and its revenue potential.',
        type: 'info',
        order: 1,
      },
      {
        id: 'db-reactivation-2',
        moduleId: 'db-reactivation',
        title: 'Workflow Walkthrough',
        description: 'See the end-to-end database reactivation automation.',
        type: 'info',
        order: 2,
      },
      {
        id: 'db-reactivation-3',
        moduleId: 'db-reactivation',
        title: 'Customize Your Database Reactivation Agent',
        description: 'Configure target leads, batch size, personalization, and offers.',
        type: 'config',
        order: 3,
      },
      {
        id: 'db-reactivation-4',
        moduleId: 'db-reactivation',
        title: 'Contact Your CSM',
        description: 'Schedule a call with your CSM to test your database reactivation campaign.',
        type: 'demo',
        order: 4,
      },
      {
        id: 'db-reactivation-5',
        moduleId: 'db-reactivation',
        title: 'Review & Complete',
        description: 'Submit feedback and mark this module as done.',
        type: 'info',
        order: 5,
      },
    ],
  },

  // ─── MODULE 6: Lead Follow-up ─────────────────────────────────────
  {
    id: 'lead-followup',
    title: 'Follow-Up Agent',
    description: 'Persistent, multi-touch follow-up sequence to re-engage unresponsive leads.',
    thumbnail: 'from-cyan-500 to-blue-600',
    order: 6,
    steps: [
      {
        id: 'lead-followup-1',
        moduleId: 'lead-followup',
        title: 'What It Does & ROI',
        description: 'How automated follow-up transforms your lead conversion.',
        type: 'info',
        order: 1,
      },
      {
        id: 'lead-followup-2',
        moduleId: 'lead-followup',
        title: 'Workflow Walkthrough',
        description: 'The complete follow-up sequence from first contact to final check-in.',
        type: 'info',
        order: 2,
      },
      {
        id: 'lead-followup-3',
        moduleId: 'lead-followup',
        title: 'Customize Your Follow-Up Agent',
        description: 'Configure touchpoints, timing, channels, tone, and exit criteria.',
        type: 'config',
        order: 3,
      },
      {
        id: 'lead-followup-4',
        moduleId: 'lead-followup',
        title: 'Contact Your CSM',
        description: 'Schedule a call with your CSM to test your lead follow-up sequence.',
        type: 'demo',
        order: 4,
      },
      {
        id: 'lead-followup-5',
        moduleId: 'lead-followup',
        title: 'Review & Complete',
        description: 'Submit feedback and mark this module as done.',
        type: 'info',
        order: 5,
      },
    ],
  },

  // ─── MODULE 7: Appointment Reminders ──────────────────────────────
  {
    id: 'appointment-reminders',
    title: 'Appointment Setter Agent',
    description: 'Books meetings, confirms details, sends reminders, and manages your calendar.',
    thumbnail: 'from-yellow-500 to-orange-600',
    order: 7,
    steps: [
      {
        id: 'appointment-reminders-1',
        moduleId: 'appointment-reminders',
        title: 'What It Does & ROI',
        description: 'How automated reminders dramatically reduce no-shows.',
        type: 'info',
        order: 1,
      },
      {
        id: 'appointment-reminders-2',
        moduleId: 'appointment-reminders',
        title: 'Workflow Walkthrough',
        description: 'The reminder automation from booking to post-appointment.',
        type: 'info',
        order: 2,
      },
      {
        id: 'appointment-reminders-3',
        moduleId: 'appointment-reminders',
        title: 'Customize Your Appointment Setter',
        description: 'Adjust reminder timing, messaging, and channels.',
        type: 'config',
        order: 3,
      },
      {
        id: 'appointment-reminders-4',
        moduleId: 'appointment-reminders',
        title: 'Contact Your CSM',
        description: 'Schedule a call with your CSM to test your appointment reminders.',
        type: 'demo',
        order: 4,
      },
      {
        id: 'appointment-reminders-5',
        moduleId: 'appointment-reminders',
        title: 'Review & Complete',
        description: 'Submit feedback and mark this module as done.',
        type: 'info',
        order: 5,
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
        type: 'info',
        order: 1,
      },
      {
        id: 'quote-followup-2',
        moduleId: 'quote-followup',
        title: 'Workflow Walkthrough',
        description: 'The complete quote follow-up automation.',
        type: 'info',
        order: 2,
      },
      {
        id: 'quote-followup-3',
        moduleId: 'quote-followup',
        title: 'Customize Follow-up Templates',
        description: 'Adjust the follow-up messaging and timing.',
        type: 'config',
        order: 3,
      },
      {
        id: 'quote-followup-4',
        moduleId: 'quote-followup',
        title: 'Contact Your CSM',
        description: 'Schedule a call with your CSM to test your quote follow-up system.',
        type: 'demo',
        order: 4,
      },
      {
        id: 'quote-followup-5',
        moduleId: 'quote-followup',
        title: 'Review & Complete',
        description: 'Submit feedback and mark this module as done.',
        type: 'info',
        order: 5,
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
        type: 'info',
        order: 1,
      },
      {
        id: 'review-request-2',
        moduleId: 'review-request',
        title: 'Workflow Walkthrough',
        description: 'The review request flow from service completion to thank you.',
        type: 'info',
        order: 2,
      },
      {
        id: 'review-request-3',
        moduleId: 'review-request',
        title: 'Customize Review Templates',
        description: 'Adjust the review request messaging and platform links.',
        type: 'config',
        order: 3,
      },
      {
        id: 'review-request-4',
        moduleId: 'review-request',
        title: 'Contact Your CSM',
        description: 'Schedule a call with your CSM to test your review request system.',
        type: 'demo',
        order: 4,
      },
      {
        id: 'review-request-5',
        moduleId: 'review-request',
        title: 'Review & Complete',
        description: 'Submit feedback and mark this module as done.',
        type: 'info',
        order: 5,
      },
    ],
  },

  // ─── MODULE 10: Website Chatbot ───────────────────────────────────
  {
    id: 'website-chatbot',
    title: 'Engagement Agent',
    description: 'Always-on website chatbot and SMS — engages visitors, qualifies leads, and books appointments.',
    thumbnail: 'from-indigo-500 to-blue-600',
    order: 10,
    steps: [
      {
        id: 'website-chatbot-1',
        moduleId: 'website-chatbot',
        title: 'What It Does & ROI',
        description: 'How a website chatbot captures leads you are currently losing.',
        type: 'info',
        order: 1,
      },
      {
        id: 'website-chatbot-2',
        moduleId: 'website-chatbot',
        title: 'Workflow Walkthrough',
        description: 'The chatbot flow from visitor landing to booking.',
        type: 'info',
        order: 2,
      },
      {
        id: 'website-chatbot-3',
        moduleId: 'website-chatbot',
        title: 'Customize Your Engagement Agent',
        description: 'Configure greeting, qualifying questions, business hours, and escalation triggers.',
        type: 'config',
        order: 3,
      },
      {
        id: 'website-chatbot-4',
        moduleId: 'website-chatbot',
        title: 'Contact Your CSM',
        description: 'Schedule a call with your CSM to test your website chatbot.',
        type: 'demo',
        order: 4,
      },
      {
        id: 'website-chatbot-5',
        moduleId: 'website-chatbot',
        title: 'Review & Complete',
        description: 'Submit feedback and mark this module as done.',
        type: 'info',
        order: 5,
      },
    ],
  },

  // ─── MODULE 11: A2P Registration ──────────────────────────────────
  {
    id: 'a2p-registration',
    title: 'A2P Registration',
    description: 'Register your business for A2P 10DLC compliance so your SMS messages actually get delivered.',
    thumbnail: 'from-emerald-500 to-green-600',
    order: 11,
    steps: [
      {
        id: 'a2p-1',
        moduleId: 'a2p-registration',
        title: 'What Is A2P & Why It Matters',
        description: 'Understand A2P 10DLC compliance and why it is required.',
        type: 'info' as const,
        order: 1,
      },
      {
        id: 'a2p-2',
        moduleId: 'a2p-registration',
        title: 'Business Information',
        description: 'Provide your business details for brand registration.',
        type: 'setup' as const,
        order: 2,
      },
      {
        id: 'a2p-3',
        moduleId: 'a2p-registration',
        title: 'Campaign Details',
        description: 'Define your messaging campaign for carrier approval.',
        type: 'setup' as const,
        order: 3,
      },
      {
        id: 'a2p-4',
        moduleId: 'a2p-registration',
        title: 'Registration Status & Approval',
        description: 'Track your registration and understand approval timelines.',
        type: 'demo' as const,
        order: 4,
      },
    ],
  },

  // ─── MODULE 12: Knowledge Base ───────────────────────────────────
  {
    id: 'knowledge-base',
    title: 'Knowledge Base Setup',
    description: 'Teach your AI agents everything about your business — services, pricing, FAQs, and policies.',
    thumbnail: 'from-amber-500 to-orange-600',
    order: 12,
    steps: [
      {
        id: 'kb-1',
        moduleId: 'knowledge-base',
        title: 'Why Knowledge Base Matters',
        description: 'How your AI agents use business knowledge to give accurate answers.',
        type: 'info' as const,
        order: 1,
      },
      {
        id: 'kb-2',
        moduleId: 'knowledge-base',
        title: 'Services & Pricing',
        description: 'Document your services, packages, and pricing for your AI agents.',
        type: 'setup' as const,
        order: 2,
      },
      {
        id: 'kb-3',
        moduleId: 'knowledge-base',
        title: 'FAQs & Business Details',
        description: 'Add frequently asked questions and key business information.',
        type: 'setup' as const,
        order: 3,
      },
      {
        id: 'kb-4',
        moduleId: 'knowledge-base',
        title: 'Review & Finalize',
        description: 'Review your knowledge base and submit for AI training.',
        type: 'demo' as const,
        order: 4,
      },
    ],
  },

  // ─── MODULE 13: Testing Your Agents ──────────────────────────────
  {
    id: 'testing',
    title: 'Testing Your Agents',
    description: 'Test each AI agent live before deployment — your Fractional Chief AI Officer will guide you.',
    thumbnail: 'from-cyan-500 to-blue-600',
    order: 13,
    steps: [
      {
        id: 'testing-1',
        moduleId: 'testing',
        title: 'Test Your Engagement Agent',
        description: 'Test the chatbot greeting, qualifying questions, and lead routing.',
        type: 'demo' as const,
        order: 1,
        instructions: `## Test Your Engagement Agent

Your Fractional Chief AI Officer will guide you through testing this agent. They will activate it in the testing module when your build is complete.

Your Engagement Agent is built and ready to test. Here is what to look for.

### How to Test

When you open a conversation with the test chatbot, pretend you are a brand-new lead reaching out to your business for the first time.

Type something like "Hey, I am interested in your services" and see how it responds. Watch for three things:

1. **Does the greeting sound like you?** Does it match the tone you set up?
2. **Does it ask the right qualifying questions?** The ones you specified in the customization step?
3. **Does it route correctly?** If you give answers that indicate a high-priority lead, it should try to book you. If you give vague or low-priority answers, it should move you to nurturing.

### Try Multiple Scenarios

Try a few different conversations. Be a difficult lead. Be an easy lead. Ask a weird question. See how it handles it.

Once you are done testing, scroll down to the feedback section. Tell us what worked, what did not, and what you want changed. Hit Submit, and our team will make the adjustments.`,
      },
      {
        id: 'testing-2',
        moduleId: 'testing',
        title: 'Test Your Lead Qualification Agent',
        description: 'Verify lead scoring and routing for high vs low priority leads.',
        type: 'demo' as const,
        order: 2,
        instructions: `## Test Your Lead Qualification Agent

Your Fractional Chief AI Officer will guide you through testing this agent. They will activate it in the testing module when your build is complete.

Let us test your Lead Qualification Agent and make sure it is scoring leads correctly.

### How to Test

When you open the test chat and simulate a lead inquiry, answer the qualifying questions the way a real lead would. What you want to watch is the scoring.

**Test as a high-priority lead:** You have a big budget, you need help soon, you are ready to move. The agent should score you high and route you toward booking.

**Test as a low-priority lead:** You are just browsing, no timeline, not sure what you need. The agent should score you lower and route you to the nurture sequence.

### Edge Cases

Now test the edge cases:
- What happens when someone says something urgent like "I need this fixed today"?
- What about "I am already working with someone else"?
- These are the moments where the AI needs to handle things well.

Check the scoring, check the routing, and submit your feedback. Let us know if any leads are getting scored too high or too low.`,
      },
      {
        id: 'testing-3',
        moduleId: 'testing',
        title: 'Test Your Appointment Setter Agent',
        description: 'Test booking flow, calendar sync, confirmations, and rescheduling.',
        type: 'demo' as const,
        order: 3,
        instructions: `## Test Your Appointment Setter Agent

Your Fractional Chief AI Officer will guide you through testing this agent. They will activate it in the testing module when your build is complete.

Your Appointment Setter is ready. Let us make sure it books correctly.

### Test the Booking Flow

Start a conversation as a lead who wants to book. Tell the agent you are interested and ready to schedule.

Watch the booking flow:
- Does it offer the right appointment types?
- Does it show your real availability?
- Go ahead and book a test appointment.

### Verify the Details

Now check your calendar. Did the appointment show up? Check the confirmation message you received. Does it sound right? Does it have all the details your clients need?

Test the reminder system too — you should receive reminders based on the schedule you set up.

### Test Rescheduling

Try rescheduling. Message the agent and say you need to move your appointment. Make sure the rescheduling flow works smoothly.

Submit your feedback when you are done. We will fine-tune anything that needs adjusting.`,
      },
      {
        id: 'testing-4',
        moduleId: 'testing',
        title: 'Test Your Follow-Up Agent',
        description: 'Review the follow-up sequence, tone, timing, and exit criteria.',
        type: 'demo' as const,
        order: 4,
        instructions: `## Test Your Follow-Up Agent

Your Fractional Chief AI Officer will guide you through testing this agent. They will activate it in the testing module when your build is complete.

Let us test your Follow-Up Agent and make sure the sequence feels right.

### Review the Sequence

First, take a look at the sequence that has been set up. You can see each message in the series, the timing between them, and which channels they go out on.

Your Chief AI Officer will send a test message to your phone number as the test contact. You will receive the first message in the sequence.

### Evaluate the Messages

Read it. Does it sound like you? Is the tone right? Does the personalization look good?

**Test exit criteria:** Reply "not interested" and see what happens. The sequence should stop.

**Test persistence:** Start a new test and do not respond at all. Watch how the messages evolve over time. They should get more creative and persistent without being pushy.

Submit your feedback — especially if the tone, timing, or messaging needs adjustment.`,
      },
      {
        id: 'testing-5',
        moduleId: 'testing',
        title: 'Test Your Lead Nurture Agent',
        description: 'Preview nurture content — testimonials, case studies, and educational material.',
        type: 'demo' as const,
        order: 5,
        instructions: `## Test Your Lead Nurture Agent

Your Fractional Chief AI Officer will guide you through testing this agent. They will activate it in the testing module when your build is complete.

Time to test your Lead Nurture Agent. This one is about building trust over time, so let us make sure the content lands.

### Preview the Content

Your Chief AI Officer will trigger the nurture sequence on a test contact so you can review the output together.

Preview the email and text content in the sequence. You should see your testimonials, your case studies, your educational content — all the material you provided during customization.

### Check the Details

- Are the testimonials accurate?
- Are the before-and-after stories compelling?
- Does the educational content actually teach something useful?
- Is the timing between messages right? Not too aggressive, not too spaced out.

Submit your feedback. If you want different testimonials featured or you have new content to add, let us know in the feedback form.`,
      },
      {
        id: 'testing-6',
        moduleId: 'testing',
        title: 'Test Your Database Reactivation Agent',
        description: 'Run a small test batch and verify personalization and re-qualification.',
        type: 'demo' as const,
        order: 6,
        instructions: `## Test Your Database Reactivation Agent

Your Fractional Chief AI Officer will guide you through testing this agent. They will activate it in the testing module when your build is complete.

Let us test your Database Reactivation Agent before we turn it loose on your real list.

### Small Test Batch

We are going to start small with a test batch of 5 to 10 contacts. You can use your own number, team members, or friends who are willing to help you test. **Do not use real leads for testing.**

Once you upload the batch, watch the outreach go out. Check the messages. Are they personalized correctly? Do they reference the right service or timeframe?

### Test the Re-qualification Flow

Respond to one of the messages as if you are an interested old lead. Watch the re-qualification flow:
- Does the agent ask the right follow-up questions?
- Does it try to assess your current needs and timeline?
- After re-qualification, does the lead get routed correctly? (Hot → booking, Not ready → nurturing)

Submit your feedback and let us know if the messaging or targeting needs tweaking before we go live with your real database.`,
      },
      {
        id: 'testing-7',
        moduleId: 'testing',
        title: 'Test Your AI Voice Receptionist',
        description: 'Call the test number and evaluate greeting, questions, booking, and escalation.',
        type: 'demo' as const,
        order: 7,
        instructions: `## Test Your AI Voice Receptionist

Your AI Voice Receptionist is ready to test. For this one, you will need to coordinate with your Fractional Chief AI Officer.

### How It Works

Once your Voice Receptionist has been built and configured based on your questionnaire, your Chief AI Officer will set up a dedicated test phone number for you.

They will reach out to schedule a live test session where you can call the number together, listen to how it handles different scenarios, and give real-time feedback.

### What to Listen For

- Does the greeting sound right? Is it using your business name and the tone you selected?
- Is it asking your qualification questions in the right order?
- When you give it a booking scenario, does it correctly offer to schedule?
- When you trigger an escalation phrase, does it properly hand off?

### Leave Feedback

After your test session, come back here and leave your feedback. Tell us what sounded great and what needs adjustment. Your Chief AI Officer will make the changes and schedule a follow-up test until everything is dialed in.`,
      },
      {
        id: 'testing-8',
        moduleId: 'testing',
        title: 'Test Your Customer Support Agent',
        description: 'Test knowledge base answers, escalation triggers, and upsell detection.',
        type: 'demo' as const,
        order: 8,
        instructions: `## Test Your Customer Support Agent

Your Fractional Chief AI Officer will guide you through testing this agent. They will activate it in the testing module when your build is complete.

Last test. Your Customer Support Agent. Let us make sure it can handle your customers' questions.

### Test Basic Questions

Pretend you are an existing customer with a question. Start simple. Ask about your business hours, your return policy, or how a service works. These are the kinds of questions your knowledge base should cover.

Watch the response. Is the information accurate? Does it pull the right details from your knowledge base?

### Test Escalation

Say something like "I want a refund" or "I need to speak to a manager." The agent should recognize this as an escalation trigger and handle it according to the rules you set up.

### Test Upsell Detection

Mention something related to another service you offer. For example, if you are a landscaper and the customer asks about lawn maintenance, does the agent suggest your seasonal cleanup package?

Submit your feedback. Let us know what is working and what needs adjusting. Our team will fine-tune it and let you know when it is ready for production.`,
      },
    ],
  },

  // ─── MODULE 14: Management & Handoff ─────────────────────────────
  {
    id: 'management',
    title: 'Management & Handoff',
    description: 'Your final module — learn to manage your AI systems and transition from setup to growth.',
    thumbnail: 'from-slate-500 to-zinc-600',
    order: 14,
    steps: [
      {
        id: 'management-1',
        moduleId: 'management',
        title: 'Your Management Dashboard',
        description: 'Navigate the management tools available to you.',
        type: 'info' as const,
        order: 1,
      },
      {
        id: 'management-2',
        moduleId: 'management',
        title: 'Demo to Live Transition',
        description: 'Understand the transition from demo/testing to live production.',
        type: 'info' as const,
        order: 2,
      },
      {
        id: 'management-3',
        moduleId: 'management',
        title: 'Ongoing Optimization',
        description: 'How your AI systems improve over time.',
        type: 'info' as const,
        order: 3,
      },
      {
        id: 'management-4',
        moduleId: 'management',
        title: 'Congratulations!',
        description: 'You have completed the full onboarding journey.',
        type: 'info' as const,
        order: 4,
      },
    ],
  },

  // ─── MODULE 15: Prompt Playground ─────────────────────────────────
  {
    id: 'prompt-playground',
    title: 'Prompt Playground',
    description: 'Test and refine AI prompts before deploying them live.',
    thumbnail: 'from-fuchsia-500 to-purple-600',
    order: 15,
    steps: [
      {
        id: 'prompt-playground-1',
        moduleId: 'prompt-playground',
        title: 'What It Is',
        description: 'Understand the Prompt Playground and why it matters.',
        type: 'info',
        order: 1,
      },
      {
        id: 'prompt-playground-2',
        moduleId: 'prompt-playground',
        title: 'How to Use It',
        description: 'Learn the interface and testing workflow.',
        type: 'info',
        order: 2,
      },
      {
        id: 'prompt-playground-3',
        moduleId: 'prompt-playground',
        title: 'Try It Yourself',
        description: 'Interactive prompt testing area.',
        type: 'config',
        order: 3,
      },
      {
        id: 'prompt-playground-4',
        moduleId: 'prompt-playground',
        title: 'Save & Deploy',
        description: 'Lock in your best prompt version and deploy it.',
        type: 'info',
        order: 4,
      },
    ],
  },
]
