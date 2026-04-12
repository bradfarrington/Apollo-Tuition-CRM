-- =============================================
-- Enriched Data Collection Migration
-- Adds richer fields to leads, enquiries, parents,
-- students, tutors. Creates tutor_subjects junction
-- table and adds exam_board to student_subjects.
-- =============================================

-- =============================================
-- 1. LEADS — additional contact/source fields
-- =============================================
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS address_line_1 TEXT;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS postal_code TEXT;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS preferred_contact_method TEXT;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS how_heard TEXT;

-- =============================================
-- 2. ENQUIRIES — owner, lesson prefs, urgency
-- =============================================
ALTER TABLE public.enquiries ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL;
ALTER TABLE public.enquiries ADD COLUMN IF NOT EXISTS source TEXT;
ALTER TABLE public.enquiries ADD COLUMN IF NOT EXISTS preferred_start_date DATE;
ALTER TABLE public.enquiries ADD COLUMN IF NOT EXISTS lesson_frequency TEXT;
ALTER TABLE public.enquiries ADD COLUMN IF NOT EXISTS lesson_format TEXT;
ALTER TABLE public.enquiries ADD COLUMN IF NOT EXISTS urgency TEXT DEFAULT 'medium';
ALTER TABLE public.enquiries ADD COLUMN IF NOT EXISTS notes TEXT;

-- =============================================
-- 3. PARENTS — relationship, secondary contact,
--    occupation, billing address, referral
-- =============================================
ALTER TABLE public.parents ADD COLUMN IF NOT EXISTS relationship_to_student TEXT;
ALTER TABLE public.parents ADD COLUMN IF NOT EXISTS secondary_phone TEXT;
ALTER TABLE public.parents ADD COLUMN IF NOT EXISTS secondary_email TEXT;
ALTER TABLE public.parents ADD COLUMN IF NOT EXISTS occupation TEXT;
ALTER TABLE public.parents ADD COLUMN IF NOT EXISTS employer TEXT;
ALTER TABLE public.parents ADD COLUMN IF NOT EXISTS billing_address_line_1 TEXT;
ALTER TABLE public.parents ADD COLUMN IF NOT EXISTS billing_city TEXT;
ALTER TABLE public.parents ADD COLUMN IF NOT EXISTS billing_postal_code TEXT;
ALTER TABLE public.parents ADD COLUMN IF NOT EXISTS referral_source TEXT;
ALTER TABLE public.parents ADD COLUMN IF NOT EXISTS how_heard TEXT;

-- =============================================
-- 4. STUDENTS — school, learning needs, goals
-- =============================================
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS gender TEXT;
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS school_name TEXT;
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS learning_needs TEXT;
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS goals TEXT;
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS availability TEXT;
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS medical_notes TEXT;

-- Add exam_board to student_subjects junction
ALTER TABLE public.student_subjects ADD COLUMN IF NOT EXISTS exam_board TEXT;

-- =============================================
-- 5. TUTORS — qualifications, DBS, teaching
--    prefs, banking, emergency contact
-- =============================================
ALTER TABLE public.tutors ADD COLUMN IF NOT EXISTS date_of_birth DATE;
ALTER TABLE public.tutors ADD COLUMN IF NOT EXISTS gender TEXT;
ALTER TABLE public.tutors ADD COLUMN IF NOT EXISTS university TEXT;
ALTER TABLE public.tutors ADD COLUMN IF NOT EXISTS degree_subject TEXT;
ALTER TABLE public.tutors ADD COLUMN IF NOT EXISTS degree_grade TEXT;
ALTER TABLE public.tutors ADD COLUMN IF NOT EXISTS dbs_status TEXT DEFAULT 'pending';
ALTER TABLE public.tutors ADD COLUMN IF NOT EXISTS dbs_certificate_number TEXT;
ALTER TABLE public.tutors ADD COLUMN IF NOT EXISTS dbs_issue_date DATE;
ALTER TABLE public.tutors ADD COLUMN IF NOT EXISTS max_travel_radius_miles INT;
ALTER TABLE public.tutors ADD COLUMN IF NOT EXISTS teaching_format TEXT;
ALTER TABLE public.tutors ADD COLUMN IF NOT EXISTS hourly_rate DECIMAL(10,2);
ALTER TABLE public.tutors ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE public.tutors ADD COLUMN IF NOT EXISTS availability TEXT;
ALTER TABLE public.tutors ADD COLUMN IF NOT EXISTS emergency_contact_name TEXT;
ALTER TABLE public.tutors ADD COLUMN IF NOT EXISTS emergency_contact_phone TEXT;
ALTER TABLE public.tutors ADD COLUMN IF NOT EXISTS bank_sort_code TEXT;
ALTER TABLE public.tutors ADD COLUMN IF NOT EXISTS bank_account_number TEXT;
ALTER TABLE public.tutors ADD COLUMN IF NOT EXISTS bank_account_name TEXT;
ALTER TABLE public.tutors ADD COLUMN IF NOT EXISTS national_insurance_number TEXT;

-- =============================================
-- 6. TUTOR_SUBJECTS junction table
-- =============================================
CREATE TABLE IF NOT EXISTS public.tutor_subjects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tutor_id UUID NOT NULL REFERENCES public.tutors(id) ON DELETE CASCADE,
    subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(tutor_id, subject_id)
);

ALTER TABLE public.tutor_subjects ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'tutor_subjects' AND policyname = 'tutor_subjects_select_all') THEN
    CREATE POLICY tutor_subjects_select_all ON public.tutor_subjects FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'tutor_subjects' AND policyname = 'tutor_subjects_insert_all') THEN
    CREATE POLICY tutor_subjects_insert_all ON public.tutor_subjects FOR INSERT WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'tutor_subjects' AND policyname = 'tutor_subjects_update_all') THEN
    CREATE POLICY tutor_subjects_update_all ON public.tutor_subjects FOR UPDATE USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'tutor_subjects' AND policyname = 'tutor_subjects_delete_all') THEN
    CREATE POLICY tutor_subjects_delete_all ON public.tutor_subjects FOR DELETE USING (true);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_tutor_subjects_tutor ON public.tutor_subjects(tutor_id);
CREATE INDEX IF NOT EXISTS idx_tutor_subjects_subject ON public.tutor_subjects(subject_id);

-- =============================================
-- 7. Indexes for new columns
-- =============================================
CREATE INDEX IF NOT EXISTS idx_enquiries_owner ON public.enquiries(owner_id);
CREATE INDEX IF NOT EXISTS idx_leads_postal_code ON public.leads(postal_code) WHERE deleted_at IS NULL;

-- Done!
