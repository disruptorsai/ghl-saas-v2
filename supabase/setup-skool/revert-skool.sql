-- Revert skool integration
DROP POLICY IF EXISTS "Users manage own member profile" ON community_members;
DROP POLICY IF EXISTS "Anyone can read members" ON community_members;
DROP POLICY IF EXISTS "Users manage own progress" ON classroom_progress;
DROP POLICY IF EXISTS "Agency can manage steps" ON classroom_steps;
DROP POLICY IF EXISTS "Anyone can read steps" ON classroom_steps;
DROP POLICY IF EXISTS "Agency can manage modules" ON classroom_modules;
DROP POLICY IF EXISTS "Anyone can read modules" ON classroom_modules;

DROP TABLE IF EXISTS community_members;
DROP TABLE IF EXISTS classroom_progress;
DROP TABLE IF EXISTS classroom_steps;
DROP TABLE IF EXISTS classroom_modules;

ALTER TABLE profiles DROP COLUMN IF EXISTS client_id;
ALTER TABLE profiles DROP COLUMN IF EXISTS role;
