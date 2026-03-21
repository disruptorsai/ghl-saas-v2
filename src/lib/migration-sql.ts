/**
 * Migration SQL to create the Disruptors Infra schema in a client's Supabase project.
 * These tables match what the n8n workflows expect.
 *
 * Core n8n tables: documents (pgvector), prompts (text 0-8, voice 0-5), API_Custom_Fields_Management
 * App tables: campaigns, leads, execution_logs, analytics, portal, chat threads, webinar
 */
export const MIGRATION_STATEMENTS: string[] = [
  // ─── n8n core tables ───────────────────────────────────

  // Enable pgvector
  `CREATE EXTENSION IF NOT EXISTS vector`,

  // Documents: Knowledge base with vector embeddings
  `CREATE TABLE IF NOT EXISTS documents (
    id BIGSERIAL PRIMARY KEY,
    content TEXT,
    metadata JSONB,
    embedding VECTOR(1536),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
  )`,

  // Vector similarity search
  `CREATE OR REPLACE FUNCTION match_documents (
    query_embedding VECTOR(1536),
    match_count INT DEFAULT NULL,
    filter JSONB DEFAULT '{}'
  ) RETURNS TABLE (
    id BIGINT, content TEXT, metadata JSONB, similarity FLOAT
  ) LANGUAGE plpgsql AS $$
  #variable_conflict use_column
  BEGIN
    RETURN QUERY SELECT
      id, content, metadata,
      1 - (documents.embedding <=> query_embedding) AS similarity
    FROM documents
    WHERE metadata @> filter
    ORDER BY documents.embedding <=> query_embedding
    LIMIT match_count;
  END;
  $$`,

  // Prompts: Text (IDs 0-8) + Voice (IDs 0-5) with composite key
  `CREATE TABLE IF NOT EXISTS prompts (
    id INT4 NOT NULL,
    prompt_type TEXT NOT NULL CHECK (prompt_type IN ('text', 'voice')),
    category TEXT NOT NULL CHECK (category IN ('persona', 'main_agent', 'booking')),
    prompt_name TEXT NOT NULL DEFAULT '',
    description TEXT,
    content TEXT,
    is_active BOOLEAN DEFAULT FALSE,
    PRIMARY KEY (id, prompt_type)
  )`,

  // Text Prompts (IDs 0-8)
  `INSERT INTO prompts (id, prompt_type, category, prompt_name, description, is_active) VALUES
    (0, 'text', 'persona',    'Bot Persona',                'Defines the core personality, tone, and communication style of your text AI agent.',              false),
    (1, 'text', 'main_agent', 'Website Agent',              'Handles website visitor engagement and initial conversations.',                                   false),
    (2, 'text', 'main_agent', 'Engagement Agent',           'Multi-channel text engagement across iMessage, WhatsApp, and Email.',                             false),
    (3, 'text', 'main_agent', 'Follow-up Agent',            'Qualification agent for post-booking follow-up conversations.',                                   false),
    (4, 'text', 'main_agent', 'Text Agent 4',               'Custom agent for additional text-based use cases.',                                               false),
    (5, 'text', 'main_agent', 'Text Agent 5',               'Custom agent for additional text-based use cases.',                                               false),
    (6, 'text', 'main_agent', 'Text Agent 6',               'Custom agent for additional text-based use cases.',                                               false),
    (7, 'text', 'booking',    'Book Directly in Calendar',  'Handles appointment scheduling, checks calendar availability, and confirms bookings with leads.', false),
    (8, 'text', 'booking',    'Book Using Scheduling Link', 'Provides booking link for scheduling appointments.',                                              false)
  ON CONFLICT (id, prompt_type) DO NOTHING`,

  // Voice Prompts (IDs 0-5)
  `INSERT INTO prompts (id, prompt_type, category, prompt_name, description, is_active) VALUES
    (0, 'voice', 'persona',    'Voice Persona',             'Defines the core personality, tone, and communication style of your voice AI agent.',              false),
    (1, 'voice', 'main_agent', 'Inbound Agent',             'Handles inbound voice calls and inquiries.',                                                      false),
    (2, 'voice', 'main_agent', 'Outbound Agent',            'Handles outbound calling campaigns and cold outreach.',                                           false),
    (3, 'voice', 'main_agent', 'Webinar Followup Agent',    'Follow-up reminder agent that calls registrants before the event.',                               false),
    (4, 'voice', 'main_agent', 'Voice Agent 4',             'Custom voice agent for specialized outreach campaigns.',                                          false),
    (5, 'voice', 'booking',    'Booking Agent Functions',   'Voice agent for booking appointments and managing calendar interactions.',                         false)
  ON CONFLICT (id, prompt_type) DO NOTHING`,

  // API Custom Fields Management (n8n reads credentials from here)
  `CREATE TABLE IF NOT EXISTS "API_Custom_Fields_Management" (
    id BIGSERIAL PRIMARY KEY,
    "GHL_API_Key" TEXT,
    "Calendar_ID" TEXT,
    "Location_ID" TEXT,
    "Assignee_ID" TEXT,
    "OpenAI_API_key" TEXT,
    "OpenRouter_API_key" TEXT,
    "Chat_History_Table_Name" TEXT,
    "Supabase_Service_Role_key" TEXT,
    "Supabase_Project_URL" TEXT,
    "Text_Engine_Webhook" TEXT,
    "Text_Engine_Followup_Webhook" TEXT,
    "retell_api_key" TEXT,
    "retell_inbound_agent_id" TEXT,
    "retell_outbound_agent_id" TEXT,
    "retell_phone_1" TEXT,
    "retell_phone_1_country_code" TEXT,
    "retell_phone_2" TEXT,
    "retell_phone_2_country_code" TEXT,
    "retell_phone_3" TEXT,
    "retell_phone_3_country_code" TEXT,
    "Transfer_To_human_Inbound_Webhook" TEXT,
    "User_Details_Inbound_Webhook" TEXT,
    "Database_Reactivation_Inbound_Webhook" TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
  )`,

  // ─── App tables ────────────────────────────────────────

  `CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`,

  // Campaigns
  `CREATE TABLE IF NOT EXISTS campaigns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campaign_name TEXT NOT NULL,
    reactivation_notes TEXT,
    webhook_url TEXT,
    status TEXT DEFAULT 'pending',
    total_leads INTEGER DEFAULT 0,
    processed_leads INTEGER DEFAULT 0,
    days_of_week JSONB,
    start_time TEXT,
    end_time TEXT,
    timezone TEXT,
    batch_size INTEGER,
    batch_interval_minutes INTEGER,
    lead_delay_seconds INTEGER,
    scheduled_for TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
  )`,

  // Leads
  `CREATE TABLE IF NOT EXISTS leads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
    name TEXT,
    email TEXT,
    phone TEXT,
    status TEXT DEFAULT 'pending',
    error_message TEXT,
    processed_at TIMESTAMPTZ,
    scheduled_for TIMESTAMPTZ,
    data JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
  )`,

  // Execution logs
  `CREATE TABLE IF NOT EXISTS execution_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
    execution_time TIMESTAMPTZ DEFAULT NOW(),
    webhook_response JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
  )`,

  // Analytics
  `CREATE TABLE IF NOT EXISTS chat_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    analytics_type TEXT,
    time_range TEXT,
    metrics JSONB,
    last_updated TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
  )`,

  `CREATE TABLE IF NOT EXISTS voice_chat_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    analytics_type TEXT,
    time_range TEXT,
    metrics JSONB,
    last_updated TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
  )`,

  `CREATE TABLE IF NOT EXISTS custom_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    analytics_type TEXT,
    name TEXT NOT NULL,
    description TEXT,
    prompt TEXT,
    color TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
  )`,

  // Portal
  `CREATE TABLE IF NOT EXISTS client_portals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT DEFAULT 'Client Onboarding Portal',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
  )`,

  `CREATE TABLE IF NOT EXISTS portal_phases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    portal_id UUID REFERENCES client_portals(id) ON DELETE CASCADE,
    name TEXT DEFAULT 'New Phase',
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
  )`,

  `CREATE TABLE IF NOT EXISTS portal_steps (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    phase_id UUID REFERENCES portal_phases(id) ON DELETE CASCADE,
    name TEXT DEFAULT 'New Step',
    content JSONB DEFAULT '{"blocks":[]}',
    created_at TIMESTAMPTZ DEFAULT NOW()
  )`,

  `CREATE TABLE IF NOT EXISTS portal_step_completions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    step_id UUID REFERENCES portal_steps(id) ON DELETE CASCADE,
    portal_id UUID REFERENCES client_portals(id) ON DELETE CASCADE,
    completed BOOLEAN DEFAULT FALSE,
    form_data JSONB,
    completed_at TIMESTAMPTZ,
    UNIQUE (step_id, portal_id)
  )`,

  `CREATE TABLE IF NOT EXISTS portal_tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    step_id UUID REFERENCES portal_steps(id) ON DELETE CASCADE,
    name TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
  )`,

  `CREATE TABLE IF NOT EXISTS portal_task_completions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_id UUID REFERENCES portal_tasks(id) ON DELETE CASCADE,
    portal_id UUID REFERENCES client_portals(id) ON DELETE CASCADE,
    completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMPTZ,
    UNIQUE (task_id, portal_id)
  )`,

  // Chat threads
  `CREATE TABLE IF NOT EXISTS prompt_chat_threads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT DEFAULT 'New Chat',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
  )`,

  `CREATE TABLE IF NOT EXISTS prompt_chat_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    thread_id UUID REFERENCES prompt_chat_threads(id) ON DELETE CASCADE,
    role TEXT,
    content TEXT,
    message_type TEXT DEFAULT 'text',
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
  )`,

  // Webinar
  `CREATE TABLE IF NOT EXISTS webinar_setup (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    webinar_url TEXT,
    replay_url TEXT,
    time_range TEXT,
    metrics JSONB,
    last_updated TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
  )`,

  // ─── Functions ─────────────────────────────────────────

  `CREATE OR REPLACE FUNCTION delete_campaign_with_data(campaign_id_param UUID)
  RETURNS VOID AS $$
  BEGIN
    DELETE FROM execution_logs WHERE campaign_id = campaign_id_param;
    DELETE FROM leads WHERE campaign_id = campaign_id_param;
    DELETE FROM campaigns WHERE id = campaign_id_param;
  END;
  $$ LANGUAGE plpgsql`,

  // ─── Triggers ──────────────────────────────────────────

  // Prevent prompt deletion (fixed slots)
  `CREATE OR REPLACE FUNCTION prevent_prompt_deletion()
  RETURNS TRIGGER AS $$ BEGIN RAISE EXCEPTION 'Deletion of prompt rows is not allowed.'; RETURN NULL; END; $$ LANGUAGE plpgsql`,

  `DROP TRIGGER IF EXISTS prevent_prompts_deletion ON prompts`,
  `CREATE TRIGGER prevent_prompts_deletion BEFORE DELETE ON prompts FOR EACH ROW EXECUTE FUNCTION prevent_prompt_deletion()`,

  // Prevent invalid prompt insertions (text: 0-8, voice: 0-5)
  `CREATE OR REPLACE FUNCTION prevent_prompt_insertion()
  RETURNS TRIGGER AS $$
  BEGIN
    IF NEW.prompt_type = 'text' AND (NEW.id < 0 OR NEW.id > 8) THEN
      RAISE EXCEPTION 'Text prompt IDs must be 0-8. ID % is not allowed.', NEW.id;
    END IF;
    IF NEW.prompt_type = 'voice' AND (NEW.id < 0 OR NEW.id > 5) THEN
      RAISE EXCEPTION 'Voice prompt IDs must be 0-5. ID % is not allowed.', NEW.id;
    END IF;
    RETURN NEW;
  END;
  $$ LANGUAGE plpgsql`,

  `DROP TRIGGER IF EXISTS prevent_invalid_prompts_insertion ON prompts`,
  `CREATE TRIGGER prevent_invalid_prompts_insertion BEFORE INSERT ON prompts FOR EACH ROW EXECUTE FUNCTION prevent_prompt_insertion()`,

  // Auto-update documents.updated_at
  `CREATE OR REPLACE FUNCTION update_updated_at_column()
  RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = NOW(); RETURN NEW; END; $$ LANGUAGE plpgsql`,

  `DROP TRIGGER IF EXISTS update_documents_updated_at ON documents`,
  `CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON documents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()`,

  // ─── Indexes ───────────────────────────────────────────

  `CREATE INDEX IF NOT EXISTS documents_created_at_idx ON documents(created_at)`,
  `CREATE INDEX IF NOT EXISTS leads_campaign_id_idx ON leads(campaign_id)`,
  `CREATE INDEX IF NOT EXISTS leads_status_idx ON leads(status)`,
  `CREATE INDEX IF NOT EXISTS execution_logs_campaign_id_idx ON execution_logs(campaign_id)`,
]

/** Full migration as a single SQL string (for copy-paste fallback). */
export const MIGRATION_SQL = MIGRATION_STATEMENTS.map((s) => s + ';').join('\n\n')
