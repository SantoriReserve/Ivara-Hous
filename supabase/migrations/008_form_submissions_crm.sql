-- CRM form submissions for admin dashboard (Make/Notion flows unchanged)

CREATE TABLE IF NOT EXISTS creator_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  location TEXT,
  instagram TEXT,
  niche TEXT,
  status TEXT NOT NULL DEFAULT 'new'
    CHECK (status IN ('new', 'reviewing', 'approved', 'declined', 'follow_up')),
  notes TEXT,
  source TEXT NOT NULL DEFAULT 'creator-application',
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS creator_applications_email_idx ON creator_applications (email);
CREATE INDEX IF NOT EXISTS creator_applications_status_idx ON creator_applications (status);
CREATE INDEX IF NOT EXISTS creator_applications_submitted_at_idx ON creator_applications (submitted_at DESC);

CREATE TABLE IF NOT EXISTS partner_inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  email TEXT NOT NULL,
  website TEXT,
  location TEXT,
  inquiry_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'new'
    CHECK (status IN ('new', 'contacted', 'in_conversation', 'partnered', 'not_fit')),
  notes TEXT,
  source TEXT NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS partner_inquiries_email_idx ON partner_inquiries (email);
CREATE INDEX IF NOT EXISTS partner_inquiries_status_idx ON partner_inquiries (status);
CREATE INDEX IF NOT EXISTS partner_inquiries_submitted_at_idx ON partner_inquiries (submitted_at DESC);

CREATE TABLE IF NOT EXISTS contact_inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  inquiry_type TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'new'
    CHECK (status IN ('new', 'replied', 'archived')),
  notes TEXT,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS contact_inquiries_email_idx ON contact_inquiries (email);
CREATE INDEX IF NOT EXISTS contact_inquiries_status_idx ON contact_inquiries (status);
CREATE INDEX IF NOT EXISTS contact_inquiries_submitted_at_idx ON contact_inquiries (submitted_at DESC);
