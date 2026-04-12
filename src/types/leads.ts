export interface Lead {
  id: string;
  source?: string;
  how_heard?: string;
  enquiry_type?: string;
  parent_name?: string;
  email?: string;
  phone?: string;
  preferred_contact_method?: string;
  address_line_1?: string;
  city?: string;
  postal_code?: string;
  message?: string;
  pipeline_id?: string;
  stage_id?: string;
  owner_id?: string;
  status: 'open' | 'won' | 'lost' | 'archived';
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
  
  // Joined fields
  pipeline_stage?: PipelineStage;
  owner?: Profile;
}

export interface PipelineStage {
  id: string;
  pipeline_id: string;
  name: string;
  color?: string;
  sort_order: number;
  is_active: boolean;
}

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  role: string;
  avatar_url?: string;
}

export interface CustomFieldValue {
  id: string;
  custom_field_id: string;
  record_id: string;
  value_text?: string;
  value_json?: any;
}
