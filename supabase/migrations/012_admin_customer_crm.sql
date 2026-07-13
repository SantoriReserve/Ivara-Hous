-- Admin CRM: private customer notes + tags (service-role only via app)

CREATE TABLE IF NOT EXISTS admin_customer_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_key TEXT NOT NULL,
  user_id UUID REFERENCES auth.users (id) ON DELETE SET NULL,
  purchase_id UUID REFERENCES purchases (id) ON DELETE SET NULL,
  body TEXT NOT NULL,
  created_by TEXT NOT NULL DEFAULT 'admin',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS admin_customer_notes_customer_key_idx
  ON admin_customer_notes (customer_key, created_at DESC);

CREATE TABLE IF NOT EXISTS admin_customer_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_key TEXT NOT NULL,
  user_id UUID REFERENCES auth.users (id) ON DELETE SET NULL,
  purchase_id UUID REFERENCES purchases (id) ON DELETE SET NULL,
  tag TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (customer_key, tag)
);

CREATE INDEX IF NOT EXISTS admin_customer_tags_tag_idx
  ON admin_customer_tags (tag);

CREATE INDEX IF NOT EXISTS admin_customer_tags_customer_key_idx
  ON admin_customer_tags (customer_key);

ALTER TABLE admin_customer_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_customer_tags ENABLE ROW LEVEL SECURITY;
