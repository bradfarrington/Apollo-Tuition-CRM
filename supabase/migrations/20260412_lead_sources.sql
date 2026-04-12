-- =============================================
-- Lead Sources — dynamic "How did you hear about us?" list
-- =============================================

CREATE TABLE IF NOT EXISTS public.lead_sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.lead_sources ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'lead_sources' AND policyname = 'lead_sources_select_all') THEN
    CREATE POLICY lead_sources_select_all ON public.lead_sources FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'lead_sources' AND policyname = 'lead_sources_insert_all') THEN
    CREATE POLICY lead_sources_insert_all ON public.lead_sources FOR INSERT WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'lead_sources' AND policyname = 'lead_sources_update_all') THEN
    CREATE POLICY lead_sources_update_all ON public.lead_sources FOR UPDATE USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'lead_sources' AND policyname = 'lead_sources_delete_all') THEN
    CREATE POLICY lead_sources_delete_all ON public.lead_sources FOR DELETE USING (true);
  END IF;
END $$;

-- Seed with sensible defaults
INSERT INTO public.lead_sources (name, sort_order) VALUES
  ('Google Search', 0),
  ('Word of Mouth / Referral', 1),
  ('Social Media', 2),
  ('School Recommendation', 3),
  ('Website', 4),
  ('Flyer / Poster', 5),
  ('Returning Client', 6),
  ('Other', 7)
ON CONFLICT DO NOTHING;
