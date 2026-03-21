-- Allow client-role users to read their assigned client row
-- This adds a SELECT policy so clients can see their own client data

-- Drop existing select policy on clients if it only allows agency
-- First check what exists and add a new policy for client users
CREATE POLICY "Client users can read own client" ON clients
  FOR SELECT USING (
    id IN (SELECT client_id FROM profiles WHERE id = auth.uid() AND role = 'client')
  );

-- Allow client-role users to read data scoped to their client_id
-- campaigns
CREATE POLICY "Client users can read own campaigns" ON campaigns
  FOR SELECT USING (
    client_id IN (SELECT client_id FROM profiles WHERE id = auth.uid() AND role = 'client')
  );

-- leads
CREATE POLICY "Client users can read own leads" ON leads
  FOR SELECT USING (
    client_id IN (SELECT client_id FROM profiles WHERE id = auth.uid() AND role = 'client')
  );

-- prompts
CREATE POLICY "Client users can read own prompts" ON prompts
  FOR SELECT USING (
    client_id IN (SELECT client_id FROM profiles WHERE id = auth.uid() AND role = 'client')
  );

-- knowledge_base
CREATE POLICY "Client users can read own kb" ON knowledge_base
  FOR SELECT USING (
    client_id IN (SELECT client_id FROM profiles WHERE id = auth.uid() AND role = 'client')
  );
