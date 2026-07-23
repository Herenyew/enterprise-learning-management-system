-- Enterprise Learning Management System
-- Initial normalized PostgreSQL schema.
-- Target: PostgreSQL 15+.

CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS citext;

CREATE SCHEMA IF NOT EXISTS lms;
SET search_path TO lms, public;

-- ---------------------------------------------------------------------------
-- Domain enums for stable system states.
-- Business-configurable lists such as course levels, categories, program types,
-- content types, and question types are stored as tables instead of enums.
-- ---------------------------------------------------------------------------

CREATE TYPE actor_status AS ENUM ('active', 'invited', 'suspended', 'archived');
CREATE TYPE record_status AS ENUM ('active', 'inactive', 'archived', 'retired');
CREATE TYPE publish_status AS ENUM ('draft', 'in_review', 'published', 'archived', 'retired');
CREATE TYPE visibility_scope AS ENUM ('public', 'private', 'restricted');
CREATE TYPE source_kind AS ENUM ('device_upload', 'google_drive', 'external_url', 'built_in');
CREATE TYPE enrollment_status AS ENUM (
  'assigned',
  'enrolled',
  'in_progress',
  'completed',
  'failed',
  'cancelled',
  'expired'
);
CREATE TYPE assessment_policy AS ENUM ('disabled', 'optional', 'mandatory');
CREATE TYPE quiz_kind AS ENUM (
  'pre_course',
  'chapter',
  'end_of_course',
  'post_course',
  'standalone'
);
CREATE TYPE attempt_status AS ENUM ('started', 'submitted', 'passed', 'failed', 'abandoned');
CREATE TYPE assignment_submission_type AS ENUM ('file', 'text', 'link');
CREATE TYPE assignment_submission_status AS ENUM (
  'not_submitted',
  'submitted',
  'late',
  'returned',
  'graded'
);
CREATE TYPE survey_status AS ENUM ('draft', 'active', 'closed', 'archived');
CREATE TYPE certificate_status AS ENUM ('draft', 'issued', 'revoked', 'expired', 'renewed');
CREATE TYPE approval_status AS ENUM ('pending', 'approved', 'rejected', 'cancelled');
CREATE TYPE approval_action_type AS ENUM ('submitted', 'approved', 'rejected', 'returned', 'cancelled');
CREATE TYPE tna_status AS ENUM ('draft', 'submitted', 'approved', 'rejected', 'fulfilled', 'cancelled');
CREATE TYPE moderation_status AS ENUM ('open', 'reviewing', 'resolved', 'dismissed');
CREATE TYPE xp_event_type AS ENUM (
  'course_completion',
  'quiz_completion',
  'quiz_pass',
  'perfect_score',
  'program_completion',
  'manual_adjustment'
);
CREATE TYPE leaderboard_basis AS ENUM ('xp_points', 'course_completion', 'program_performance');
CREATE TYPE reset_frequency AS ENUM ('weekly', 'monthly', 'quarterly', 'never');
CREATE TYPE report_run_status AS ENUM ('queued', 'running', 'completed', 'failed');

-- ---------------------------------------------------------------------------
-- Shared timestamp helper.
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ---------------------------------------------------------------------------
-- 1. Organization, people, roles, and workforce structure.
-- ---------------------------------------------------------------------------

CREATE TABLE organizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  legal_name text,
  primary_domain citext,
  status record_status NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT organizations_name_unique UNIQUE (name)
);

CREATE TABLE departments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  parent_department_id uuid REFERENCES departments(id) ON DELETE SET NULL,
  name text NOT NULL,
  code text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT departments_org_name_unique UNIQUE (organization_id, name),
  CONSTRAINT departments_org_code_unique UNIQUE (organization_id, code)
);

CREATE TABLE work_units (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  department_id uuid REFERENCES departments(id) ON DELETE SET NULL,
  name text NOT NULL,
  code text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT work_units_org_name_unique UNIQUE (organization_id, name)
);

CREATE TABLE job_titles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  title text NOT NULL,
  job_family text,
  grade text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT job_titles_org_title_unique UNIQUE (organization_id, title)
);

CREATE TABLE competency_gap_areas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT competency_gap_areas_org_name_unique UNIQUE (organization_id, name)
);

CREATE TABLE users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  employee_number text,
  email citext NOT NULL,
  full_name text NOT NULL,
  preferred_name text,
  avatar_url text,
  department_id uuid REFERENCES departments(id) ON DELETE SET NULL,
  work_unit_id uuid REFERENCES work_units(id) ON DELETE SET NULL,
  job_title_id uuid REFERENCES job_titles(id) ON DELETE SET NULL,
  manager_user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  status actor_status NOT NULL DEFAULT 'active',
  hired_on date,
  last_login_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT users_org_email_unique UNIQUE (organization_id, email),
  CONSTRAINT users_org_employee_number_unique UNIQUE (organization_id, employee_number)
);

CREATE TABLE roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  name text NOT NULL,
  description text,
  is_system_role boolean NOT NULL DEFAULT true
);

CREATE TABLE user_roles (
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role_id uuid NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  assigned_by_user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  assigned_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, role_id)
);

-- ---------------------------------------------------------------------------
-- 2. Files and assets used by courses, certificates, signatures, reports, etc.
-- ---------------------------------------------------------------------------

CREATE TABLE file_assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  uploaded_by_user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  file_name text NOT NULL,
  mime_type text,
  file_size_bytes bigint CHECK (file_size_bytes IS NULL OR file_size_bytes >= 0),
  storage_provider text NOT NULL DEFAULT 'local',
  storage_key text,
  external_url text,
  checksum_sha256 text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- 3. Catalog and platform configuration.
-- ---------------------------------------------------------------------------

