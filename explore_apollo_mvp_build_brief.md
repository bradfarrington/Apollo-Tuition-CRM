# Explore Apollo Tuition CRM — MVP Build Brief

## 1) Product Vision

Build a bespoke internal operations platform for **Explore Apollo Tuition**.

This app should replace the parts of GoHighLevel currently used for:
- lead capture
- contact management
- parent/student onboarding
- tutor admin
- bulk email and SMS
- contract and document tracking
- payment admin
- internal pipelines and workflow management

For the **MVP**, the app should **not** replace Wise. Wise remains the lesson delivery platform for now.

The app should be designed so that **phase 2** can later expand into:
- parent dashboard
- student dashboard
- tutor dashboard
- lesson history
- attendance tracking
- progress reporting
- homework/resources
- Wise replacement if needed

---

## 2) Core Product Principles

The system must be:

1. **Flexible**
   - avoid hardcoded student fields, parent fields, pipeline stages, and pipelines where possible
   - support custom fields for major record types
   - support multiple pipelines
   - support editable statuses and stages

2. **Internal-first**
   - the MVP is primarily for admin and operations users
   - no parent/student/tutor external dashboards in version 1 unless needed for auth testing only

3. **Operational**
   - this is not just a CRM
   - it is the internal operating system for the tutoring business

4. **Future-ready**
   - data structure and UI should support future dashboards and learning delivery expansion

5. **Premium but friendly**
   - the UI should feel modern, clean, pastel, slightly premium, and easy to use

---

## 3) MVP Scope

### Must include
- internal auth
- admin dashboard
- leads management
- parents management
- students management
- tutors management
- onboarding flow
- contracts/documents tracking
- communications hub
- payments admin
- tasks/follow-ups
- configurable pipelines
- configurable custom fields
- website form capture support

### Must not include in MVP
- live classroom
- whiteboard
- Wise replacement
- lesson playback
- parent portal
- student portal
- tutor portal
- advanced academic analytics
- homework system

---

## 4) Primary Users

### Admin
Full access to all data, settings, pipelines, custom fields, records, and communication tools.

### Operations Staff
Can manage leads, parents, students, tutors, onboarding, tasks, contracts, communications, and payments.

### Future Roles (not MVP focus)
- Tutor
- Parent
- Student

---

## 5) Core Data Model

## Important architecture rule
Use **system fields + custom fields**.

That means:
- each main entity should have core fixed columns for essential system functionality
- additional business-specific fields should be stored through a `custom_fields` + `custom_field_values` structure
- avoid needing database changes every time the client wants to track a new field

### Main entities

#### profiles
For internal logged-in users.
Core fields:
- id
- full_name
- email
- role
- avatar_url
- is_active
- created_at
- updated_at

#### leads
Raw incoming enquiries before conversion.
Core fields:
- id
- source
- enquiry_type
- parent_name
- email
- phone
- message
- pipeline_id
- stage_id
- owner_id
- status
- created_at
- updated_at

#### parents
Main guardian / payer contact.
Core fields:
- id
- first_name
- last_name
- email
- phone
- preferred_contact_method
- status
- notes
- created_at
- updated_at

#### students
Linked to a parent or guardian.
Core fields:
- id
- primary_parent_id
- first_name
- last_name
- date_of_birth
- school_year
- key_stage
- status
- tutor_id
- notes
- created_at
- updated_at

#### tutors
Internal tutor records.
Core fields:
- id
- first_name
- last_name
- email
- phone
- active_status
- contract_status
- notes
- created_at
- updated_at

#### student_parent_links
For supporting multiple guardians if needed.
Core fields:
- id
- student_id
- parent_id
- relationship_type
- is_primary
- created_at

#### enrolments
Student learning arrangements.
Core fields:
- id
- student_id
- tutor_id
- subject
- lesson_frequency
- lesson_length_minutes
- weekly_day
- weekly_time
- start_date
- end_date
- status
- created_at
- updated_at

#### pipelines
Supports multiple pipelines.
Core fields:
- id
- name
- entity_type
- is_default
- is_active
- sort_order
- created_at
- updated_at

Examples:
- Leads pipeline
- Student onboarding pipeline
- Tutor onboarding pipeline

