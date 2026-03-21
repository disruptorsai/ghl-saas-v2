-- Classroom Seed Data
-- Run this after the migration to populate initial classroom content
-- Note: Full module content should be managed via the admin UI

-- Module 1: Welcome
INSERT INTO classroom_modules (id, title, description, thumbnail_url, "order")
VALUES (
  gen_random_uuid(),
  'Welcome to Sales Infra',
  'Get oriented with the platform, meet your AI agents, and understand the journey ahead.',
  'from-blue-500 to-purple-600',
  1
);

-- Module 2: API Keys & Software Setup
INSERT INTO classroom_modules (id, title, description, thumbnail_url, "order")
VALUES (
  gen_random_uuid(),
  'API Keys & Software Setup',
  'Connect your GoHighLevel, OpenAI, and Retell accounts to power your AI agents.',
  'from-green-500 to-teal-600',
  2
);

-- Module 3: AI Voice Receptionist
INSERT INTO classroom_modules (id, title, description, thumbnail_url, "order")
VALUES (
  gen_random_uuid(),
  'AI Voice Receptionist',
  'Deploy an AI that answers your business phone 24/7, qualifies callers, and books appointments.',
  'from-orange-500 to-red-600',
  3
);

-- Module 4: Database Reactivation
INSERT INTO classroom_modules (id, title, description, thumbnail_url, "order")
VALUES (
  gen_random_uuid(),
  'Database Reactivation',
  'Re-engage your old leads and past clients with AI-powered text campaigns.',
  'from-purple-500 to-pink-600',
  4
);

-- Module 5: Lead Follow-up
INSERT INTO classroom_modules (id, title, description, thumbnail_url, "order")
VALUES (
  gen_random_uuid(),
  'Lead Follow-up',
  'Automatically follow up with new leads via text within seconds of inquiry.',
  'from-cyan-500 to-blue-600',
  5
);

-- Module 6: Appointment Reminders
INSERT INTO classroom_modules (id, title, description, thumbnail_url, "order")
VALUES (
  gen_random_uuid(),
  'Appointment Reminders',
  'Reduce no-shows with AI-powered appointment confirmation and reminder sequences.',
  'from-yellow-500 to-orange-600',
  6
);

-- Module 7: Quote Follow-up
INSERT INTO classroom_modules (id, title, description, thumbnail_url, "order")
VALUES (
  gen_random_uuid(),
  'Quote Follow-up',
  'Automatically follow up on sent quotes to increase close rates.',
  'from-emerald-500 to-green-600',
  7
);

-- Module 8: Review Request
INSERT INTO classroom_modules (id, title, description, thumbnail_url, "order")
VALUES (
  gen_random_uuid(),
  'Review Request',
  'Automatically request Google reviews from happy customers after service completion.',
  'from-amber-500 to-yellow-600',
  8
);

-- Module 9: Website Chatbot
INSERT INTO classroom_modules (id, title, description, thumbnail_url, "order")
VALUES (
  gen_random_uuid(),
  'Website Chatbot',
  'Deploy an AI chatbot on your website that captures leads and answers questions 24/7.',
  'from-indigo-500 to-purple-600',
  9
);

-- Module 10: Prompt Playground
INSERT INTO classroom_modules (id, title, description, thumbnail_url, "order")
VALUES (
  gen_random_uuid(),
  'Prompt Playground',
  'Fine-tune your AI agents'' personalities, responses, and behaviors.',
  'from-rose-500 to-pink-600',
  10
);

-- Note: Steps should be added via the admin UI or a separate seed script
-- since they contain extensive markdown content