CREATE TABLE course_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name text NOT NULL,
  slug text NOT NULL,
  description text,
  display_order integer NOT NULL DEFAULT 0,
  is_visible boolean NOT NULL DEFAULT true,
  status record_status NOT NULL DEFAULT 'active',
  created_by_user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT course_categories_org_slug_unique UNIQUE (organization_id, slug)
);

CREATE TABLE course_levels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  display_order integer NOT NULL DEFAULT 0,
  is_visible boolean NOT NULL DEFAULT true,
  status record_status NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT course_levels_org_name_unique UNIQUE (organization_id, name)
);

CREATE TABLE content_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  code text NOT NULL,
  name text NOT NULL,
  description text,
  allowed_formats text,
  max_file_size_mb integer CHECK (max_file_size_mb IS NULL OR max_file_size_mb >= 0),
  requires_lrs boolean NOT NULL DEFAULT false,
  allow_creator boolean NOT NULL DEFAULT true,
  allow_learner_upload boolean NOT NULL DEFAULT false,
  is_enabled boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT content_types_org_code_unique UNIQUE (organization_id, code)
);

CREATE TABLE question_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  code text NOT NULL,
  name text NOT NULL,
  description text,
  configuration_schema jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_enabled boolean NOT NULL DEFAULT true,
  created_by_user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT question_types_org_code_unique UNIQUE (organization_id, code)
);

CREATE TABLE external_providers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name text NOT NULL,
  provider_type text NOT NULL,
  integration_status record_status NOT NULL DEFAULT 'inactive',
  integration_config jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT external_providers_org_name_unique UNIQUE (organization_id, name)
);

CREATE TABLE external_provider_tracks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id uuid NOT NULL REFERENCES external_providers(id) ON DELETE CASCADE,
  name text NOT NULL,
  credential_name text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT external_provider_tracks_provider_name_unique UNIQUE (provider_id, name)
);

-- ---------------------------------------------------------------------------
-- 4. Approval workflows.
-- ---------------------------------------------------------------------------

CREATE TABLE approval_workflows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name text NOT NULL,
  applies_to text NOT NULL,
  description text,
  is_enabled boolean NOT NULL DEFAULT true,
  created_by_user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT approval_workflows_org_name_unique UNIQUE (organization_id, name)
);

CREATE TABLE approval_workflow_steps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id uuid NOT NULL REFERENCES approval_workflows(id) ON DELETE CASCADE,
  step_order integer NOT NULL CHECK (step_order > 0),
  step_name text NOT NULL,
  approver_type text NOT NULL CHECK (approver_type IN ('role', 'manager', 'specific_user')),
  approver_role_id uuid REFERENCES roles(id) ON DELETE SET NULL,
  approver_user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  is_required boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT approval_workflow_steps_unique_order UNIQUE (workflow_id, step_order)
);

-- ---------------------------------------------------------------------------
-- 5. Certificate templates and signers.
-- ---------------------------------------------------------------------------

CREATE TABLE certificate_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  orientation text NOT NULL DEFAULT 'landscape' CHECK (orientation IN ('landscape', 'portrait')),
  background_asset_id uuid REFERENCES file_assets(id) ON DELETE SET NULL,
  border_style text,
  layout_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  include_official_stamp boolean NOT NULL DEFAULT true,
  lock_when_in_use boolean NOT NULL DEFAULT true,
  status publish_status NOT NULL DEFAULT 'draft',
  created_by_user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT certificate_templates_org_name_unique UNIQUE (organization_id, name)
);

CREATE TABLE certificate_template_signers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id uuid NOT NULL REFERENCES certificate_templates(id) ON DELETE CASCADE,
  signer_user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  signer_name text NOT NULL,
  signer_title text NOT NULL,
  signature_asset_id uuid REFERENCES file_assets(id) ON DELETE SET NULL,
  display_order integer NOT NULL DEFAULT 1,
  is_required boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT certificate_template_signers_unique_order UNIQUE (template_id, display_order)
);

-- ---------------------------------------------------------------------------
-- 6. Program types, programs, cohorts, tasks, milestones, and templates.
-- ---------------------------------------------------------------------------

CREATE TABLE program_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  default_duration_days integer CHECK (default_duration_days IS NULL OR default_duration_days > 0),
  default_certificate_template_id uuid REFERENCES certificate_templates(id) ON DELETE SET NULL,
  default_xp_multiplier numeric(6, 2) NOT NULL DEFAULT 1.00 CHECK (default_xp_multiplier > 0),
  enrollment_workflow_id uuid REFERENCES approval_workflows(id) ON DELETE SET NULL,
  completion_workflow_id uuid REFERENCES approval_workflows(id) ON DELETE SET NULL,
  status record_status NOT NULL DEFAULT 'active',
  created_by_user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT program_types_org_name_unique UNIQUE (organization_id, name)
);

CREATE TABLE programs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  program_type_id uuid REFERENCES program_types(id) ON DELETE SET NULL,
  owner_user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  name text NOT NULL,
  description text,
  target_audience text,
  visibility visibility_scope NOT NULL DEFAULT 'private',
  status publish_status NOT NULL DEFAULT 'draft',
  start_date date,
  end_date date,
  xp_multiplier numeric(6, 2) NOT NULL DEFAULT 1.00 CHECK (xp_multiplier > 0),
  created_by_user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  published_at timestamptz,
  archived_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT programs_org_name_unique UNIQUE (organization_id, name),
  CONSTRAINT programs_dates_valid CHECK (end_date IS NULL OR start_date IS NULL OR end_date >= start_date)
);

CREATE TABLE program_target_departments (
  program_id uuid NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
  department_id uuid NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
  PRIMARY KEY (program_id, department_id)
);

CREATE TABLE program_target_work_units (
  program_id uuid NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
  work_unit_id uuid NOT NULL REFERENCES work_units(id) ON DELETE CASCADE,
  PRIMARY KEY (program_id, work_unit_id)
);

