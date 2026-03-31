-- Migration: Create module_content table with RLS policies
-- This table stores the instructions and video URLs for each step in each module.
-- Content is gated by client tier and per-client overrides.

CREATE TABLE IF NOT EXISTS module_content (
  module_id TEXT NOT NULL,
  step_id TEXT NOT NULL,
  instructions TEXT NOT NULL DEFAULT '',
  video_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (module_id, step_id)
);

ALTER TABLE module_content ENABLE ROW LEVEL SECURITY;

-- Agency users get full read access
CREATE POLICY "agency_full_access" ON module_content
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'agency'
    )
  );

-- Client users can only read content for unlocked modules
CREATE POLICY "client_module_access" ON module_content
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM profiles p
      JOIN clients c ON c.id = p.client_id
      WHERE p.id = auth.uid()
      AND p.role = 'client'
      AND (
        (c.module_overrides ? module_content.module_id
         AND (c.module_overrides->>module_content.module_id)::boolean = true)
        OR
        (
          NOT (c.module_overrides ? module_content.module_id)
          AND (
            c.tier = 'full_suite'
            OR (c.tier = 'growth' AND module_content.module_id IN (
              'welcome','api-setup','twilio-setup','voice-receptionist',
              'db-reactivation','lead-followup','appointment-reminders'
            ))
            OR (c.tier = 'starter' AND module_content.module_id IN (
              'welcome','api-setup','twilio-setup','voice-receptionist'
            ))
          )
        )
      )
      AND NOT (
        c.module_overrides ? module_content.module_id
        AND (c.module_overrides->>module_content.module_id)::boolean = false
      )
    )
  );
