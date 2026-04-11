export type Parent = {
  id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
  address_line_1: string | null;
  city: string | null;
  county: string | null;
  postal_code: string | null;
  country: string | null;
  preferred_contact_method: 'email' | 'phone' | 'whatsapp' | 'sms' | null;
  status: 'active' | 'inactive' | 'prospective';
  notes: string | null;
  created_at: string;
  updated_at: string;
  
  // Custom fields
  custom_fields?: Record<string, any>;
  
  // Computed / Relational (for UI)
  linked_students_count?: number;
  active_enrolments_count?: number;
};