CREATE TABLE program_target_job_titles (
  program_id uuid NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
  job_title_id uuid NOT NULL REFERENCES job_titles(id) ON DELETE CASCADE,
  PRIMARY KEY (program_id, job_title_id)
);

CREATE TABLE program_cohorts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id uuid NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
  name text NOT NULL,
  start_date date,
  end_date date,
  capacity integer CHECK (capacity IS NULL OR capacity > 0),
  created_by_user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT program_cohorts_program_name_unique UNIQUE (program_id, name),
  CONSTRAINT program_cohorts_dates_valid CHECK (
    end_date IS NULL OR start_date IS NULL OR end_date >= start_date
  )
);

CREATE TABLE program_cohort_members (
  cohort_id uuid NOT NULL REFERENCES program_cohorts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  added_by_user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  added_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (cohort_id, user_id)
);

CREATE TABLE program_tasks (
  id uuid PRIMARY KEY DT NULL DEFAULT now()
);

CREATE TABLE program_milestones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id uuid NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  due_offset_days integer,EFAULT gen_random_uuid(),
  program_id uuid NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
  title text NOT NULL,
  task_type text NOT NULL,
  description text,
  scheduled_start_at timestamptz,
  scheduled_due_at timestamptz,
  due_offset_days integer,
  display_order integer NOT NULL DEFAULT 0,
  is_required boolean NOT NULL DEFAULT true,
  created_by_user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NO
  display_order integer NOT NULL DEFAULT 0,
  is_required boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE program_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  program_type_id uuid REFERENCES program_types(id) ON DELETE SET NULL,
  name text NOT NULL,
  description text,
  target_audience text,
  default_duration_days integer CHECK (default_duration_days IS NULL OR default_duration_days > 0),
  default_visibility visibility_scope NOT NULL DEFAULT 'private',
  is_active boolean NOT NULL DEFAULT true,
  created_by_user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT program_templates_org_name_unique UNIQUE (organization_id, name)
);

CREATE TABLE program_template_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id uuid NOT NULL REFERENCES program_templates(id) ON DELETE CASCADE,
  title text NOT NULL,
  task_type text NOT NULL,
  description text,
  due_offset_days integer,
  display_order integer NOT NULL DEFAULT 0,
  is_required boolean NOT NULL DEFAULT true
);

CREATE TABLE program_template_milestones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id uuid NOT NULL REFERENCES program_templates(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  due_offset_days integer,
  display_order integer NOT NULL DEFAULT 0,
  is_required boolean NOT NULL DEFAULT true
);

-- ---------------------------------------------------------------------------
-- 7. Courses, chapters, content, attachments, catalog audience, reviews.
-- ---------------------------------------------------------------------------

CREATE TABLE courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  category_id uuid REFERENCES course_categories(id) ON DELETE SET NULL,
  level_id uuid REFERENCES course_levels(id) ON DELETE SET NULL,
  owner_user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  creator_user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  title text NOT NULL,
  slug text NOT NULL,
  description text,
  thumbnail_asset_id uuid REFERENCES file_assets(id) ON DELETE SET NULL,
  thumbnail_url text,
  duration_minutes integer CHECK (duration_minutes IS NULL OR duration_minutes >= 0),
  xp_on_completion integer NOT NULL DEFAULT 0 CHECK (xp_on_completion >= 0),
  xp_multiplier numeric(6, 2) NOT NULL DEFAULT 1.00 CHECK (xp_multiplier > 0),
  pass_threshold_pct numeric(5, 2) CHECK (
    pass_threshold_pct IS NULL OR pass_threshold_pct BETWEEN 0 AND 100
  ),
  minimum_completion_pct numeric(5, 2) NOT NULL DEFAULT 100 CHECK (
    minimum_completion_pct BETWEEN 0 AND 100
  ),
  pre_course_assessment_policy assessment_policy NOT NULL DEFAULT 'disabled',
  post_course_assessment_policy assessment_policy NOT NULL DEFAULT 'disabled',
  visibility visibility_scope NOT NULL DEFAULT 'private',
  status publish_status NOT NULL DEFAULT 'draft',
  published_at timestamptz,
  archived_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT courses_org_slug_unique UNIQUE (organization_id, slug)
);

CREATE TABLE course_target_departments (
  course_id uuid NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  department_id uuid NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
  PRIMARY KEY (course_id, department_id)
);

CREATE TABLE course_target_work_units (
  course_id uuid NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  work_unit_id uuid NOT NULL REFERENCES work_units(id) ON DELETE CASCADE,
  PRIMARY KEY (course_id, work_unit_id)
);

CREATE TABLE course_target_job_titles (
  course_id uuid NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  job_title_id uuid NOT NULL REFERENCES job_titles(id) ON DELETE CASCADE,
  PRIMARY KEY (course_id, job_title_id)
);

CREATE TABLE course_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  version_number integer NOT NULL CHECK (version_number > 0),
  change_note text,
  snapshot_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by_user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT course_versions_unique_number UNIQUE (course_id, version_number)
);

CREATE TABLE course_chapters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  display_order integer NOT NULL DEFAULT 0,
  is_required boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT course_chapters_unique_order UNIQUE (course_id, display_order)
);

CREATE TABLE course_content_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  chapter_id uuid NOT NULL REFERENCES course_chapters(id) ON DELETE CASCADE,
  content_type_id uuid NOT NULL REFERENCES content_types(id) ON DELETE RESTRICT,
  title text NOT NULL,
  description text,
  source_type source_kind NOT NULL DEFAULT 'built_in',
  external_url text,
  duration_seconds integer CHECK (duration_seconds IS NULL OR duration_seconds >= 0),
  estimated_minutes integer CHECK (estimated_minutes IS NULL OR estimated_minutes >= 0),
  display_order integer NOT NULL DEFAULT 0,
  is_required boolean NOT NULL DEFAULT true,
  completion_weight numeric(8, 4) NOT NULL DEFAULT 1.0000 CHECK (completion_weight >= 0),
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by_user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT course_content_items_unique_order UNIQUE (chapter_id, display_order)
);

