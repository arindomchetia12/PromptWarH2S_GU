CREATE TABLE IF NOT EXISTS schemes (
  id serial PRIMARY KEY,
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  category text NOT NULL,
  government_level text NOT NULL,
  regions jsonb NOT NULL DEFAULT '[]'::jsonb,
  intended_beneficiaries jsonb NOT NULL DEFAULT '[]'::jsonb,
  benefits jsonb NOT NULL DEFAULT '[]'::jsonb,
  criteria jsonb NOT NULL DEFAULT '{}'::jsonb,
  required_documents jsonb NOT NULL DEFAULT '[]'::jsonb,
  application_steps jsonb NOT NULL DEFAULT '[]'::jsonb,
  information_url text NOT NULL,
  application_url text NOT NULL,
  last_verified_at date,
  active boolean NOT NULL DEFAULT true,
  demo_data boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS schemes_active_category_idx
  ON schemes (active, category);
