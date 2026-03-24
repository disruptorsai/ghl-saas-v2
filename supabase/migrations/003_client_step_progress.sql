-- Client step progress using text step IDs (matches hardcoded module data)
-- Scoped per client, not per user — agency staff and client see the same progress

CREATE TABLE IF NOT EXISTS client_step_progress (
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  step_id TEXT NOT NULL,
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  PRIMARY KEY (client_id, step_id)
);

CREATE INDEX idx_client_step_progress_client ON client_step_progress(client_id);

ALTER TABLE client_step_progress ENABLE ROW LEVEL SECURITY;

-- Agency users can manage progress for their own clients
CREATE POLICY "Agency manages client progress" ON client_step_progress
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM clients WHERE clients.id = client_step_progress.client_id
      AND clients.agency_id = auth.uid()
    )
  );

-- Client-role users can manage their own progress
CREATE POLICY "Clients manage own progress" ON client_step_progress
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE profiles.id = auth.uid()
      AND profiles.client_id = client_step_progress.client_id
    )
  );