CREATE TABLE content_item_attachments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content_item_id uuid NOT NULL REFERENCES course_content_items(id) ON DELETE CASCADE,
  file_asset_id uuid REFERENCES file_assets(id) ON DELETE SET NULL,
  source_type source_kind NOT NULL DEFAULT 'device_upload',
  external_url text,
  display_name text NOT NULL,
  display_order integer NOT NULL DEFAULT 0,
  created_by_user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE program_courses (
  program_id uuid NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
  course_id uuid NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  display_order integer NOT NULL DEFAULT 0,
  is_required boolean NOT NULL DEFAULT true,
  unlock_rule text,
  PRIMARY KEY (program_id, course_id)
);

CREATE TABLE program_template_courses (
  template_id uuid NOT NULL REFERENCES program_templates(id) ON DELETE CASCADE,
  course_id uuid NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  display_order integer NOT NULL DEFAULT 0,
  is_required boolean NOT NULL DEFAULT true,
  PRIMARY KEY (template_id, course_id)
);

CREATE TABLE course_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rating integer NOT NULL CHECK (rating BETWEEN 1 AND 5),
  title text,
  body text,
  moderation_status moderation_status NOT NULL DEFAULT 'open',
  is_visible boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT course_reviews_one_per_user UNIQUE (course_id, user_id)
);

CREATE TABLE course_review_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id uuid NOT NULL REFERENCES course_reviews(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  body text NOT NULL,
  moderation_status moderation_status NOT NULL DEFAULT 'open',
  is_visible boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE moderation_flags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  subject_type text NOT NULL,
  subject_id uuid NOT NULL,
  reported_by_user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  reason text NOT NULL,
  severity text NOT NULL DEFAULT 'review',
  status moderation_status NOT NULL DEFAULT 'open',
  resolved_by_user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  resolved_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- 8. Course templates.
-- ---------------------------------------------------------------------------

CREATE TABLE course_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  category_id uuid REFERENCES course_categories(id) ON DELETE SET NULL,
  level_id uuid REFERENCES course_levels(id) ON DELETE SET NULL,
  name text NOT NULL,
  title text NOT NULL,
  description text,
  default_xp_on_completion integer NOT NULL DEFAULT 0 CHECK (default_xp_on_completion >= 0),
  default_pass_threshold_pct numeric(5, 2) CHECK (
    default_pass_threshold_pct IS NULL OR default_pass_threshold_pct BETWEEN 0 AND 100
  ),
  is_active boolean NOT NULL DEFAULT true,
  created_by_user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT course_templates_org_name_unique UNIQUE (organization_id, name)
);

CREATE TABLE course_template_chapters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id uuid NOT NULL REFERENCES course_templates(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  display_order integer NOT NULL DEFAULT 0,
  is_required boolean NOT NULL DEFAULT true
);

CREATE TABLE course_template_content_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_chapter_id uuid NOT NULL REFERENCES course_template_chapters(id) ON DELETE CASCADE,
  content_type_id uuid REFERENCES content_types(id) ON DELETE SET NULL,
  title text NOT NULL,
  description text,
  estimated_minutes integer CHECK (estimated_minutes IS NULL OR estimated_minutes >= 0),
  display_order integer NOT NULL DEFAULT 0,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb
);

-- ---------------------------------------------------------------------------
-- 9. Question bank, quiz templates, quizzes, attempts, and scoring policies.
-- ---------------------------------------------------------------------------

CREATE TABLE attempt_scoring_policies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  is_enabled boolean NOT NULL DEFAULT true,
  created_by_user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT attempt_scoring_policies_org_name_unique UNIQUE (organization_id, name)
);

CREATE TABLE attempt_scoring_policy_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  policy_id uuid NOT NULL REFERENCES attempt_scoring_policies(id) ON DELETE CASCADE,
  attempt_number_min integer NOT NULL CHECK (attempt_number_min > 0),
  attempt_number_max integer CHECK (attempt_number_max IS NULL OR attempt_number_max >= attempt_number_min),
  score_multiplier numeric(6, 4) NOT NULL DEFAULT 1.0000 CHECK (score_multiplier >= 0),
  fixed_penalty_points numeric(8, 2) NOT NULL DEFAULT 0 CHECK (fixed_penalty_points >= 0),
  CONSTRAINT attempt_scoring_policy_rules_unique_min UNIQUE (policy_id, attempt_number_min)
);

CREATE TABLE question_bank_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  question_type_id uuid NOT NULL REFERENCES question_types(id) ON DELETE RESTRICT,
  topic text,
  difficulty text NOT NULL DEFAULT 'medium',
  prompt text NOT NULL,
  explanation text,
  default_points numeric(8, 2) NOT NULL DEFAULT 1 CHECK (default_points >= 0),
  status record_status NOT NULL DEFAULT 'active',
  created_by_user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE question_options (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id uuid NOT NULL REFERENCES question_bank_questions(id) ON DELETE CASCADE,
  option_text text NOT NULL,
  is_correct boolean NOT NULL DEFAULT false,
  display_order integer NOT NULL DEFAULT 0
);

CREATE TABLE question_matching_pairs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id uuid NOT NULL REFERENCES question_bank_questions(id) ON DELETE CASCADE,
  prompt_text text NOT NULL,
  match_text text NOT NULL,
  display_order integer NOT NULL DEFAULT 0
);

CREATE TABLE question_ordering_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id uuid NOT NULL REFERENCES question_bank_questions(id) ON DELETE CASCADE,
  item_text text NOT NULL,
  correct_order integer NOT NULL CHECK (correct_order > 0)
);