#### pipeline_stages
Configurable stages inside pipelines.
Core fields:
- id
- pipeline_id
- name
- color
- sort_order
- is_active
- created_at
- updated_at

#### contracts
Tracks contracts for parents, students, tutors.
Core fields:
- id
- related_type
- related_id
- contract_type
- version
- status
- sent_at
- signed_at
- file_url
- created_at
- updated_at

#### documents
General document storage.
Core fields:
- id
- related_type
- related_id
- name
- file_url
- document_type
- uploaded_by
- created_at
- updated_at

#### communications
Unified communication log.
Core fields:
- id
- related_type
- related_id
- channel
- direction
- subject
- body_excerpt
- sent_by
- sent_at
- external_message_id
- created_at

Channels:
- email
- sms
- note
- call
- whatsapp_note

#### templates
For reusable emails, SMS, contracts, onboarding emails, reminders.
Core fields:
- id
- name
- type
- subject
- body
- is_active
- created_at
- updated_at

#### payments
Simple payment admin tracking for MVP.
Core fields:
- id
- parent_id
- student_id
- amount
- currency
- billing_period
- due_date
- paid_date
- status
- notes
- created_at
- updated_at

#### tasks
Internal operational tasks.
Core fields:
- id
- related_type
- related_id
- title
- description
- assigned_to
- due_date
- status
- priority
- created_by
- created_at
- updated_at

#### custom_fields
Dynamic field definitions.
Core fields:
- id
- entity_type
- label
- api_key
- field_type
- is_required
- options_json
- sort_order
- is_active
- created_at
- updated_at

Supported field types:
- text
- textarea
- number
- date
- datetime
- select
- multiselect
- checkbox
- email
- phone
- url

#### custom_field_values
Dynamic values for records.
Core fields:
- id
- custom_field_id
- record_id
- value_text
- value_json
- created_at
- updated_at

#### activity_log
For auditing and history.
Core fields:
- id
- actor_id
- action_type
- entity_type
- entity_id
- summary
- metadata_json
- created_at

---

## 6) Recommended Database Rules

- Use UUID primary keys
- Use timestamps on all tables
- Add indexes on:
  - email
  - phone
  - related_type + related_id
  - pipeline_id + stage_id
  - parent_id
  - student_id
  - tutor_id
- Use row level security in Supabase
- Start with internal users only for access rules
- Use clear enum-like constraints where useful, but avoid over-hardcoding client-specific values

---

## 7) Core Workflows

### Workflow 1: Website Lead Capture
Website form submitted -> create lead -> assign default pipeline and stage -> notify admin -> create follow-up task

### Workflow 2: Lead Qualification
Lead reviewed -> call booked -> call completed -> convert lead into parent and possibly student records -> move stage

### Workflow 3: Student Onboarding
Onboarding form sent -> submitted -> update/create parent and student records -> create tasks -> move onboarding stage

### Workflow 4: Contracts
Contract sent -> status pending -> signed -> stage updated -> document stored on relevant record

### Workflow 5: Tutor Assignment
Student reviewed -> tutor selected -> enrolment created -> student status updated -> internal notes recorded

### Workflow 6: Payment Tracking
Payment added -> due date tracked -> marked paid or overdue -> reminders/tasks created if needed

### Workflow 7: Communications
Email or SMS sent -> communication logged on timeline -> visible on parent/student/lead record

---

## 8) Front-End UX / UI Direction

The visual style should combine:
- clean SaaS dashboard structure
- soft pastel accents
- rounded cards
- light neutral backgrounds
- premium minimal spacing
- education-friendly tone

### General visual rules
- 80 percent neutral interface
- 20 percent pastel accent usage
- avoid loud gradients everywhere
- gradients should only be used on summary cards, welcome cards, and empty states
- tables and forms should stay mostly neutral and highly readable

### Suggested color direction
- background: very light grey
- cards: white
- border: subtle cool grey
- primary pastel purple
- secondary pastel blue
- accent pastel pink
- success pastel green

### Layout pattern
- left sidebar
- top search / actions bar
- main content canvas
- responsive cards
- clean data tables
- clear detail views with tabs and activity timeline

---

## 9) Main Screens for MVP

