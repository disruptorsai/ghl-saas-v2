-- ============================================================
-- MAIN SUPABASE MIGRATION (Platform DB)
-- Run this in YOUR main Supabase project SQL Editor
-- This stores: auth, user profiles, clients, demo pages, support chat
-- ============================================================

-- ─── Profiles ──────────────────────────────────────────────
-- Auto-created on user signup via trigger
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  logo_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name')
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ─── Clients ───────────────────────────────────────────────
-- Central table for all client metadata, credentials, and Supabase connection info
create table if not exists clients (
  id uuid primary key default gen_random_uuid(),
  agency_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  email text,
  description text,
  image_url text,
  logo_url text,
  sort_order integer default 0,

  -- Client Supabase connection
  supabase_url text,
  supabase_service_key text,
  migration_status text,        -- 'pending' | 'running' | 'completed' | 'failed'
  migration_error text,

  -- AI API Keys
  openrouter_api_key text,
  openai_api_key text,

  -- GoHighLevel
  ghl_api_key text,
  ghl_location_id text,
  ghl_calendar_id text,
  ghl_assignee_id text,

  -- Retell AI
  retell_api_key text,
  retell_inbound_agent_id text,
  retell_outbound_agent_id text,
  retell_outbound_followup_agent_id text,
  retell_agent_id_4 text,
  retell_phone_1 text,
  retell_phone_2 text,
  retell_phone_3 text,

  -- Webhook URLs
  prompt_webhook_url text,
  knowledge_base_add_webhook_url text,
  knowledge_base_delete_webhook_url text,
  text_engine_webhook text,
  text_engine_followup_webhook text,
  transfer_to_human_webhook_url text,
  user_details_webhook_url text,
  update_pipeline_webhook_url text,
  lead_score_webhook_url text,
  save_reply_webhook_url text,
  outbound_caller_webhook_1_url text,
  outbound_caller_webhook_2_url text,
  outbound_caller_webhook_3_url text,
  database_reactivation_inbound_webhook_url text,
  campaign_webhook_url text,
  analytics_webhook_url text,
  ai_chat_webhook_url text,

  -- Module access
  tier text not null default 'full_suite',
  module_overrides jsonb not null default '{}',

  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- RPC to delete a client and all associated data
create or replace function delete_client_with_data(client_id_param uuid)
returns void as $$
begin
  delete from support_chat_messages where client_id = client_id_param;
  delete from clients where id = client_id_param;
end;
$$ language plpgsql security definer;

-- ─── Demo Pages ────────────────────────────────────────────
-- Public-facing demo/landing pages with drag-and-drop sections
create table if not exists demo_pages (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  sections jsonb default '[]',
  published_sections jsonb,
  is_published boolean default false,
  text_ai_webhook_url text,
  voice_phone_number text,
  voice_phone_country_code text,
  phone_call_webhook_url text,
  form_ai_webhook_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ─── Support Chat Messages ─────────────────────────────────
-- In-app support chat history per client
create table if not exists support_chat_messages (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references clients(id) on delete cascade not null,
  role text not null,         -- 'user' | 'assistant'
  content text not null,
  created_at timestamptz default now()
);

-- ─── Indexes ───────────────────────────────────────────────
create index if not exists clients_agency_id_idx on clients(agency_id);
create index if not exists clients_sort_order_idx on clients(sort_order);
create index if not exists demo_pages_slug_idx on demo_pages(slug);
create index if not exists demo_pages_is_published_idx on demo_pages(is_published);
create index if not exists support_chat_client_id_idx on support_chat_messages(client_id);
create index if not exists support_chat_created_at_idx on support_chat_messages(created_at);

-- ─── RLS Policies ──────────────────────────────────────────
alter table profiles enable row level security;
alter table clients enable row level security;
alter table demo_pages enable row level security;
alter table support_chat_messages enable row level security;

-- Profiles: users can only read/update their own
create policy "Users can view own profile" on profiles
  for select using (auth.uid() = id);
create policy "Users can update own profile" on profiles
  for update using (auth.uid() = id);

-- Clients: users can only access their own clients
create policy "Users can view own clients" on clients
  for select using (auth.uid() = agency_id);
create policy "Users can create clients" on clients
  for insert with check (auth.uid() = agency_id);
create policy "Users can update own clients" on clients
  for update using (auth.uid() = agency_id);
create policy "Users can delete own clients" on clients
  for delete using (auth.uid() = agency_id);

-- Demo pages: all authenticated users (adjust as needed)
create policy "Authenticated users can manage demo pages" on demo_pages
  for all using (auth.role() = 'authenticated');

-- Public read for published demo pages (for public-facing pages)
create policy "Anyone can view published demo pages" on demo_pages
  for select using (is_published = true);

-- Support chat: users can access messages for their own clients
create policy "Users can view own support messages" on support_chat_messages
  for select using (
    client_id in (select id from clients where agency_id = auth.uid())
  );
create policy "Users can create support messages" on support_chat_messages
  for insert with check (
    client_id in (select id from clients where agency_id = auth.uid())
  );

-- ─── Storage Buckets ───────────────────────────────────────
-- Run these via the Supabase Dashboard > Storage, or use:
-- insert into storage.buckets (id, name, public) values ('logos', 'logos', true);
-- insert into storage.buckets (id, name, public) values ('demo-assets', 'demo-assets', true);

-- ─── Realtime ──────────────────────────────────────────────
-- Enable realtime on clients table (for live updates in sidebar)
alter publication supabase_realtime add table clients;