CREATE TABLE quiz_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  attempt_scoring_policy_id uuid REFERENCES attempt_scoring_policies(id) ON DELETE SET NULL,
  name text NOT NULL,
  description text,
  pass_threshold_pct numeric(5, 2) NOT NULL DEFAULT 80 CHECK (pass_threshold_pct BETWEEN 0 AND 100),
  max_attempts integer NOT NULL DEFAULT 3 CHECK (max_attempts > 0),
  time_limit_minutes integer CHECK (time_limit_minutes IS NULL OR time_limit_minutes > 0),
  randomize_question_order boolean NOT NULL DEFAULT false,
  show_correct_answers_after_submit boolean NOT NULL DEFAULT false,
  negative_marking boolean NOT NULL DEFAULT false,
  partial_scoring boolean NOT NULL DEFAULT false,
  is_active boolean NOT NULL DEFAULT true,
  created_by_user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT quiz_templates_org_name_unique UNIQUE (organization_id, name)
);

CREATE TABLE quiz_template_questions (
  quiz_template_id uuid NOT NULL REFERENCES quiz_templates(id) ON DELETE CASCADE,
  question_id uuid NOT NULL REFERENCES question_bank_questions(id) ON DELETE CASCADE,
  display_order integer NOT NULL DEFAULT 0,
  points_override numeric(8, 2) CHECK (points_override IS NULL OR points_override >= 0),
  PRIMARY KEY (quiz_template_id, question_id)
);

CREATE TABLE quizzes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  course_id uuid REFERENCES courses(id) ON DELETE CASCADE,
  chapter_id uuid REFERENCES course_chapters(id) ON DELETE CASCADE,
  content_item_id uuid REFERENCES course_content_items(id) ON DELETE SET NULL,
  template_id uuid REFERENCES quiz_templates(id) ON DELETE SET NULL,
  attempt_scoring_policy_id uuid REFERENCES attempt_scoring_policies(id) ON DELETE SET NULL,
  title text NOT NULL,
  quiz_kind quiz_kind NOT NULL DEFAULT 'chapter',
  pass_threshold_pct numeric(5, 2) NOT NULL DEFAULT 80 CHECK (pass_threshold_pct BETWEEN 0 AND 100),
  max_attempts integer NOT NULL DEFAULT 3 CHECK (max_attempts > 0),
  time_limit_minutes integer CHECK (time_limit_minutes IS NULL OR time_limit_minutes > 0),
  retry_rule text,
  randomize_question_order boolean NOT NULL DEFAULT false,
  show_correct_answers_after_submit boolean NOT NULL DEFAULT false,
  negative_marking boolean NOT NULL DEFAULT false,
  partial_scoring boolean NOT NULL DEFAULT false,
  is_required boolean NOT NULL DEFAULT true,
  created_by_user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE quiz_questions (
  quiz_id uuid NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  question_id uuid NOT NULL REFERENCES question_bank_questions(id) ON DELETE CASCADE,
  display_order integer NOT NULL DEFAULT 0,
  points numeric(8, 2) NOT NULL DEFAULT 1 CHECK (points >= 0),
  PRIMARY KEY (quiz_id, question_id)
);

-- ---------------------------------------------------------------------------
-- 10. Enrollment, progress, quiz attempts, and learner program progress.
-- ---------------------------------------------------------------------------

CREATE TABLE course_enrollments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  enrolled_by_user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  status enrollment_status NOT NULL DEFAULT 'enrolled',
  enrollment_source text NOT NULL DEFAULT 'self',
  due_at timestamptz,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT course_enrollments_unique_user_course UNIQUE (course_id, user_id)
);

CREATE TABLE content_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  enrollment_id uuid NOT NULL REFERENCES course_enrollments(id) ON DELETE CASCADE,
  content_item_id uuid NOT NULL REFERENCES course_content_items(id) ON DELETE CASCADE,
  progress_pct numeric(5, 2) NOT NULL DEFAULT 0 CHECK (progress_pct BETWEEN 0 AND 100),
  time_spent_seconds integer NOT NULL DEFAULT 0 CHECK (time_spent_seconds >= 0),
  last_position_seconds integer CHECK (last_position_seconds IS NULL OR last_position_seconds >= 0),
  started_at timestamptz,
  completed_at timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT content_progress_unique_item UNIQUE (enrollment_id, content_item_id)
);

CREATE TABLE program_enrollments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id uuid NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
  cohort_id uuid REFERENCES program_cohorts(id) ON DELETE SET NULL,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  enrolled_by_user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  status enrollment_status NOT NULL DEFAULT 'enrolled',
  progress_pct numeric(5, 2) NOT NULL DEFAULT 0 CHECK (progress_pct BETWEEN 0 AND 100),
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT program_enrollments_unique_user_program UNIQUE (program_id, user_id)
);

CREATE TABLE quiz_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id uuid NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  enrollment_id uuid REFERENCES course_enrollments(id) ON DELETE SET NULL,
  attempt_number integer NOT NULL CHECK (attempt_number > 0),
  status attempt_status NOT NULL DEFAULT 'started',
  started_at timestamptz NOT NULL DEFAULT now(),
  submitted_at timestamptz,
  score_pct numeric(5, 2) CHECK (score_pct IS NULL OR score_pct BETWEEN 0 AND 100),
  raw_points numeric(10, 2) CHECK (raw_points IS NULL OR raw_points >= 0),
  awarded_points numeric(10, 2) CHECK (awarded_points IS NULL OR awarded_points >= 0),
  xp_awarded integer NOT NULL DEFAULT 0 CHECK (xp_awarded >= 0),
  CONSTRAINT quiz_attempts_unique_attempt UNIQUE (quiz_id, user_id, attempt_number)
);

CREATE TABLE quiz_answers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  attempt_id uuid NOT NULL REFERENCES quiz_attempts(id) ON DELETE CASCADE,
  question_id uuid NOT NULL REFERENCES question_bank_questions(id) ON DELETE CASCADE,
  selected_option_id uuid REFERENCES question_options(id) ON DELETE SET NULL,
  answer_text text,
  answer_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_correct boolean,
  points_awarded numeric(8, 2) CHECK (points_awarded IS NULL OR points_awarded >= 0),
  answered_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT quiz_answers_unique_question UNIQUE (attempt_id, question_id)
);

