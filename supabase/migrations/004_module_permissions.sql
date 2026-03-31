ALTER TABLE clients
  ADD COLUMN IF NOT EXISTS tier text NOT NULL DEFAULT 'full_suite',
  ADD COLUMN IF NOT EXISTS module_overrides jsonb NOT NULL DEFAULT '{}';

ALTER TABLE clients
  ADD CONSTRAINT clients_tier_check
  CHECK (tier IN ('starter', 'growth', 'full_suite'));
