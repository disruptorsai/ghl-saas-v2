-- Audit logs table for tracking user actions
CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  user_id uuid,
  user_email text,
  action text NOT NULL,
  entity_type text NOT NULL,
  entity_id text,
  entity_name text,
  details jsonb DEFAULT '{}',
  ip_address text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_audit_logs_client_id ON audit_logs(client_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_entity_type ON audit_logs(entity_type);

-- RLS
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view audit logs for their clients"
  ON audit_logs FOR SELECT
  USING (client_id IN (
    SELECT id FROM clients WHERE agency_id = auth.uid()
  ));

CREATE POLICY "Users can insert audit logs for their clients"
  ON audit_logs FOR INSERT
  WITH CHECK (client_id IN (
    SELECT id FROM clients WHERE agency_id = auth.uid()
  ));