-- ---------------------------------------------------------------------------
-- 11. Assignments and submissions.
-- ---------------------------------------------------------------------------

CREATE TABLE assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  course_id uuid REFERENCES courses(id) ON DELETE CASCADE,
  program_id uuid REFERENCES programs(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  submission_type assignment_submission_type NOT NULL DEFAULT 'file',
  due_at timestamptz,
  peer_review_enabled boolean NOT NULL DEFAULT false,
  status publish_status NOT NULL DEFAULT 'draft',
  created_by_user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT assignments_has_owner CHECK (course_id IS NOT NULL OR program_id IS NOT NULL)
);

CREATE TABLE assignment_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id uuid NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  submission_text text,
  submission_url text,
  status assignment_submission_status NOT NULL DEFAULT 'not_submitted',
  submitted_at timestamptz,
  grade_score numeric(6, 2),
  reviewer_user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  reviewed_at timestamptz,
  review_notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT assignment_submissions_unique_user UNIQUE (assignment_id, user_id)
);

CREATE TABLE assignment_submission_files (
  submission_id uuid NOT NULL REFERENCES assignment_submissions(id) ON DELETE CASCADE,
  file_asset_id uuid NOT NULL REFERENCES file_assets(id) ON DELETE CASCADE,
  PRIMARY KEY (submission_id, file_asset_id)
);

CREATE TABLE assignment_peer_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id uuid NOT NULL REFERENCES assignment_submissions(id) ON DELETE CASCADE,
  reviewer_user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  score numeric(6, 2),
  comments text,
  submitted_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT assignment_peer_reviews_unique_reviewer UNIQUE (submission_id, reviewer_user_id)
);

-- ---------------------------------------------------------------------------
-- 12. Surveys and feedback.
-- ---------------------------------------------------------------------------

CREATE TABLE surveys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  course_id uuid REFERENCES courses(id) ON DELETE CASCADE,
  program_id uuid REFERENCES programs(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  is_anonymous boolean NOT NULL DEFAULT false,
  status survey_status NOT NULL DEFAULT 'draft',
  created_by_user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE survey_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  survey_id uuid NOT NULL REFERENCES surveys(id) ON DELETE CASCADE,
  question_type text NOT NULL CHECK (question_type IN ('rating', 'scale', 'yes_no', 'single_choice', 'multi_choice', 'open_text')),
  prompt text NOT NULL,
  is_required boolean NOT NULL DEFAULT true,
  display_order integer NOT NULL DEFAULT 0,
  scale_min integer,
  scale_max integer,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE survey_question_options (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  survey_question_id uuid NOT NULL REFERENCES survey_questions(id) ON DELETE CASCADE,
  option_text text NOT NULL,
  display_order integer NOT NULL DEFAULT 0
);

CREATE TABLE survey_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  survey_id uuid NOT NULL REFERENCES surveys(id) ON DELETE CASCADE,
  user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  submitted_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE survey_answers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  response_id uuid NOT NULL REFERENCES survey_responses(id) ON DELETE CASCADE,
  survey_question_id uuid NOT NULL REFERENCES survey_questions(id) ON DELETE CASCADE,
  selected_option_id uuid REFERENCES survey_question_options(id) ON DELETE SET NULL,
  answer_text text,
  numeric_value numeric(8, 2),
  answer_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  CONSTRAINT survey_answers_unique_question UNIQUE (response_id, survey_question_id)
);

-- ---------------------------------------------------------------------------
-- 13. Certificates and external credentials.
-- ---------------------------------------------------------------------------

CREATE TABLE issued_certificates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  template_id uuid REFERENCES certificate_templates(id) ON DELETE SET NULL,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  course_id uuid REFERENCES courses(id) ON DELETE SET NULL,
  program_id uuid REFERENCES programs(id) ON DELETE SET NULL,
  certificate_number text NOT NULL,
  status certificate_status NOT NULL DEFAULT 'issued',
  issued_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz,
  pdf_asset_id uuid REFERENCES file_assets(id) ON DELETE SET NULL,
  issued_by_user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  CONSTRAINT issued_certificates_org_number_unique UNIQUE (organization_id, certificate_number),
  CONSTRAINT issued_certificates_has_subject CHECK (course_id IS NOT NULL OR program_id IS NOT NULL)
);

CREATE TABLE external_certificates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  provider_id uuid REFERENCES external_providers(id) ON DELETE SET NULL,
  credential_name text NOT NULL,
  credential_number text,
  issue_date date,
  expiry_date date,
  verification_url text,
  parsed_status text,
  source_asset_id uuid REFERENCES file_assets(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- 14. XP, gamification, and leaderboards.
-- ---------------------------------------------------------------------------

CREATE TABLE learning_levels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name text NOT NULL,
  display_order integer NOT NULL DEFAULT 0,
  min_xp integer NOT NULL CHECK (min_xp >= 0),
  max_xp integer CHECK (max_xp IS NULL OR max_xp >= min_xp),
  badge_asset_id uuid REFERENCES file_assets(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT learning_levels_org_name_unique UNIQUE (organization_id, name)
);

CREATE TABLE xp_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  rule_code text NOT NULL,
  name text NOT NULL,
  event_type xp_event_type NOT NULL,
  xp_amount integer NOT NULL DEFAULT 0 CHECK (xp_amount >= 0),
  multiplier numeric(6, 2) NOT NULL DEFAULT 1.00 CHECK (multiplier > 0),
  minimum_completion_pct numeric(5, 2) CHECK (
    minimum_completion_pct IS NULL OR minimum_completion_pct BETWEEN 0 AND 100
  ),
  is_enabled boolean NOT NULL DEFAULT true,
  created_by_user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT xp_rules_org_code_unique UNIQUE (organization_id, rule_code)
);

