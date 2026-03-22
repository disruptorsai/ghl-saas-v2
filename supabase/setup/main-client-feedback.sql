CREATE TABLE IF NOT EXISTS client_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  user_id uuid,
  user_email text,
  workflow text NOT NULL,  -- 'text_ai', 'voice_ai', 'campaigns', 'knowledge_base', 'deployment', 'general'
  rating integer CHECK (rating >= 1 AND rating <= 5),
  comment text,
  status text DEFAULT 'new',  -- 'new', 'reviewed', 'resolved'
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_client_feedback_client ON client_feedback(client_id);
CREATE INDEX idx_client_feedback_workflow ON client_feedback(workflow);
CREATE INDEX idx_client_feedback_status ON client_feedback(status);

ALTER TABLE client_feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view feedback for their clients"
  ON client_feedback FOR SELECT
  USING (client_id IN (SELECT id FROM clients WHERE agency_id = auth.uid()));

CREATE POLICY "Users can insert feedback"
  ON client_feedback FOR INSERT
  WITH CHECK (client_id IN (SELECT id FROM clients WHERE agency_id = auth.uid()));

CREATE POLICY "Users can update feedback status"
  ON client_feedback FOR UPDATE
  USING (client_id IN (SELECT id FROM clients WHERE agency_id = auth.uid()));
