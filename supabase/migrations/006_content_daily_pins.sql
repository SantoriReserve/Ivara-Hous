-- Daily content assignment pins (Today ↔ Content Library integration)

CREATE TABLE IF NOT EXISTS content_daily_pins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  day_number INTEGER NOT NULL,
  idea_id TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, day_number)
);

CREATE INDEX IF NOT EXISTS content_daily_pins_user_id_idx ON content_daily_pins (user_id);

ALTER TABLE content_daily_pins ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY content_daily_pins_select_own ON content_daily_pins
    FOR SELECT USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY content_daily_pins_insert_own ON content_daily_pins
    FOR INSERT WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY content_daily_pins_update_own ON content_daily_pins
    FOR UPDATE USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