1. Login
2. Dashboard
3. Leads list
4. Lead detail
5. Parents list
6. Parent detail
7. Students list
8. Student detail
9. Tutors list
10. Tutor detail
11. Pipelines board view
12. Pipeline settings
13. Onboarding submissions
14. Contracts/documents list
15. Communications center
16. Payments list
17. Tasks list
18. Settings
19. Custom field manager
20. Template manager

---

## 10) Detail Page Structure

Each main record page should follow a similar pattern:

### Header
- record name
- status badge
- pipeline stage
- quick actions

### Main content area
Left/main column:
- overview card
- core details
- linked records
- custom fields
- documents/contracts

Right column:
- activity timeline
- tasks
- recent communications

Tabs may include:
- Overview
- Notes
- Communications
- Documents
- Payments
- Timeline

---

## 11) Build Order

### Phase 1 — Foundation
- project setup
- Supabase connection
- auth
- user roles
- global app shell
- navigation
- dashboard layout skeleton

### Phase 2 — Database + Core Entities
- create database schema
- build profiles
- build leads
- build parents
- build students
- build tutors
- build relationships
- build activity logging

### Phase 3 — Pipelines + Custom Fields
- pipelines
- stages
- custom fields
- custom field values
- pipeline UI

### Phase 4 — CRM Record Views
- list pages
- filters
- detail pages
- create/edit forms
- linked record UI

### Phase 5 — Onboarding + Website Capture
- public form endpoints or embedded form handling
- create leads from website
- onboarding forms
- onboarding review flows

### Phase 6 — Contracts / Documents
- contracts table
- documents upload
- status tracking
- linking to records

### Phase 7 — Communications
- templates
- email composer
- SMS composer
- communication timeline
- bulk send prep UI

### Phase 8 — Payments + Tasks
- payments UI
- status tracking
- tasks list and reminders
- operational widgets

### Phase 9 — Polish
- search
- audit trail
- dashboard widgets
- empty states
- settings cleanup
- responsive pass

---

## 12) Future Expansion Plan

The MVP must be architected so future phases can add:
- tutor login
- parent login
- student login
- dashboards by role
- progress snapshots
- lesson summaries
- attendance tracking
- Wise-linked data if integration becomes useful
- lesson scheduling
- homework/resources
- academic reporting
- replacing Wise completely if desired

---

## 13) Technical Notes for Supabase

Supabase project URL:
`https://yydqlisbtkqrvvcgedtn.supabase.co`

Important:
- do not hardcode secrets in client-side code
- use environment variables for anon key and service role key
- generate SQL migrations cleanly
- use RLS policies carefully
- assume internal admin users only for MVP auth flows
- keep schema modular and extensible

---

## 14) Prompt for Google AI Studio — Main Build Prompt

You are building a production-quality MVP for a bespoke internal CRM and operations platform for a tutoring company called Explore Apollo Tuition.

## Product goal
Build the MVP of an internal business operations system that replaces the client’s current use of GoHighLevel for:
- leads
- contacts
- parent/student onboarding
- tutor admin
- bulk email and SMS
- contracts and documents
- payments admin
- internal task and workflow management

Wise remains the lesson delivery platform for now. Do not build any live classroom or lesson delivery features in this MVP.

## Core product rules
1. Avoid hardcoding client-specific fields where possible.
2. The system must support configurable custom fields for major record types like leads, parents, students, and tutors.
3. The system must support multiple pipelines and configurable pipeline stages.
4. Build the MVP for internal staff first, not for parents or students.
5. Architect the app so future phases can support parent, student, and tutor dashboards.

## Tech direction
- Front end should be modern web app architecture
- Back end should use Supabase
- Supabase project URL is: https://yydqlisbtkqrvvcgedtn.supabase.co
- Use environment variables for keys
- Use row level security
- Use UUIDs
- Use modular schema design
- Generate clean database tables and migration-ready SQL

## Design direction
Create a premium, minimal, education-friendly SaaS interface with:
- light neutral background
- white cards
- subtle borders
- rounded corners
- soft pastel accents
- mostly neutral UI with pastel used for highlights only
- left sidebar navigation
- top search/action bar
- clear dashboard cards
- clean table layouts
- polished detail pages with tabs and activity timeline

The visual style should feel like a modern SaaS dashboard mixed with an education platform. Friendly, premium, calm, uncluttered.

