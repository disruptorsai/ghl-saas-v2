-- ============================================================
-- CLIENT SUPABASE MIGRATION (Per-Client DB)
-- Run this in EACH CLIENT'S Supabase project SQL Editor
-- This stores: n8n data, prompts, knowledge base, campaigns,
--              leads, analytics, portal, chat threads, webinar
-- ============================================================


-- ═══════════════════════════════════════════════════════════
-- SECTION 1: n8n Core Tables (required for n8n workflows)
-- ═══════════════════════════════════════════════════════════

-- Enable the pgvector extension to work with embedding vectors
create extension if not exists vector;

-- Create a table to store your documents (for knowledge base)
create table if not exists documents (
  id bigserial primary key,
  content text,
  metadata jsonb,
  embedding vector(1536),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Create a function to search for documents
create or replace function match_documents (
  query_embedding vector(1536),
  match_count int DEFAULT null,
  filter jsonb DEFAULT '{}'
) returns table (
  id bigint,
  content text,
  metadata jsonb,
  similarity float
)
language plpgsql
as $$
#variable_conflict use_column
begin
  return query
  select
    id,
    content,
    metadata,
    1 - (documents.embedding <=> query_embedding) as similarity
  from documents
  where metadata @> filter
  order by documents.embedding <=> query_embedding
  limit match_count;
end;
$$;

-- Create prompts table with composite key (id, prompt_type)
-- Text prompts: IDs 0-8 (9 slots)   Voice prompts: IDs 0-5 (6 slots)
-- Categories: persona, main_agent, booking
create table if not exists prompts (
  id int4 not null,
  prompt_type text not null check (prompt_type in ('text', 'voice')),
  category text not null check (category in ('persona', 'main_agent', 'booking')),
  prompt_name text not null default '',
  description text,
  content text,
  is_active boolean default false,
  primary key (id, prompt_type)
);

-- Insert Text Prompts (IDs 0-8)
INSERT INTO prompts (id, prompt_type, category, prompt_name, description, is_active) VALUES
  (0, 'text', 'persona',     'Bot Persona',                'Defines the core personality, tone, and communication style of your text AI agent.',                    false),
  (1, 'text', 'main_agent',  'Website Agent',              'Handles website visitor engagement and initial conversations.',                                         false),
  (2, 'text', 'main_agent',  'Engagement Agent',           'Multi-channel text engagement across iMessage, WhatsApp, and Email.',                                   false),
  (3, 'text', 'main_agent',  'Follow-up Agent',            'Qualification agent for post-booking follow-up conversations.',                                         false),
  (4, 'text', 'main_agent',  'Text Agent 4',               'Custom agent for additional text-based use cases.',                                                     false),
  (5, 'text', 'main_agent',  'Text Agent 5',               'Custom agent for additional text-based use cases.',                                                     false),
  (6, 'text', 'main_agent',  'Text Agent 6',               'Custom agent for additional text-based use cases.',                                                     false),
  (7, 'text', 'booking',     'Book Directly in Calendar',  'Handles appointment scheduling, checks calendar availability, and confirms bookings with leads.',       false),
  (8, 'text', 'booking',     'Book Using Scheduling Link',  'Provides booking link for scheduling appointments.',                                                   false)
ON CONFLICT (id, prompt_type) DO NOTHING;

-- Insert Voice Prompts (IDs 0-5)
INSERT INTO prompts (id, prompt_type, category, prompt_name, description, is_active) VALUES
  (0, 'voice', 'persona',     'Voice Persona',              'Defines the core personality, tone, and communication style of your voice AI agent.',                   false),
  (1, 'voice', 'main_agent',  'Inbound Agent',              'Handles inbound voice calls and inquiries.',                                                           false),
  (2, 'voice', 'main_agent',  'Outbound Agent',             'Handles outbound calling campaigns and cold outreach.',                                                false),
  (3, 'voice', 'main_agent',  'Webinar Followup Agent',     'Follow-up reminder agent that calls registrants before the event.',                                    false),
  (4, 'voice', 'main_agent',  'Voice Agent 4',              'Custom voice agent for specialized outreach campaigns.',                                               false),
  (5, 'voice', 'booking',     'Booking Agent Functions',    'Voice agent for booking appointments and managing calendar interactions.',                              false)
ON CONFLICT (id, prompt_type) DO NOTHING;

-- Create API Custom Fields Management table with Retell integration fields
create table if not exists "API_Custom_Fields_Management" (
  id bigserial primary key,
  "GHL_API_Key" text,
  "Calendar_ID" text,
  "Location_ID" text,
  "Assignee_ID" text,
  "OpenAI_API_key" text,
  "OpenRouter_API_key" text,
  "Chat_History_Table_Name" text,
  "Supabase_Service_Role_key" text,
  "Supabase_Project_URL" text,
  "Text_Engine_Webhook" text,
  "Text_Engine_Followup_Webhook" text,
  "retell_api_key" text,
  "retell_inbound_agent_id" text,
  "retell_outbound_agent_id" text,
  "retell_phone_1" text,
  "retell_phone_1_country_code" text,
  "retell_phone_2" text,
  "retell_phone_2_country_code" text,
  "retell_phone_3" text,
  "retell_phone_3_country_code" text,
  "Transfer_To_human_Inbound_Webhook" text,
  "User_Details_Inbound_Webhook" text,
  "Database_Reactivation_Inbound_Webhook" text,
  created_at timestamptz default now()
);


-- ═══════════════════════════════════════════════════════════
-- SECTION 2: App Tables (used by the Disruptors LAS platform)
-- ═══════════════════════════════════════════════════════════

create extension if not exists "uuid-ossp";

-- Campaigns (database reactivation campaigns)
create table if not exists campaigns (
  id uuid primary key default uuid_generate_v4(),
  campaign_name text not null,
  reactivation_notes text,
  webhook_url text,
  status text default 'pending',
  total_leads integer default 0,
  processed_leads integer default 0,
  days_of_week jsonb,
  start_time text,
  end_time text,
  timezone text,
  batch_size integer,
  batch_interval_minutes integer,
  lead_delay_seconds integer,
  scheduled_for timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Leads (contacts per campaign)
create table if not exists leads (
  id uuid primary key default uuid_generate_v4(),
  campaign_id uuid references campaigns(id) on delete cascade,
  name text,
  email text,
  phone text,
  status text default 'pending',
  error_message text,
  processed_at timestamptz,
  scheduled_for timestamptz,
  data jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Execution logs (campaign webhook execution history)
create table if not exists execution_logs (
  id uuid primary key default uuid_generate_v4(),
  campaign_id uuid references campaigns(id) on delete cascade,
  execution_time timestamptz default now(),
  webhook_response jsonb,
  created_at timestamptz default now()
);

-- Chat analytics
create table if not exists chat_analytics (
  id uuid primary key default uuid_generate_v4(),
  analytics_type text,
  time_range text,
  metrics jsonb,
  last_updated timestamptz default now(),
  created_at timestamptz default now()
);

-- Voice chat analytics
create table if not exists voice_chat_analytics (
  id uuid primary key default uuid_generate_v4(),
  analytics_type text,
  time_range text,
  metrics jsonb,
  last_updated timestamptz default now(),
  created_at timestamptz default now()
);

-- Custom metrics
create table if not exists custom_metrics (
  id uuid primary key default uuid_generate_v4(),
  analytics_type text,
  name text not null,
  description text,
  prompt text,
  color text,
  created_at timestamptz default now()
);

-- Client portal
create table if not exists client_portals (
  id uuid primary key default uuid_generate_v4(),
  name text default 'Client Onboarding Portal',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists portal_phases (
  id uuid primary key default uuid_generate_v4(),
  portal_id uuid references client_portals(id) on delete cascade,
  name text default 'New Phase',
  order_index integer default 0,
  created_at timestamptz default now()
);

create table if not exists portal_steps (
  id uuid primary key default uuid_generate_v4(),
  phase_id uuid references portal_phases(id) on delete cascade,
  name text default 'New Step',
  content jsonb default '{"blocks":[]}',
  created_at timestamptz default now()
);

create table if not exists portal_step_completions (
  id uuid primary key default uuid_generate_v4(),
  step_id uuid references portal_steps(id) on delete cascade,
  portal_id uuid references client_portals(id) on delete cascade,
  completed boolean default false,
  form_data jsonb,
  completed_at timestamptz,
  unique (step_id, portal_id)
);

create table if not exists portal_tasks (
  id uuid primary key default uuid_generate_v4(),
  step_id uuid references portal_steps(id) on delete cascade,
  name text,
  created_at timestamptz default now()
);

create table if not exists portal_task_completions (
  id uuid primary key default uuid_generate_v4(),
  task_id uuid references portal_tasks(id) on delete cascade,
  portal_id uuid references client_portals(id) on delete cascade,
  completed boolean default false,
  completed_at timestamptz,
  unique (task_id, portal_id)
);

-- Prompt chat threads (AI chat with prompts)
create table if not exists prompt_chat_threads (
  id uuid primary key default uuid_generate_v4(),
  title text default 'New Chat',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists prompt_chat_messages (
  id uuid primary key default uuid_generate_v4(),
  thread_id uuid references prompt_chat_threads(id) on delete cascade,
  role text,
  content text,
  message_type text default 'text',
  metadata jsonb,
  created_at timestamptz default now()
);

-- Webinar setup
create table if not exists webinar_setup (
  id uuid primary key default uuid_generate_v4(),
  webinar_url text,
  replay_url text,
  time_range text,
  metrics jsonb,
  last_updated timestamptz default now(),
  created_at timestamptz default now()
);


-- ═══════════════════════════════════════════════════════════
-- SECTION 3: Functions, Triggers, and Indexes
-- ═══════════════════════════════════════════════════════════

-- Delete campaign with all associated data
create or replace function delete_campaign_with_data(campaign_id_param uuid)
returns void as $$
begin
  delete from execution_logs where campaign_id = campaign_id_param;
  delete from leads where campaign_id = campaign_id_param;
  delete from campaigns where id = campaign_id_param;
end;
$$ language plpgsql;

-- Auto-update updated_at columns
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Apply trigger to documents table
drop trigger if exists update_documents_updated_at on documents;
create trigger update_documents_updated_at before update on documents
  for each row execute function update_updated_at_column();

-- Prevent deletion of prompt rows (fixed 12 slots)
create or replace function prevent_prompt_deletion()
returns trigger as $$
begin
  raise exception 'Deletion of prompt rows is not allowed.';
  return null;
end;
$$ language plpgsql;

drop trigger if exists prevent_prompts_deletion on prompts;
create trigger prevent_prompts_deletion
before delete on prompts
for each row
execute function prevent_prompt_deletion();

-- Prevent invalid prompt insertions (text: 0-8, voice: 0-5)
create or replace function prevent_prompt_insertion()
returns trigger as $$
begin
  if new.prompt_type = 'text' and (new.id < 0 or new.id > 8) then
    raise exception 'Text prompt IDs must be 0-8. ID % is not allowed.', new.id;
  end if;
  if new.prompt_type = 'voice' and (new.id < 0 or new.id > 5) then
    raise exception 'Voice prompt IDs must be 0-5. ID % is not allowed.', new.id;
  end if;
  return new;
end;
$$ language plpgsql;

drop trigger if exists prevent_invalid_prompts_insertion on prompts;
create trigger prevent_invalid_prompts_insertion
before insert on prompts
for each row
execute function prevent_prompt_insertion();

-- Indexes for n8n tables
create index if not exists documents_embedding_idx on documents using ivfflat (embedding vector_cosine_ops)
  with (lists = 100);
create index if not exists prompts_id_idx on prompts(id);
create index if not exists documents_created_at_idx on documents(created_at);
create index if not exists api_custom_fields_created_at_idx on "API_Custom_Fields_Management"(created_at);

-- Indexes for app tables
create index if not exists leads_campaign_id_idx on leads(campaign_id);
create index if not exists leads_status_idx on leads(status);
create index if not exists execution_logs_campaign_id_idx on execution_logs(campaign_id);
create index if not exists chat_analytics_type_idx on chat_analytics(analytics_type);
create index if not exists portal_phases_portal_id_idx on portal_phases(portal_id);
create index if not exists portal_steps_phase_id_idx on portal_steps(phase_id);
create index if not exists prompt_chat_messages_thread_id_idx on prompt_chat_messages(thread_id);
