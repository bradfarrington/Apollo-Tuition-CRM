-- Enable UUID extension if not already available
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ----------------------------------------------------
-- PROFILES
-- ----------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL DEFAULT 'operations' CHECK (role IN ('admin', 'operations', 'tutor', 'parent', 'student')),
    avatar_url TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------
-- PIPELINES
-- ----------------------------------------------------
CREATE TABLE IF NOT EXISTS public.pipelines (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    entity_type TEXT NOT NULL CHECK (entity_type IN ('lead', 'student_onboarding', 'tutor_onboarding', 'other')),
    is_default BOOLEAN NOT NULL DEFAULT false,
    is_active BOOLEAN NOT NULL DEFAULT true,
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------
-- PIPELINE_STAGES
-- ----------------------------------------------------
CREATE TABLE IF NOT EXISTS public.pipeline_stages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pipeline_id UUID NOT NULL REFERENCES public.pipelines(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    color TEXT,
    sort_order INT NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------
-- TAGS
-- ----------------------------------------------------
CREATE TABLE IF NOT EXISTS public.tags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    color TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------
-- ENTITY_TAGS
-- ----------------------------------------------------
CREATE TABLE IF NOT EXISTS public.entity_tags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tag_id UUID NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,
    related_type TEXT NOT NULL CHECK (related_type IN ('parent', 'student', 'tutor', 'lead', 'invoice')),
    related_id UUID NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(tag_id, related_type, related_id)
);

-- ----------------------------------------------------
-- PARENTS
-- ----------------------------------------------------
CREATE TABLE IF NOT EXISTS public.parents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    address_line_1 TEXT,
    city TEXT,
    postal_code TEXT,
    country TEXT,
    preferred_contact_method TEXT CHECK (preferred_contact_method IN ('email', 'phone', 'whatsapp', 'sms')),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'prospective')),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- ----------------------------------------------------
-- TUTORS
-- ----------------------------------------------------
CREATE TABLE IF NOT EXISTS public.tutors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    address_line_1 TEXT,
    city TEXT,
    postal_code TEXT,
    country TEXT,
    active_status TEXT NOT NULL DEFAULT 'active' CHECK (active_status IN ('active', 'inactive', 'onboarding')),
    contract_status TEXT NOT NULL DEFAULT 'pending' CHECK (contract_status IN ('pending', 'signed', 'expired', 'terminated')),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- ----------------------------------------------------
-- LEADS
-- ----------------------------------------------------
CREATE TABLE IF NOT EXISTS public.leads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source TEXT,
    enquiry_type TEXT,
    parent_name TEXT,
    email TEXT,
    phone TEXT,
    message TEXT,
    pipeline_id UUID REFERENCES public.pipelines(id) ON DELETE SET NULL,
    stage_id UUID REFERENCES public.pipeline_stages(id) ON DELETE SET NULL,
    owner_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'won', 'lost', 'archived')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- ----------------------------------------------------
-- STUDENTS
-- ----------------------------------------------------
CREATE TABLE IF NOT EXISTS public.students (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    primary_parent_id UUID REFERENCES public.parents(id) ON DELETE SET NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    date_of_birth DATE,
    academic_cohort INT,
    school_year TEXT,
    key_stage TEXT,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'onboarding', 'graduated', 'paused')),
    tutor_id UUID REFERENCES public.tutors(id) ON DELETE SET NULL,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- ----------------------------------------------------
-- STUDENT_PARENT_LINKS
-- ----------------------------------------------------
CREATE TABLE IF NOT EXISTS public.student_parent_links (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    parent_id UUID NOT NULL REFERENCES public.parents(id) ON DELETE CASCADE,
    relationship_type TEXT NOT NULL,
    is_primary BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(student_id, parent_id)
);

-- ----------------------------------------------------
-- ENROLMENTS
-- ----------------------------------------------------
CREATE TABLE IF NOT EXISTS public.enrolments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    tutor_id UUID REFERENCES public.tutors(id) ON DELETE SET NULL,
    subject TEXT,
    lesson_frequency TEXT,
    lesson_length_minutes INT,
    weekly_day TEXT,
    weekly_time TIME,
    parent_charge_rate DECIMAL(10, 2),
    tutor_pay_rate DECIMAL(10, 2),
    start_date DATE,
    end_date DATE,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed', 'cancelled')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------
-- CONTRACTS
-- ----------------------------------------------------
CREATE TABLE IF NOT EXISTS public.contracts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    related_type TEXT NOT NULL CHECK (related_type IN ('parent', 'student', 'tutor', 'lead')),
    related_id UUID NOT NULL,
    contract_type TEXT NOT NULL,
    version TEXT,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'signed', 'expired', 'voided')),
    sent_at TIMESTAMPTZ,
    signed_at TIMESTAMPTZ,
    file_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------
-- DOCUMENTS
-- ----------------------------------------------------
CREATE TABLE IF NOT EXISTS public.documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    related_type TEXT NOT NULL CHECK (related_type IN ('parent', 'student', 'tutor', 'lead')),
    related_id UUID NOT NULL,
    name TEXT NOT NULL,
    file_url TEXT NOT NULL,
    document_type TEXT,
    uploaded_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------
-- COMMUNICATIONS
-- ----------------------------------------------------
CREATE TABLE IF NOT EXISTS public.communications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    related_type TEXT NOT NULL CHECK (related_type IN ('parent', 'student', 'tutor', 'lead')),
    related_id UUID NOT NULL,
    channel TEXT NOT NULL CHECK (channel IN ('email', 'sms', 'note', 'call', 'whatsapp_note')),
    direction TEXT NOT NULL CHECK (direction IN ('inbound', 'outbound', 'internal')),
    subject TEXT,
    body_excerpt TEXT,
    sent_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    sent_at TIMESTAMPTZ DEFAULT NOW(),
    external_message_id TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------
