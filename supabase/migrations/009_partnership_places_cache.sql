-- Partnership discovery cache: city geocodes, POI properties, location search results

CREATE TABLE IF NOT EXISTS partnership_city_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  location_hash TEXT NOT NULL UNIQUE,
  city_key TEXT NOT NULL DEFAULT '',
  state TEXT NOT NULL DEFAULT '',
  country TEXT NOT NULL DEFAULT '',
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  display_name TEXT NOT NULL DEFAULT '',
  geoapify_place_id TEXT,
  fetched_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '90 days'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS partnership_city_cache_expires_idx
  ON partnership_city_cache (expires_at);

CREATE TABLE IF NOT EXISTS partnership_places (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  external_id TEXT NOT NULL,
  source TEXT NOT NULL DEFAULT 'geoapify',
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  geoapify_categories TEXT[] NOT NULL DEFAULT '{}',
  address TEXT NOT NULL DEFAULT '',
  city_key TEXT NOT NULL DEFAULT '',
  state TEXT NOT NULL DEFAULT '',
  country TEXT NOT NULL DEFAULT '',
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  website TEXT,
  phone TEXT,
  image_url TEXT,
  image_source TEXT,
  raw_data JSONB,
  fetched_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '30 days'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (source, external_id)
);

CREATE INDEX IF NOT EXISTS partnership_places_city_country_idx
  ON partnership_places (city_key, country);

CREATE INDEX IF NOT EXISTS partnership_places_expires_idx
  ON partnership_places (expires_at);

CREATE TABLE IF NOT EXISTS partnership_location_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  location_hash TEXT NOT NULL UNIQUE,
  city_key TEXT NOT NULL DEFAULT '',
  state TEXT NOT NULL DEFAULT '',
  country TEXT NOT NULL DEFAULT '',
  location_label TEXT NOT NULL DEFAULT '',
  place_ids UUID[] NOT NULL DEFAULT '{}',
  result_count INTEGER NOT NULL DEFAULT 0,
  fetched_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '30 days'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS partnership_location_cache_expires_idx
  ON partnership_location_cache (expires_at);

CREATE TABLE IF NOT EXISTS partnership_search_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users (id) ON DELETE SET NULL,
  location_label TEXT NOT NULL DEFAULT '',
  city_key TEXT NOT NULL DEFAULT '',
  result_count INTEGER NOT NULL DEFAULT 0,
  cache_hit BOOLEAN NOT NULL DEFAULT false,
  source TEXT NOT NULL DEFAULT 'mixed',
  credits_used INTEGER NOT NULL DEFAULT 0,
  latency_ms INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS partnership_search_logs_user_idx
  ON partnership_search_logs (user_id, created_at DESC);

ALTER TABLE partnership_city_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE partnership_places ENABLE ROW LEVEL SECURITY;
ALTER TABLE partnership_location_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE partnership_search_logs ENABLE ROW LEVEL SECURITY;

-- Service role writes all cache tables; authenticated users read cached places only.

DO $$ BEGIN
  CREATE POLICY partnership_places_select_authenticated ON partnership_places
    FOR SELECT TO authenticated USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY partnership_search_logs_select_own ON partnership_search_logs
    FOR SELECT USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY partnership_search_logs_insert_own ON partnership_search_logs
    FOR INSERT WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
