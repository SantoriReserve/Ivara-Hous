-- Harden customer data isolation for auth/purchase onboarding.

-- email_deliveries is service-role only (no anon/authenticated policies).
ALTER TABLE email_deliveries ENABLE ROW LEVEL SECURITY;

-- Faster email lookups for onboarding / resend / webhook idempotency.
CREATE INDEX IF NOT EXISTS email_deliveries_purchase_type_status_idx
  ON email_deliveries (purchase_id, email_type, status)
  WHERE purchase_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS email_deliveries_recipient_type_created_idx
  ON email_deliveries (recipient_email, email_type, created_at DESC);