-- TEMPLATES
-- ----------------------------------------------------
CREATE TABLE IF NOT EXISTS public.templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('email', 'sms', 'contract', 'note')),
    subject TEXT,
    body TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------
-- INVOICES (Replaces Payments)
-- ----------------------------------------------------
CREATE TABLE IF NOT EXISTS public.invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    parent_id UUID NOT NULL REFERENCES public.parents(id) ON DELETE CASCADE,
    student_id UUID REFERENCES public.students(id) ON DELETE SET NULL,
    amount_due DECIMAL(10, 2) NOT NULL,
    amount_paid DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    currency TEXT NOT NULL DEFAULT 'GBP',
    billing_period_start DATE,
    billing_period_end DATE,
    due_date DATE,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'open', 'paid', 'overdue', 'void', 'uncollectible')),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------
-- TRANSACTIONS
-- ----------------------------------------------------
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_id UUID NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
    amount DECIMAL(10, 2) NOT NULL,
    currency TEXT NOT NULL DEFAULT 'GBP',
    payment_method TEXT CHECK (payment_method IN ('card', 'bank_transfer', 'cash', 'stripe', 'other')),
    external_transaction_id TEXT,
    status TEXT NOT NULL DEFAULT 'success' CHECK (status IN ('pending', 'success', 'failed', 'refunded')),
    processed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------
-- TASKS
-- ----------------------------------------------------
CREATE TABLE IF NOT EXISTS public.tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    related_type TEXT CHECK (related_type IN ('parent', 'student', 'tutor', 'lead', 'invoice', 'contract')),
    related_id UUID,
    title TEXT NOT NULL,
    description TEXT,
    assigned_to UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    due_date TIMESTAMPTZ,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
    priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------
-- CUSTOM_FIELDS
-- ----------------------------------------------------
CREATE TABLE IF NOT EXISTS public.custom_fields (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entity_type TEXT NOT NULL CHECK (entity_type IN ('parent', 'student', 'tutor', 'lead', 'enrolment')),
    label TEXT NOT NULL,
    api_key TEXT NOT NULL,
    field_type TEXT NOT NULL CHECK (field_type IN ('text', 'textarea', 'number', 'date', 'datetime', 'select', 'multiselect', 'checkbox', 'email', 'phone', 'url')),
    is_required BOOLEAN NOT NULL DEFAULT false,
    options_json JSONB,
    sort_order INT NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(entity_type, api_key)
);

-- ----------------------------------------------------
-- CUSTOM_FIELD_VALUES
-- ----------------------------------------------------
CREATE TABLE IF NOT EXISTS public.custom_field_values (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    custom_field_id UUID NOT NULL REFERENCES public.custom_fields(id) ON DELETE CASCADE,
    record_id UUID NOT NULL,
    value_text TEXT,
    value_json JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(custom_field_id, record_id)
);

-- ----------------------------------------------------
-- ACTIVITY_LOG
-- ----------------------------------------------------
CREATE TABLE IF NOT EXISTS public.activity_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    actor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    action_type TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id UUID NOT NULL,
    summary TEXT,
    metadata_json JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------
-- INDEXES
-- ----------------------------------------------------
CREATE INDEX idx_profiles_email ON public.profiles(email);
CREATE INDEX idx_profiles_role ON public.profiles(role);

CREATE INDEX idx_pipelines_entity_type ON public.pipelines(entity_type);
CREATE INDEX idx_pipeline_stages_pipeline_id ON public.pipeline_stages(pipeline_id);

CREATE INDEX idx_entity_tags_related ON public.entity_tags(related_type, related_id);
CREATE INDEX idx_entity_tags_tag ON public.entity_tags(tag_id);

CREATE INDEX idx_parents_email ON public.parents(email) WHERE deleted_at IS NULL;
CREATE INDEX idx_parents_phone ON public.parents(phone) WHERE deleted_at IS NULL;

CREATE INDEX idx_tutors_email ON public.tutors(email) WHERE deleted_at IS NULL;
CREATE INDEX idx_tutors_contract_status ON public.tutors(contract_status) WHERE deleted_at IS NULL;

CREATE INDEX idx_leads_pipeline_stage ON public.leads(pipeline_id, stage_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_leads_owner ON public.leads(owner_id) WHERE deleted_at IS NULL;

CREATE INDEX idx_students_primary_parent ON public.students(primary_parent_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_students_tutor ON public.students(tutor_id) WHERE deleted_at IS NULL;

CREATE INDEX idx_enrolments_student ON public.enrolments(student_id);
CREATE INDEX idx_enrolments_tutor ON public.enrolments(tutor_id);

CREATE INDEX idx_contracts_related ON public.contracts(related_type, related_id);
CREATE INDEX idx_documents_related ON public.documents(related_type, related_id);
CREATE INDEX idx_communications_related ON public.communications(related_type, related_id);

CREATE INDEX idx_invoices_parent ON public.invoices(parent_id);
CREATE INDEX idx_invoices_status ON public.invoices(status);
CREATE INDEX idx_transactions_invoice ON public.transactions(invoice_id);

CREATE INDEX idx_tasks_related ON public.tasks(related_type, related_id);
CREATE INDEX idx_tasks_assigned_to ON public.tasks(assigned_to);

CREATE INDEX idx_custom_fields_entity ON public.custom_fields(entity_type);
CREATE INDEX idx_custom_field_values_record ON public.custom_field_values(record_id);

CREATE INDEX idx_activity_log_entity ON public.activity_log(entity_type, entity_id);
CREATE INDEX idx_activity_log_actor ON public.activity_log(actor_id);
