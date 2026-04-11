export interface Tutor {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string | null;
  address_line_1?: string | null;
  city?: string | null;
  county?: string | null;
  postal_code?: string | null;
  country?: string | null;
  active_status: 'active' | 'inactive' | 'onboarding';
  contract_status: 'pending' | 'signed' | 'expired' | 'terminated';
  notes?: string | null;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;

  // Joined relationships (for list views)
  active_students_count?: number;
  active_enrolments_count?: number;
}
