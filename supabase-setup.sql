-- =============================================
-- Apollo Tuition CRM — Supabase Setup Script
-- Run this in your Supabase SQL Editor:
-- Dashboard → SQL Editor → New Query → Paste → Run
-- =============================================

-- =============================================
-- 1. CREATE MISSING TABLES
-- =============================================

-- Subjects table
CREATE TABLE IF NOT EXISTS public.subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  colour TEXT NOT NULL DEFAULT '#a5acff',
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Student ↔ Subject junction table
CREATE TABLE IF NOT EXISTS public.student_subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(student_id, subject_id)
);

-- Student Notes
CREATE TABLE IF NOT EXISTS public.student_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'Untitled Note',
  content TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================
-- 2. ENABLE RLS ON NEW TABLES
-- =============================================

ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_notes ENABLE ROW LEVEL SECURITY;

-- =============================================
-- 3. ADD PERMISSIVE RLS POLICIES (all tables)
-- Allows anon key full CRUD access for the internal CRM.
-- Replace with auth-based policies when login is added.
-- =============================================

-- Helper: create permissive policies for a table
-- We use DO blocks to avoid errors if policies already exist.

-- SUBJECTS
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'subjects' AND policyname = 'subjects_select_all') THEN
    CREATE POLICY subjects_select_all ON public.subjects FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'subjects' AND policyname = 'subjects_insert_all') THEN
    CREATE POLICY subjects_insert_all ON public.subjects FOR INSERT WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'subjects' AND policyname = 'subjects_update_all') THEN
    CREATE POLICY subjects_update_all ON public.subjects FOR UPDATE USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'subjects' AND policyname = 'subjects_delete_all') THEN
    CREATE POLICY subjects_delete_all ON public.subjects FOR DELETE USING (true);
  END IF;
END $$;

-- STUDENT_SUBJECTS
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'student_subjects' AND policyname = 'student_subjects_select_all') THEN
    CREATE POLICY student_subjects_select_all ON public.student_subjects FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'student_subjects' AND policyname = 'student_subjects_insert_all') THEN
    CREATE POLICY student_subjects_insert_all ON public.student_subjects FOR INSERT WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'student_subjects' AND policyname = 'student_subjects_update_all') THEN
    CREATE POLICY student_subjects_update_all ON public.student_subjects FOR UPDATE USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'student_subjects' AND policyname = 'student_subjects_delete_all') THEN
    CREATE POLICY student_subjects_delete_all ON public.student_subjects FOR DELETE USING (true);
  END IF;
END $$;

-- STUDENT_NOTES
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'student_notes' AND policyname = 'student_notes_select_all') THEN
    CREATE POLICY student_notes_select_all ON public.student_notes FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'student_notes' AND policyname = 'student_notes_insert_all') THEN
    CREATE POLICY student_notes_insert_all ON public.student_notes FOR INSERT WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'student_notes' AND policyname = 'student_notes_update_all') THEN
    CREATE POLICY student_notes_update_all ON public.student_notes FOR UPDATE USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'student_notes' AND policyname = 'student_notes_delete_all') THEN
    CREATE POLICY student_notes_delete_all ON public.student_notes FOR DELETE USING (true);
  END IF;
END $$;

-- STUDENTS (existing table — add policies if missing)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'students' AND policyname = 'students_select_all') THEN
    CREATE POLICY students_select_all ON public.students FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'students' AND policyname = 'students_insert_all') THEN
    CREATE POLICY students_insert_all ON public.students FOR INSERT WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'students' AND policyname = 'students_update_all') THEN
    CREATE POLICY students_update_all ON public.students FOR UPDATE USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'students' AND policyname = 'students_delete_all') THEN
    CREATE POLICY students_delete_all ON public.students FOR DELETE USING (true);
  END IF;
END $$;