## MVP screens to scaffold
- Login
- Dashboard
- Leads list and detail
- Parents list and detail
- Students list and detail
- Tutors list and detail
- Pipelines board/settings
- Onboarding submissions
- Contracts/documents
- Communications center
- Payments
- Tasks
- Settings
- Custom field manager
- Template manager

## Main entities to implement
- profiles
- leads
- parents
- students
- tutors
- student_parent_links
- enrolments
- pipelines
- pipeline_stages
- contracts
- documents
- communications
- templates
- payments
- tasks
- custom_fields
- custom_field_values
- activity_log

## Data model requirements
Each main entity should have fixed system fields, but the app must also support extensible custom fields using a custom field definition table and a custom field values table.

## UX requirements
Each detail page should have:
- header with name, status, stage, and quick actions
- main content with overview and linked records
- activity timeline
- tasks and communication history
- support for custom fields

## Build priorities
1. Create the front-end shell and navigation
2. Create Supabase schema and migrations
3. Build reusable table and detail-page components
4. Scaffold CRUD pages for the core entities
5. Scaffold pipeline and custom-field configuration
6. Prepare onboarding, documents, communications, and payment sections

## Do not build yet
- no Wise replacement
- no tutor external dashboard
- no parent portal
- no student portal
- no classroom tools
- no whiteboard
- no lesson recording UI

## Output requested
1. Folder structure for the app
2. Front-end shell with layout components
3. Supabase SQL schema for the MVP
4. Example RLS approach for internal users
5. Seed data examples for pipelines and stages
6. Reusable design tokens and component guidance
7. Scaffold pages for the MVP routes

Focus on clean architecture, extensibility, and maintainability.

---

## 15) Prompt for Google AI Studio — Database-first

You are designing the database architecture for a bespoke tutoring CRM and operations platform for Explore Apollo Tuition.

Build a Supabase-ready PostgreSQL schema for an MVP that handles:
- leads
- parents
- students
- tutors
- onboarding
- pipelines and stages
- contracts and documents
- communications
- payments
- tasks
- templates
- audit history
- custom fields

Requirements:
- Use UUID primary keys
- Include created_at and updated_at timestamps
- Support multiple pipelines
- Support configurable pipeline stages
- Support custom field definitions and custom field values
- Support polymorphic relations using related_type and related_id where appropriate
- Keep the schema extensible for future parent/student/tutor dashboards
- Add useful indexes
- Suggest RLS strategy for internal-only MVP
- Output SQL in migration-ready order

Entities required:
- profiles
- leads
- parents
- students
- tutors
- student_parent_links
- enrolments
- pipelines
- pipeline_stages
- contracts
- documents
- communications
- templates
- payments
- tasks
- custom_fields
- custom_field_values
- activity_log

Also include:
- suggested enum values where useful
- example seed data for default pipelines and stages
- notes on where to avoid over-hardcoding

---

## 16) Prompt for Google AI Studio — Front-end shell only

You are designing the front-end shell for a bespoke internal CRM and operations platform for Explore Apollo Tuition.

Design and scaffold a modern web app shell for an internal tutoring operations system with these sections:
- Dashboard
- Leads
- Parents
- Students
- Tutors
- Pipelines
- Onboarding
- Contracts
- Communications
- Payments
- Tasks
- Settings

Design goals:
- modern SaaS
- pastel accents
- calm education-friendly feel
- premium minimal layout
- light grey background
- white cards
- rounded corners
- subtle shadows
- clean tables
- responsive layout
- left sidebar
- topbar with search and quick actions

Important:
- this is an internal admin app, not a student portal
- optimize the shell for dense CRM workflows and detail pages
- use reusable layout components
- define design tokens, spacing, table styles, badges, and card variants
- scaffold route pages and shared components
- include example dashboard widgets and detail-page layout patterns

Output:
- app shell structure
- route structure
- layout components
- design token suggestions
- starter components for cards, tables, badges, tabs, timeline, and detail views

---

## 17) Non-negotiables

- Do not turn this into a generic school ERP
- Do not overbuild the academic side in MVP
- Do not hardcode every field
- Do not assume only one pipeline
- Do not assume one parent per student forever
- Do not assume only one subject arrangement per student
- Do not make the interface childish
- Do not make the interface visually noisy

The app should feel like a serious bespoke SaaS product for a premium tutoring company.
