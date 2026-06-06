-- Email delivery tracking + future PDF attachment support

CREATE TABLE IF NOT EXISTS email_deliveries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users (id) ON DELETE SET NULL,
  purchase_id UUID REFERENCES purchases (id) ON DELETE SET NULL,
  plan_instance_id UUID REFERENCES plan_instances (id) ON DELETE SET NULL,
  email_type TEXT NOT NULL,
  recipient_email TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('sent', 'failed')),
  resend_id TEXT,
  attachment_url TEXT,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS email_deliveries_user_id_idx ON email_deliveries (user_id);
CREATE INDEX IF NOT EXISTS email_deliveries_purchase_id_idx ON email_deliveries (purchase_id);
CREATE INDEX IF NOT EXISTS email_deliveries_email_type_idx ON email_deliveries (email_type);
