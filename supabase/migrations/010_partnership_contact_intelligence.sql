-- Partnership contact intelligence cache fields

ALTER TABLE partnership_places
  ADD COLUMN IF NOT EXISTS instagram TEXT,
  ADD COLUMN IF NOT EXISTS contact_intelligence JSONB;

CREATE INDEX IF NOT EXISTS partnership_places_contact_intel_idx
  ON partnership_places ((contact_intelligence IS NOT NULL));
