-- ============================================================
-- MAIN SUPABASE — FULL SETUP (Platform DB + Skool Community)
-- Run this in YOUR main Supabase project SQL Editor
-- Includes: auth, profiles (with roles), clients, demo pages,
--           support chat, classroom, community members,
--           audit logs, notifications, client feedback
-- ============================================================


-- ═══════════════════════════════════════════════════════════
-- SECTION 1: Core Tables
-- ═══════════════════════════════════════════════════════════

-- ─── Profiles ──────────────────────────────────────────────
-- Auto-created on user signup via trigger
-- role: 'agency' (admin users) or 'client' (client users)
-- client_id: links client-role users to their assigned client
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  logo_url text,
  role text default 'agency' check (role in ('agency', 'client')),
  client_id uuid,  -- references clients(id), added after clients table
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
  campaign_orchestrator_webhook_url text,
  analytics_webhook_url text,
  ai_chat_webhook_url text,

  -- n8n
  n8n_base_url text,
  n8n_api_key text,

  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Now add the foreign key from profiles.client_id -> clients.id
alter table profiles add constraint profiles_client_id_fkey
  foreign key (client_id) references clients(id) on delete set null;

-- RPC to delete a client and all associated data
create or replace function delete_client_with_data(client_id_param uuid)
returns void as $$
begin
  delete from support_chat_messages where client_id = client_id_param;
  delete from clients where id = client_id_param;
end;
$$ language plpgsql security definer;


-- ═══════════════════════════════════════════════════════════
-- SECTION 2: Demo Pages + Support Chat
-- ═══════════════════════════════════════════════════════════

-- ─── Demo Pages ────────────────────────────────────────────
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
create table if not exists support_chat_messages (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references clients(id) on delete cascade not null,
  role text not null,         -- 'user' | 'assistant'
  content text not null,
  created_at timestamptz default now()
);


-- ═══════════════════════════════════════════════════════════
-- SECTION 3: Audit Logs + Notifications + Client Feedback
-- ═══════════════════════════════════════════════════════════

-- ─── Audit Logs ────────────────────────────────────────────
create table if not exists audit_logs (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references clients(id) on delete cascade not null,
  user_id uuid references auth.users(id),
  action text not null,
  entity_type text,
  entity_id text,
  details jsonb,
  created_at timestamptz default now()
);

-- ─── Notifications ─────────────────────────────────────────
create table if not exists notifications (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references clients(id) on delete cascade not null,
  user_id uuid references auth.users(id),
  title text not null,
  message text,
  type text default 'info',   -- 'info' | 'success' | 'warning' | 'error'
  is_read boolean default false,
  entity_type text,
  entity_id text,
  link text,
  created_at timestamptz default now()
);

-- ─── Client Feedback ───────────────────────────────────────
create table if not exists client_feedback (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references clients(id) on delete cascade not null,
  user_id uuid references auth.users(id),
  category text not null,     -- 'bug' | 'feature' | 'improvement' | 'other'
  priority text default 'medium',
  subject text not null,
  description text,
  status text default 'open', -- 'open' | 'in_progress' | 'resolved' | 'closed'
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);


-- ═══════════════════════════════════════════════════════════
-- SECTION 4: Skool Community Tables
-- ═══════════════════════════════════════════════════════════

