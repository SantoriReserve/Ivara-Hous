-- Dashboard engagement: content tracking + learning insights

CREATE TABLE IF NOT EXISTS content_idea_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  idea_id TEXT NOT NULL,
  planned BOOLEAN NOT NULL DEFAULT false,
  filmed BOOLEAN NOT NULL DEFAULT false,
  edited BOOLEAN NOT NULL DEFAULT false,
  posted BOOLEAN NOT NULL DEFAULT false,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, idea_id)
);

CREATE INDEX IF NOT EXISTS content_idea_progress_user_id_idx ON content_idea_progress (user_id);

CREATE TABLE IF NOT EXISTS learning_insight_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  insight_id TEXT NOT NULL,
  day_number INTEGER,
  prompt TEXT NOT NULL,
  response TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, insight_id, day_number)
);

CREATE INDEX IF NOT EXISTS learning_insight_responses_user_id_idx ON learning_insight_responses (user_id);

ALTER TABLE content_idea_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_insight_responses ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY content_idea_progress_select_own ON content_idea_progress
    FOR SELECT USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY content_idea_progress_insert_own ON content_idea_progress
    FOR INSERT WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY content_idea_progress_update_own ON content_idea_progress
    FOR UPDATE USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY learning_insight_responses_select_own ON learning_insight_responses
    FOR SELECT USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY learning_insight_responses_insert_own ON learning_insight_responses
    FOR INSERT WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY learning_insight_responses_update_own ON learning_insight_responses
    FOR UPDATE USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
