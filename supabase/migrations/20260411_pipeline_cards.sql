-- =============================================
-- Pipeline Cards Migration
-- Creates pipeline_cards junction table and
-- adds configurable entity types + card fields to pipelines
-- =============================================

-- 1. Create pipeline_cards table
CREATE TABLE IF NOT EXISTS public.pipeline_cards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pipeline_id UUID NOT NULL REFERENCES public.pipelines(id) ON DELETE CASCADE,
    stage_id UUID NOT NULL REFERENCES public.pipeline_stages(id) ON DELETE CASCADE,
    entity_type TEXT NOT NULL CHECK (entity_type IN ('lead', 'parent', 'student', 'tutor')),
    entity_id UUID NOT NULL,
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(pipeline_id, entity_type, entity_id)
);

-- 2. Add new columns to pipelines
ALTER TABLE public.pipelines
  ADD COLUMN IF NOT EXISTS allowed_entity_types TEXT[] NOT NULL DEFAULT '{lead}';

ALTER TABLE public.pipelines
  ADD COLUMN IF NOT EXISTS card_display_fields JSONB NOT NULL DEFAULT '{}';

-- 3. Migrate existing entity_type values to allowed_entity_types array
UPDATE public.pipelines
SET allowed_entity_types = ARRAY[entity_type]
WHERE allowed_entity_types = '{lead}' AND entity_type != 'lead';

-- 4. Set default card_display_fields for existing pipelines
UPDATE public.pipelines
SET card_display_fields = '{
  "lead": ["parent_name", "email", "enquiry_type"],
  "parent": ["first_name", "last_name", "email"],
  "student": ["first_name", "last_name", "school_year"],
  "tutor": ["first_name", "last_name", "email"]
}'::jsonb
WHERE card_display_fields = '{}';

-- 5. Migrate existing leads with stage_id into pipeline_cards
INSERT INTO public.pipeline_cards (pipeline_id, stage_id, entity_type, entity_id, sort_order)
SELECT
  l.pipeline_id,
  l.stage_id,
  'lead',
  l.id,
  0
FROM public.leads l
WHERE l.pipeline_id IS NOT NULL
  AND l.stage_id IS NOT NULL
  AND l.deleted_at IS NULL
ON CONFLICT DO NOTHING;

-- 6. Enable RLS
ALTER TABLE public.pipeline_cards ENABLE ROW LEVEL SECURITY;

-- 7. RLS Policies
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'pipeline_cards' AND policyname = 'pipeline_cards_select_all') THEN
    CREATE POLICY pipeline_cards_select_all ON public.pipeline_cards FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'pipeline_cards' AND policyname = 'pipeline_cards_insert_all') THEN
    CREATE POLICY pipeline_cards_insert_all ON public.pipeline_cards FOR INSERT WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'pipeline_cards' AND policyname = 'pipeline_cards_update_all') THEN
    CREATE POLICY pipeline_cards_update_all ON public.pipeline_cards FOR UPDATE USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'pipeline_cards' AND policyname = 'pipeline_cards_delete_all') THEN
    CREATE POLICY pipeline_cards_delete_all ON public.pipeline_cards FOR DELETE USING (true);
  END IF;
END $$;

-- 8. Indexes
CREATE INDEX IF NOT EXISTS idx_pipeline_cards_pipeline ON public.pipeline_cards(pipeline_id);
CREATE INDEX IF NOT EXISTS idx_pipeline_cards_stage ON public.pipeline_cards(stage_id);
CREATE INDEX IF NOT EXISTS idx_pipeline_cards_entity ON public.pipeline_cards(entity_type, entity_id);