-- PARENTS
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'parents' AND policyname = 'parents_select_all') THEN
    CREATE POLICY parents_select_all ON public.parents FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'parents' AND policyname = 'parents_insert_all') THEN
    CREATE POLICY parents_insert_all ON public.parents FOR INSERT WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'parents' AND policyname = 'parents_update_all') THEN
    CREATE POLICY parents_update_all ON public.parents FOR UPDATE USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'parents' AND policyname = 'parents_delete_all') THEN
    CREATE POLICY parents_delete_all ON public.parents FOR DELETE USING (true);
  END IF;
END $$;

-- TUTORS
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'tutors' AND policyname = 'tutors_select_all') THEN
    CREATE POLICY tutors_select_all ON public.tutors FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'tutors' AND policyname = 'tutors_insert_all') THEN
    CREATE POLICY tutors_insert_all ON public.tutors FOR INSERT WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'tutors' AND policyname = 'tutors_update_all') THEN
    CREATE POLICY tutors_update_all ON public.tutors FOR UPDATE USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'tutors' AND policyname = 'tutors_delete_all') THEN
    CREATE POLICY tutors_delete_all ON public.tutors FOR DELETE USING (true);
  END IF;
END $$;

-- LEADS
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'leads' AND policyname = 'leads_select_all') THEN
    CREATE POLICY leads_select_all ON public.leads FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'leads' AND policyname = 'leads_insert_all') THEN
    CREATE POLICY leads_insert_all ON public.leads FOR INSERT WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'leads' AND policyname = 'leads_update_all') THEN
    CREATE POLICY leads_update_all ON public.leads FOR UPDATE USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'leads' AND policyname = 'leads_delete_all') THEN
    CREATE POLICY leads_delete_all ON public.leads FOR DELETE USING (true);
  END IF;
END $$;

-- PIPELINES
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'pipelines' AND policyname = 'pipelines_select_all') THEN
    CREATE POLICY pipelines_select_all ON public.pipelines FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'pipelines' AND policyname = 'pipelines_insert_all') THEN
    CREATE POLICY pipelines_insert_all ON public.pipelines FOR INSERT WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'pipelines' AND policyname = 'pipelines_update_all') THEN
    CREATE POLICY pipelines_update_all ON public.pipelines FOR UPDATE USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'pipelines' AND policyname = 'pipelines_delete_all') THEN
    CREATE POLICY pipelines_delete_all ON public.pipelines FOR DELETE USING (true);
  END IF;
END $$;

-- PIPELINE_STAGES
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'pipeline_stages' AND policyname = 'pipeline_stages_select_all') THEN
    CREATE POLICY pipeline_stages_select_all ON public.pipeline_stages FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'pipeline_stages' AND policyname = 'pipeline_stages_insert_all') THEN
    CREATE POLICY pipeline_stages_insert_all ON public.pipeline_stages FOR INSERT WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'pipeline_stages' AND policyname = 'pipeline_stages_update_all') THEN
    CREATE POLICY pipeline_stages_update_all ON public.pipeline_stages FOR UPDATE USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'pipeline_stages' AND policyname = 'pipeline_stages_delete_all') THEN
    CREATE POLICY pipeline_stages_delete_all ON public.pipeline_stages FOR DELETE USING (true);
  END IF;
END $$;

-- CUSTOM_FIELDS
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'custom_fields' AND policyname = 'custom_fields_select_all') THEN
    CREATE POLICY custom_fields_select_all ON public.custom_fields FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'custom_fields' AND policyname = 'custom_fields_insert_all') THEN
    CREATE POLICY custom_fields_insert_all ON public.custom_fields FOR INSERT WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'custom_fields' AND policyname = 'custom_fields_update_all') THEN
    CREATE POLICY custom_fields_update_all ON public.custom_fields FOR UPDATE USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'custom_fields' AND policyname = 'custom_fields_delete_all') THEN
    CREATE POLICY custom_fields_delete_all ON public.custom_fields FOR DELETE USING (true);
  END IF;