CREATE TABLE xp_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  course_id uuid REFERENCES courses(id) ON DELETE SET NULL,
  program_id uuid REFERENCES programs(id) ON DELETE SET NULL,
  quiz_attempt_id uuid REFERENCES quiz_attempts(id) ON DELETE SET NULL,
  event_type xp_event_type NOT NULL,
  xp_amount integer NOT NULL CHECK (xp_amount <> 0),
  reason text,
  created_by_user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE user_xp_summaries (
  user_id uuid PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  current_level_id uuid REFERENCES learning_levels(id) ON DELETE SET NULL,
  total_xp integer NOT NULL DEFAULT 0 CHECK (total_xp >= 0),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE leaderboard_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name text NOT NULL,
  basis leaderboard_basis NOT NULL DEFAULT 'xp_points',
  scope text NOT NULL DEFAULT 'company',
  reset_frequency reset_frequency NOT NULL DEFAULT 'monthly',
  is_default_for_learners boolean NOT NULL DEFAULT false,
  anonymous_mode boolean NOT NULL DEFAULT false,
  is_enabled boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT leaderboard_rules_org_name_unique UNIQUE (organization_id, name)
);

CREATE TABLE leaderboard_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  leaderboard_rule_id uuid NOT NULL REFERENCES leaderboard_rules(id) ON DELETE CASCADE,
  period_start date NOT NULL,
  period_end date NOT NULL,
  generated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT leaderboard_snapshots_dates_valid CHECK (period_end >= period_start)
);

CREATE TABLE leaderboard_entries (
  snapshot_id uuid NOT NULL REFERENCES leaderboard_snapshots(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rank_number integer NOT NULL CHECK (rank_number > 0),
  score numeric(12, 2) NOT NULL DEFAULT 0,
  PRIMARY KEY (snapshot_id, user_id),
  CONSTRAINT leaderboard_entries_unique_rank UNIQUE (snapshot_id, rank_number)
);

-- ---------------------------------------------------------------------------
-- 15. Training needs analysis.
-- ---------------------------------------------------------------------------

CREATE TABLE tna_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  requester_user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  learner_user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  department_id uuid REFERENCES departments(id) ON DELETE SET NULL,
  work_unit_id uuid REFERENCES work_units(id) ON DELETE SET NULL,
  job_title_id uuid REFERENCES job_titles(id) ON DELETE SET NULL,
  competency_gap_area_id uuid REFERENCES competency_gap_areas(id) ON DELETE SET NULL,
  request_type text NOT NULL DEFAULT 'individual',
  preferred_training_format text,
  preferred_start_date date,
  target_completion_date date,
  business_justification text,
  status tna_status NOT NULL DEFAULT 'draft',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- 16. Approval requests, notifications, reporting, and audit.
-- ---------------------------------------------------------------------------

CREATE TABLE approval_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  workflow_id uuid REFERENCES approval_workflows(id) ON DELETE SET NULL,
  subject_type text NOT NULL,
  subject_id uuid NOT NULL,
  requested_by_user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  status approval_status NOT NULL DEFAULT 'pending',
  requested_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz
);

CREATE TABLE approval_actions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  approval_request_id uuid NOT NULL REFERENCES approval_requests(id) ON DELETE CASCADE,
  workflow_step_id uuid REFERENCES approval_workflow_steps(id) ON DELETE SET NULL,
  actor_user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  action approval_action_type NOT NULL,
  comments text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE notification_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  channel text NOT NULL,
  notification_type text NOT NULL,
  is_enabled boolean NOT NULL DEFAULT true,
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT notification_settings_unique_user_type UNIQUE (user_id, channel, notification_type)
);

CREATE TABLE notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title text NOT NULL,
  body text,
  notification_type text NOT NULL,
  action_url text,
  read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE saved_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  owner_user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  name text NOT NULL,
  report_type text NOT NULL,
  filters_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  schedule_cron text,
  is_enabled boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT saved_reports_org_name_unique UNIQUE (organization_id, name)
);

CREATE TABLE report_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id uuid NOT NULL REFERENCES saved_reports(id) ON DELETE CASCADE,
  status report_run_status NOT NULL DEFAULT 'queued',
  output_asset_id uuid REFERENCES file_assets(id) ON DELETE SET NULL,
  started_at timestamptz,
  completed_at timestamptz,
  error_message text
);

CREATE TABLE dashboard_widgets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name text NOT NULL,
  kpi_key text NOT NULL,
  section text NOT NULL,
  chart_type text NOT NULL,
  display_order integer NOT NULL DEFAULT 0,
  is_enabled boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT dashboard_widgets_org_name_unique UNIQUE (organization_id, name)
);

CREATE TABLE audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES organizations(id) ON DELETE SET NULL,
  actor_user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  entity_type text NOT NULL,
  entity_id uuid,
  action text NOT NULL,
  before_json jsonb,
  after_json jsonb,
  ip_address inet,
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- Views for common reporting screens.
-- ---------------------------------------------------------------------------

CREATE VIEW v_course_catalog AS
SELECT
  c.id,
  c.organization_id,
  c.title,
  c.slug,
  c.description,
  cc.name AS category_name,
  cl.name AS level_name,
  c.duration_minutes,
  c.xp_on_completion,
  c.xp_multiplier,
  c.visibility,
  c.status,
  c.published_at,
  COUNT(DISTINCT ce.user_id) AS enrolled_count,
  AVG(cr.rating)::numeric(5, 2) AS average_rating
FROM courses c
LEFT JOIN course_categories cc ON cc.id = c.category_id
LEFT JOIN course_levels cl ON cl.id = c.level_id
LEFT JOIN course_enrollments ce ON ce.course_id = c.id
LEFT JOIN course_reviews cr ON cr.course_id = c.id AND cr.is_visible = true
GROUP BY c.id, cc.name, cl.name;

