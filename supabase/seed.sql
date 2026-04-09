-- ==========================================
-- EXPLORE APOLLO CRM: SEED DATA
-- ==========================================

-- NOTE: If your database enforces the profiles -> auth.users foreign key, 
-- you will need to create these users in auth.users first, or uncomment the block below 
-- (assuming pgcrypto is enabled in your Supabase project).

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at)
VALUES 
('11111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'admin@exploreapollo.com', crypt('password123', gen_salt('bf')), NOW()),
('22222222-2222-2222-2222-222222222222', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'ops@exploreapollo.com', crypt('password123', gen_salt('bf')), NOW());

-- ----------------------------------------------------
-- 1. INTERNAL PROFILES
-- ----------------------------------------------------
INSERT INTO public.profiles (id, full_name, email, role, is_active) VALUES
('11111111-1111-1111-1111-111111111111', 'Alice Admin', 'admin@exploreapollo.com', 'admin', true),
('22222222-2222-2222-2222-222222222222', 'Bob Operations', 'ops@exploreapollo.com', 'operations', true);

-- ----------------------------------------------------
-- 2. PIPELINES
-- ----------------------------------------------------
INSERT INTO public.pipelines (id, name, entity_type, is_default, sort_order) VALUES
('33333333-3333-3333-3333-333333333331', 'Leads Pipeline', 'lead', true, 10),
('33333333-3333-3333-3333-333333333332', 'Student Onboarding Pipeline', 'student_onboarding', true, 20),
('33333333-3333-3333-3333-333333333333', 'Tutor Onboarding Pipeline', 'tutor_onboarding', true, 30);

-- ----------------------------------------------------
-- 3. PIPELINE STAGES
-- ----------------------------------------------------
INSERT INTO public.pipeline_stages (id, pipeline_id, name, color, sort_order) VALUES
-- Leads Pipeline Stages
('44444444-4444-4444-4444-444444444411', '33333333-3333-3333-3333-333333333331', 'New Lead', '#3b82f6', 10),
('44444444-4444-4444-4444-444444444412', '33333333-3333-3333-3333-333333333331', 'Contact Attempted', '#eab308', 20),
('44444444-4444-4444-4444-444444444413', '33333333-3333-3333-3333-333333333331', 'Call Booked', '#8b5cf6', 30),
('44444444-4444-4444-4444-444444444414', '33333333-3333-3333-3333-333333333331', 'Call Completed', '#f97316', 40),
('44444444-4444-4444-4444-444444444415', '33333333-3333-3333-3333-333333333331', 'Qualified', '#22c55e', 50),
('44444444-4444-4444-4444-444444444416', '33333333-3333-3333-3333-333333333331', 'Won', '#16a34a', 60),
('44444444-4444-4444-4444-444444444417', '33333333-3333-3333-3333-333333333331', 'Lost', '#ef4444', 70),

-- Student Onboarding Pipeline Stages
('44444444-4444-4444-4444-444444444421', '33333333-3333-3333-3333-333333333332', 'Onboarding Sent', '#3b82f6', 10),
('44444444-4444-4444-4444-444444444422', '33333333-3333-3333-3333-333333333332', 'Onboarding Complete', '#8b5cf6', 20),
('44444444-4444-4444-4444-444444444423', '33333333-3333-3333-3333-333333333332', 'Contract Sent', '#eab308', 30),
('44444444-4444-4444-4444-444444444424', '33333333-3333-3333-3333-333333333332', 'Contract Signed', '#10b981', 40),
('44444444-4444-4444-4444-444444444425', '33333333-3333-3333-3333-333333333332', 'Tutor Assigned', '#06b6d4', 50),
('44444444-4444-4444-4444-444444444426', '33333333-3333-3333-3333-333333333332', 'Ready to Start', '#f59e0b', 60),
('44444444-4444-4444-4444-444444444427', '33333333-3333-3333-3333-333333333332', 'Active Student', '#22c55e', 70),

-- Tutor Onboarding Pipeline Stages
('44444444-4444-4444-4444-444444444431', '33333333-3333-3333-3333-333333333333', 'Applied', '#64748b', 10),
('44444444-4444-4444-4444-444444444432', '33333333-3333-3333-3333-333333333333', 'Interviewed', '#8b5cf6', 20),
('44444444-4444-4444-4444-444444444433', '33333333-3333-3333-3333-333333333333', 'Approved', '#3b82f6', 30),
('44444444-4444-4444-4444-444444444434', '33333333-3333-3333-3333-333333333333', 'Contract Sent', '#eab308', 40),
('44444444-4444-4444-4444-444444444435', '33333333-3333-3333-3333-333333333333', 'Contract Signed', '#10b981', 50),
('44444444-4444-4444-4444-444444444436', '33333333-3333-3333-3333-333333333333', 'Active', '#22c55e', 60);

-- ----------------------------------------------------
-- 4. TEMPLATES
-- ----------------------------------------------------
INSERT INTO public.templates (id, name, type, subject, body) VALUES
(uuid_generate_v4(), 'Student Onboarding Email', 'email', 'Welcome to Apollo Tuition! Next Steps', 'Hi {{parent_first_name}},<br><br>Welcome to Apollo! Please complete the onboarding form linked below so we can find the perfect tutor match for {{student_first_name}}.<br><br>Best,<br>The Apollo Team'),
(uuid_generate_v4(), 'Contract Reminder Email', 'email', 'Reminder: Your Apollo Tuition Contract', 'Hi {{parent_first_name}},<br><br>This is a quick reminder to sign your tutoring contract so we can get started.<br><br>Best,<br>The Apollo Team'),
(uuid_generate_v4(), 'Welcome Email', 'email', 'You are all set!', 'Hi {{parent_first_name}},<br><br>Everything is signed and ready. Your first lesson will be scheduled shortly.<br><br>Best,<br>The Apollo Team'),
(uuid_generate_v4(), 'Payment Reminder SMS', 'sms', NULL, 'Hi {{parent_first_name}}, just a quick reminder that your Apollo Tuition invoice is due tomorrow. Thank you! - Apollo Team'),
(uuid_generate_v4(), 'General Follow-up SMS', 'sms', NULL, 'Hi {{parent_first_name}}, tracking back on our recent chat. Let us know if you have any further questions! - Apollo Team');

-- ----------------------------------------------------
-- 5. PARENTS
-- ----------------------------------------------------
INSERT INTO public.parents (id, first_name, last_name, email, phone, city, status, preferred_contact_method) VALUES
('55555555-5555-5555-5555-555555555551', 'Sarah', 'Jenkins', 'sarah.jenkins@example.com', '07700900111', 'London', 'active', 'email'),
('55555555-5555-5555-5555-555555555552', 'Michael', 'Chen', 'michael.chen@example.com', '07700900222', 'Manchester', 'active', 'whatsapp'),
('55555555-5555-5555-5555-555555555553', 'Emma', 'Smith', 'emma.smith@example.com', '07700900333', 'Birmingham', 'prospective', 'phone');

-- ----------------------------------------------------
-- 6. TUTORS
-- ----------------------------------------------------
INSERT INTO public.tutors (id, first_name, last_name, email, phone, city, active_status, contract_status) VALUES
('66666666-6666-6666-6666-666666666661', 'James', 'Wilson', 'j.wilson.tutor@example.com', '07700900444', 'London', 'active', 'signed'),
('66666666-6666-6666-6666-666666666662', 'Aisha', 'Patel', 'aisha.patel.tutor@example.com', '07700900555', 'Leeds', 'active', 'signed'),
('66666666-6666-6666-6666-666666666663', 'David', 'Brown', 'd.brown.tutor@example.com', '07700900666', 'London', 'onboarding', 'pending');

-- ----------------------------------------------------
-- 7. STUDENTS
-- ----------------------------------------------------
INSERT INTO public.students (id, primary_parent_id, first_name, last_name, school_year, key_stage, status, tutor_id) VALUES
('77777777-7777-7777-7777-777777777771', '55555555-5555-5555-5555-555555555551', 'Thomas', 'Jenkins', 'Year 10', 'KS4', 'active', '66666666-6666-6666-6666-666666666661'),
('77777777-7777-7777-7777-777777777772', '55555555-5555-5555-5555-555555555552', 'Chloe', 'Chen', 'Year 8', 'KS3', 'active', '66666666-6666-6666-6666-666666666662'),
('77777777-7777-7777-7777-777777777773', '55555555-5555-5555-5555-555555555551', 'Emily', 'Jenkins', 'Year 12', 'KS5', 'onboarding', NULL);

-- ----------------------------------------------------
-- 8. LEADS
-- ----------------------------------------------------
INSERT INTO public.leads (id, parent_name, email, phone, source, enquiry_type, message, pipeline_id, stage_id, owner_id, status) VALUES
('88888888-8888-8888-8888-888888888881', 'Rachel Green', 'rachel.g@example.com', '07700900777', 'Website', 'GCSE Maths', 'Looking for an experienced maths tutor for my son in Year 11.', '33333333-3333-3333-3333-333333333331', '44444444-4444-4444-4444-444444444411', '11111111-1111-1111-1111-111111111111', 'open'),
('88888888-8888-8888-8888-888888888882', 'Mark Spencer', 'mark.spencer@example.com', '07700900888', 'Referral', 'A-Level Chemistry', 'Highly recommended by Sarah Jenkins. Needing help in time for mocks.', '33333333-3333-3333-3333-333333333331', '44444444-4444-4444-4444-444444444413', '22222222-2222-2222-2222-222222222222', 'open'),
('88888888-8888-8888-8888-888888888883', 'Emma Smith', 'emma.smith@example.com', '07700900333', 'Google Ads', 'Primary English', 'Needs help with reading comprehension.', '33333333-3333-3333-3333-333333333331', '44444444-4444-4444-4444-444444444416', '11111111-1111-1111-1111-111111111111', 'won');

-- ----------------------------------------------------
-- 9. TASKS
-- ----------------------------------------------------
INSERT INTO public.tasks (id, related_type, related_id, title, description, assigned_to, status, priority, due_date) VALUES
(uuid_generate_v4(), 'lead', '88888888-8888-8888-8888-888888888881', 'Call Rachel about Maths tutoring', 'Initial consultation call to discuss requirements and book an assessment.', '11111111-1111-1111-1111-111111111111', 'pending', 'high', NOW() + INTERVAL '1 day'),
(uuid_generate_v4(), 'student', '77777777-7777-7777-7777-777777777773', 'Send Onboarding Form to Emily', 'Emily Jenkins is ready to onboard, send out the standard link.', '22222222-2222-2222-2222-222222222222', 'completed', 'medium', NOW() - INTERVAL '1 day'),
(uuid_generate_v4(), 'tutor', '66666666-6666-6666-6666-666666666663', 'Review David Brown Interview Notes', 'Make a decision on hiring and initiate reference checks.', '11111111-1111-1111-1111-111111111111', 'pending', 'high', NOW() + INTERVAL '2 days');

-- ----------------------------------------------------
-- 10. PAYMENTS (INVOICES & TRANSACTIONS)
-- ----------------------------------------------------
INSERT INTO public.invoices (id, parent_id, student_id, amount_due, amount_paid, billing_period_start, billing_period_end, due_date, status) VALUES
('99999999-9999-9999-9999-999999999991', '55555555-5555-5555-5555-555555555551', '77777777-7777-7777-7777-777777777771', '120.00', '120.00', CURRENT_DATE - INTERVAL '30 days', CURRENT_DATE - INTERVAL '1 day', CURRENT_DATE + INTERVAL '5 days', 'paid'),
('99999999-9999-9999-9999-999999999992', '55555555-5555-5555-5555-555555555552', '77777777-7777-7777-7777-777777777772', '80.00', '0.00', CURRENT_DATE, CURRENT_DATE + INTERVAL '30 days', CURRENT_DATE + INTERVAL '10 days', 'open');

INSERT INTO public.transactions (id, invoice_id, amount, payment_method, status, processed_at) VALUES
(uuid_generate_v4(), '99999999-9999-9999-9999-999999999991', '120.00', 'stripe', 'success', NOW() - INTERVAL '5 days');

-- ----------------------------------------------------
-- 11. CONTRACTS
-- ----------------------------------------------------
INSERT INTO public.contracts (id, related_type, related_id, contract_type, status, version) VALUES
(uuid_generate_v4(), 'parent', '55555555-5555-5555-5555-555555555551', 'Parent Tutoring Agreement', 'signed', 'v1.0'),
(uuid_generate_v4(), 'tutor', '66666666-6666-6666-6666-666666666661', 'Tutor Independent Contractor Agreement', 'signed', 'v1.0'),
(uuid_generate_v4(), 'parent', '55555555-5555-5555-5555-555555555553', 'Parent Tutoring Agreement', 'sent', 'v1.0');
