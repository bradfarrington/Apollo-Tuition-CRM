-- Migration for CRM Tags

-- 1. Create crm_tags table for the tag dictionary
CREATE TABLE IF NOT EXISTS public.crm_tags (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL UNIQUE,
  color text DEFAULT '#94a3b8',
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.crm_tags ENABLE ROW LEVEL SECURITY;

-- Add RLS Policies
CREATE POLICY "Enable read access for all users" ON public.crm_tags
  FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users only" ON public.crm_tags
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users only" ON public.crm_tags
  FOR UPDATE USING (auth.role() = 'authenticated');

-- 2. Add tags array to leads table
ALTER TABLE public.leads
  ADD COLUMN IF NOT EXISTS tags text[] DEFAULT '{}'::text[];