CREATE VIEW v_learner_progress_report AS
SELECT
  u.id AS user_id,
  u.organization_id,
  u.full_name,
  d.name AS department_name,
  COUNT(DISTINCT ce.id) FILTER (WHERE ce.status = 'completed') AS completed_courses,
  COUNT(DISTINCT ce.id) FILTER (WHERE ce.status <> 'completed') AS pending_courses,
  COUNT(DISTINCT ic.id) FILTER (WHERE ic.status = 'issued') AS active_certificates,
  COALESCE(ux.total_xp, 0) AS total_xp,
  COUNT(DISTINCT qa.id) AS quiz_attempts
FROM users u
LEFT JOIN departments d ON d.id = u.department_id
LEFT JOIN course_enrollments ce ON ce.user_id = u.id
LEFT JOIN issued_certificates ic ON ic.user_id = u.id AND ic.status = 'issued'
LEFT JOIN user_xp_summaries ux ON ux.user_id = u.id
LEFT JOIN quiz_attempts qa ON qa.user_id = u.id
GROUP BY u.id, d.name, ux.total_xp;

CREATE VIEW v_course_completion_report AS
SELECT
  c.id AS course_id,
  c.organization_id,
  c.title,
  COUNT(ce.id) AS enrollment_count,
  COUNT(ce.id) FILTER (WHERE ce.status = 'completed') AS completion_count,
  CASE
    WHEN COUNT(ce.id) = 0 THEN 0
    ELSE ROUND(
      (COUNT(ce.id) FILTER (WHERE ce.status = 'completed')::numeric / COUNT(ce.id)::numeric) * 100,
      2
    )
  END AS completion_rate_pct,
  AVG(NULLIF(cp.progress_pct, 0))::numeric(5, 2) AS average_content_progress_pct
FROM courses c
LEFT JOIN course_enrollments ce ON ce.course_id = c.id
LEFT JOIN content_progress cp ON cp.enrollment_id = ce.id
GROUP BY c.id;

-- ---------------------------------------------------------------------------
-- Indexes for foreign keys and high-read screens.
-- ---------------------------------------------------------------------------

CREATE INDEX idx_users_org ON users(organization_id);
CREATE INDEX idx_users_manager ON users(manager_user_id);
CREATE INDEX idx_courses_org_status ON courses(organization_id, status);
CREATE INDEX idx_courses_category ON courses(category_id);
CREATE INDEX idx_course_chapters_course ON course_chapters(course_id);
CREATE INDEX idx_content_items_chapter ON course_content_items(chapter_id);
CREATE INDEX idx_course_enrollments_user ON course_enrollments(user_id);
CREATE INDEX idx_course_enrollments_course_status ON course_enrollments(course_id, status);
CREATE INDEX idx_content_progress_enrollment ON content_progress(enrollment_id);
CREATE INDEX idx_program_enrollments_user ON program_enrollments(user_id);
CREATE INDEX idx_program_enrollments_program ON program_enrollments(program_id);
CREATE INDEX idx_quiz_attempts_user ON quiz_attempts(user_id);
CREATE INDEX idx_quiz_attempts_quiz ON quiz_attempts(quiz_id);
CREATE INDEX idx_xp_events_user_created ON xp_events(user_id, created_at DESC);
CREATE INDEX idx_notifications_user_unread ON notifications(user_id, created_at DESC) WHERE read_at IS NULL;
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_tna_requests_status ON tna_requests(organization_id, status);

-- ---------------------------------------------------------------------------
-- Updated-at triggers for mutable tables.
-- ---------------------------------------------------------------------------

CREATE TRIGGER trg_organizations_updated_at BEFORE UPDATE ON organizations
FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_departments_updated_at BEFORE UPDATE ON departments
FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_work_units_updated_at BEFORE UPDATE ON work_units
FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_job_titles_updated_at BEFORE UPDATE ON job_titles
FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_users_updated_at BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_course_categories_updated_at BEFORE UPDATE ON course_categories
FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_course_levels_updated_at BEFORE UPDATE ON course_levels
FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_content_types_updated_at BEFORE UPDATE ON content_types
FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_question_types_updated_at BEFORE UPDATE ON question_types
FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_certificate_templates_updated_at BEFORE UPDATE ON certificate_templates
FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_program_types_updated_at BEFORE UPDATE ON program_types
FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_programs_updated_at BEFORE UPDATE ON programs
FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_courses_updated_at BEFORE UPDATE ON courses
FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_course_chapters_updated_at BEFORE UPDATE ON course_chapters
FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_course_content_items_updated_at BEFORE UPDATE ON course_content_items
FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_course_reviews_updated_at BEFORE UPDATE ON course_reviews
FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_course_templates_updated_at BEFORE UPDATE ON course_templates
FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_quiz_templates_updated_at BEFORE UPDATE ON quiz_templates
FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_quizzes_updated_at BEFORE UPDATE ON quizzes
FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_course_enrollments_updated_at BEFORE UPDATE ON course_enrollments
FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_program_enrollments_updated_at BEFORE UPDATE ON program_enrollments
FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_assignments_updated_at BEFORE UPDATE ON assignments
FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_surveys_updated_at BEFORE UPDATE ON surveys
FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_external_certificates_updated_at BEFORE UPDATE ON external_certificates
FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_learning_levels_updated_at BEFORE UPDATE ON learning_levels
FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_xp_rules_updated_at BEFORE UPDATE ON xp_rules
FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_leaderboard_rules_updated_at BEFORE UPDATE ON leaderboard_rules
FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_tna_requests_updated_at BEFORE UPDATE ON tna_requests
FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_saved_reports_updated_at BEFORE UPDATE ON saved_reports
FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_dashboard_widgets_updated_at BEFORE UPDATE ON dashboard_widgets
FOR EACH ROW EXECUTE FUNCTION set_updated_at();