-- ─── Classroom Modules (admin-managed content) ─────────────
create table if not exists classroom_modules (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  thumbnail_url text,
  "order" integer not null default 0,
  created_by uuid references auth.users(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ─── Classroom Steps (lessons within modules) ──────────────
create table if not exists classroom_steps (
  id uuid primary key default gen_random_uuid(),
  module_id uuid not null references classroom_modules(id) on delete cascade,
  title text not null,
  description text,
  media_url text,
  media_type text check (media_type in ('video', 'image', 'flowchart', 'embed')),
  instructions text,
  type text check (type in ('info', 'setup', 'config', 'demo')),
  "order" integer not null default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ─── Classroom Progress (per user per step) ────────────────
create table if not exists classroom_progress (
  user_id uuid not null references auth.users(id) on delete cascade,
  step_id uuid not null references classroom_steps(id) on delete cascade,
  completed boolean default false,
  completed_at timestamptz,
  primary key (user_id, step_id)
);

-- ─── Community Members (Skool members tab) ─────────────────
create table if not exists community_members (
  user_id uuid not null references auth.users(id) on delete cascade primary key,
  display_name text,
  avatar_url text,
  role_label text,
  company text,
  is_online boolean default false,
  joined_at timestamptz default now()
);


-- ═══════════════════════════════════════════════════════════
-- SECTION 5: Indexes
-- ═══════════════════════════════════════════════════════════

create index if not exists clients_agency_id_idx on clients(agency_id);
create index if not exists clients_sort_order_idx on clients(sort_order);
create index if not exists demo_pages_slug_idx on demo_pages(slug);
create index if not exists demo_pages_is_published_idx on demo_pages(is_published);
create index if not exists support_chat_client_id_idx on support_chat_messages(client_id);
create index if not exists support_chat_created_at_idx on support_chat_messages(created_at);
create index if not exists audit_logs_client_id_idx on audit_logs(client_id);
create index if not exists audit_logs_created_at_idx on audit_logs(created_at);
create index if not exists notifications_client_id_idx on notifications(client_id);
create index if not exists notifications_user_id_idx on notifications(user_id);
create index if not exists client_feedback_client_id_idx on client_feedback(client_id);
create index if not exists classroom_modules_order_idx on classroom_modules("order");
create index if not exists classroom_steps_module_id_idx on classroom_steps(module_id);


-- ═══════════════════════════════════════════════════════════
-- SECTION 6: RLS Policies
-- ═══════════════════════════════════════════════════════════

alter table profiles enable row level security;
alter table clients enable row level security;
alter table demo_pages enable row level security;
alter table support_chat_messages enable row level security;
alter table audit_logs enable row level security;
alter table notifications enable row level security;
alter table client_feedback enable row level security;
alter table classroom_modules enable row level security;
alter table classroom_steps enable row level security;
alter table classroom_progress enable row level security;
alter table community_members enable row level security;

-- Profiles: users can only read/update their own
create policy "Users can view own profile" on profiles
  for select using (auth.uid() = id);
create policy "Users can update own profile" on profiles
  for update using (auth.uid() = id);

-- Clients: agency users can CRUD their own clients
create policy "Agency can view own clients" on clients
  for select using (auth.uid() = agency_id);
create policy "Agency can create clients" on clients
  for insert with check (auth.uid() = agency_id);
create policy "Agency can update own clients" on clients
  for update using (auth.uid() = agency_id);
create policy "Agency can delete own clients" on clients
  for delete using (auth.uid() = agency_id);

-- Clients: client-role users can read their assigned client
create policy "Client users can read own client" on clients
  for select using (
    id in (select client_id from profiles where id = auth.uid() and role = 'client')
  );

-- Demo pages
create policy "Authenticated users can manage demo pages" on demo_pages
  for all using (auth.role() = 'authenticated');
create policy "Anyone can view published demo pages" on demo_pages
  for select using (is_published = true);

-- Support chat
create policy "Users can view own support messages" on support_chat_messages
  for select using (
    client_id in (select id from clients where agency_id = auth.uid())
  );
create policy "Users can create support messages" on support_chat_messages
  for insert with check (
    client_id in (select id from clients where agency_id = auth.uid())
  );

-- Audit logs: users can view logs for their own clients
create policy "Users can view own audit logs" on audit_logs
  for select using (
    client_id in (select id from clients where agency_id = auth.uid())
  );
create policy "Users can create audit logs" on audit_logs
  for insert with check (
    client_id in (select id from clients where agency_id = auth.uid())
  );

-- Notifications: users can manage their own
create policy "Users can view own notifications" on notifications
  for select using (user_id = auth.uid());
create policy "Users can update own notifications" on notifications
  for update using (user_id = auth.uid());
create policy "Users can create notifications" on notifications
  for insert with check (user_id = auth.uid());

-- Client feedback: users can manage feedback for their clients
create policy "Users can view own feedback" on client_feedback
  for select using (
    client_id in (select id from clients where agency_id = auth.uid())
  );
create policy "Users can create feedback" on client_feedback
  for insert with check (
    client_id in (select id from clients where agency_id = auth.uid())
  );
create policy "Users can update own feedback" on client_feedback
  for update using (
    client_id in (select id from clients where agency_id = auth.uid())
  );

-- Classroom: everyone reads, agency manages
create policy "Anyone can read modules" on classroom_modules
  for select using (true);
create policy "Agency can manage modules" on classroom_modules
  for all using (
    exists (select 1 from profiles where id = auth.uid() and role = 'agency')
  );

create policy "Anyone can read steps" on classroom_steps
  for select using (true);
create policy "Agency can manage steps" on classroom_steps
  for all using (
    exists (select 1 from profiles where id = auth.uid() and role = 'agency')
  );

-- Progress: users manage their own
create policy "Users manage own progress" on classroom_progress
  for all using (user_id = auth.uid());

-- Community members: everyone reads, users manage own
create policy "Anyone can read members" on community_members
  for select using (true);
create policy "Users manage own member profile" on community_members
  for all using (user_id = auth.uid());


-- ═══════════════════════════════════════════════════════════
-- SECTION 7: Storage + Realtime
-- ═══════════════════════════════════════════════════════════

-- Storage buckets (run via Dashboard > Storage if SQL doesn't work):
-- insert into storage.buckets (id, name, public) values ('logos', 'logos', true);
-- insert into storage.buckets (id, name, public) values ('demo-assets', 'demo-assets', true);

-- Enable realtime on clients table (for live updates)
alter publication supabase_realtime add table clients;
