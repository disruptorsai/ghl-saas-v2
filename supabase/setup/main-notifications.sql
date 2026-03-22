CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  user_id uuid,
  title text NOT NULL,
  message text NOT NULL,
  type text NOT NULL DEFAULT 'info',  -- 'info', 'success', 'warning', 'error'
  entity_type text,  -- 'campaign', 'lead', 'credential', etc.
  entity_id text,
  link text,  -- relative URL to navigate to
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_notifications_client_user ON notifications(client_id, user_id);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX idx_notifications_is_read ON notifications(is_read) WHERE is_read = false;

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their notifications"
  ON notifications FOR SELECT
  USING (client_id IN (SELECT id FROM clients WHERE agency_id = auth.uid()));

CREATE POLICY "Users can update their notifications"
  ON notifications FOR UPDATE
  USING (client_id IN (SELECT id FROM clients WHERE agency_id = auth.uid()));

CREATE POLICY "Users can insert notifications"
  ON notifications FOR INSERT
  WITH CHECK (client_id IN (SELECT id FROM clients WHERE agency_id = auth.uid()));
