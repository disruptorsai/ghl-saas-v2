export const chatResponses: { keywords: string[]; response: string }[] = [
  {
    keywords: ['hello', 'hi', 'hey', 'sup', 'yo'],
    response:
      'Hey there! Welcome to Disruptors Sales Infra support. I can help you navigate the platform, answer questions about your AI agents, or point you to the right module. What can I help with?',
  },
  {
    keywords: ['api', 'key', 'keys', 'setup', 'connect'],
    response:
      'For API key setup, head to the Classroom tab and open Module 2: "API Keys & Software Setup." It walks you through GoHighLevel, OpenAI, and Retell.ai step by step. If you run into issues, make sure you copied the full key with no extra spaces.',
  },
  {
    keywords: ['voice', 'receptionist', 'call', 'phone', 'answer'],
    response:
      'The AI Voice Receptionist is covered in Module 3. It answers every call 24/7, qualifies callers, and books appointments on your calendar. You can customize the greeting, qualification questions, and knowledge base. If you have already completed the module and need changes, submit a feedback request.',
  },
  {
    keywords: ['reactivation', 'database', 'old leads', 'cold leads', 'crm'],
    response:
      'Database Reactivation is in Module 4. It re-engages contacts sitting in your CRM who have not interacted in a while. The AI sends personalized outreach and handles the conversation. Most businesses see 8-15% response rates and 3-7% booking rates from their existing database.',
  },
  {
    keywords: ['follow-up', 'followup', 'follow up', 'new lead', 'speed to lead'],
    response:
      'Lead Follow-up is in Module 5. It automates the entire follow-up process from the moment a new lead comes in — instant welcome message, multi-step nurture over 14 days, and AI-powered conversations to book appointments. The key stat: responding in under 5 minutes makes you 21x more likely to qualify a lead.',
  },
  {
    keywords: ['reminder', 'reminders', 'no-show', 'no show', 'appointment'],
    response:
      'Appointment Reminders are covered in Module 6. The system sends automated reminders at 24 hours and 1 hour before each appointment, handles confirmations and rescheduling, and follows up after the visit. Most clients see no-show rates drop from 20-30% down to 5-10%.',
  },
  {
    keywords: ['quote', 'proposal', 'estimate', 'close rate'],
    response:
      'Quote Follow-up is in Module 7. It automatically follows up on sent quotes at strategic intervals — 24 hours, 3 days, 7 days, and 14 days. The AI handles objections and routes hot leads back to you. 60% of prospects need 3-5 follow-ups before deciding, and your AI never forgets.',
  },
  {
    keywords: ['review', 'reviews', 'google', 'yelp', 'reputation', 'stars'],
    response:
      'Review Request is covered in Module 8. After each service, the AI asks your client how it went. Positive responses get a direct link to leave a Google or Yelp review. Negative responses get routed to your team privately. Most clients double their review count within 60 days.',
  },
  {
    keywords: ['chatbot', 'chat bot', 'website', 'widget', 'live chat'],
    response:
      'The Website Chatbot is in Module 9. It engages visitors on your website 24/7, answers questions from your knowledge base, qualifies leads, and books appointments. Visitors who chat are 2.8x more likely to convert. You can customize the persona, greeting, and conversation goals.',
  },
  {
    keywords: ['prompt', 'playground', 'test', 'refine', 'adjust'],
    response:
      'The Prompt Playground is in Module 10. It is your sandbox for testing and refining AI prompts before they go live. Select any agent, edit the prompt, and test with sample messages. Make one change at a time and run at least 5 test scenarios before deploying.',
  },
  {
    keywords: ['help', 'stuck', 'confused', 'lost', 'where', 'how do i'],
    response:
      'No worries — I am here to help! Here is a quick guide: Start with the Classroom tab to go through modules in order. Each module has step-by-step instructions. If you need to talk to our team directly, submit a feedback request from any module step and we will get back to you within 24 hours.',
  },
  {
    keywords: ['error', 'broken', 'not working', 'bug', 'issue', 'problem'],
    response:
      'Sorry to hear you are running into an issue. Here are a few quick fixes to try: 1) Refresh the page, 2) Clear your browser cache, 3) Make sure your API keys are still active. If the problem persists, submit a bug report through the feedback form on the step where you encountered it, and our team will investigate.',
  },
  {
    keywords: ['billing', 'cost', 'price', 'payment', 'charge', 'invoice', 'money'],
    response:
      'For billing questions: You pay for AI usage directly to OpenAI and Retell (typically $30-80/month combined depending on volume). Your Disruptors Media subscription is billed monthly with no long-term contract. For specific billing inquiries, reach out to Tyler at the team contact listed in the About section.',
  },
  {
    keywords: ['cancel', 'stop', 'leave', 'quit', 'unsubscribe'],
    response:
      'We operate month-to-month with no long-term contracts. If you decide to cancel, you keep 100% of the systems we built in your software. To cancel, just reach out to Tyler through the About section contact info. We would love to hear your feedback so we can improve.',
  },
  {
    keywords: ['thank', 'thanks', 'awesome', 'great', 'amazing', 'love'],
    response:
      'Glad to hear that! We are always here if you need anything. Keep working through the modules at your own pace, and do not hesitate to reach out if any questions come up along the way.',
  },
]

export const defaultResponse =
  "I am not sure about that one. Let me connect you with our team — they will get back to you within 24 hours. In the meantime, try checking the Classroom tab for step-by-step guides on each AI agent."

export const welcomeMessage =
  "Welcome to Disruptors Sales Infra Support! I can help you navigate the platform, answer questions about your AI agents, troubleshoot issues, or point you to the right module. What can I help with today?"

export function getResponse(message: string): string {
  const lower = message.toLowerCase()
  const match = chatResponses.find((r) =>
    r.keywords.some((k) => lower.includes(k))
  )
  return match?.response ?? defaultResponse
}
