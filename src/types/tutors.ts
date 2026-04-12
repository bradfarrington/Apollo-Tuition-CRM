export interface Tutor {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string | null;
  date_of_birth?: string | null;
  gender?: string | null;

  // Address
  address_line_1?: string | null;
  city?: string | null;
  county?: string | null;
  postal_code?: string | null;
  country?: string | null;

  // Qualifications
  university?: string | null;
  degree_subject?: string | null;
  degree_grade?: string | null;

  // DBS
  dbs_status?: string | null;
  dbs_certificate_number?: string | null;
  dbs_issue_date?: string | null;

  // Teaching preferences
  max_travel_radius_miles?: number | null;
  teaching_format?: string | null;
  hourly_rate?: number | null;
  bio?: string | null;
  availability?: string | null;

  // Emergency contact
  emergency_contact_name?: string | null;
  emergency_contact_phone?: string | null;

  // Banking / Payroll
  bank_sort_code?: string | null;
  bank_account_number?: string | null;
  bank_account_name?: string | null;
  national_insurance_number?: string | null;

  // Status
  active_status: 'active' | 'inactive' | 'onboarding';
  contract_status: 'pending' | 'signed' | 'expired' | 'terminated';
  notes?: string | null;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;

  // Joined relationships (for list views)
  active_students_count?: number;
  active_enrolments_count?: number;
  subject_ids?: string[];
  subjects?: { id: string; name: string; colour: string }[];
}
