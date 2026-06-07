-- Email delivery analytics indexes for future admin dashboard

CREATE INDEX IF NOT EXISTS email_deliveries_created_at_idx
  ON email_deliveries (created_at DESC);

CREATE INDEX IF NOT EXISTS email_deliveries_status_idx
  ON email_deliveries (status);

CREATE INDEX IF NOT EXISTS email_deliveries_recipient_email_idx
  ON email_deliveries (recipient_email);
