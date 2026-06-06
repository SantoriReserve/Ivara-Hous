-- Phase 2: assessments + purchases (no auth tables yet)

CREATE TABLE IF NOT EXISTS assessments (
  id UUID PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  schema_version TEXT NOT NULL,
  source TEXT NOT NULL,
  answers JSONB NOT NULL,
  analysis JSONB NOT NULL,
  payment_status TEXT NOT NULL DEFAULT 'free' CHECK (payment_status IN ('free', 'paid')),
  submitted_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS assessments_email_idx ON assessments (email);

CREATE TABLE IF NOT EXISTS purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID REFERENCES assessments (id) ON DELETE SET NULL,
  customer_email TEXT NOT NULL,
  stripe_customer_id TEXT,
  stripe_checkout_session_id TEXT NOT NULL UNIQUE,
  stripe_payment_intent_id TEXT,
  product_slug TEXT NOT NULL,
  amount_cents INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'usd',
  status TEXT NOT NULL CHECK (status IN ('completed', 'refunded')),
  purchased_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS purchases_customer_email_idx ON purchases (customer_email);
CREATE INDEX IF NOT EXISTS purchases_assessment_id_idx ON purchases (assessment_id);
