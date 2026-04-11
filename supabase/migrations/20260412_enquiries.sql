-- =============================================
-- Enquiries Architecture Migration
-- Creates the enquiries table for sales pipelines
-- and updates pipeline_cards to use 'enquiry'
-- instead of 'lead'
-- =============================================

-- 1. Create Enquiries table
CREATE TABLE IF NOT EXISTS public.enquiries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
    enquiry_type TEXT,
    message TEXT,
    students JSONB NOT NULL DEFAULT '[]'::jsonb, -- Array of { first_name, last_name, year_group, subjects }
    status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'won', 'lost', 'archived')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS
ALTER TABLE public.enquiries ENABLE ROW LEVEL SECURITY;
CREATE POLICY enquiries_all ON public.enquiries FOR ALL USING (true) WITH CHECK (true);

-- 2. Update pipeline_cards constraint
ALTER TABLE public.pipeline_cards DROP CONSTRAINT IF EXISTS pipeline_cards_entity_type_check;
ALTER TABLE public.pipeline_cards ADD CONSTRAINT pipeline_cards_entity_type_check 
  CHECK (entity_type IN ('lead', 'parent', 'student', 'tutor', 'enquiry'));

-- 3. Data Migration: convert pipeline leads to enquiries
DO $$ 
DECLARE
  card_record RECORD;
  new_enquiry_id UUID;
BEGIN
  FOR card_record IN 
    SELECT pc.id as card_id, l.id as lead_id, l.enquiry_type, l.message
    FROM public.pipeline_cards pc
    JOIN public.leads l ON l.id = pc.entity_id
    WHERE pc.entity_type = 'lead'
  LOOP
    -- Create corresponding enquiry, retaining the original data
    INSERT INTO public.enquiries (lead_id, enquiry_type, message)
    VALUES (card_record.lead_id, card_record.enquiry_type, card_record.message)
    RETURNING id INTO new_enquiry_id;

    -- Update the pipeline card to point to the new enquiry
    UPDATE public.pipeline_cards
    SET entity_type = 'enquiry',
        entity_id = new_enquiry_id
    WHERE id = card_record.card_id;
  END LOOP;
END $$;

-- 4. Update pipelines allowed_entity_types ('lead' -> 'enquiry')
UPDATE public.pipelines 
SET allowed_entity_types = array_replace(allowed_entity_types, 'lead', 'enquiry')
WHERE 'lead' = ANY(allowed_entity_types);

-- 5. Update pipeline card\_display\_fields JSON keys ('lead' -> 'enquiry')
UPDATE public.pipelines 
SET card_display_fields = (card_display_fields - 'lead') || jsonb_build_object('enquiry', card_display_fields->'lead')
WHERE card_display_fields ? 'lead';
