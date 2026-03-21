-- Skool Integration Migration
-- Adds role-based auth, classroom content, and community members

-- Add role and client_id to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'agency' CHECK (role IN ('agency', 'client'));
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS client_id UUID REFERENCES clients(id) ON DELETE SET NULL;

-- Classroom modules (admin-managed content)
CREATE TABLE IF NOT EXISTS classroom_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  "order" INTEGER NOT NULL DEFAULT 0,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Classroom steps (lessons within modules)
CREATE TABLE IF NOT EXISTS classroom_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id UUID NOT NULL REFERENCES classroom_modules(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  media_url TEXT,
  media_type TEXT CHECK (media_type IN ('video', 'image', 'flowchart', 'embed')),
  instructions TEXT,
  type TEXT CHECK (type IN ('info', 'setup', 'config', 'demo')),
  "order" INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Progress tracking per user per step
CREATE TABLE IF NOT EXISTS classroom_progress (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  step_id UUID NOT NULL REFERENCES classroom_steps(id) ON DELETE CASCADE,
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  PRIMARY KEY (user_id, step_id)
);

-- Community members (profile for Skool members tab)
CREATE TABLE IF NOT EXISTS community_members (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  display_name TEXT,
  avatar_url TEXT,
  role_label TEXT,
  company TEXT,
  is_online BOOLEAN DEFAULT false,
  joined_at TIMESTAMPTZ DEFAULT now()
);

-- RLS Policies

-- classroom_modules: everyone reads, agency inserts/updates/deletes
ALTER TABLE classroom_modules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read modules" ON classroom_modules
  FOR SELECT USING (true);

CREATE POLICY "Agency can manage modules" ON classroom_modules
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'agency')
  );

-- classroom_steps: everyone reads, agency manages
ALTER TABLE classroom_steps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read steps" ON classroom_steps
  FOR SELECT USING (true);

CREATE POLICY "Agency can manage steps" ON classroom_steps
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'agency')
  );

-- classroom_progress: users manage their own
ALTER TABLE classroom_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own progress" ON classroom_progress
  FOR ALL USING (user_id = auth.uid());

-- community_members: everyone reads, users update own
ALTER TABLE community_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read members" ON community_members
  FOR SELECT USING (true);

CREATE POLICY "Users manage own member profile" ON community_members
  FOR ALL USING (user_id = auth.uid());