END $$;

-- CUSTOM_FIELD_VALUES
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'custom_field_values' AND policyname = 'custom_field_values_select_all') THEN
    CREATE POLICY custom_field_values_select_all ON public.custom_field_values FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'custom_field_values' AND policyname = 'custom_field_values_insert_all') THEN
    CREATE POLICY custom_field_values_insert_all ON public.custom_field_values FOR INSERT WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'custom_field_values' AND policyname = 'custom_field_values_update_all') THEN
    CREATE POLICY custom_field_values_update_all ON public.custom_field_values FOR UPDATE USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'custom_field_values' AND policyname = 'custom_field_values_delete_all') THEN
    CREATE POLICY custom_field_values_delete_all ON public.custom_field_values FOR DELETE USING (true);
  END IF;
END $$;

-- PROFILES
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'profiles_select_all') THEN
    CREATE POLICY profiles_select_all ON public.profiles FOR SELECT USING (true);
  END IF;
END $$;

-- =============================================
-- 4. SEED DEFAULT SUBJECTS
-- =============================================

INSERT INTO public.subjects (name, colour, is_active, sort_order) 
VALUES 
  ('Maths', '#a5acff', true, 0),
  ('English', '#f9a8d4', true, 1),
  ('Science', '#6ee7b7', true, 2)
ON CONFLICT DO NOTHING;

-- =============================================
-- 5. CREATE INDEXES
-- =============================================

CREATE INDEX IF NOT EXISTS idx_student_subjects_student ON public.student_subjects(student_id);
CREATE INDEX IF NOT EXISTS idx_student_subjects_subject ON public.student_subjects(subject_id);
CREATE INDEX IF NOT EXISTS idx_student_notes_student ON public.student_notes(student_id);
CREATE INDEX IF NOT EXISTS idx_students_status ON public.students(status);
CREATE INDEX IF NOT EXISTS idx_leads_status ON public.leads(status);

-- DOCUMENTS
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'documents' AND policyname = 'documents_select_all') THEN
    CREATE POLICY documents_select_all ON public.documents FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'documents' AND policyname = 'documents_insert_all') THEN
    CREATE POLICY documents_insert_all ON public.documents FOR INSERT WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'documents' AND policyname = 'documents_update_all') THEN
    CREATE POLICY documents_update_all ON public.documents FOR UPDATE USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'documents' AND policyname = 'documents_delete_all') THEN
    CREATE POLICY documents_delete_all ON public.documents FOR DELETE USING (true);
  END IF;
END $$;

-- =============================================
-- 6. CREATE STORAGE BUCKETS
-- =============================================

INSERT INTO storage.buckets (id, name, public) 
VALUES ('documents', 'documents', true)
ON CONFLICT (id) DO NOTHING;

-- Storage Policies for 'documents'
-- Allow public SELECT
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage' AND policyname = 'Public reads for documents') THEN
    CREATE POLICY "Public reads for documents" ON storage.objects FOR SELECT TO public USING (bucket_id = 'documents');
  END IF;
END $$;

-- Allow INSERT
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage' AND policyname = 'Allow uploads to documents') THEN
    CREATE POLICY "Allow uploads to documents" ON storage.objects FOR INSERT TO public WITH CHECK (bucket_id = 'documents');
  END IF;
END $$;

-- Allow UPDATE
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage' AND policyname = 'Allow object updates to documents') THEN
    CREATE POLICY "Allow object updates to documents" ON storage.objects FOR UPDATE TO public USING (bucket_id = 'documents');
  END IF;
END $$;

-- Allow DELETE
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage' AND policyname = 'Allow object deletes to documents') THEN
    CREATE POLICY "Allow object deletes to documents" ON storage.objects FOR DELETE TO public USING (bucket_id = 'documents');
  END IF;
END $$;

-- Done! All tables created, RLS policies applied, seed data inserted, and storage buckets configured.
