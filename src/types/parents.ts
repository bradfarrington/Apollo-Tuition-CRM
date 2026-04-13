export type Parent = {
  id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
  secondary_phone: string | null;
  secondary_email: string | null;
  preferred_contact_method: 'email' | 'phone' | 'whatsapp' | 'sms' | null;
  relationship_to_student: string | null;
  occupation: string | null;
  employer: string | null;
  address_line_1: string | null;
  city: string | null;
  county: string | null;
  postal_code: string | null;
  country: string | null;
  billing_address_line_1: string | null;
  billing_city: string | null;
  billing_postal_code: string | null;
  referral_source: string | null;
  how_heard: string | null;
  status: 'active' | 'inactive' | 'prospective' | 'onboarding';
  notes: string | null;
  created_at: string;
  updated_at: string;
  
  // Custom fields
  custom_fields?: Record<string, any>;
  
  // Computed / Relational (for UI)
  linked_students_count?: number;
  active_enrolments_count?: number;
  students?: any[];
};
