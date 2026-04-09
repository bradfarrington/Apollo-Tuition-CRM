export type StudentStatus = 'active' | 'inactive' | 'onboarding' | 'graduated' | 'paused';

export interface Student {
  id: string;
  primary_parent_id: string | null;
  first_name: string;
  last_name: string;
  date_of_birth: string | null;
  academic_cohort: number | null;
  school_year: string | null;
  key_stage: string | null;
  status: StudentStatus;
  tutor_id: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  
  // Joined/Aggregated fields for UI
  primary_parent_name?: string;
  assigned_tutor_name?: string;
  active_enrolments_count?: number;
  subject_ids?: string[];
  subjects?: { id: string; name: string; colour: string }[];
}
