--
-- PostgreSQL database dump
--

\restrict lwvs5SlQgjrEdiMogpwPx7WziMaTS5gkrGtZCPOUrGe37GVC6nw22aBNuRhC8n5

-- Dumped from database version 15.14
-- Dumped by pg_dump version 15.14

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


--
-- Name: insurance_expenses_who_pays_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.insurance_expenses_who_pays_enum AS ENUM (
    'company',
    'worker',
    'shared',
    'not_applicable',
    'agency'
);


ALTER TYPE public.insurance_expenses_who_pays_enum OWNER TO postgres;

--
-- Name: interview_details_result_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.interview_details_result_enum AS ENUM (
    'pass',
    'fail',
    'rejected'
);


ALTER TYPE public.interview_details_result_enum OWNER TO postgres;

--
-- Name: interview_details_status_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.interview_details_status_enum AS ENUM (
    'scheduled',
    'completed',
    'cancelled'
);


ALTER TYPE public.interview_details_status_enum OWNER TO postgres;

--
-- Name: interview_details_type_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.interview_details_type_enum AS ENUM (
    'In-person',
    'Online',
    'Phone'
);


ALTER TYPE public.interview_details_type_enum OWNER TO postgres;

--
-- Name: interview_expenses_expense_type_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.interview_expenses_expense_type_enum AS ENUM (
    'visa_fee',
    'work_permit',
    'medical_exam',
    'insurance',
    'air_ticket',
    'orientation_training',
    'document_processing',
    'service_charge',
    'welfare_fund',
    'other'
);


ALTER TYPE public.interview_expenses_expense_type_enum OWNER TO postgres;

--
-- Name: interview_expenses_who_pays_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.interview_expenses_who_pays_enum AS ENUM (
    'company',
    'worker',
    'shared',
    'not_applicable',
    'agency'
);


ALTER TYPE public.interview_expenses_who_pays_enum OWNER TO postgres;

--
-- Name: job_contracts_accommodation_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.job_contracts_accommodation_enum AS ENUM (
    'free',
    'paid',
    'not_provided'
);


ALTER TYPE public.job_contracts_accommodation_enum OWNER TO postgres;

--
-- Name: job_contracts_food_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.job_contracts_food_enum AS ENUM (
    'free',
    'paid',
    'not_provided'
);


ALTER TYPE public.job_contracts_food_enum OWNER TO postgres;

--
-- Name: job_contracts_overtime_policy_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.job_contracts_overtime_policy_enum AS ENUM (
    'as_per_company_policy',
    'paid',
    'unpaid',
    'not_applicable'
);


ALTER TYPE public.job_contracts_overtime_policy_enum OWNER TO postgres;

--
-- Name: job_contracts_transport_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.job_contracts_transport_enum AS ENUM (
    'free',
    'paid',
    'not_provided'
);


ALTER TYPE public.job_contracts_transport_enum OWNER TO postgres;

--
-- Name: job_positions_accommodation_override_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.job_positions_accommodation_override_enum AS ENUM (
    'free',
    'paid',
    'not_provided'
);


ALTER TYPE public.job_positions_accommodation_override_enum OWNER TO postgres;

--
-- Name: job_positions_food_override_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.job_positions_food_override_enum AS ENUM (
    'free',
    'paid',
    'not_provided'
);


ALTER TYPE public.job_positions_food_override_enum OWNER TO postgres;

--
-- Name: job_positions_overtime_policy_override_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.job_positions_overtime_policy_override_enum AS ENUM (
    'as_per_company_policy',
    'paid',
    'unpaid',
    'not_applicable'
);


ALTER TYPE public.job_positions_overtime_policy_override_enum OWNER TO postgres;

--
-- Name: job_positions_transport_override_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.job_positions_transport_override_enum AS ENUM (
    'free',
    'paid',
    'not_provided'
);


ALTER TYPE public.job_positions_transport_override_enum OWNER TO postgres;

--
-- Name: job_postings_announcement_type_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.job_postings_announcement_type_enum AS ENUM (
    'full_ad',
    'short_ad',
    'update'
);


ALTER TYPE public.job_postings_announcement_type_enum OWNER TO postgres;

--
-- Name: medical_expenses_domestic_who_pays_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.medical_expenses_domestic_who_pays_enum AS ENUM (
    'company',
    'worker',
    'shared',
    'not_applicable',
    'agency'
);


ALTER TYPE public.medical_expenses_domestic_who_pays_enum OWNER TO postgres;

--
-- Name: medical_expenses_foreign_who_pays_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.medical_expenses_foreign_who_pays_enum AS ENUM (
    'company',
    'worker',
    'shared',
    'not_applicable',
    'agency'
);


ALTER TYPE public.medical_expenses_foreign_who_pays_enum OWNER TO postgres;

--
-- Name: notifications_notification_type_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.notifications_notification_type_enum AS ENUM (
    'shortlisted',
    'interview_scheduled',
    'interview_rescheduled',
    'interview_passed',
    'interview_failed'
);


ALTER TYPE public.notifications_notification_type_enum OWNER TO postgres;

--
-- Name: training_expenses_who_pays_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.training_expenses_who_pays_enum AS ENUM (
    'company',
    'worker',
    'shared',
    'not_applicable',
    'agency'
);


ALTER TYPE public.training_expenses_who_pays_enum OWNER TO postgres;

--
-- Name: travel_expenses_ticket_type_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.travel_expenses_ticket_type_enum AS ENUM (
    'one_way',
    'round_trip',
    'return_only'
);


ALTER TYPE public.travel_expenses_ticket_type_enum OWNER TO postgres;

--
-- Name: travel_expenses_who_provides_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.travel_expenses_who_provides_enum AS ENUM (
    'company',
    'worker',
    'shared',
    'not_applicable',
    'agency'
);


ALTER TYPE public.travel_expenses_who_provides_enum OWNER TO postgres;

--
-- Name: visa_permit_expenses_who_pays_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.visa_permit_expenses_who_pays_enum AS ENUM (
    'company',
    'worker',
    'shared',
    'not_applicable',
    'agency'
);


ALTER TYPE public.visa_permit_expenses_who_pays_enum OWNER TO postgres;

--
-- Name: welfare_service_expenses_service_who_pays_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.welfare_service_expenses_service_who_pays_enum AS ENUM (
    'company',
    'worker',
    'shared',
    'not_applicable',
    'agency'
);


ALTER TYPE public.welfare_service_expenses_service_who_pays_enum OWNER TO postgres;

--
-- Name: welfare_service_expenses_welfare_who_pays_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.welfare_service_expenses_welfare_who_pays_enum AS ENUM (
    'company',
    'worker',
    'shared',
    'not_applicable',
    'agency'
);


ALTER TYPE public.welfare_service_expenses_welfare_who_pays_enum OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: agency_reviews; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.agency_reviews (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    agency_id uuid NOT NULL,
    candidate_id uuid NOT NULL,
    rating integer NOT NULL,
    review_text text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.agency_reviews OWNER TO postgres;

--
-- Name: agency_users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.agency_users (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    full_name character varying(150) NOT NULL,
    phone character varying(20) NOT NULL,
    user_id uuid NOT NULL,
    agency_id uuid,
    role character varying(32) DEFAULT 'owner'::character varying NOT NULL,
    status character varying(32) DEFAULT 'active'::character varying NOT NULL,
    password_hash character varying(200),
    password_set_by_admin_at timestamp with time zone
);


ALTER TABLE public.agency_users OWNER TO postgres;

--
-- Name: application_notes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.application_notes (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    job_application_id uuid NOT NULL,
    agency_id uuid NOT NULL,
    added_by_user_id uuid NOT NULL,
    added_by_name character varying(150) NOT NULL,
    note_text text NOT NULL,
    is_private boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.application_notes OWNER TO postgres;

--
-- Name: audit_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.audit_logs (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    method character varying(10) NOT NULL,
    path character varying(500) NOT NULL,
    correlation_id character varying(50),
    origin_ip character varying(50),
    user_agent character varying(500),
    user_id uuid,
    user_email character varying(100),
    user_role character varying(50),
    agency_id uuid,
    client_id character varying(100),
    action character varying(100) NOT NULL,
    category character varying(50) NOT NULL,
    resource_type character varying(50),
    resource_id uuid,
    state_change jsonb,
    outcome character varying(20) NOT NULL,
    status_code integer,
    error_message text,
    metadata jsonb,
    duration_ms integer,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.audit_logs OWNER TO postgres;

--
-- Name: blocked_phones; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.blocked_phones (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    phone character varying(20) NOT NULL,
    reason character varying(255)
);


ALTER TABLE public.blocked_phones OWNER TO postgres;

--
-- Name: candidate_documents; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.candidate_documents (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    candidate_id uuid NOT NULL,
    document_type_id uuid NOT NULL,
    document_url character varying(1000) NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    notes text,
    file_type character varying(100),
    file_size integer,
    is_active boolean DEFAULT true NOT NULL,
    verification_status character varying(20) DEFAULT 'pending'::character varying NOT NULL,
    verified_by uuid,
    verified_at timestamp with time zone,
    rejection_reason text,
    replaced_by_document_id uuid
);


ALTER TABLE public.candidate_documents OWNER TO postgres;

--
-- Name: candidate_job_profiles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.candidate_job_profiles (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    candidate_id uuid NOT NULL,
    profile_blob jsonb NOT NULL,
    label character varying,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.candidate_job_profiles OWNER TO postgres;

--
-- Name: candidate_preferences; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.candidate_preferences (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    candidate_id uuid NOT NULL,
    job_title_id uuid NOT NULL,
    title character varying(255) NOT NULL,
    priority integer NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.candidate_preferences OWNER TO postgres;

--
-- Name: candidates; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.candidates (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    full_name character varying(150) NOT NULL,
    phone character varying(20) NOT NULL,
    email character varying(150),
    gender character varying(10),
    date_of_birth date,
    address jsonb,
    passport_number character varying(50),
    profile_image character varying(1000),
    is_active boolean DEFAULT true NOT NULL
);


ALTER TABLE public.candidates OWNER TO postgres;

--
-- Name: countries; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.countries (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    country_code character varying(3) NOT NULL,
    country_name character varying(100) NOT NULL,
    currency_code character varying(3) NOT NULL,
    currency_name character varying(100) NOT NULL,
    npr_multiplier numeric(14,6) NOT NULL
);


ALTER TABLE public.countries OWNER TO postgres;

--
-- Name: document_types; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.document_types (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    name character varying(100) NOT NULL,
    type_code character varying(50) NOT NULL,
    description text,
    is_required boolean DEFAULT false NOT NULL,
    display_order integer DEFAULT 0 NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    allowed_mime_types text,
    max_file_size_mb integer
);


ALTER TABLE public.document_types OWNER TO postgres;

--
-- Name: employers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.employers (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    company_name character varying(255) NOT NULL,
    country character varying(100) NOT NULL,
    city character varying(100)
);


ALTER TABLE public.employers OWNER TO postgres;

--
-- Name: insurance_expenses; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.insurance_expenses (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    job_posting_id uuid NOT NULL,
    who_pays public.insurance_expenses_who_pays_enum,
    is_free boolean DEFAULT false NOT NULL,
    amount numeric(10,2),
    currency character varying(10),
    coverage_amount numeric(12,2),
    coverage_currency character varying(10),
    notes text
);


ALTER TABLE public.insurance_expenses OWNER TO postgres;

--
-- Name: interview_details; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.interview_details (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    job_posting_id uuid NOT NULL,
    job_application_id uuid NOT NULL,
    interview_date_ad date,
    interview_date_bs character varying(20),
    interview_time time without time zone,
    duration_minutes integer DEFAULT 60 NOT NULL,
    location text,
    contact_person character varying(255),
    required_documents text[],
    notes text,
    status public.interview_details_status_enum DEFAULT 'scheduled'::public.interview_details_status_enum NOT NULL,
    result public.interview_details_result_enum,
    type public.interview_details_type_enum DEFAULT 'In-person'::public.interview_details_type_enum NOT NULL,
    interviewer_email character varying(255),
    feedback text,
    score integer,
    recommendation text,
    rejection_reason text,
    completed_at timestamp with time zone,
    cancelled_at timestamp with time zone,
    rescheduled_at timestamp with time zone
);


ALTER TABLE public.interview_details OWNER TO postgres;

--
-- Name: interview_expenses; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.interview_expenses (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    interview_id uuid NOT NULL,
    expense_type public.interview_expenses_expense_type_enum NOT NULL,
    who_pays public.interview_expenses_who_pays_enum NOT NULL,
    is_free boolean DEFAULT false NOT NULL,
    amount numeric(10,2),
    currency character varying(10),
    refundable boolean DEFAULT false NOT NULL,
    notes text
);


ALTER TABLE public.interview_expenses OWNER TO postgres;

--
-- Name: job_applications; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.job_applications (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    candidate_id uuid NOT NULL,
    job_posting_id uuid NOT NULL,
    position_id uuid NOT NULL,
    status character varying NOT NULL,
    history_blob jsonb DEFAULT '[]'::jsonb NOT NULL,
    withdrawn_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.job_applications OWNER TO postgres;

--
-- Name: job_contracts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.job_contracts (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    job_posting_id uuid NOT NULL,
    employer_id uuid NOT NULL,
    posting_agency_id uuid NOT NULL,
    period_years integer NOT NULL,
    renewable boolean DEFAULT false NOT NULL,
    hours_per_day integer,
    days_per_week integer,
    overtime_policy public.job_contracts_overtime_policy_enum DEFAULT 'as_per_company_policy'::public.job_contracts_overtime_policy_enum,
    weekly_off_days integer,
    food public.job_contracts_food_enum,
    accommodation public.job_contracts_accommodation_enum,
    transport public.job_contracts_transport_enum,
    annual_leave_days integer
);


ALTER TABLE public.job_contracts OWNER TO postgres;

--
-- Name: job_positions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.job_positions (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    job_contract_id uuid NOT NULL,
    title character varying(255) NOT NULL,
    male_vacancies integer DEFAULT 0 NOT NULL,
    female_vacancies integer DEFAULT 0 NOT NULL,
    total_vacancies integer GENERATED ALWAYS AS ((male_vacancies + female_vacancies)) STORED NOT NULL,
    monthly_salary_amount numeric(12,2) NOT NULL,
    salary_currency character varying(10) NOT NULL,
    hours_per_day_override integer,
    days_per_week_override integer,
    overtime_policy_override public.job_positions_overtime_policy_override_enum,
    weekly_off_days_override integer,
    food_override public.job_positions_food_override_enum,
    accommodation_override public.job_positions_accommodation_override_enum,
    transport_override public.job_positions_transport_override_enum,
    position_notes text
);


ALTER TABLE public.job_positions OWNER TO postgres;

--
-- Name: job_posting_titles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.job_posting_titles (
    job_posting_id uuid NOT NULL,
    job_title_id uuid NOT NULL
);


ALTER TABLE public.job_posting_titles OWNER TO postgres;

--
-- Name: job_postings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.job_postings (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    posting_title character varying(500) NOT NULL,
    country character varying(100) NOT NULL,
    city character varying(100),
    lt_number character varying(100),
    chalani_number character varying(100),
    approval_date_bs character varying(20),
    approval_date_ad date,
    posting_date_ad date DEFAULT ('now'::text)::date NOT NULL,
    posting_date_bs character varying(20),
    announcement_type public.job_postings_announcement_type_enum DEFAULT 'full_ad'::public.job_postings_announcement_type_enum NOT NULL,
    notes text,
    cutout_url character varying(1000),
    view_count integer DEFAULT 0 NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    skills jsonb,
    education_requirements jsonb,
    experience_requirements jsonb
);


ALTER TABLE public.job_postings OWNER TO postgres;

--
-- Name: job_titles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.job_titles (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    title character varying(255) NOT NULL,
    rank integer NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    difficulty character varying(50),
    skills_summary text,
    description text
);


ALTER TABLE public.job_titles OWNER TO postgres;

--
-- Name: medical_expenses; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.medical_expenses (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    job_posting_id uuid NOT NULL,
    domestic_who_pays public.medical_expenses_domestic_who_pays_enum,
    domestic_is_free boolean DEFAULT false NOT NULL,
    domestic_amount numeric(10,2),
    domestic_currency character varying(10),
    domestic_notes text,
    foreign_who_pays public.medical_expenses_foreign_who_pays_enum,
    foreign_is_free boolean DEFAULT false NOT NULL,
    foreign_amount numeric(10,2),
    foreign_currency character varying(10),
    foreign_notes text
);


ALTER TABLE public.medical_expenses OWNER TO postgres;

--
-- Name: notifications; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.notifications (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    candidate_id uuid NOT NULL,
    job_application_id uuid NOT NULL,
    job_posting_id uuid NOT NULL,
    agency_id uuid NOT NULL,
    interview_id uuid,
    notification_type public.notifications_notification_type_enum NOT NULL,
    title character varying(500) NOT NULL,
    message text NOT NULL,
    payload jsonb NOT NULL,
    is_read boolean DEFAULT false NOT NULL,
    is_sent boolean DEFAULT false NOT NULL,
    sent_at timestamp with time zone,
    read_at timestamp with time zone
);


ALTER TABLE public.notifications OWNER TO postgres;

--
-- Name: posting_agencies; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.posting_agencies (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    name character varying(255) NOT NULL,
    license_number character varying(100) NOT NULL,
    country character varying(100),
    city character varying(100),
    address text,
    latitude double precision,
    longitude double precision,
    phones text[],
    emails text[],
    contact_email character varying(255),
    contact_phone character varying(100),
    website character varying(500),
    description character varying(1000),
    logo_url character varying(1000),
    banner_url character varying(1000),
    established_year integer,
    license_valid_till date,
    is_active boolean DEFAULT true NOT NULL,
    services text[],
    target_countries text[],
    specializations text[],
    certifications jsonb,
    social_media jsonb,
    bank_details jsonb,
    contact_persons jsonb,
    operating_hours jsonb,
    statistics jsonb,
    settings jsonb,
    average_rating numeric(3,2) DEFAULT '0'::numeric NOT NULL,
    review_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public.posting_agencies OWNER TO postgres;

--
-- Name: salary_conversions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.salary_conversions (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    job_position_id uuid NOT NULL,
    converted_amount numeric(12,2) NOT NULL,
    converted_currency character varying(10) NOT NULL,
    conversion_rate numeric(10,6),
    conversion_date date DEFAULT ('now'::text)::date NOT NULL
);


ALTER TABLE public.salary_conversions OWNER TO postgres;

--
-- Name: training_expenses; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.training_expenses (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    job_posting_id uuid NOT NULL,
    who_pays public.training_expenses_who_pays_enum,
    is_free boolean DEFAULT false NOT NULL,
    amount numeric(10,2),
    currency character varying(10),
    duration_days integer,
    mandatory boolean DEFAULT true NOT NULL,
    notes text
);


ALTER TABLE public.training_expenses OWNER TO postgres;

--
-- Name: travel_expenses; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.travel_expenses (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    job_posting_id uuid NOT NULL,
    who_provides public.travel_expenses_who_provides_enum,
    ticket_type public.travel_expenses_ticket_type_enum,
    is_free boolean DEFAULT false NOT NULL,
    amount numeric(10,2),
    currency character varying(10),
    notes text
);


ALTER TABLE public.travel_expenses OWNER TO postgres;

--
-- Name: typeorm_metadata; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.typeorm_metadata (
    type character varying NOT NULL,
    database character varying,
    schema character varying,
    "table" character varying,
    name character varying,
    value text
);


ALTER TABLE public.typeorm_metadata OWNER TO postgres;

--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    phone character varying(20) NOT NULL,
    full_name character varying(150),
    role character varying(32) NOT NULL,
    is_active boolean DEFAULT false NOT NULL,
    candidate_id uuid,
    agency_id uuid,
    is_agency_owner boolean DEFAULT false NOT NULL
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: visa_permit_expenses; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.visa_permit_expenses (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    job_posting_id uuid NOT NULL,
    who_pays public.visa_permit_expenses_who_pays_enum,
    is_free boolean DEFAULT false NOT NULL,
    amount numeric(10,2),
    currency character varying(10),
    refundable boolean DEFAULT false NOT NULL,
    notes text
);


ALTER TABLE public.visa_permit_expenses OWNER TO postgres;

--
-- Name: welfare_service_expenses; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.welfare_service_expenses (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    job_posting_id uuid NOT NULL,
    welfare_who_pays public.welfare_service_expenses_welfare_who_pays_enum,
    welfare_is_free boolean DEFAULT false NOT NULL,
    welfare_amount numeric(10,2),
    welfare_currency character varying(10),
    welfare_fund_purpose text,
    welfare_refundable boolean DEFAULT false NOT NULL,
    welfare_notes text,
    service_who_pays public.welfare_service_expenses_service_who_pays_enum,
    service_is_free boolean DEFAULT false NOT NULL,
    service_amount numeric(10,2),
    service_currency character varying(10),
    service_type text,
    service_refundable boolean DEFAULT false NOT NULL,
    service_notes text
);


ALTER TABLE public.welfare_service_expenses OWNER TO postgres;

--
-- Data for Name: agency_reviews; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.agency_reviews (id, agency_id, candidate_id, rating, review_text, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: agency_users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.agency_users (id, created_at, updated_at, full_name, phone, user_id, agency_id, role, status, password_hash, password_set_by_admin_at) FROM stdin;
34dc4951-facd-4b46-a314-345feea66d97	2025-12-16 04:31:50.246277+00	2025-12-16 04:48:16.035579+00	Gopal Bajagain	+9779861234563	cc244556-b54d-443c-9dcb-de9c4ad93eb8	a03c9d1e-68cd-45b9-a775-c20a24389355	owner	active	\N	\N
c1cc6ddf-6522-404d-a406-32868654157c	2025-12-16 05:07:41.432418+00	2025-12-16 05:13:20.816316+00	Narendra Babu Rana	+9779801090469	8f544770-2e2d-46f5-bd8d-1582823dd54d	e9992fb6-1bf9-4944-a869-bf85280a7e45	owner	active	\N	\N
75d02684-f2cf-4fdd-aee0-9eba60811f0d	2025-12-16 04:06:44.842247+00	2025-12-16 07:53:24.706867+00	ajay	+9779862146252	aaa0dec0-7277-4eb3-a261-b53bb4f657a7	e9992fb6-1bf9-4944-a869-bf85280a7e45	staff	active	$2a$10$l/dxEjoERq4NlM6Kb5W7fOkJnFGspSZJp4uFlR2z4aQdyopT0uVoC	2025-12-16 07:51:37.622+00
abfe7b4e-4f7b-40b0-990b-5ba84c5db241	2025-12-16 08:00:54.678534+00	2025-12-18 09:13:28.312229+00	rojan	+9779861432303	112f6722-9d38-4839-b767-d1b96f346304	e9992fb6-1bf9-4944-a869-bf85280a7e45	accountant	active	$2a$10$4BuNH/AA/huqLko3fPtq5.hY4boS5h.RB.3TVVw./8v7ycX4/eWhK	2025-12-16 08:00:54.677+00
\.


--
-- Data for Name: application_notes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.application_notes (id, job_application_id, agency_id, added_by_user_id, added_by_name, note_text, is_private, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: audit_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.audit_logs (id, method, path, correlation_id, origin_ip, user_agent, user_id, user_email, user_role, agency_id, client_id, action, category, resource_type, resource_id, state_change, outcome, status_code, error_message, metadata, duration_ms, created_at) FROM stdin;
2b945b99-bc97-4a14-a1e1-3dc26757a195	POST	/login/start	a4f607d6-99ca-40ff-aae7-4ae570e230e3	27.34.66.163	Dart/3.8 (dart:io)	\N	\N	\N	\N	anonymous	login_start	auth	\N	\N	\N	failure	404	No registration found for this phone	{"query": {}, "bodyKeys": ["phone"]}	166	2025-12-10 04:09:06.700274+00
bbf62c71-83c4-425a-ad06-e29ba277e6a1	POST	/register	dc06d580-697b-4721-ba0e-b26c74dc579b	27.34.66.163	Dart/3.8 (dart:io)	\N	\N	\N	\N	anonymous	register	auth	\N	\N	\N	success	200	\N	{"query": {}, "bodyKeys": ["full_name", "phone"]}	48	2025-12-10 04:09:26.829223+00
a833d80f-d80f-4a51-a70c-f38ccbf0aa67	POST	/verify	c5e467ae-a988-44af-bdcc-1781eb12c214	27.34.66.163	Dart/3.8 (dart:io)	\N	\N	\N	\N	anonymous	login_verify	auth	\N	\N	\N	success	200	\N	{"query": {}, "bodyKeys": ["phone", "otp"]}	37	2025-12-10 04:09:35.543629+00
d51cceff-44ee-49da-9a54-de60d786b08c	PUT	/candidates/3af2e3c5-66ea-48bc-9ef9-addb9cd801fa	0427dad3-7d12-4017-8388-e67d73f5c202	27.34.66.163	Dart/3.8 (dart:io)	\N	\N	\N	\N	anonymous	update_profile	candidate	candidate	3af2e3c5-66ea-48bc-9ef9-addb9cd801fa	\N	success	200	\N	{"query": {}, "bodyKeys": ["full_name", "address", "passport_number", "email", "gender", "date_of_birth"]}	43	2025-12-10 04:18:47.008137+00
93c63ca7-d7f9-4cf0-9bbe-a9619120b3c7	POST	/login/start	63f486d5-5f4c-45ba-8e30-72145bc07f5a	27.34.66.163	Dart/3.8 (dart:io)	\N	\N	\N	\N	anonymous	login_start	auth	\N	\N	\N	success	200	\N	{"query": {}, "bodyKeys": ["phone"]}	26	2025-12-10 08:46:01.336636+00
a5d78b34-ac0c-46db-b886-d9374ea8fe84	POST	/login/verify	fc682e88-72cd-4960-b30f-e540d4cade4c	27.34.66.163	Dart/3.8 (dart:io)	\N	\N	\N	\N	anonymous	login_verify	auth	\N	\N	\N	success	200	\N	{"query": {}, "bodyKeys": ["phone", "otp"]}	17	2025-12-10 08:46:09.51152+00
debe0125-1d20-44c1-a19c-3fed6fcb49de	POST	/agency/register-owner	edf968c4-2e51-4454-8ab9-718e8bb21cc9	27.34.66.169	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36	\N	\N	\N	\N	anonymous	register	auth	\N	\N	\N	success	200	\N	{"query": {}, "bodyKeys": ["full_name", "phone"]}	98	2025-12-16 04:06:44.848334+00
69484dfc-27c0-47da-975d-f5348d475b98	POST	/agency/verify-owner	259c3214-994a-4a1d-acbb-c1d3f453c77d	27.34.66.169	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36	\N	\N	\N	\N	anonymous	login_verify	auth	\N	\N	\N	success	200	\N	{"query": {}, "bodyKeys": ["phone", "otp"]}	42	2025-12-16 04:06:49.525498+00
cc53a55e-149d-4b17-898f-89533632ab57	POST	/agencies/owner/agency	5d7b1f13-2d6f-4c5d-bec8-21769fbd0ff8	27.34.66.169	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36	aaa0dec0-7277-4eb3-a261-b53bb4f657a7	\N	owner	\N	web-app	create_agency	agency	agency	\N	\N	success	201	\N	{"query": {}, "bodyKeys": ["name", "license_number", "address", "city", "country", "phone", "website", "description"]}	39	2025-12-16 04:07:31.017161+00
1c8179d4-8428-4a29-ad68-77474a38a940	POST	/agency/login/start-owner	93dfe214-18c1-4dba-9d0b-63e4ed5668e7	27.34.66.169	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36	\N	\N	\N	\N	anonymous	login_start	auth	\N	\N	\N	failure	404	No registration found for this phone	{"query": {}, "bodyKeys": ["phone"]}	22	2025-12-16 04:10:35.609283+00
1c09d79b-3c9a-4258-acc0-1056fd110a0d	POST	/agency/login/start-owner	90789719-cc70-4eb4-ab23-e55982784935	27.34.66.169	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36	\N	\N	\N	\N	anonymous	login_start	auth	\N	\N	\N	success	200	\N	{"query": {}, "bodyKeys": ["phone"]}	28	2025-12-16 04:10:46.758373+00
6269e884-75c7-49aa-8152-18c7653fe701	POST	/agency/login/verify-owner	bb5c83ec-60c1-40bc-9fa7-f6eff95269e5	27.34.66.169	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36	\N	\N	\N	\N	anonymous	login_verify	auth	\N	\N	\N	success	200	\N	{"query": {}, "bodyKeys": ["phone", "otp"]}	6	2025-12-16 04:10:50.74127+00
8523fc44-a790-4554-9ae5-f17d59f0e388	POST	/agency/login/start-owner	4230f690-7b43-41bc-88f6-fa26b9fd0a94	27.34.66.169	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36	\N	\N	\N	\N	anonymous	login_start	auth	\N	\N	\N	success	200	\N	{"query": {}, "bodyKeys": ["phone"]}	22	2025-12-16 04:25:14.135614+00
e6aeddb6-248b-4f7a-8404-7c4779d34338	POST	/agency/login/verify-owner	84e9c257-a9b5-4143-b2de-4cb626249b84	27.34.66.169	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36	\N	\N	\N	\N	anonymous	login_verify	auth	\N	\N	\N	success	200	\N	{"query": {}, "bodyKeys": ["phone", "otp"]}	7	2025-12-16 04:25:20.876774+00
beedc635-3596-4073-8526-f61e68747b79	POST	/agency/register-owner	9fdf3096-724e-4ae3-9dd6-8785ad0d280a	27.34.66.169	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36	\N	\N	\N	\N	anonymous	register	auth	\N	\N	\N	success	200	\N	{"query": {}, "bodyKeys": ["full_name", "phone"]}	36	2025-12-16 04:31:50.251954+00
00a5f334-81c5-42b2-95bf-d923879730c7	POST	/agency/verify-owner	f0ac01a2-47e4-4d20-b87e-0d04624a8917	27.34.66.169	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36	\N	\N	\N	\N	anonymous	login_verify	auth	\N	\N	\N	success	200	\N	{"query": {}, "bodyKeys": ["phone", "otp"]}	28	2025-12-16 04:34:06.169995+00
967ea7db-1cae-4219-8b07-35bc4e2116dc	POST	/agencies/owner/agency	a7839e4f-0ce3-49e7-b6ff-53412af1a688	27.34.66.169	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36	cc244556-b54d-443c-9dcb-de9c4ad93eb8	\N	owner	\N	web-app	create_agency	agency	agency	\N	\N	success	201	\N	{"query": {}, "bodyKeys": ["name", "license_number", "address", "city", "country", "phone", "website", "description"]}	50	2025-12-16 04:48:16.044483+00
bf7efe76-e37a-4584-87ac-a0b1dd2f67ef	POST	/agency/register-owner	722d6478-5d4c-4879-b27c-1dc35ef174e1	27.34.66.169	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36	\N	\N	\N	\N	anonymous	register	auth	\N	\N	\N	success	200	\N	{"query": {}, "bodyKeys": ["full_name", "phone"]}	38	2025-12-16 05:07:41.437879+00
77d2846b-9c33-45a3-8324-00b548cd4c25	POST	/agency/verify-owner	7e0ca984-83fa-4e76-a9d3-cdc8d4e23dab	27.34.66.169	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36	\N	\N	\N	\N	anonymous	login_verify	auth	\N	\N	\N	success	200	\N	{"query": {}, "bodyKeys": ["phone", "otp"]}	28	2025-12-16 05:07:58.89806+00
e073f57e-7199-4580-b4b4-7979fb91267b	POST	/agencies/owner/agency	bd3908b5-f7aa-455e-82dc-3dcbc5efe8d2	27.34.66.169	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36	8f544770-2e2d-46f5-bd8d-1582823dd54d	\N	owner	\N	web-app	create_agency	agency	agency	\N	\N	success	201	\N	{"query": {}, "bodyKeys": ["name", "license_number", "address", "city", "country", "phone", "website", "description"]}	40	2025-12-16 05:13:20.822375+00
e1039ce5-62b4-43e7-be93-1ed75158f393	PATCH	/agencies/owner/agency/basic	a28bc3fd-7921-4d8b-9960-bd81e50a90bf	27.34.66.169	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36	8f544770-2e2d-46f5-bd8d-1582823dd54d	\N	owner	\N	web-app	update_agency	agency	agency	\N	\N	success	200	\N	{"query": {}, "bodyKeys": ["name", "description", "established_year", "license_number"]}	44	2025-12-16 05:17:37.024704+00
f56ba488-61c1-4bb5-bdb4-785d43b81462	PATCH	/agencies/owner/agency/basic	38a7e498-6bc0-457a-b67a-c3fc9d0b924d	27.34.66.169	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36	8f544770-2e2d-46f5-bd8d-1582823dd54d	\N	owner	\N	web-app	update_agency	agency	agency	\N	\N	success	200	\N	{"query": {}, "bodyKeys": ["name", "description", "established_year", "license_number"]}	58	2025-12-16 05:21:02.217629+00
10ae2f29-0fd1-473d-aedd-33d558526413	POST	/agency/login/start-owner	8b2034aa-4b3a-4523-8b39-b046d3b3ade6	27.34.66.169	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36	\N	\N	\N	\N	anonymous	login_start	auth	\N	\N	\N	success	200	\N	{"query": {}, "bodyKeys": ["phone"]}	84	2025-12-16 05:38:31.351715+00
c5dd6c41-bff8-4293-b8ce-87b961e03943	POST	/agency/login/verify-owner	37d5183a-01f5-472c-8bc9-64182e3bc361	27.34.66.169	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36	\N	\N	\N	\N	anonymous	login_verify	auth	\N	\N	\N	success	200	\N	{"query": {}, "bodyKeys": ["phone", "otp"]}	29	2025-12-16 05:38:40.572486+00
df4cb1af-7756-4061-ac53-7c8086be1766	PATCH	/agencies/owner/agency/contact	276d56ad-20e3-41ce-930e-e42b2493862f	27.34.66.169	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36	8f544770-2e2d-46f5-bd8d-1582823dd54d	\N	owner	e9992fb6-1bf9-4944-a869-bf85280a7e45	web-app	update_agency	agency	agency	\N	\N	success	200	\N	{"query": {}, "bodyKeys": ["phone", "mobile", "email", "website"]}	38	2025-12-16 05:42:10.980493+00
25049088-a4ae-4766-b8ad-dd60b9ab6abe	PATCH	/agencies/owner/agency/social-media	1a9d368c-4f8d-48f0-ad75-aa376855fb2e	27.34.66.169	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36	8f544770-2e2d-46f5-bd8d-1582823dd54d	\N	owner	e9992fb6-1bf9-4944-a869-bf85280a7e45	web-app	update_agency	agency	agency	\N	\N	success	200	\N	{"query": {}, "bodyKeys": ["social_media"]}	30	2025-12-16 05:42:36.212945+00
e7aae09f-dcd0-401b-a19b-8f274ffbb137	PATCH	/agencies/owner/agency/services	763d05c1-87e2-4404-89f8-b98c523ed5f1	27.34.66.169	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36	8f544770-2e2d-46f5-bd8d-1582823dd54d	\N	owner	e9992fb6-1bf9-4944-a869-bf85280a7e45	web-app	update_agency	agency	agency	\N	\N	success	200	\N	{"query": {}, "bodyKeys": ["services", "specializations", "target_countries"]}	10	2025-12-16 05:46:21.299337+00
a0252c23-bb3c-47a1-b958-d155703aa8c7	PATCH	/agencies/owner/agency/services	7c62e20f-57c8-4562-b121-afaea0af6be2	27.34.66.169	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36	8f544770-2e2d-46f5-bd8d-1582823dd54d	\N	owner	e9992fb6-1bf9-4944-a869-bf85280a7e45	web-app	update_agency	agency	agency	\N	\N	success	200	\N	{"query": {}, "bodyKeys": ["services", "specializations", "target_countries"]}	13	2025-12-16 05:46:21.350309+00
58dcdd1d-6725-4dd9-bbe6-89ed261c93d6	PATCH	/agencies/owner/agency/services	37bde4bd-cfc4-4465-a96a-3c1976010a0d	27.34.66.169	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36	8f544770-2e2d-46f5-bd8d-1582823dd54d	\N	owner	e9992fb6-1bf9-4944-a869-bf85280a7e45	web-app	update_agency	agency	agency	\N	\N	success	200	\N	{"query": {}, "bodyKeys": ["services", "specializations", "target_countries"]}	14	2025-12-16 05:46:21.404761+00
346a6777-ed6a-40b7-96f1-be9865e7e51c	POST	/agency/login/start-owner	03a6f3dc-c403-4a1e-b2c8-410a1b25935a	27.34.66.169	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.1 Safari/605.1.15	\N	\N	\N	\N	anonymous	login_start	auth	\N	\N	\N	success	200	\N	{"query": {}, "bodyKeys": ["phone"]}	23	2025-12-16 05:48:47.093793+00
57dbff1c-5755-49a1-88a3-15f99638966f	POST	/agency/login/verify-owner	578a7345-23c3-4c3a-8efa-41c658b4cba5	27.34.66.169	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.1 Safari/605.1.15	\N	\N	\N	\N	anonymous	login_verify	auth	\N	\N	\N	success	200	\N	{"query": {}, "bodyKeys": ["phone", "otp"]}	12	2025-12-16 05:48:50.149301+00
daab8b79-bea8-4021-bcfe-729c9ee71b80	POST	/agencies/owner/members/invite	b104f06f-bbc8-471b-af22-c8bd0e5deac5	27.34.66.169	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.1 Safari/605.1.15	8f544770-2e2d-46f5-bd8d-1582823dd54d	\N	owner	e9992fb6-1bf9-4944-a869-bf85280a7e45	web-app	add_team_member	agency	agency_user	\N	\N	success	201	\N	{"query": {}, "bodyKeys": ["full_name", "phone", "role"]}	173	2025-12-16 07:51:37.630639+00
7d8a0c89-150f-4d19-9f53-164c02b479d5	POST	/member/login/start	d9c0d835-251d-4ecc-96c7-9972cb894e0e	27.34.66.169	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.1 Safari/605.1.15	\N	\N	\N	\N	anonymous	login_start	auth	\N	\N	\N	success	200	\N	{"query": {}, "bodyKeys": ["phone"]}	27	2025-12-16 07:53:01.04192+00
8ec5f322-9f3f-4b2f-93bc-6530e3005eae	POST	/member/login/start	8e97d3bf-8029-4946-a86a-40abc00f19ed	27.34.66.169	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.1 Safari/605.1.15	\N	\N	\N	\N	anonymous	login_start	auth	\N	\N	\N	success	200	\N	{"query": {}, "bodyKeys": ["phone"]}	29	2025-12-16 07:53:19.248809+00
d56d8fef-315a-4061-ad2e-49b2af284d1f	POST	/member/login/verify	283abce3-7da7-4343-b004-8fdd10187b5e	27.34.66.169	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.1 Safari/605.1.15	\N	\N	\N	\N	anonymous	login_verify	auth	\N	\N	\N	success	200	\N	{"query": {}, "bodyKeys": ["phone", "otp"]}	12	2025-12-16 07:53:24.714211+00
ae3ede8d-aa1d-4da8-b6b1-888006fb1919	POST	/agency/login/start-owner	224c35c4-e804-4beb-8285-a9aefcbb2f2e	27.34.66.169	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.1 Safari/605.1.15	\N	\N	\N	\N	anonymous	login_start	auth	\N	\N	\N	success	200	\N	{"query": {}, "bodyKeys": ["phone"]}	22	2025-12-16 08:00:31.566437+00
276c39c6-5541-4889-bfbc-5753f1445161	POST	/agency/login/verify-owner	1bf5d1eb-5bcf-49c2-9137-2fe21c1b0cbc	27.34.66.169	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.1 Safari/605.1.15	\N	\N	\N	\N	anonymous	login_verify	auth	\N	\N	\N	success	200	\N	{"query": {}, "bodyKeys": ["phone", "otp"]}	7	2025-12-16 08:00:34.646431+00
1e963321-e174-41da-b17a-cbad7c1ff214	POST	/agencies/owner/members/invite	dd98e4e7-7d61-4a17-9101-f1a31d83cf60	27.34.66.169	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.1 Safari/605.1.15	8f544770-2e2d-46f5-bd8d-1582823dd54d	\N	owner	e9992fb6-1bf9-4944-a869-bf85280a7e45	web-app	add_team_member	agency	agency_user	\N	\N	success	201	\N	{"query": {}, "bodyKeys": ["full_name", "phone", "role"]}	133	2025-12-16 08:00:54.687589+00
3dd33ce6-2629-4be5-ba7d-f30e180d7add	PUT	/candidates/3af2e3c5-66ea-48bc-9ef9-addb9cd801fa/job-profiles	dc9d522b-698b-4164-9c22-d8f443922378	27.34.66.169	Dart/3.8 (dart:io)	\N	\N	\N	\N	anonymous	update_job_profile	candidate	candidate_job_profile	3af2e3c5-66ea-48bc-9ef9-addb9cd801fa	\N	success	200	\N	{"query": {}, "bodyKeys": ["profile_blob"]}	35	2025-12-16 08:25:31.60869+00
b9350424-dff5-4327-9510-afe5ed5326e5	PUT	/candidates/3af2e3c5-66ea-48bc-9ef9-addb9cd801fa/job-profiles	04a3d801-1277-46cb-80ff-29b905d67ec4	27.34.66.169	Dart/3.8 (dart:io)	\N	\N	\N	\N	anonymous	update_job_profile	candidate	candidate_job_profile	3af2e3c5-66ea-48bc-9ef9-addb9cd801fa	\N	success	200	\N	{"query": {}, "bodyKeys": ["profile_blob"]}	35	2025-12-16 08:31:17.403354+00
ff355f05-6fbe-4bff-9f0c-4d55b75e81f4	PUT	/candidates/3af2e3c5-66ea-48bc-9ef9-addb9cd801fa/job-profiles	fd6fc404-26f6-4ddb-8fd9-260e0befae1f	27.34.66.169	Dart/3.8 (dart:io)	\N	\N	\N	\N	anonymous	update_job_profile	candidate	candidate_job_profile	3af2e3c5-66ea-48bc-9ef9-addb9cd801fa	\N	success	200	\N	{"query": {}, "bodyKeys": ["profile_blob"]}	52	2025-12-16 08:32:11.480878+00
2b00c0c6-db9f-40ab-8acf-37472f2a3dce	PUT	/candidates/3af2e3c5-66ea-48bc-9ef9-addb9cd801fa/job-profiles	fd0023d5-c41a-4454-9d16-ec4db2ecc0d6	27.34.66.169	Dart/3.8 (dart:io)	\N	\N	\N	\N	anonymous	update_job_profile	candidate	candidate_job_profile	3af2e3c5-66ea-48bc-9ef9-addb9cd801fa	\N	success	200	\N	{"query": {}, "bodyKeys": ["profile_blob"]}	47	2025-12-16 08:32:43.337404+00
7d86f6de-d7da-4c3a-9f19-d34f9748924f	PUT	/candidates/3af2e3c5-66ea-48bc-9ef9-addb9cd801fa/job-profiles	72fd0fb9-6612-44b0-a1ad-66d182e6e845	27.34.66.169	Dart/3.8 (dart:io)	\N	\N	\N	\N	anonymous	update_job_profile	candidate	candidate_job_profile	3af2e3c5-66ea-48bc-9ef9-addb9cd801fa	\N	success	200	\N	{"query": {}, "bodyKeys": ["profile_blob"]}	34	2025-12-16 09:22:12.935986+00
d75a31fd-0586-4e8e-8c9d-5bc4de121ff9	PUT	/candidates/3af2e3c5-66ea-48bc-9ef9-addb9cd801fa/job-profiles	efa15002-a4f6-4f86-8795-2a37d1ec0009	27.34.66.169	Dart/3.8 (dart:io)	\N	\N	\N	\N	anonymous	update_job_profile	candidate	candidate_job_profile	3af2e3c5-66ea-48bc-9ef9-addb9cd801fa	\N	success	200	\N	{"query": {}, "bodyKeys": ["profile_blob"]}	42	2025-12-16 09:25:16.892067+00
00a47189-15ca-4261-9b7c-67da729f1489	POST	/applications	cc1b06ad-9278-4394-b89d-dec577a20509	27.34.66.169	Dart/3.8 (dart:io)	\N	\N	\N	\N	anonymous	apply_job	application	job_application	\N	\N	success	201	\N	{"query": {}, "bodyKeys": ["candidate_id", "job_posting_id", "position_id", "note"]}	52	2025-12-16 10:14:15.416137+00
0b0745b2-fc81-45a4-80c9-72fb6958ebe5	PUT	/candidates/3af2e3c5-66ea-48bc-9ef9-addb9cd801fa	51d3fd5a-0a3f-43fb-91d6-ab7bef05e012	27.34.66.169	Dart/3.8 (dart:io)	\N	\N	\N	\N	anonymous	update_profile	candidate	candidate	3af2e3c5-66ea-48bc-9ef9-addb9cd801fa	\N	success	200	\N	{"query": {}, "bodyKeys": ["full_name", "address", "passport_number", "email", "gender", "date_of_birth"]}	22	2025-12-16 11:27:49.66684+00
d0975a92-e49b-4e58-b380-5d30a12ad610	POST	/login/start	d4e9e2fa-096e-4801-a30f-803f793b79ab	27.34.66.162	Dart/3.8 (dart:io)	\N	\N	\N	\N	anonymous	login_start	auth	\N	\N	\N	success	200	\N	{"query": {}, "bodyKeys": ["phone"]}	30	2025-12-17 05:52:50.653174+00
945783fb-4f55-49ae-ba8f-668a11f2d529	POST	/login/verify	c75e3154-295f-484f-90c6-f7d0ccd204c0	27.34.66.162	Dart/3.8 (dart:io)	\N	\N	\N	\N	anonymous	login_verify	auth	\N	\N	\N	failure	400	Invalid OTP	{"query": {}, "bodyKeys": ["phone", "otp"]}	1	2025-12-17 05:52:54.523825+00
e413c799-061e-46a4-9385-9d9c9b17266e	POST	/login/verify	213eb525-59a1-4820-a6b2-0e352c0cf283	27.34.66.162	Dart/3.8 (dart:io)	\N	\N	\N	\N	anonymous	login_verify	auth	\N	\N	\N	failure	400	Invalid OTP	{"query": {}, "bodyKeys": ["phone", "otp"]}	1	2025-12-17 05:53:04.963046+00
fcc70f28-6b98-438a-b520-a86f3fa86370	POST	/login/start	5b781fc5-e35a-49ae-8bc6-838069576067	27.34.66.162	Dart/3.8 (dart:io)	\N	\N	\N	\N	anonymous	login_start	auth	\N	\N	\N	success	200	\N	{"query": {}, "bodyKeys": ["phone"]}	29	2025-12-17 05:53:15.429762+00
ac9ac555-272c-4ee1-91ce-949280db64d0	POST	/login/verify	65e24624-c9b4-4d66-9bd3-16c6b5df556f	27.34.66.162	Dart/3.8 (dart:io)	\N	\N	\N	\N	anonymous	login_verify	auth	\N	\N	\N	failure	400	Invalid OTP	{"query": {}, "bodyKeys": ["phone", "otp"]}	1	2025-12-17 05:54:36.109182+00
e1b3fabc-6b92-4117-8754-9e745bc480ce	POST	/login/start	0b9a3bbc-dfda-4888-8b8b-29e40687016e	27.34.66.162	Dart/3.8 (dart:io)	\N	\N	\N	\N	anonymous	login_start	auth	\N	\N	\N	success	200	\N	{"query": {}, "bodyKeys": ["phone"]}	27	2025-12-17 05:55:00.366609+00
9305a9ba-ea25-4f63-94e9-fa535fd99246	POST	/login/verify	a0f3389b-fa23-49bd-9d8f-a10fcb76e3ed	27.34.66.162	Dart/3.8 (dart:io)	\N	\N	\N	\N	anonymous	login_verify	auth	\N	\N	\N	success	200	\N	{"query": {}, "bodyKeys": ["phone", "otp"]}	45	2025-12-17 05:55:44.883927+00
d9485d94-1f0b-4182-8214-66a9f576497b	POST	/agency/login/start-owner	16560d17-ea87-456c-b907-00e8b381f7bb	27.34.66.167	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.1 Safari/605.1.15	\N	\N	\N	\N	anonymous	login_start	auth	\N	\N	\N	success	200	\N	{"query": {}, "bodyKeys": ["phone"]}	28	2025-12-18 03:50:40.461153+00
b3d7f470-62cc-4a06-8bb3-473c052d1c00	POST	/agency/login/verify-owner	a01fb2cd-e5db-45c1-b828-43e87ca1754f	27.34.66.167	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.1 Safari/605.1.15	\N	\N	\N	\N	anonymous	login_verify	auth	\N	\N	\N	failure	400	Invalid OTP	{"query": {}, "bodyKeys": ["phone", "otp"]}	1	2025-12-18 03:50:43.13317+00
ea1b739e-5f33-47de-ab04-a44534bbce2e	POST	/agency/login/start-owner	25146c1a-12b2-4ace-9501-b34843c61460	27.34.66.167	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.1 Safari/605.1.15	\N	\N	\N	\N	anonymous	login_start	auth	\N	\N	\N	success	200	\N	{"query": {}, "bodyKeys": ["phone"]}	19	2025-12-18 03:52:52.973598+00
dc0d6cbc-6f41-4470-a4d2-d042f7499152	POST	/agency/login/verify-owner	2dd68d47-1c7e-4626-9679-03ef985d3ec0	27.34.66.167	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.1 Safari/605.1.15	\N	\N	\N	\N	anonymous	login_verify	auth	\N	\N	\N	success	200	\N	{"query": {}, "bodyKeys": ["phone", "otp"]}	17	2025-12-18 03:52:54.914647+00
d5c14a9f-4dfa-42a7-bb90-dd9fafcbd805	PUT	/candidates/3af2e3c5-66ea-48bc-9ef9-addb9cd801fa/job-profiles	b82fab0d-ad91-4401-9416-182b60ea9eaf	27.34.66.167	Dart/3.8 (dart:io)	78b22b13-c2ae-41cb-b3ea-2f31f6ffdc42	\N	candidate	\N	web-app	update_job_profile	candidate	candidate_job_profile	3af2e3c5-66ea-48bc-9ef9-addb9cd801fa	\N	success	200	\N	{"query": {}, "bodyKeys": ["profile_blob"]}	75	2025-12-18 04:05:36.049382+00
c083353f-ab9f-47b0-a785-cb90a55d886b	PUT	/candidates/3af2e3c5-66ea-48bc-9ef9-addb9cd801fa/job-profiles	21825d0c-4d39-4da5-a130-06741c8eb5ca	27.34.66.167	Dart/3.8 (dart:io)	78b22b13-c2ae-41cb-b3ea-2f31f6ffdc42	\N	candidate	\N	web-app	update_job_profile	candidate	candidate_job_profile	3af2e3c5-66ea-48bc-9ef9-addb9cd801fa	\N	success	200	\N	{"query": {}, "bodyKeys": ["profile_blob"]}	34	2025-12-18 04:06:22.979736+00
6f84468b-e53a-4a02-bb23-b184317cd141	PUT	/candidates/3af2e3c5-66ea-48bc-9ef9-addb9cd801fa/job-profiles	f361d654-e4b7-4ce8-9a72-0eea2aa722d2	27.34.66.167	Dart/3.8 (dart:io)	78b22b13-c2ae-41cb-b3ea-2f31f6ffdc42	\N	candidate	\N	web-app	update_job_profile	candidate	candidate_job_profile	3af2e3c5-66ea-48bc-9ef9-addb9cd801fa	\N	success	200	\N	{"query": {}, "bodyKeys": ["profile_blob"]}	235	2025-12-18 04:07:08.636132+00
7c51be5e-0c66-4958-8edf-ecb110c84fe4	PUT	/candidates/3af2e3c5-66ea-48bc-9ef9-addb9cd801fa/job-profiles	6bf3c8dd-ab30-42e1-a2d8-fcdfb38dd888	27.34.66.167	Dart/3.8 (dart:io)	78b22b13-c2ae-41cb-b3ea-2f31f6ffdc42	\N	candidate	\N	web-app	update_job_profile	candidate	candidate_job_profile	3af2e3c5-66ea-48bc-9ef9-addb9cd801fa	\N	success	200	\N	{"query": {}, "bodyKeys": ["profile_blob"]}	120	2025-12-18 04:24:39.531473+00
0ef474bd-4a4b-4e4e-84d9-72e57ba151b6	PUT	/candidates/3af2e3c5-66ea-48bc-9ef9-addb9cd801fa/job-profiles	2e8990c0-01a4-4c70-bea7-aa668df47345	27.34.66.167	Dart/3.8 (dart:io)	78b22b13-c2ae-41cb-b3ea-2f31f6ffdc42	\N	candidate	\N	web-app	update_job_profile	candidate	candidate_job_profile	3af2e3c5-66ea-48bc-9ef9-addb9cd801fa	\N	success	200	\N	{"query": {}, "bodyKeys": ["profile_blob"]}	43	2025-12-18 04:28:06.198795+00
e1cd8e7a-67ce-4823-b77d-6a451b5e1536	PUT	/candidates/3af2e3c5-66ea-48bc-9ef9-addb9cd801fa/job-profiles	46878de6-f834-4454-9155-82d19925f992	27.34.66.167	Dart/3.8 (dart:io)	78b22b13-c2ae-41cb-b3ea-2f31f6ffdc42	\N	candidate	\N	web-app	update_job_profile	candidate	candidate_job_profile	3af2e3c5-66ea-48bc-9ef9-addb9cd801fa	\N	success	200	\N	{"query": {}, "bodyKeys": ["profile_blob"]}	47	2025-12-18 04:35:59.466647+00
fe1cbb13-d897-4d61-819c-344193e2c471	POST	/agency/login/start-owner	8d8477e7-24f2-4c15-9fc3-7a4943b89016	27.34.66.167	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.1 Safari/605.1.15	\N	\N	\N	\N	anonymous	login_start	auth	\N	\N	\N	success	200	\N	{"query": {}, "bodyKeys": ["phone"]}	27	2025-12-18 05:49:54.133131+00
4d6976a2-9fd8-4655-b2a1-22f819eea803	POST	/agency/login/verify-owner	b9e872dd-2977-4242-b029-b4960a464a0d	27.34.66.167	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.1 Safari/605.1.15	\N	\N	\N	\N	anonymous	login_verify	auth	\N	\N	\N	success	200	\N	{"query": {}, "bodyKeys": ["phone", "otp"]}	15	2025-12-18 05:49:57.02312+00
2f34b07a-a099-4198-85d8-cfd6fb90209f	POST	/agency/login/start-owner	c0a5d80a-29c4-4dc6-8e77-b3e8d2b9c2cb	27.34.66.167	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.1 Safari/605.1.15	\N	\N	\N	\N	anonymous	login_start	auth	\N	\N	\N	success	200	\N	{"query": {}, "bodyKeys": ["phone"]}	22	2025-12-18 06:50:49.752021+00
db048b4b-6372-430e-9a87-f8669c24d562	POST	/agency/login/verify-owner	6a0a7f88-531c-4c09-ac2e-39fb91a01fd6	27.34.66.167	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.1 Safari/605.1.15	\N	\N	\N	\N	anonymous	login_verify	auth	\N	\N	\N	success	200	\N	{"query": {}, "bodyKeys": ["phone", "otp"]}	6	2025-12-18 06:50:52.888371+00
c7113353-0f25-43bc-bc62-b451db41ebf8	POST	/agency/login/start-owner	b9465648-441d-49cf-8185-a58e87f2dc81	27.34.66.167	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.1 Safari/605.1.15	\N	\N	\N	\N	anonymous	login_start	auth	\N	\N	\N	success	200	\N	{"query": {}, "bodyKeys": ["phone"]}	23	2025-12-18 06:56:38.749509+00
74e8564a-ef91-4e25-aba4-765d87f36b78	POST	/agency/login/verify-owner	3b7ce2b3-394c-49d1-9663-3cc37a1a6981	27.34.66.167	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.1 Safari/605.1.15	\N	\N	\N	\N	anonymous	login_verify	auth	\N	\N	\N	success	200	\N	{"query": {}, "bodyKeys": ["phone", "otp"]}	7	2025-12-18 06:56:42.056567+00
efc1ad36-0635-455c-91c3-188f65ec7f71	POST	/member/login/start	d2a6c927-de4c-42de-87eb-99d4bc9ca7b6	27.34.66.167	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.1 Safari/605.1.15	\N	\N	\N	\N	anonymous	login_start	auth	\N	\N	\N	failure	400	Invalid member account	{"query": {}, "bodyKeys": ["phone"]}	25	2025-12-18 06:58:01.656325+00
0520ac4a-f0d9-4da5-8a40-6022127387d2	POST	/agency/login/start-owner	0e07b490-58a1-4ec1-a34b-983d3ff20972	27.34.66.167	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.1 Safari/605.1.15	\N	\N	\N	\N	anonymous	login_start	auth	\N	\N	\N	success	200	\N	{"query": {}, "bodyKeys": ["phone"]}	5	2025-12-18 06:58:21.056612+00
e79ee1af-d78c-4032-8b7d-004416a68a3c	POST	/agency/login/verify-owner	253405b1-dfd9-4f08-9ba1-89d4af921a4f	27.34.66.167	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.1 Safari/605.1.15	\N	\N	\N	\N	anonymous	login_verify	auth	\N	\N	\N	success	200	\N	{"query": {}, "bodyKeys": ["phone", "otp"]}	6	2025-12-18 06:58:23.531523+00
079fab6a-f25c-403a-bde3-c70a5258a62b	POST	/agency/login/start-owner	19968bc6-b858-4fd2-871a-f2239cf688bc	27.34.66.167	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.1 Safari/605.1.15	\N	\N	\N	\N	anonymous	login_start	auth	\N	\N	\N	success	200	\N	{"query": {}, "bodyKeys": ["phone"]}	25	2025-12-18 07:04:57.506959+00
db5d0c91-034b-44c9-ba20-1232b3b64bad	POST	/agency/login/verify-owner	63ddbb92-f95a-4c26-a4cc-d692981c29cb	27.34.66.167	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.1 Safari/605.1.15	\N	\N	\N	\N	anonymous	login_verify	auth	\N	\N	\N	success	200	\N	{"query": {}, "bodyKeys": ["phone", "otp"]}	5	2025-12-18 07:05:00.410088+00
c1dc5ecd-d8fc-4246-a478-5e8e819e4d74	POST	/register	f5f96460-d9b4-49af-b4d0-380415dbf7b6	27.34.66.167	Dart/3.8 (dart:io)	\N	\N	\N	\N	anonymous	register	auth	\N	\N	\N	success	200	\N	{"query": {}, "bodyKeys": ["full_name", "phone"]}	47	2025-12-18 07:10:25.391243+00
9cdf78d5-ed9c-486d-9d2d-e34f193393a9	POST	/verify	c18d041a-ef7f-4c8c-8bfe-e1232cacd793	27.34.66.167	Dart/3.8 (dart:io)	\N	\N	\N	\N	anonymous	login_verify	auth	\N	\N	\N	success	200	\N	{"query": {}, "bodyKeys": ["phone", "otp"]}	16	2025-12-18 07:10:28.018196+00
26a8fdcb-bfa0-4ef0-905b-e24c41056f16	POST	/login/start	c7f9f24a-ecf5-44b5-8b17-28a636464552	27.34.66.167	Dart/3.8 (dart:io)	\N	\N	\N	\N	anonymous	login_start	auth	\N	\N	\N	success	200	\N	{"query": {}, "bodyKeys": ["phone"]}	59	2025-12-18 07:17:34.864542+00
45172bb9-bcdf-4c69-a84c-6024dba74e02	POST	/login/verify	d97fd800-e6dd-4234-b37f-13afbf8df0e0	27.34.66.167	Dart/3.8 (dart:io)	\N	\N	\N	\N	anonymous	login_verify	auth	\N	\N	\N	success	200	\N	{"query": {}, "bodyKeys": ["phone", "otp"]}	9	2025-12-18 07:17:37.356436+00
e595fbb6-cab4-4d4b-a635-3198896f3f7b	POST	/applications/0c071028-3a8c-4670-bf86-860c2072782c/shortlist	ab35850e-fec6-4679-ad18-9c146f88ec8f	27.34.66.167	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.1 Safari/605.1.15	aaa0dec0-7277-4eb3-a261-b53bb4f657a7	\N	owner	e9992fb6-1bf9-4944-a869-bf85280a7e45	web-app	shortlist_candidate	application	job_application	0c071028-3a8c-4670-bf86-860c2072782c	\N	success	200	\N	{"query": {}, "bodyKeys": ["note", "updatedBy"]}	73	2025-12-18 07:30:44.988847+00
a129d95f-7c33-44f4-a374-0ffcb01ee088	POST	/applications/0c071028-3a8c-4670-bf86-860c2072782c/complete-interview	f37079a5-eeac-470b-9dbd-aafe5387d8ee	27.34.66.167	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.1 Safari/605.1.15	aaa0dec0-7277-4eb3-a261-b53bb4f657a7	\N	owner	e9992fb6-1bf9-4944-a869-bf85280a7e45	web-app	complete_interview	interview	job_application	0c071028-3a8c-4670-bf86-860c2072782c	\N	success	200	\N	{"query": {}, "bodyKeys": ["result", "note", "updatedBy"]}	82	2025-12-18 07:56:46.211945+00
e2d4e38f-e377-4c21-8bb2-2d0870870adf	POST	/applications	be8a6f52-b093-4d7f-b2bd-c2079f1d7ac3	27.34.66.167	Dart/3.8 (dart:io)	\N	\N	\N	\N	anonymous	apply_job	application	job_application	\N	\N	failure	500	Internal server error	{"query": {}, "bodyKeys": ["candidate_id", "job_posting_id", "position_id", "note"]}	21	2025-12-18 08:11:09.304632+00
4b7ba417-c939-4e0f-8084-348aeb0146c1	POST	/applications	42dc107f-94c6-4ad2-8a8f-bd7045f59d21	27.34.66.167	Dart/3.8 (dart:io)	\N	\N	\N	\N	anonymous	apply_job	application	job_application	\N	\N	failure	500	Internal server error	{"query": {}, "bodyKeys": ["candidate_id", "job_posting_id", "position_id", "note"]}	33	2025-12-18 08:11:25.140062+00
3863e223-0a84-4aa0-8d26-bba93eb36b51	POST	/applications	5e6e5e6a-5a88-45ef-ba47-1c12974e1ff4	27.34.66.167	Dart/3.8 (dart:io)	\N	\N	\N	\N	anonymous	apply_job	application	job_application	\N	\N	failure	500	Internal server error	{"query": {}, "bodyKeys": ["candidate_id", "job_posting_id", "position_id", "note"]}	39	2025-12-18 08:58:57.192247+00
3b3c9e7c-c944-4cc0-ac78-0f0cd5866801	POST	/applications	3d77f337-3d43-46d1-ac46-c6f085ce9dcd	27.34.66.167	Dart/3.8 (dart:io)	\N	\N	\N	\N	anonymous	apply_job	application	job_application	\N	\N	failure	500	Internal server error	{"query": {}, "bodyKeys": ["candidate_id", "job_posting_id", "position_id", "note"]}	18	2025-12-18 08:59:02.880286+00
ca66be19-5edc-41da-9cd8-077c575c2940	POST	/member/login/start	9a677748-579a-44ea-b9aa-4dc51f39868a	27.34.66.167	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.1 Safari/605.1.15	\N	\N	\N	\N	anonymous	login_start	auth	\N	\N	\N	success	200	\N	{"query": {}, "bodyKeys": ["phone"]}	22	2025-12-18 09:13:23.569888+00
92641391-617b-44a1-8837-341094346040	POST	/member/login/verify	8f56e3c8-2b13-4aa8-afe8-8c5e1ef8ef2a	27.34.66.167	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.1 Safari/605.1.15	\N	\N	\N	\N	anonymous	login_verify	auth	\N	\N	\N	success	200	\N	{"query": {}, "bodyKeys": ["phone", "otp"]}	33	2025-12-18 09:13:28.336872+00
167e6d9c-001f-4756-8360-d0b78f99bb60	POST	/agency/login/start-owner	615c2dca-324b-4044-ac8f-f90ca42e2e94	27.34.66.167	Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1	\N	\N	\N	\N	anonymous	login_start	auth	\N	\N	\N	success	200	\N	{"query": {}, "bodyKeys": ["phone"]}	21	2025-12-18 09:22:03.274761+00
0f55f184-0f6c-4c5c-b241-b30153019cb0	POST	/agency/login/verify-owner	3c2f5729-e650-4d55-b60b-33e6fdc8d7eb	27.34.66.167	Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1	\N	\N	\N	\N	anonymous	login_verify	auth	\N	\N	\N	success	200	\N	{"query": {}, "bodyKeys": ["phone", "otp"]}	7	2025-12-18 09:22:06.935179+00
6c251719-f093-42a8-9061-90da8e8b31c0	POST	/agency/login/start-owner	cbecbdd4-096f-45e9-ae93-52ecd87e7051	27.34.66.167	Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1	\N	\N	\N	\N	anonymous	login_start	auth	\N	\N	\N	failure	404	No registration found for this phone	{"query": {}, "bodyKeys": ["phone"]}	5	2025-12-18 09:22:44.375686+00
626a638a-ab38-4ccf-bfbb-4ec47a780ddd	POST	/login/start	78442235-1f5f-4693-9a77-55d9c8bd1f15	27.34.66.172	Dart/3.8 (dart:io)	\N	\N	\N	\N	anonymous	login_start	auth	\N	\N	\N	failure	404	No candidate profile found for this phone	{"query": {}, "bodyKeys": ["phone"]}	68	2025-12-19 04:24:17.332623+00
acf83bf7-d547-4635-b57d-ce5f82e7c39b	POST	/register	61e3c23d-92cb-4605-bc17-ccbca8c45aef	27.34.66.172	Dart/3.8 (dart:io)	\N	\N	\N	\N	anonymous	register	auth	\N	\N	\N	failure	400	Phone already registered with a different role	{"query": {}, "bodyKeys": ["full_name", "phone"]}	22	2025-12-19 04:24:27.927819+00
ab24fa38-4de3-45ba-9aa3-c150588f1426	POST	/login/start	893fd773-892d-454c-bf81-9555e6ea8510	27.34.66.172	Dart/3.8 (dart:io)	\N	\N	\N	\N	anonymous	login_start	auth	\N	\N	\N	failure	404	No candidate profile found for this phone	{"query": {}, "bodyKeys": ["phone"]}	5	2025-12-19 04:24:36.320127+00
44332c9e-bf1c-43c4-a275-6b2e2d44a452	POST	/login/start	6d94c464-f707-4957-a3ea-6a05c79ecd92	27.34.66.172	Dart/3.8 (dart:io)	\N	\N	\N	\N	anonymous	login_start	auth	\N	\N	\N	success	200	\N	{"query": {}, "bodyKeys": ["phone"]}	24	2025-12-19 04:24:52.43417+00
0aab96dd-751f-4acc-8a4f-7ad1dc8b7f7d	POST	/login/verify	268e8d9c-cdeb-4c07-ba07-1a77e0d95794	27.34.66.172	Dart/3.8 (dart:io)	\N	\N	\N	\N	anonymous	login_verify	auth	\N	\N	\N	success	200	\N	{"query": {}, "bodyKeys": ["phone", "otp"]}	40	2025-12-19 04:24:55.457614+00
\.


--
-- Data for Name: blocked_phones; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.blocked_phones (id, phone, reason) FROM stdin;
\.


--
-- Data for Name: candidate_documents; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.candidate_documents (id, created_at, updated_at, candidate_id, document_type_id, document_url, name, description, notes, file_type, file_size, is_active, verification_status, verified_by, verified_at, rejection_reason, replaced_by_document_id) FROM stdin;
\.


--
-- Data for Name: candidate_job_profiles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.candidate_job_profiles (id, candidate_id, profile_blob, label, created_at, updated_at) FROM stdin;
cbc599e6-aa6e-4125-b0f0-813b7376fb6b	3af2e3c5-66ea-48bc-9ef9-addb9cd801fa	{"skills": [{"title": "Driving", "years": 3, "documents": [], "duration_months": 12}], "education": [{"title": "", "degree": "SLC Pass", "institute": "Golden Peak High School"}], "trainings": [{"hours": 40, "title": "Tool Handling", "provider": "Nepal Training Association", "certificate": true}], "experience": [{"title": "Laundry worker", "months": 24, "employer": "Nepal Laundry Service", "description": "best employee of the year.", "end_date_ad": "2025-12-04", "start_date_ad": "2023-12-16"}, {"title": "laundry worker", "months": 1, "employer": "Nepalese Laundry", "description": "employee.", "end_date_ad": "2025-12-16", "start_date_ad": "2025-12-04"}]}	\N	2025-12-16 08:25:31.601214+00	2025-12-18 04:35:59.449563+00
\.


--
-- Data for Name: candidate_preferences; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.candidate_preferences (id, candidate_id, job_title_id, title, priority, created_at, updated_at) FROM stdin;
215f499c-da00-4840-afb8-3b8ce666a216	3af2e3c5-66ea-48bc-9ef9-addb9cd801fa	a55430d2-644f-4a6b-9b31-f82a3a1e55a2	Mason	1	2025-12-10 04:10:16.941642	2025-12-10 04:10:16.941642
4505dd6a-790a-48e0-bbde-522f838d6d33	3af2e3c5-66ea-48bc-9ef9-addb9cd801fa	a3bbe6e9-8c16-44bc-bf20-394945bb63e9	Cleaner / Cleaning & Laundry Worker	2	2025-12-16 08:16:43.927943	2025-12-16 08:26:57.197009
9f502329-0a5c-4699-b541-6b222515b9c8	0ba2a930-fdfb-4a12-919c-21c3044254af	26b4694a-ef2d-41da-b1a4-b6c00bccae8e	Carpenter	1	2025-12-19 04:24:59.974109	2025-12-19 04:24:59.974109
e9b27b3c-5301-48bd-bfaf-b771a8ae51a9	0ba2a930-fdfb-4a12-919c-21c3044254af	fd7e1eba-a3eb-4efd-b6a6-9b088d610373	Steel Fixer	2	2025-12-19 04:25:00.8168	2025-12-19 04:25:00.8168
\.


--
-- Data for Name: candidates; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.candidates (id, created_at, updated_at, full_name, phone, email, gender, date_of_birth, address, passport_number, profile_image, is_active) FROM stdin;
3af2e3c5-66ea-48bc-9ef9-addb9cd801fa	2025-12-10 04:09:26.816689+00	2025-12-10 04:18:46.994834+00	Ramey	+9779862146253	rame@gmail.com	Male	2025-12-09	{"name": "Biratnagar Bazaar", "ward": "8", "district": "Morang", "province": "Koshi", "coordinates": {"lat": 26.4525, "lng": 87.2718}, "municipality": "Biratnagar Metropolitan City"}	6636363636	\N	t
0ba2a930-fdfb-4a12-919c-21c3044254af	2025-12-18 07:10:25.373605+00	2025-12-19 04:25:34.687168+00	Test Man	+9779862146257	\N	\N	\N	\N	\N	public/uploads/candidates/0ba2a930-fdfb-4a12-919c-21c3044254af/profile.jpg	t
\.


--
-- Data for Name: countries; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.countries (id, created_at, updated_at, country_code, country_name, currency_code, currency_name, npr_multiplier) FROM stdin;
247c8a6f-1aee-40ad-b45a-9dc04275cf5f	2025-12-10 03:29:08.517788+00	2025-12-10 03:29:08.517788+00	NPL	Nepal	NPR	Nepalese Rupee	1.000000
35955f21-8ef0-4190-ac63-1d7f6eef3e27	2025-12-10 03:29:08.517788+00	2025-12-10 03:29:08.517788+00	UAE	United Arab Emirates	AED	UAE Dirham	36.000000
11f97ee2-0468-485b-b814-fb24b7d9296e	2025-12-10 03:29:08.517788+00	2025-12-10 03:29:08.517788+00	QAT	Qatar	QAR	Qatari Riyal	36.500000
e82861d4-3382-426b-ae01-8964f3c8fa9f	2025-12-10 03:29:08.517788+00	2025-12-10 03:29:08.517788+00	KSA	Saudi Arabia	SAR	Saudi Riyal	35.000000
1541c69a-611a-4062-86d3-7569236674a9	2025-12-10 03:29:08.517788+00	2025-12-10 03:29:08.517788+00	KWT	Kuwait	KWD	Kuwaiti Dinar	432.000000
5a4caa03-2d13-4ead-895e-07e49d65ce07	2025-12-10 03:29:08.517788+00	2025-12-10 03:29:08.517788+00	OMN	Oman	OMR	Omani Rial	350.000000
2ef8bfe4-195a-4bf8-a530-4469f5ee925e	2025-12-10 03:29:08.517788+00	2025-12-10 03:29:08.517788+00	BHR	Bahrain	BHD	Bahraini Dinar	347.000000
8154bd5e-da61-47e1-91b4-253d36a4177d	2025-12-10 03:29:08.517788+00	2025-12-10 03:29:08.517788+00	MYS	Malaysia	MYR	Malaysian Ringgit	28.000000
ce3cb642-f432-42b8-b393-f143d6e538d5	2025-12-10 03:29:08.517788+00	2025-12-10 03:29:08.517788+00	KOR	South Korea	KRW	South Korean Won	0.096000
4018517d-0e0c-4728-ad58-b39d4ec6ac0a	2025-12-10 03:29:08.517788+00	2025-12-10 03:29:08.517788+00	JPN	Japan	JPY	Japanese Yen	0.900000
e8f15db8-e025-4d64-a28a-a047e29b5b03	2025-12-10 03:29:08.517788+00	2025-12-10 03:29:08.517788+00	CYP	Cyprus	EUR	Euro	145.000000
c0e97377-d506-4a39-ba2f-d0fa2967600c	2025-12-10 03:29:08.517788+00	2025-12-10 03:29:08.517788+00	ROU	Romania	RON	Romanian Leu	29.000000
56b91e4a-08a4-4f9f-b115-2ad1a21b2646	2025-12-10 03:29:08.517788+00	2025-12-10 03:29:08.517788+00	POL	Poland	PLN	Polish Zloty	34.000000
0311312c-80ea-4db6-a6fd-47f7d9bd2ce9	2025-12-10 03:29:08.517788+00	2025-12-10 03:29:08.517788+00	PRT	Portugal	EUR	Euro	145.000000
7900c4aa-8a99-44f3-b139-744c7c6990cc	2025-12-10 03:29:08.517788+00	2025-12-10 03:29:08.517788+00	HRV	Croatia	EUR	Euro	145.000000
8c50c5bc-a325-4740-8b23-ac46ad51c7c2	2025-12-10 03:29:08.517788+00	2025-12-10 03:29:08.517788+00	MLT	Malta	EUR	Euro	145.000000
861e2fe4-41e7-405d-80e0-6f8706eaa642	2025-12-10 03:29:08.517788+00	2025-12-10 03:29:08.517788+00	ISR	Israel	ILS	Israeli Shekel	35.000000
b751e66a-7dc0-4437-8eae-c17d5bd0d0a4	2025-12-10 03:29:08.517788+00	2025-12-10 03:29:08.517788+00	TUR	Turkey	TRY	Turkish Lira	4.800000
e4b858e5-45b1-447f-877b-33e0cb94dbf4	2025-12-10 03:29:08.517788+00	2025-12-10 03:29:08.517788+00	JOR	Jordan	JOD	Jordanian Dinar	187.000000
d167154b-e4dc-4911-9417-6bb6928a32a4	2025-12-10 03:29:08.517788+00	2025-12-10 03:29:08.517788+00	IND	India	INR	Indian Rupee	1.600000
fb66854d-3e9b-43a9-a50e-e405120a9fd6	2025-12-10 03:29:08.517788+00	2025-12-10 03:29:08.517788+00	LKA	Sri Lanka	LKR	Sri Lankan Rupee	0.400000
2deac191-269b-46a5-ac95-0b4be315d43d	2025-12-10 03:29:08.517788+00	2025-12-10 03:29:08.517788+00	BGD	Bangladesh	BDT	Bangladeshi Taka	1.200000
f11b1cc6-b61b-408a-9c5e-0331e5d6c597	2025-12-10 03:29:08.517788+00	2025-12-10 03:29:08.517788+00	PAK	Pakistan	PKR	Pakistani Rupee	0.480000
84031818-e175-42d5-9efe-480245ed195f	2025-12-10 03:29:08.517788+00	2025-12-10 03:29:08.517788+00	IDN	Indonesia	IDR	Indonesian Rupiah	0.008500
4d6a90d1-8cca-4d8d-b5df-1ec49e0efe4c	2025-12-10 03:29:08.517788+00	2025-12-10 03:29:08.517788+00	THA	Thailand	THB	Thai Baht	3.700000
5c175b9a-a9cb-439d-8b79-1577895825af	2025-12-10 03:29:08.517788+00	2025-12-10 03:29:08.517788+00	SGP	Singapore	SGD	Singapore Dollar	98.000000
1df5c877-5287-418f-8ed1-17e69b9f0707	2025-12-10 03:29:08.517788+00	2025-12-10 03:29:08.517788+00	HKG	Hong Kong	HKD	Hong Kong Dollar	17.000000
dd8ad023-e0a5-466f-8e0a-7db8d4617eb0	2025-12-10 03:29:08.517788+00	2025-12-10 03:29:08.517788+00	CHN	China	CNY	Chinese Yuan	18.000000
b0e32f3a-ae60-4330-b677-7ff0c673553d	2025-12-10 03:29:08.517788+00	2025-12-10 03:29:08.517788+00	TWN	Taiwan	TWD	New Taiwan Dollar	4.100000
d400a5a2-6c6b-427b-b298-9fb0738262ba	2025-12-10 03:29:08.517788+00	2025-12-10 03:29:08.517788+00	MDC	Maldives	MVR	Maldivian Rufiyaa	8.600000
6f021990-d7c8-4cab-9bde-e76568b468a6	2025-12-10 03:29:08.517788+00	2025-12-10 03:29:08.517788+00	MUS	Mauritius	MUR	Mauritian Rupee	2.800000
d315d03e-a3f9-4f35-bccc-5ebf91cb7d9c	2025-12-10 03:29:08.517788+00	2025-12-10 03:29:08.517788+00	ZAF	South Africa	ZAR	South African Rand	7.200000
8f7dd15d-4291-44af-8b56-d93da77288de	2025-12-10 03:29:08.517788+00	2025-12-10 03:29:08.517788+00	KEN	Kenya	KES	Kenyan Shilling	1.020000
39d06b80-05b9-42da-bc57-f02d062b7214	2025-12-10 03:29:08.517788+00	2025-12-10 03:29:08.517788+00	USA	United States	USD	US Dollar	133.000000
68984ce6-6dd7-4b2c-bed1-ac3892af6b0f	2025-12-10 03:29:08.517788+00	2025-12-10 03:29:08.517788+00	CAN	Canada	CAD	Canadian Dollar	97.000000
8f80b3c0-39fd-4a45-8308-e392cfbbebb3	2025-12-10 03:29:08.517788+00	2025-12-10 03:29:08.517788+00	AUS	Australia	AUD	Australian Dollar	88.000000
52c5d676-d6ba-4a7b-b3bb-f18354a0fd3d	2025-12-10 03:29:08.517788+00	2025-12-10 03:29:08.517788+00	NZL	New Zealand	NZD	New Zealand Dollar	79.000000
6bb6ca98-f942-4251-b31a-72ecd254f636	2025-12-10 03:29:08.517788+00	2025-12-10 03:29:08.517788+00	DEU	Germany	EUR	Euro	145.000000
eb4ee867-da16-4366-9203-2e8063f1460d	2025-12-10 03:29:08.517788+00	2025-12-10 03:29:08.517788+00	ITA	Italy	EUR	Euro	145.000000
62be224c-c970-47ad-8676-ec27ed5eb1ab	2025-12-10 03:29:08.517788+00	2025-12-10 03:29:08.517788+00	ESP	Spain	EUR	Euro	145.000000
94efb106-36b9-483b-8ab9-6de59bb92b0f	2025-12-10 03:29:08.517788+00	2025-12-10 03:29:08.517788+00	FRA	France	EUR	Euro	145.000000
06c3caf1-582e-41d5-bb81-0225229c5af6	2025-12-10 03:29:08.517788+00	2025-12-10 03:29:08.517788+00	CZE	Czechia	CZK	Czech Koruna	6.200000
e9f8acb4-c6ff-4ca3-b9b8-3114d659b9fa	2025-12-10 03:29:08.517788+00	2025-12-10 03:29:08.517788+00	HUN	Hungary	HUF	Hungarian Forint	0.360000
31760f39-fb37-4d21-bcc9-3a2f29e1b8f9	2025-12-10 03:29:08.517788+00	2025-12-10 03:29:08.517788+00	BGR	Bulgaria	BGN	Bulgarian Lev	74.000000
a3681880-2e39-4887-ba37-a78ec7cb4481	2025-12-10 03:29:08.517788+00	2025-12-10 03:29:08.517788+00	LTU	Lithuania	EUR	Euro	145.000000
3a33d1df-1208-4ee1-a057-fccfa3e1aa39	2025-12-10 03:29:08.517788+00	2025-12-10 03:29:08.517788+00	LVA	Latvia	EUR	Euro	145.000000
d08e2a1f-9115-4b98-80ec-9880c292f546	2025-12-10 03:29:08.517788+00	2025-12-10 03:29:08.517788+00	EST	Estonia	EUR	Euro	145.000000
\.


--
-- Data for Name: document_types; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.document_types (id, created_at, updated_at, name, type_code, description, is_required, display_order, is_active, allowed_mime_types, max_file_size_mb) FROM stdin;
735d703c-a4dd-45c6-8ae9-768b30e252d4	2025-12-10 03:29:08.63123+00	2025-12-10 03:29:08.63123+00	Passport	PASSPORT	Valid passport document	t	1	t	application/pdf,image/jpeg,image/jpg,image/png	10
621cf1f6-6475-4b72-94ad-d56b2386a7c4	2025-12-10 03:29:08.641808+00	2025-12-10 03:29:08.641808+00	Medical Certificate	MEDICAL	Medical fitness certificate	t	2	t	application/pdf,image/jpeg,image/jpg,image/png	10
d4ee17fd-6ae4-4cc9-97ec-15abaccdb4c2	2025-12-10 03:29:08.651515+00	2025-12-10 03:29:08.651515+00	Insurance Document	INSURANCE	Health or travel insurance document	f	3	t	application/pdf,image/jpeg,image/jpg,image/png	10
a3ec58f4-e0bc-476e-8cfd-6115e9f26cf9	2025-12-10 03:29:08.658613+00	2025-12-10 03:29:08.658613+00	SSF Document	SSF	Social Security Fund document	f	4	t	application/pdf,image/jpeg,image/jpg,image/png	10
46f9a21c-ec62-467c-a454-062057484cde	2025-12-10 03:29:08.66381+00	2025-12-10 03:29:08.66381+00	Educational Certificate	EDUCATION	Educational qualifications and certificates	f	5	t	application/pdf,image/jpeg,image/jpg,image/png	10
5451f41a-8190-417a-9784-4020f27b764c	2025-12-10 03:29:08.671488+00	2025-12-10 03:29:08.671488+00	Experience Letter	EXPERIENCE	Work experience letters and references	f	6	t	application/pdf,image/jpeg,image/jpg,image/png	10
a176ecbd-6749-4d18-aa9a-38cad5bd8364	2025-12-10 03:29:08.675879+00	2025-12-10 03:29:08.675879+00	Police Clearance	POLICE_CLEARANCE	Police clearance certificate	f	7	t	application/pdf,image/jpeg,image/jpg,image/png	10
\.


--
-- Data for Name: employers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.employers (id, created_at, updated_at, company_name, country, city) FROM stdin;
82a62383-c5df-40b3-b0a9-81f28101d548	2025-12-10 03:29:08.779635+00	2025-12-10 03:29:08.779635+00	Dev Employer	UAE	Dubai
5bb8c3e2-5bbe-4f21-9f35-7a07dc945c0f	2025-12-16 06:06:45.543159+00	2025-12-16 06:13:52.6+00	HIT FACILITY MANAGEMENT SERVICES L.L.C	Bahrain	Manama
\.


--
-- Data for Name: insurance_expenses; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.insurance_expenses (id, created_at, updated_at, job_posting_id, who_pays, is_free, amount, currency, coverage_amount, coverage_currency, notes) FROM stdin;
b37cf647-07ce-489d-ae80-59bdad0a6d75	2025-12-16 07:15:37.918818+00	2025-12-16 07:15:37.918818+00	890b908b-3839-4f6b-8241-fc72a00a33ce	shared	f	1500.00	NPR	500000.00	NPR	\N
\.


--
-- Data for Name: interview_details; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.interview_details (id, created_at, updated_at, job_posting_id, job_application_id, interview_date_ad, interview_date_bs, interview_time, duration_minutes, location, contact_person, required_documents, notes, status, result, type, interviewer_email, feedback, score, recommendation, rejection_reason, completed_at, cancelled_at, rescheduled_at) FROM stdin;
9e004013-559c-458f-920b-3cf44ef1c058	2025-12-18 07:37:25.87458+00	2025-12-18 07:56:46.168616+00	890b908b-3839-4f6b-8241-fc72a00a33ce	0c071028-3a8c-4670-bf86-860c2072782c	2025-12-19	\N	10:00:00	60	Office	Narendra Babu Rana	{cv,citizenship,education,photo,hardcopy}	please come 20 minutes early 	completed	fail	In-person	\N	\N	\N	\N	\N	2025-12-18 07:56:46.165+00	\N	\N
\.


--
-- Data for Name: interview_expenses; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.interview_expenses (id, created_at, interview_id, expense_type, who_pays, is_free, amount, currency, refundable, notes) FROM stdin;
\.


--
-- Data for Name: job_applications; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.job_applications (id, candidate_id, job_posting_id, position_id, status, history_blob, withdrawn_at, created_at, updated_at) FROM stdin;
0c071028-3a8c-4670-bf86-860c2072782c	3af2e3c5-66ea-48bc-9ef9-addb9cd801fa	890b908b-3839-4f6b-8241-fc72a00a33ce	d2721210-731a-4805-af31-25cd43bfeadc	interview_failed	[{"note": "I am available for this job.", "updated_at": "2025-12-16T10:14:15.404Z", "updated_by": null, "next_status": "applied", "prev_status": null}, {"note": "Shortlisted from job details", "updated_at": "2025-12-18T07:30:44.917Z", "updated_by": "agency", "next_status": "shortlisted", "prev_status": "applied"}, {"note": "Bulk scheduled via agency workflow", "updated_at": "2025-12-18T07:37:25.889Z", "updated_by": "agency", "next_status": "interview_scheduled", "prev_status": "shortlisted"}, {"note": "", "updated_at": "2025-12-18T07:56:46.174Z", "updated_by": "agency", "next_status": "interview_failed", "prev_status": "interview_scheduled"}]	\N	2025-12-16 10:14:15.405381+00	2025-12-18 07:56:46.17717+00
\.


--
-- Data for Name: job_contracts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.job_contracts (id, created_at, updated_at, job_posting_id, employer_id, posting_agency_id, period_years, renewable, hours_per_day, days_per_week, overtime_policy, weekly_off_days, food, accommodation, transport, annual_leave_days) FROM stdin;
eaa3a28d-d7c4-458f-892c-ec8a095f7cf6	2025-12-10 03:29:08.779635+00	2025-12-10 03:29:08.779635+00	135198ba-ed98-4303-8b63-d5eb13b39952	82a62383-c5df-40b3-b0a9-81f28101d548	32180c15-fc5b-4dc9-acf7-e622120bc6ae	1	t	\N	\N	as_per_company_policy	\N	\N	\N	\N	\N
4b2fd3b8-9986-45a2-ac41-460175f2b17a	2025-12-10 03:29:09.306593+00	2025-12-10 03:29:09.306593+00	5b573e9f-c875-402f-a3b7-b1e6b1bdc279	82a62383-c5df-40b3-b0a9-81f28101d548	a1439760-013c-4b0f-a1ee-5ab2d7c9df70	1	t	\N	\N	as_per_company_policy	\N	\N	\N	\N	\N
4f87dbc2-a78e-4d7e-b72c-1ebd0cb27dfc	2025-12-10 03:29:09.764596+00	2025-12-10 03:29:09.764596+00	f23fe7d0-c6e2-412b-b78c-06803f24d9ea	82a62383-c5df-40b3-b0a9-81f28101d548	9b42d121-42ee-4e6c-b301-7cf399438f71	1	t	\N	\N	as_per_company_policy	\N	\N	\N	\N	\N
ae540ebe-ca19-4d50-a63a-855a0cf81968	2025-12-16 06:06:45.543159+00	2025-12-16 06:14:17.77+00	890b908b-3839-4f6b-8241-fc72a00a33ce	5bb8c3e2-5bbe-4f21-9f35-7a07dc945c0f	e9992fb6-1bf9-4944-a869-bf85280a7e45	2	t	8	6	as_per_company_policy	1	free	free	free	30
\.


--
-- Data for Name: job_positions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.job_positions (id, created_at, updated_at, job_contract_id, title, male_vacancies, female_vacancies, monthly_salary_amount, salary_currency, hours_per_day_override, days_per_week_override, overtime_policy_override, weekly_off_days_override, food_override, accommodation_override, transport_override, position_notes) FROM stdin;
8e5b20db-e066-48ad-88f0-873e574ed862	2025-12-10 03:29:08.779635+00	2025-12-10 03:29:08.779635+00	eaa3a28d-d7c4-458f-892c-ec8a095f7cf6	General Worker	2	0	1000.00	AED	\N	\N	\N	\N	\N	\N	\N	\N
bf8c4b5f-43ec-4c98-ae14-497ed14ea42b	2025-12-10 03:29:08.779635+00	2025-12-10 03:29:08.779635+00	eaa3a28d-d7c4-458f-892c-ec8a095f7cf6	Different Job	2	0	1000.00	AED	\N	\N	\N	\N	\N	\N	\N	\N
99ddfd55-94b1-465c-b816-a77cc994661c	2025-12-10 03:29:08.779635+00	2025-12-10 03:29:08.779635+00	eaa3a28d-d7c4-458f-892c-ec8a095f7cf6	Unique Job	2	0	1000.00	AED	\N	\N	\N	\N	\N	\N	\N	\N
56cbf726-8ec4-44f9-86d5-557906c13443	2025-12-10 03:29:09.306593+00	2025-12-10 03:29:09.306593+00	4b2fd3b8-9986-45a2-ac41-460175f2b17a	General Worker	2	0	1000.00	AED	\N	\N	\N	\N	\N	\N	\N	\N
ddf89021-b04c-4e76-b125-990a9e621911	2025-12-10 03:29:09.306593+00	2025-12-10 03:29:09.306593+00	4b2fd3b8-9986-45a2-ac41-460175f2b17a	Different Job	2	0	1000.00	AED	\N	\N	\N	\N	\N	\N	\N	\N
afa5bf7a-dcc5-4e7b-b532-67e68ac56ebf	2025-12-10 03:29:09.306593+00	2025-12-10 03:29:09.306593+00	4b2fd3b8-9986-45a2-ac41-460175f2b17a	Unique Job	2	0	1000.00	AED	\N	\N	\N	\N	\N	\N	\N	\N
6b43941c-b857-46a8-b9f2-eb06ffb8b5a7	2025-12-10 03:29:09.764596+00	2025-12-10 03:29:09.764596+00	4f87dbc2-a78e-4d7e-b72c-1ebd0cb27dfc	General Worker	2	0	1000.00	AED	\N	\N	\N	\N	\N	\N	\N	\N
4ee5830d-1a5b-4b65-b8a7-0769b318eb5f	2025-12-10 03:29:09.764596+00	2025-12-10 03:29:09.764596+00	4f87dbc2-a78e-4d7e-b72c-1ebd0cb27dfc	Different Job	2	0	1000.00	AED	\N	\N	\N	\N	\N	\N	\N	\N
dadacd29-b022-4213-beaa-aa682d4e4a77	2025-12-10 03:29:09.764596+00	2025-12-10 03:29:09.764596+00	4f87dbc2-a78e-4d7e-b72c-1ebd0cb27dfc	Unique Job	2	0	1000.00	AED	\N	\N	\N	\N	\N	\N	\N	\N
d2721210-731a-4805-af31-25cd43bfeadc	2025-12-16 06:06:45.543159+00	2025-12-16 07:56:40.276+00	ae540ebe-ca19-4d50-a63a-855a0cf81968	Laundry Worker	2	1	1000.00	BHD	\N	\N	\N	\N	\N	\N	\N	Needed
\.


--
-- Data for Name: job_posting_titles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.job_posting_titles (job_posting_id, job_title_id) FROM stdin;
135198ba-ed98-4303-8b63-d5eb13b39952	d6a90ba5-8c80-4030-ab84-b2d2c3630426
135198ba-ed98-4303-8b63-d5eb13b39952	a8267c03-784f-46ec-9216-6a935ecccdc3
5b573e9f-c875-402f-a3b7-b1e6b1bdc279	333ad008-d699-45ee-8776-b20d6a07e0ee
5b573e9f-c875-402f-a3b7-b1e6b1bdc279	62a6b866-55a7-4861-9f3f-db6802e93f64
f23fe7d0-c6e2-412b-b78c-06803f24d9ea	a55430d2-644f-4a6b-9b31-f82a3a1e55a2
f23fe7d0-c6e2-412b-b78c-06803f24d9ea	a6bff4b3-182f-46cb-8a62-aa47a5620770
\.


--
-- Data for Name: job_postings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.job_postings (id, created_at, updated_at, posting_title, country, city, lt_number, chalani_number, approval_date_bs, approval_date_ad, posting_date_ad, posting_date_bs, announcement_type, notes, cutout_url, view_count, is_active, skills, education_requirements, experience_requirements) FROM stdin;
135198ba-ed98-4303-8b63-d5eb13b39952	2025-12-10 03:29:08.779635+00	2025-12-10 03:29:09.195598+00	Sample Job for Inspire International Employment Pvt. Ltd	UAE	\N	\N	\N	\N	\N	2025-12-10	\N	full_ad	\N	\N	0	t	["seed-basic", "seed-tagged"]	["seed-education"]	{"level": "entry", "min_years": 0}
5b573e9f-c875-402f-a3b7-b1e6b1bdc279	2025-12-10 03:29:09.306593+00	2025-12-10 03:29:09.472232+00	Sample Job for Everest Global Recruitment Pvt. Ltd	UAE	\N	\N	\N	\N	\N	2025-12-10	\N	full_ad	\N	\N	0	t	["seed-basic", "seed-tagged"]	["seed-education"]	{"level": "entry", "min_years": 0}
f23fe7d0-c6e2-412b-b78c-06803f24d9ea	2025-12-10 03:29:09.764596+00	2025-12-10 03:29:09.915212+00	Sample Job for Himalayan Overseas Manpower Pvt. Ltd	UAE	\N	\N	\N	\N	\N	2025-12-10	\N	full_ad	\N	\N	0	t	["seed-basic", "seed-tagged"]	["seed-education"]	{"level": "entry", "min_years": 0}
890b908b-3839-4f6b-8241-fc72a00a33ce	2025-12-16 06:06:45.543159+00	2025-12-16 11:40:55.68+00	बहराइनमा वैदेशिक रोजगारको अवसर - HIT Facility Management	Bahrain	Manama	298629	६०२१३६३६	\N	2024-01-23	2024-01-23	\N	full_ad	अन्तर्वार्ता मेनपावर कार्यालय काठमाडौंमा २०८० माघ १८ गते (1 February 2024) मा हुनेछ। सम्पर्क: NMS Recruitment Service Pvt. Ltd., Boudhha-06, Kathmandu. Ph: 01-5914535, 5914536	public/uploads/jobs/890b908b-3839-4f6b-8241-fc72a00a33ce/cutout.png	0	t	["सम्बन्धित कामामा दक्ष", "Communication", "Teamwork", "Time Management", "Tool handling", "Masonry & concrete work"]	["SLC Pass", "Plus 2 preferred"]	{"level": "expert", "max_years": 5, "min_years": 1}
\.


--
-- Data for Name: job_titles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.job_titles (id, created_at, updated_at, title, rank, is_active, difficulty, skills_summary, description) FROM stdin;
a55430d2-644f-4a6b-9b31-f82a3a1e55a2	2025-12-10 03:29:08.60895+00	2025-12-10 03:29:08.60895+00	Mason	1	t	High	Basic masonry, site experience	Lays bricks/blocks, builds walls, plastering. Heavy lifting outdoors.
26b4694a-ef2d-41da-b1a4-b6c00bccae8e	2025-12-10 03:29:08.60895+00	2025-12-10 03:29:08.60895+00	Carpenter	2	t	High	Woodworking, tool handling	Cuts, shapes, assembles wooden structures, furniture, formwork.
fd7e1eba-a3eb-4efd-b6a6-9b088d610373	2025-12-10 03:29:08.60895+00	2025-12-10 03:29:08.60895+00	Steel Fixer	3	t	High	Rebar placement, basic construction	Installs steel bars/reinforcement in concrete structures. Physically demanding.
333ad008-d699-45ee-8776-b20d6a07e0ee	2025-12-10 03:29:08.60895+00	2025-12-10 03:29:08.60895+00	Scaffolder	4	t	High	Safety knowledge, climbing	Sets up scaffolding for construction sites. Requires balance, strength.
62a6b866-55a7-4861-9f3f-db6802e93f64	2025-12-10 03:29:08.60895+00	2025-12-10 03:29:08.60895+00	Painter	5	t	Medium	Painting techniques, surface prep	Paints walls, ceilings, structures. Prepares surfaces and applies coatings.
7084e4f0-a7a5-41eb-bfa6-3370d96ef99c	2025-12-10 03:29:08.60895+00	2025-12-10 03:29:08.60895+00	Tile/Marble Fixer	6	t	Medium	Tile/stone laying, cutting	Installs tiles/marble in floors and walls. Requires precision and bending.
31ea9fa0-9bab-420d-acd7-fdb36fc3f044	2025-12-10 03:29:08.60895+00	2025-12-10 03:29:08.60895+00	Plasterer	7	t	High	Plastering skills	Applies plaster to walls and ceilings, smooths surfaces. Heavy, repetitive work.
e4cf1a1b-bb3d-4c0c-a879-8bc364c46b5e	2025-12-10 03:29:08.60895+00	2025-12-10 03:29:08.60895+00	Shuttering/Formwork Carpenter	8	t	High	Carpentry, construction	Builds molds for concrete casting. Heavy, standing, lifting work.
d6a90ba5-8c80-4030-ab84-b2d2c3630426	2025-12-10 03:29:08.60895+00	2025-12-10 03:29:08.60895+00	Welder	9	t	Medium–High	Welding certifications, metalwork	Joins metal parts using welding machines. Requires precision and safety awareness.
6b4fa041-f8bf-4344-9bae-5972d31b2c3a	2025-12-10 03:29:08.60895+00	2025-12-10 03:29:08.60895+00	Pipe Fitter / Plumber	10	t	Medium–High	Plumbing trade knowledge	Installs and repairs water/gas pipelines, sanitary fittings. Physical bending and lifting.
30e4b3eb-d07b-44f3-b94d-cc827f0e37a6	2025-12-10 03:29:08.60895+00	2025-12-10 03:29:08.60895+00	Plumber	10	t	Medium–High	Plumbing trade knowledge	Installs and repairs water/gas pipelines, sanitary fittings. Physical bending and lifting.
d45db460-098d-47af-8107-20d50e1f7094	2025-12-10 03:29:08.60895+00	2025-12-10 03:29:08.60895+00	Electrician	11	t	Medium	Electrical training, safety knowledge	Installs, maintains, and repairs electrical systems. Risk of shocks if untrained.
483f3611-8757-4c78-99d5-8ee9ffa00f9a	2025-12-10 03:29:08.60895+00	2025-12-10 03:29:08.60895+00	AC / HVAC Technician	12	t	Medium	Refrigeration/AC training	Installs, maintains, and repairs AC and cooling systems. Involves lifting and precision.
be6cc5d0-eff0-4baa-b690-266a24a213c1	2025-12-10 03:29:08.60895+00	2025-12-10 03:29:08.60895+00	Mechanical / Electrical Technician	13	t	Medium	Technical training	Maintains machinery, small engines, or electrical equipment. Moderate physical work.
a8267c03-784f-46ec-9216-6a935ecccdc3	2025-12-10 03:29:08.60895+00	2025-12-10 03:29:08.60895+00	Automotive Mechanic	14	t	Medium–High	Vehicle repair experience	Repairs cars, trucks, or heavy vehicles. Hands-on, physical, sometimes oily work.
5d895a4f-6bfd-4f4d-8e8d-2c4fa079bc1d	2025-12-10 03:29:08.60895+00	2025-12-10 03:29:08.60895+00	Heavy/Trailer Driver	15	t	Medium	Driving license, experience	Operates trucks or trailers. Long hours, requires endurance and focus.
db88043e-5348-4992-a09b-ccbbf8a88a49	2025-12-10 03:29:08.60895+00	2025-12-10 03:29:08.60895+00	Light Vehicle Driver	16	t	Medium	Driving license	Drives cars, vans, minibuses. Long hours possible, moderate physical activity.
b3c2e265-e4b1-4f19-a8a7-b548b0908965	2025-12-10 03:29:08.60895+00	2025-12-10 03:29:08.60895+00	Bus/Coaster Driver	17	t	Medium	Professional driving license	Drives passenger vehicles on local or intercity routes. Responsible for safety and schedules.
0796b9a7-013d-45d4-ba8c-31dafe668528	2025-12-10 03:29:08.60895+00	2025-12-10 03:29:08.60895+00	Delivery Driver	18	t	Medium	Driving experience	Delivers goods/packages. Requires physical handling of parcels.
a6bff4b3-182f-46cb-8a62-aa47a5620770	2025-12-10 03:29:08.60895+00	2025-12-10 03:29:08.60895+00	Forklift Operator	19	t	Medium	Certification, machine handling	Operates forklifts in warehouses or construction. Moderate lifting, attention to safety.
b93087f9-94a3-4651-9226-f6e048afbb27	2025-12-10 03:29:08.60895+00	2025-12-10 03:29:08.60895+00	Excavator / Backhoe Operator	20	t	High	Machine operation experience	Operates heavy earthmoving equipment. Long hours, outdoor, physically stressful.
757907d2-d4ca-4fc1-b275-2b3c896b28d4	2025-12-10 03:29:08.60895+00	2025-12-10 03:29:08.60895+00	Crane / Hoist Operator	21	t	Medium–High	Certified operator	Operates cranes or hoists on construction sites. Requires precision and safety compliance.
5a4828d7-d399-40cd-98c3-517cc145df6a	2025-12-10 03:29:08.60895+00	2025-12-10 03:29:08.60895+00	Loader / Bulldozer Operator	22	t	High	Machine operation experience	Operates loaders/bulldozers. Heavy machinery, long hours, outdoor work.
ede0d211-bfb3-4a82-b5fd-c6225bf8d463	2025-12-10 03:29:08.60895+00	2025-12-10 03:29:08.60895+00	Machine Operator (Factory)	23	t	Medium	Technical skills	Runs factory machines, monitors production. Standing and repetitive tasks.
1d4812c6-ed0c-4813-81ba-c21c1643e4fd	2025-12-10 03:29:08.60895+00	2025-12-10 03:29:08.60895+00	Packaging / Loading / Shipping Worker	24	t	Medium–High	No formal skill, experience helpful	Packs, labels, and moves goods. Heavy lifting and repetitive tasks.
183f7e4e-136f-4b63-8ecc-1bce21ee5fa9	2025-12-10 03:29:08.60895+00	2025-12-10 03:29:08.60895+00	Factory / Manufacturing Worker	25	t	Medium–High	No formal skill required	Works on assembly lines or production units. Standing, repetitive, sometimes physically demanding.
2211ce6d-6148-488d-bd7d-ceb923a773fa	2025-12-10 03:29:08.60895+00	2025-12-10 03:29:08.60895+00	Warehouse Worker	26	t	Medium	Inventory handling, lifting	Loads, unloads, stores goods. Moderate to heavy physical effort.
c7b2b800-5a92-4d8e-a23a-ccfda8748f1b	2025-12-10 03:29:08.60895+00	2025-12-10 03:29:08.60895+00	Storekeeper	27	t	Low–Medium	Inventory management	Maintains stock records, organizes storage. Mostly administrative with light physical work.
04de6533-42dd-4af3-bfb6-fec49213631a	2025-12-10 03:29:08.60895+00	2025-12-10 03:29:08.60895+00	Office Assistant / Admin Assistant	28	t	Low	Basic computer, office experience	Supports office work: filing, data entry, minor errands. Mostly seated work.
71aea17d-f66b-4202-801d-755eddada91e	2025-12-10 03:29:08.60895+00	2025-12-10 03:29:08.60895+00	Clerk / Data Entry	29	t	Low	Computer literacy	Inputs data, maintains records, office support. Minimal physical effort.
90fe6205-6df7-410f-8579-678c3cc70b3a	2025-12-10 03:29:08.60895+00	2025-12-10 03:29:08.60895+00	Receptionist	30	t	Low	Communication skills	Handles calls, visitors, schedules appointments. Mostly desk-based work.
577b9dbd-eb1e-43e5-a7ec-e3d70e8df8e0	2025-12-10 03:29:08.60895+00	2025-12-10 03:29:08.60895+00	Security Guard	31	t	Medium	Security training, physical fitness	Monitors premises, ensures safety. Can involve patrolling and standing long hours.
dcf97ce1-5599-4253-8b96-dbba6e9bff7e	2025-12-10 03:29:08.60895+00	2025-12-10 03:29:08.60895+00	Salesman / Retail Staff	32	t	Low–Medium	Customer service skills	Sells products, assists customers, manages shelves. Moderate physical activity.
60b8325c-cbc4-44c5-9f82-e5cf0b679735	2025-12-10 03:29:08.60895+00	2025-12-10 03:29:08.60895+00	Housekeeping Attendant	33	t	Medium	Cleaning skills	Cleans rooms, changes linens, tidies facilities. Repetitive standing and bending.
a3bbe6e9-8c16-44bc-bf20-394945bb63e9	2025-12-10 03:29:08.60895+00	2025-12-10 03:29:08.60895+00	Cleaner / Cleaning & Laundry Worker	34	t	Medium	No formal skill	Sweeps, mops, washes, handles laundry. Physically repetitive.
32804ede-242b-406c-9d9c-e8747a54c36c	2025-12-10 03:29:08.60895+00	2025-12-10 03:29:08.60895+00	General Labourer (Specified)	35	t	High	No formal skill	Performs manual tasks: carrying, digging, loading. Heavy physical effort.
cadfe87f-34a9-4dc0-a00a-2400112b29fd	2025-12-10 03:29:08.60895+00	2025-12-10 03:29:08.60895+00	General Labourer (Unspecified)	36	t	High	No formal skill	Miscellaneous manual labor in construction or factories. Physically demanding.
f5ebe68e-3644-4992-ae9f-056bb23a310a	2025-12-10 03:29:08.60895+00	2025-12-10 03:29:08.60895+00	Chef / Cook	37	t	Medium	Culinary skills	Prepares meals in hotels, restaurants, or labor camps. Standing, fast-paced work.
5c4a6562-3471-4838-80c8-68eebbbdf21f	2025-12-10 03:29:08.60895+00	2025-12-10 03:29:08.60895+00	Cook Helper / Kitchen Helper	38	t	Medium	Basic kitchen experience	Assists main cook: chopping, cleaning, carrying items, dishwashing. Standing work.
b2ef2ec7-4073-472a-9d76-bef35167cda6	2025-12-10 03:29:08.60895+00	2025-12-10 03:29:08.60895+00	Baker / Pastry / Dessert Maker	39	t	Medium	Baking skills	Prepares bread, pastries, desserts. Mixing, shaping, oven handling.
6f14d2e4-12c2-41ab-8564-53e4b7bfea29	2025-12-10 03:29:08.60895+00	2025-12-10 03:29:08.60895+00	Butcher	40	t	Medium–High	Meat handling, knife skills	Cuts, prepares, and packs meat. Requires strength and hygiene awareness.
55e8ef53-0aef-4967-95d8-70227433c3ee	2025-12-10 03:29:08.60895+00	2025-12-10 03:29:08.60895+00	Barista / Coffee Maker	41	t	Low–Medium	Coffee making skills	Prepares beverages, serves customers. Mostly standing and repetitive motions.
b50f9701-9262-4743-b978-7ce3c0c5c017	2025-12-10 03:29:08.60895+00	2025-12-10 03:29:08.60895+00	Waiter / Steward	42	t	Medium	Customer service, hospitality skills	Serves food and drinks, clears tables. Long standing hours, fast-paced.
7fee4d30-51e1-4e00-be43-dd2de9e7670a	2025-12-10 03:29:08.60895+00	2025-12-10 03:29:08.60895+00	Caregiver / Nursing Aide	43	t	Medium	Basic healthcare training	Assists elderly/disabled with daily activities, hygiene, and medication. Physically and emotionally demanding.
6507ad1c-06f8-4b93-a19d-72151e29140d	2025-12-10 03:29:08.60895+00	2025-12-10 03:29:08.60895+00	Beautician / Fitness Staff	44	t	Low–Medium	Training in beauty or fitness	Provides beauty or fitness services: massage, makeup, exercise guidance. Light to moderate effort.
7710aed4-b254-4e97-bd8f-420f8c943453	2025-12-10 03:29:08.60895+00	2025-12-10 03:29:08.60895+00	Agriculture / Farm Worker	45	t	High	Farming experience	Planting, watering, harvesting crops. Heavy outdoor labor.
3a0d799f-caf2-40c6-b91f-c50ec9d31f31	2025-12-10 03:29:08.60895+00	2025-12-10 03:29:08.60895+00	Poultry Worker	46	t	Medium	Animal handling experience	Feeds, cleans, and maintains poultry. Moderate lifting and cleaning.
c59df757-7ff1-434c-889a-fe2769571bbb	2025-12-10 03:29:08.60895+00	2025-12-10 03:29:08.60895+00	Gardener / Landscaping	47	t	Medium–High	Horticulture skills helpful	Plants, trims, waters, and maintains gardens. Physical outdoor work.
4b760200-1738-45ac-b14d-a142d5e8975d	2025-12-10 03:29:08.60895+00	2025-12-10 03:29:08.60895+00	Aviation / Cruise Staff	48	t	Medium	Hospitality/customer service	Works on ships or planes: cabin service, cleaning, guest assistance. Standing, customer-facing.
4da41bf8-ecaf-4c92-a948-3b791d9252d2	2025-12-10 03:29:08.60895+00	2025-12-10 03:29:08.60895+00	Construction Helper (General)	49	t	High	No formal skill	Assists skilled workers on sites: carrying, mixing, cleaning. Physically demanding.
626d2c38-e875-4194-a8ef-d7a1c5b224a4	2025-12-10 03:29:08.60895+00	2025-12-10 03:29:08.60895+00	Laundry Worker	50	t	Medium	No formal skill	Washes, folds, and irons clothes in hotels or factories. Repetitive, standing work.
\.


--
-- Data for Name: medical_expenses; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.medical_expenses (id, created_at, updated_at, job_posting_id, domestic_who_pays, domestic_is_free, domestic_amount, domestic_currency, domestic_notes, foreign_who_pays, foreign_is_free, foreign_amount, foreign_currency, foreign_notes) FROM stdin;
dba489c5-3e5a-4404-9567-9f253541185b	2025-12-16 07:15:37.90838+00	2025-12-16 07:15:37.90838+00	890b908b-3839-4f6b-8241-fc72a00a33ce	company	f	48500.00	\N	\N	company	f	125.00	\N	\N
\.


--
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.notifications (id, created_at, updated_at, candidate_id, job_application_id, job_posting_id, agency_id, interview_id, notification_type, title, message, payload, is_read, is_sent, sent_at, read_at) FROM stdin;
15900e89-23e7-47d1-bb2e-f7f4d9ebcd4d	2025-12-18 07:37:25.924899+00	2025-12-18 07:51:18.976384+00	3af2e3c5-66ea-48bc-9ef9-addb9cd801fa	0c071028-3a8c-4670-bf86-860c2072782c	890b908b-3839-4f6b-8241-fc72a00a33ce	e9992fb6-1bf9-4944-a869-bf85280a7e45	9e004013-559c-458f-920b-3cf44ef1c058	interview_scheduled	Interview Scheduled	Interview scheduled for "बहराइनमा वैदेशिक रोजगारको अवसर - HIT Facility Management" at Nepalese Manpower Agency on 2025-12-19 at 10:00:00.	{"job_title": "बहराइनमा वैदेशिक रोजगारको अवसर - HIT Facility Management", "agency_name": "Nepalese Manpower Agency", "interview_details": {"date": "2025-12-19", "time": "10:00:00", "location": "Office"}}	t	t	2025-12-18 07:37:25.937+00	2025-12-18 07:51:18.973+00
60dd11a5-5eba-421c-8804-b2edea930c02	2025-12-18 07:30:44.947345+00	2025-12-18 07:51:24.760772+00	3af2e3c5-66ea-48bc-9ef9-addb9cd801fa	0c071028-3a8c-4670-bf86-860c2072782c	890b908b-3839-4f6b-8241-fc72a00a33ce	e9992fb6-1bf9-4944-a869-bf85280a7e45	\N	shortlisted	Congratulations! You've been shortlisted	Congratulations! You have been shortlisted for "बहराइनमा वैदेशिक रोजगारको अवसर - HIT Facility Management" at Nepalese Manpower Agency.	{"job_title": "बहराइनमा वैदेशिक रोजगारको अवसर - HIT Facility Management", "agency_name": "Nepalese Manpower Agency"}	t	t	2025-12-18 07:30:44.965+00	2025-12-18 07:51:24.759+00
d3095400-2c20-4e87-9154-ba7dcbbbdbaa	2025-12-18 07:56:46.193087+00	2025-12-18 07:57:14.918876+00	3af2e3c5-66ea-48bc-9ef9-addb9cd801fa	0c071028-3a8c-4670-bf86-860c2072782c	890b908b-3839-4f6b-8241-fc72a00a33ce	e9992fb6-1bf9-4944-a869-bf85280a7e45	\N	interview_failed	Interview Result	Thank you for your interest in "बहराइनमा वैदेशिक रोजगारको अवसर - HIT Facility Management" at Nepalese Manpower Agency. Unfortunately, you were not selected this time.	{"job_title": "बहराइनमा वैदेशिक रोजगारको अवसर - HIT Facility Management", "agency_name": "Nepalese Manpower Agency"}	t	t	2025-12-18 07:56:46.202+00	2025-12-18 07:57:14.917+00
\.


--
-- Data for Name: posting_agencies; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.posting_agencies (id, created_at, updated_at, name, license_number, country, city, address, latitude, longitude, phones, emails, contact_email, contact_phone, website, description, logo_url, banner_url, established_year, license_valid_till, is_active, services, target_countries, specializations, certifications, social_media, bank_details, contact_persons, operating_hours, statistics, settings, average_rating, review_count) FROM stdin;
32180c15-fc5b-4dc9-acf7-e622120bc6ae	2025-12-10 03:29:08.746609+00	2025-12-10 03:29:08.746609+00	Inspire International Employment Pvt. Ltd	REG-2024-001	\N	\N	Manpower Bazar, Sinamangal, Kathmandu, Nepal	\N	\N	{01-4112800,+977-9841234567}	{info@inspireintl.com.np}	\N	\N	www.udaanrecruitment.com	Leading recruitment agency specializing in overseas employment opportunities for Nepali workers in Gulf countries and Malaysia.	/images/agency_logo.png	/images/agency_banner.jpg	2020	\N	t	{"Overseas Job Placement","Visa Processing","Document Verification","Pre-departure Training","Post-placement Support"}	{UAE,"Saudi Arabia",Qatar,Kuwait,Oman,Bahrain,Malaysia,Singapore}	{Hospitality,Construction,Healthcare,"Domestic Work","Security Services",Transportation}	[{"name": "Government License", "number": "REG-2024-001", "issued_by": "Department of Foreign Employment", "expiry_date": "2025-01-15", "issued_date": "2020-01-15"}, {"name": "ISO 9001:2015", "number": "ISO-2021-4567", "issued_by": "International Standards Organization", "expiry_date": "2024-06-20", "issued_date": "2021-06-20"}]	{"twitter": "https://twitter.com/udaanrecruitment", "facebook": "https://facebook.com/udaanrecruitment", "linkedin": "https://linkedin.com/company/udaanrecruitment", "instagram": "https://instagram.com/udaanrecruitment"}	{"bank_name": "Nepal Investment Bank", "swift_code": "NIBLNPKT", "account_name": "Udaan Recruitment Agency Pvt. Ltd.", "account_number": "0123456789"}	[{"name": "Rajesh Thapa", "email": "rajesh@udaanrecruitment.com", "phone": "+977-9841234567", "position": "Managing Director"}, {"name": "Sunita Shrestha", "email": "sunita@udaanrecruitment.com", "phone": "+977-9851234567", "position": "Operations Manager"}]	{"sunday": "Closed", "saturday": "09:00 AM - 05:00 PM", "weekdays": "09:00 AM - 06:00 PM"}	{"active_since": "2020-01-15", "success_rate": 92, "countries_served": 8, "total_placements": 1250, "active_recruiters": 8, "partner_companies": 45}	{"currency": "NPR", "features": {"document_upload": true, "candidate_tracking": true, "analytics_dashboard": true, "online_applications": true, "interview_scheduling": true}, "language": "en", "timezone": "Asia/Kathmandu", "date_format": "DD/MM/YYYY", "notifications": {"sms_enabled": true, "push_enabled": true, "email_enabled": true}}	0.00	0
a1439760-013c-4b0f-a1ee-5ab2d7c9df70	2025-12-10 03:29:09.286678+00	2025-12-10 03:29:09.286678+00	Everest Global Recruitment Pvt. Ltd	REG-2022-015	\N	\N	Gairidhara, Kathmandu, Nepal	\N	\N	{01-4432100,+977-9851122334}	{contact@everestglobal.com.np}	\N	\N	www.everestglobalrecruitment.com	Trusted manpower agency offering skilled, semi-skilled, and unskilled workforce solutions for Middle East and European markets.	/images/everest_logo.png	/images/everest_banner.jpg	2018	\N	t	{"International Job Placement","Work Visa Assistance","Health Checkup Coordination","Pre-departure Orientation","Post-deployment Monitoring"}	{UAE,Qatar,Poland,Romania,"Saudi Arabia",Croatia}	{Engineering,Hospitality,Construction,Manufacturing,Caregiving,Security}	[{"name": "Government License", "number": "REG-2022-015", "issued_by": "Department of Foreign Employment", "expiry_date": "2028-03-10", "issued_date": "2018-03-10"}, {"name": "ISO 14001:2015", "number": "ISO-2019-8734", "issued_by": "International Standards Organization", "expiry_date": "2025-07-25", "issued_date": "2019-07-25"}]	{"twitter": "https://twitter.com/everestglobal", "facebook": "https://facebook.com/everestglobal", "linkedin": "https://linkedin.com/company/everestglobal", "instagram": "https://instagram.com/everestglobal"}	{"bank_name": "Nabil Bank Limited", "swift_code": "NARBNPKA", "account_name": "Everest Global Recruitment Pvt. Ltd.", "account_number": "2233445566"}	[{"name": "Kiran Gurung", "email": "kiran@everestglobal.com", "phone": "+977-9851122334", "position": "Executive Director"}, {"name": "Rita Koirala", "email": "rita@everestglobal.com", "phone": "+977-9845098765", "position": "HR Manager"}]	{"sunday": "Closed", "saturday": "09:30 AM - 04:00 PM", "weekdays": "09:30 AM - 06:30 PM"}	{"active_since": "2018-03-10", "success_rate": 95, "countries_served": 6, "total_placements": 1890, "active_recruiters": 12, "partner_companies": 60}	{"currency": "NPR", "features": {"document_upload": true, "candidate_tracking": true, "analytics_dashboard": false, "online_applications": true, "interview_scheduling": true}, "language": "en", "timezone": "Asia/Kathmandu", "date_format": "DD/MM/YYYY", "notifications": {"sms_enabled": true, "push_enabled": false, "email_enabled": true}}	0.00	0
9b42d121-42ee-4e6c-b301-7cf399438f71	2025-12-10 03:29:09.663861+00	2025-12-10 03:29:09.663861+00	Himalayan Overseas Manpower Pvt. Ltd	REG-2019-045	\N	\N	Putalisadak, Kathmandu, Nepal	\N	\N	{01-4789000,+977-9860098765}	{hello@himalayanoverseas.com}	\N	\N	www.himalayanoverseas.com	One of Nepal’s oldest manpower companies supplying workers to Asia, Europe, and the Gulf region with a strong focus on compliance and welfare.	/images/himalayan_logo.png	/images/himalayan_banner.jpg	2015	\N	t	{"Overseas Employment","Recruitment Campaigns","Travel & Ticketing Assistance","Skill Testing","Counseling & Support"}	{Malaysia,UAE,Qatar,Japan,"Saudi Arabia",Jordan,Kuwait}	{Hospitality,Agriculture,Caregiving,"Industrial Work",Construction,"IT Professionals"}	[{"name": "Government License", "number": "REG-2019-045", "issued_by": "Department of Foreign Employment", "expiry_date": "2025-08-01", "issued_date": "2015-08-01"}, {"name": "ISO 45001:2018", "number": "ISO-2020-3344", "issued_by": "International Standards Organization", "expiry_date": "2025-10-05", "issued_date": "2020-10-05"}]	{"twitter": "https://twitter.com/himalayanoverseas", "facebook": "https://facebook.com/himalayanoverseas", "linkedin": "https://linkedin.com/company/himalayanoverseas", "instagram": "https://instagram.com/himalayanoverseas"}	{"bank_name": "Standard Chartered Bank Nepal", "swift_code": "SCBLNPKA", "account_name": "Himalayan Overseas Manpower Pvt. Ltd.", "account_number": "9876543210"}	[{"name": "Deepak Shrestha", "email": "deepak@himalayanoverseas.com", "phone": "+977-9860098765", "position": "Chairman"}, {"name": "Mina Rana", "email": "mina@himalayanoverseas.com", "phone": "+977-9812345678", "position": "Recruitment Head"}]	{"sunday": "Closed", "saturday": "10:00 AM - 04:00 PM", "weekdays": "09:00 AM - 05:30 PM"}	{"active_since": "2015-08-01", "success_rate": 90, "countries_served": 7, "total_placements": 3500, "active_recruiters": 15, "partner_companies": 85}	{"currency": "NPR", "features": {"document_upload": false, "candidate_tracking": true, "analytics_dashboard": true, "online_applications": true, "interview_scheduling": true}, "language": "en", "timezone": "Asia/Kathmandu", "date_format": "DD/MM/YYYY", "notifications": {"sms_enabled": false, "push_enabled": true, "email_enabled": true}}	0.00	0
645edc76-069e-4498-a078-d3706ff14e2f	2025-12-16 04:07:31.001863+00	2025-12-16 04:07:31.001863+00	atest company 	123456789	nepal	kathunadu	kathmandu	\N	\N	{9862146252}	{}	\N	\N	https://www.water.com	we are tyesting hte dsystem 	\N	\N	\N	\N	t	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	0.00	0
a03c9d1e-68cd-45b9-a775-c20a24389355	2025-12-16 04:48:16.023247+00	2025-12-16 04:48:16.023247+00	Himalayan Global Manpower Pvt. Ltd.	REG-2015-MP-0421	Nepal	Kathmandu	Putalisadak	\N	\N	{9861234563}	{}	\N	\N	https://www.himalayanglobalmanpower.com/	Himalayan Global Manpower Pvt. Ltd. is a licensed Nepali manpower agency specializing in overseas recruitment services. We provide skilled, semi-skilled, and unskilled workforce solutions to employers in Gulf countries, Malaysia, and other international markets. Our agency is committed to ethical recruitment practices, worker safety, and long-term partnerships with both clients and candidates.	\N	\N	\N	\N	t	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	0.00	0
e9992fb6-1bf9-4944-a869-bf85280a7e45	2025-12-16 05:13:20.806269+00	2025-12-16 05:46:21.394+00	Nepalese Manpower Agency	1253-074-075	Nepal	Kathmandu	Chauki Tol Bikash-Tokha, Basundhara	\N	\N	{9801090469,9801090469}	{info@nepalmanpoweragency.com}	\N	\N	https://globalrecruitmentagency.com	The Global Recruitment Agency Pvt. Ltd. One of the reputed and leading manpower agencies in Nepal. Our company Established in 2007 under the Company Act 2053 B.S.(1996 A.D.) of Nepal Government Registration No. 163840/073/074 and Department of Foreign Employment. Government of Nepali with and License No.1253/074/075 And Under Nepal Association of Foreign Employment Agencies (NAFEA) member ID no.1201.	public/uploads/agencies/e9992fb6-1bf9-4944-a869-bf85280a7e45/logo.png	public/uploads/agencies/e9992fb6-1bf9-4944-a869-bf85280a7e45/banner.png	2007	\N	t	{"Recruitment & Staffing","Overseas Employment","Manpower Export","International Labor Supply"}	{Bahrain,Romania}	{"Gender-Specific Recruitment","Domestic and personal care roles","Office & Administrative Roles"}	\N	{"twitter": "https://www.facebook.com/p/Nepalese-Manpower-Agency-100063707826830/", "facebook": "https://www.facebook.com/p/Nepalese-Manpower-Agency-100063707826830/", "linkedin": "https://www.facebook.com/p/Nepalese-Manpower-Agency-100063707826830/", "instagram": "https://www.facebook.com/p/Nepalese-Manpower-Agency-100063707826830/"}	\N	\N	\N	\N	\N	0.00	0
\.


--
-- Data for Name: salary_conversions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.salary_conversions (id, created_at, job_position_id, converted_amount, converted_currency, conversion_rate, conversion_date) FROM stdin;
a8c8fb92-67db-4dd8-84a6-b00978a147c5	2025-12-10 03:29:08.779635+00	8e5b20db-e066-48ad-88f0-873e574ed862	36000.00	NPR	\N	2025-12-10
c4676b96-ac5f-48f0-8a8a-f12c53efcdf5	2025-12-10 03:29:08.779635+00	bf8c4b5f-43ec-4c98-ae14-497ed14ea42b	26000.00	NPR	\N	2025-12-10
def2c17f-c1ec-4532-a1a8-22efc1acb2b3	2025-12-10 03:29:08.779635+00	99ddfd55-94b1-465c-b816-a77cc994661c	16000.00	NPR	\N	2025-12-10
2579f2d7-eaef-4426-b8e5-2014d8170c07	2025-12-10 03:29:09.306593+00	56cbf726-8ec4-44f9-86d5-557906c13443	36000.00	NPR	\N	2025-12-10
dd934c15-b3b3-42f6-b23f-eba34cb3b904	2025-12-10 03:29:09.306593+00	ddf89021-b04c-4e76-b125-990a9e621911	26000.00	NPR	\N	2025-12-10
b9cc902e-4d0a-41ed-bc5f-43ff62ed5ed2	2025-12-10 03:29:09.306593+00	afa5bf7a-dcc5-4e7b-b532-67e68ac56ebf	16000.00	NPR	\N	2025-12-10
c0ad87e5-a6a0-4b74-98df-3776e8078343	2025-12-10 03:29:09.764596+00	6b43941c-b857-46a8-b9f2-eb06ffb8b5a7	36000.00	NPR	\N	2025-12-10
097f5fe1-0747-4deb-982e-e5142bc3cddb	2025-12-10 03:29:09.764596+00	4ee5830d-1a5b-4b65-b8a7-0769b318eb5f	26000.00	NPR	\N	2025-12-10
96aa79c1-364c-424e-bdd5-ef79404838b2	2025-12-10 03:29:09.764596+00	dadacd29-b022-4213-beaa-aa682d4e4a77	16000.00	NPR	\N	2025-12-10
\.


--
-- Data for Name: training_expenses; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.training_expenses (id, created_at, updated_at, job_posting_id, who_pays, is_free, amount, currency, duration_days, mandatory, notes) FROM stdin;
ff71b19c-4c71-486b-8c0c-b900b364975e	2025-12-16 07:15:37.945543+00	2025-12-16 07:15:37.945543+00	890b908b-3839-4f6b-8241-fc72a00a33ce	worker	f	5000.00	NPR	7	t	\N
\.


--
-- Data for Name: travel_expenses; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.travel_expenses (id, created_at, updated_at, job_posting_id, who_provides, ticket_type, is_free, amount, currency, notes) FROM stdin;
ce03dd9d-cbf4-4e88-a50b-b7f04c3c0fb8	2025-12-16 07:15:37.927728+00	2025-12-16 07:15:37.927728+00	890b908b-3839-4f6b-8241-fc72a00a33ce	company	round_trip	f	45000.00	NPR	\N
\.


--
-- Data for Name: typeorm_metadata; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.typeorm_metadata (type, database, schema, "table", name, value) FROM stdin;
GENERATED_COLUMN	app_db	public	job_positions	total_vacancies	male_vacancies + female_vacancies
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, created_at, updated_at, phone, full_name, role, is_active, candidate_id, agency_id, is_agency_owner) FROM stdin;
78b22b13-c2ae-41cb-b3ea-2f31f6ffdc42	2025-12-10 04:09:26.822111+00	2025-12-10 04:09:35.531115+00	+9779862146253	\N	candidate	t	3af2e3c5-66ea-48bc-9ef9-addb9cd801fa	\N	f
cc244556-b54d-443c-9dcb-de9c4ad93eb8	2025-12-16 04:31:50.239917+00	2025-12-16 04:48:16.032049+00	+9779861234563	Gopal Bajagain	owner	t	\N	a03c9d1e-68cd-45b9-a775-c20a24389355	t
8f544770-2e2d-46f5-bd8d-1582823dd54d	2025-12-16 05:07:41.423438+00	2025-12-16 05:13:20.814107+00	+9779801090469	Narendra Babu Rana	owner	t	\N	e9992fb6-1bf9-4944-a869-bf85280a7e45	t
112f6722-9d38-4839-b767-d1b96f346304	2025-12-16 08:00:54.582622+00	2025-12-16 08:00:54.582622+00	+9779861432303	\N	agency_user	t	\N	e9992fb6-1bf9-4944-a869-bf85280a7e45	f
aaa0dec0-7277-4eb3-a261-b53bb4f657a7	2025-12-16 04:06:44.775563+00	2025-12-18 05:49:57.012572+00	+9779862146252	Test user	owner	t	\N	e9992fb6-1bf9-4944-a869-bf85280a7e45	t
b2362985-2f8a-4c82-8e2b-c5eb17a8b9cf	2025-12-18 07:10:25.383733+00	2025-12-18 07:10:28.006746+00	+9779862146257	\N	candidate	t	0ba2a930-fdfb-4a12-919c-21c3044254af	\N	f
\.


--
-- Data for Name: visa_permit_expenses; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.visa_permit_expenses (id, created_at, updated_at, job_posting_id, who_pays, is_free, amount, currency, refundable, notes) FROM stdin;
2206c6d7-9df6-4ed7-9008-3cff95306fb5	2025-12-16 07:15:37.938142+00	2025-12-16 07:15:37.938142+00	890b908b-3839-4f6b-8241-fc72a00a33ce	company	f	15000.00	NPR	t	\N
\.


--
-- Data for Name: welfare_service_expenses; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.welfare_service_expenses (id, created_at, updated_at, job_posting_id, welfare_who_pays, welfare_is_free, welfare_amount, welfare_currency, welfare_fund_purpose, welfare_refundable, welfare_notes, service_who_pays, service_is_free, service_amount, service_currency, service_type, service_refundable, service_notes) FROM stdin;
ebca4a7c-4e28-4643-bbac-1a538d172c31	2025-12-16 07:15:37.953108+00	2025-12-16 07:15:37.953108+00	890b908b-3839-4f6b-8241-fc72a00a33ce	\N	f	\N	\N	\N	f	\N	\N	f	\N	\N	\N	f	\N
\.


--
-- Name: job_titles PK_09ddf4ace4b8a6a11ba4ce439e3; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.job_titles
    ADD CONSTRAINT "PK_09ddf4ace4b8a6a11ba4ce439e3" PRIMARY KEY (id);


--
-- Name: candidates PK_140681296bf033ab1eb95288abb; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.candidates
    ADD CONSTRAINT "PK_140681296bf033ab1eb95288abb" PRIMARY KEY (id);


--
-- Name: medical_expenses PK_1b6553ad4aee05e5a6759a533f3; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.medical_expenses
    ADD CONSTRAINT "PK_1b6553ad4aee05e5a6759a533f3" PRIMARY KEY (id);


--
-- Name: audit_logs PK_1bb179d048bbc581caa3b013439; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT "PK_1bb179d048bbc581caa3b013439" PRIMARY KEY (id);


--
-- Name: posting_agencies PK_1d9df02218831388fbf1ae4dd7d; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.posting_agencies
    ADD CONSTRAINT "PK_1d9df02218831388fbf1ae4dd7d" PRIMARY KEY (id);


--
-- Name: visa_permit_expenses PK_27268470b9bb8d1fa4aec1d3b0e; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.visa_permit_expenses
    ADD CONSTRAINT "PK_27268470b9bb8d1fa4aec1d3b0e" PRIMARY KEY (id);


--
-- Name: interview_details PK_2e02acba102e30972426b4c60e2; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.interview_details
    ADD CONSTRAINT "PK_2e02acba102e30972426b4c60e2" PRIMARY KEY (id);


--
-- Name: job_contracts PK_2e38dffa409b4ef656120d9effc; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.job_contracts
    ADD CONSTRAINT "PK_2e38dffa409b4ef656120d9effc" PRIMARY KEY (id);


--
-- Name: interview_expenses PK_48d3ac472395b72c32181fc0f8c; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.interview_expenses
    ADD CONSTRAINT "PK_48d3ac472395b72c32181fc0f8c" PRIMARY KEY (id);


--
-- Name: insurance_expenses PK_5df159615ae6e1cd9fb283b5a87; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.insurance_expenses
    ADD CONSTRAINT "PK_5df159615ae6e1cd9fb283b5a87" PRIMARY KEY (id);


--
-- Name: job_positions PK_647b08f0ec097a17f8fff8adfb9; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.job_positions
    ADD CONSTRAINT "PK_647b08f0ec097a17f8fff8adfb9" PRIMARY KEY (id);


--
-- Name: notifications PK_6a72c3c0f683f6462415e653c3a; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT "PK_6a72c3c0f683f6462415e653c3a" PRIMARY KEY (id);


--
-- Name: agency_reviews PK_6e1d41fb73616aa1463bc898cae; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.agency_reviews
    ADD CONSTRAINT "PK_6e1d41fb73616aa1463bc898cae" PRIMARY KEY (id);


--
-- Name: salary_conversions PK_95ca6ecef75e8a3f69d0f63c745; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.salary_conversions
    ADD CONSTRAINT "PK_95ca6ecef75e8a3f69d0f63c745" PRIMARY KEY (id);


--
-- Name: blocked_phones PK_9745ca000962db1e4ed4ba30bda; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.blocked_phones
    ADD CONSTRAINT "PK_9745ca000962db1e4ed4ba30bda" PRIMARY KEY (id);


--
-- Name: travel_expenses PK_9f0fad590a59f048b60d648c9de; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.travel_expenses
    ADD CONSTRAINT "PK_9f0fad590a59f048b60d648c9de" PRIMARY KEY (id);


--
-- Name: users PK_a3ffb1c0c8416b9fc6f907b7433; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY (id);


--
-- Name: candidate_documents PK_a7b7572a2c5c1320a4249ce2b4c; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.candidate_documents
    ADD CONSTRAINT "PK_a7b7572a2c5c1320a4249ce2b4c" PRIMARY KEY (id);


--
-- Name: agency_users PK_ae72ca39f0a748bf74eef99df42; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.agency_users
    ADD CONSTRAINT "PK_ae72ca39f0a748bf74eef99df42" PRIMARY KEY (id);


--
-- Name: welfare_service_expenses PK_b12d9b16bc9c42f9f7bf281b359; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.welfare_service_expenses
    ADD CONSTRAINT "PK_b12d9b16bc9c42f9f7bf281b359" PRIMARY KEY (id);


--
-- Name: countries PK_b2d7006793e8697ab3ae2deff18; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.countries
    ADD CONSTRAINT "PK_b2d7006793e8697ab3ae2deff18" PRIMARY KEY (id);


--
-- Name: job_applications PK_c56a5e86707d0f0df18fa111280; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.job_applications
    ADD CONSTRAINT "PK_c56a5e86707d0f0df18fa111280" PRIMARY KEY (id);


--
-- Name: candidate_job_profiles PK_d2d6d49e62e757d8560c115a744; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.candidate_job_profiles
    ADD CONSTRAINT "PK_d2d6d49e62e757d8560c115a744" PRIMARY KEY (id);


--
-- Name: document_types PK_d467d7eeb7c8ce216e90e8494aa; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.document_types
    ADD CONSTRAINT "PK_d467d7eeb7c8ce216e90e8494aa" PRIMARY KEY (id);


--
-- Name: application_notes PK_db708de5fa99541ad52a1f907de; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.application_notes
    ADD CONSTRAINT "PK_db708de5fa99541ad52a1f907de" PRIMARY KEY (id);


--
-- Name: job_postings PK_dda635ece382c8ad2d90a179182; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.job_postings
    ADD CONSTRAINT "PK_dda635ece382c8ad2d90a179182" PRIMARY KEY (id);


--
-- Name: training_expenses PK_eb0d37652998e43cf8ab20c3fe3; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.training_expenses
    ADD CONSTRAINT "PK_eb0d37652998e43cf8ab20c3fe3" PRIMARY KEY (id);


--
-- Name: job_posting_titles PK_ec28ac8b6e5f0f13c42bb4cc551; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.job_posting_titles
    ADD CONSTRAINT "PK_ec28ac8b6e5f0f13c42bb4cc551" PRIMARY KEY (job_posting_id, job_title_id);


--
-- Name: candidate_preferences PK_edab04727cde80630b03c814590; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.candidate_preferences
    ADD CONSTRAINT "PK_edab04727cde80630b03c814590" PRIMARY KEY (id);


--
-- Name: employers PK_f2c1aea3e8d7aa3c5fba949c97d; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employers
    ADD CONSTRAINT "PK_f2c1aea3e8d7aa3c5fba949c97d" PRIMARY KEY (id);


--
-- Name: job_titles UQ_5b92e31e3b94131e35dd37cd8dc; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.job_titles
    ADD CONSTRAINT "UQ_5b92e31e3b94131e35dd37cd8dc" UNIQUE (title);


--
-- Name: document_types UQ_803cd247b7c1c8d91b30a3eb210; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.document_types
    ADD CONSTRAINT "UQ_803cd247b7c1c8d91b30a3eb210" UNIQUE (name);


--
-- Name: document_types UQ_dd164434a0eea940c2f89a9aea3; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.document_types
    ADD CONSTRAINT "UQ_dd164434a0eea940c2f89a9aea3" UNIQUE (type_code);


--
-- Name: posting_agencies UQ_f911562cb01cb61ac6e6628f928; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.posting_agencies
    ADD CONSTRAINT "UQ_f911562cb01cb61ac6e6628f928" UNIQUE (license_number);


--
-- Name: candidate_documents unique_candidate_document_type; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.candidate_documents
    ADD CONSTRAINT unique_candidate_document_type UNIQUE (candidate_id, document_type_id, is_active);


--
-- Name: IDX_111cff97d120481f9897b23a45; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "IDX_111cff97d120481f9897b23a45" ON public.agency_users USING btree (phone);


--
-- Name: IDX_2cd10fda8276bb995288acfbfb; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_2cd10fda8276bb995288acfbfb" ON public.audit_logs USING btree (created_at);


--
-- Name: IDX_2d1a14e9cb167a840b369a6cb7; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_2d1a14e9cb167a840b369a6cb7" ON public.candidate_documents USING btree (candidate_id);


--
-- Name: IDX_2fca02bf097b947093a0e76e1d; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "IDX_2fca02bf097b947093a0e76e1d" ON public.agency_users USING btree (user_id);


--
-- Name: IDX_3be96197319fc5a348749a3253; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_3be96197319fc5a348749a3253" ON public.agency_reviews USING btree (candidate_id);


--
-- Name: IDX_3e7b896dc7bb31ea753cbe0a0b; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_3e7b896dc7bb31ea753cbe0a0b" ON public.candidate_preferences USING btree (job_title_id);


--
-- Name: IDX_44bfa80560a4cf0eb9d5cf4f80; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_44bfa80560a4cf0eb9d5cf4f80" ON public.job_posting_titles USING btree (job_posting_id);


--
-- Name: IDX_6246b3b328fc893aa6693308a8; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_6246b3b328fc893aa6693308a8" ON public.agency_reviews USING btree (agency_id);


--
-- Name: IDX_6fdb3282cea9ba5877ab476aa7; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_6fdb3282cea9ba5877ab476aa7" ON public.users USING btree (agency_id);


--
-- Name: IDX_7f324d819c48fab6096a60563d; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "IDX_7f324d819c48fab6096a60563d" ON public.candidate_preferences USING btree (candidate_id, title);


--
-- Name: IDX_8a0324bcdc1e155445c66213af; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_8a0324bcdc1e155445c66213af" ON public.audit_logs USING btree (category);


--
-- Name: IDX_a000cca60bcf04454e72769949; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "IDX_a000cca60bcf04454e72769949" ON public.users USING btree (phone);


--
-- Name: IDX_a0cbad1360aeda920c5aff6642; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_a0cbad1360aeda920c5aff6642" ON public.audit_logs USING btree (resource_type);


--
-- Name: IDX_a0efe7a0921ca16f5ad25588b9; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "IDX_a0efe7a0921ca16f5ad25588b9" ON public.candidates USING btree (phone);


--
-- Name: IDX_a5cac5451f7c8d47581a71fbe9; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "IDX_a5cac5451f7c8d47581a71fbe9" ON public.blocked_phones USING btree (phone);


--
-- Name: IDX_a6edbe5a917f5a9bca9efe20a3; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_a6edbe5a917f5a9bca9efe20a3" ON public.users USING btree (candidate_id);


--
-- Name: IDX_bac600fefd2160baa5639b0821; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "IDX_bac600fefd2160baa5639b0821" ON public.agency_reviews USING btree (candidate_id, agency_id);


--
-- Name: IDX_bd2726fd31b35443f2245b93ba; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_bd2726fd31b35443f2245b93ba" ON public.audit_logs USING btree (user_id);


--
-- Name: IDX_c73ac097c97c09610beeac26f5; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "IDX_c73ac097c97c09610beeac26f5" ON public.countries USING btree (country_code);


--
-- Name: IDX_ca50a4611a400579032cec68da; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_ca50a4611a400579032cec68da" ON public.candidate_documents USING btree (document_type_id);


--
-- Name: IDX_cee5459245f652b75eb2759b4c; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_cee5459245f652b75eb2759b4c" ON public.audit_logs USING btree (action);


--
-- Name: IDX_edfa680307645e2933bebc9cbf; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_edfa680307645e2933bebc9cbf" ON public.job_posting_titles USING btree (job_title_id);


--
-- Name: IDX_fc5f9367dcbe93c0b2e7afd5cc; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_fc5f9367dcbe93c0b2e7afd5cc" ON public.audit_logs USING btree (agency_id);


--
-- Name: IDX_fe4065b8f5b53fb980b88dec45; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_fe4065b8f5b53fb980b88dec45" ON public.agency_users USING btree (agency_id);


--
-- Name: idx_job_applications_candidate; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_job_applications_candidate ON public.job_applications USING btree (candidate_id);


--
-- Name: idx_job_applications_candidate_created; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_job_applications_candidate_created ON public.job_applications USING btree (candidate_id, created_at);


--
-- Name: idx_job_applications_posting; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_job_applications_posting ON public.job_applications USING btree (job_posting_id);


--
-- Name: idx_notifications_candidate; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_notifications_candidate ON public.notifications USING btree (candidate_id);


--
-- Name: idx_notifications_candidate_created; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_notifications_candidate_created ON public.notifications USING btree (candidate_id, created_at);


--
-- Name: idx_notifications_candidate_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_notifications_candidate_id ON public.notifications USING btree (candidate_id);


--
-- Name: idx_notifications_unread; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_notifications_unread ON public.notifications USING btree (candidate_id, is_read);


--
-- Name: interview_expenses FK_049e6fa81322a77abea14beb1ee; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.interview_expenses
    ADD CONSTRAINT "FK_049e6fa81322a77abea14beb1ee" FOREIGN KEY (interview_id) REFERENCES public.interview_details(id) ON DELETE CASCADE;


--
-- Name: job_applications FK_1f0ed6a45088ef95236af37a5f4; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.job_applications
    ADD CONSTRAINT "FK_1f0ed6a45088ef95236af37a5f4" FOREIGN KEY (job_posting_id) REFERENCES public.job_postings(id);


--
-- Name: welfare_service_expenses FK_262d75d8f915525c19d1b56f300; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.welfare_service_expenses
    ADD CONSTRAINT "FK_262d75d8f915525c19d1b56f300" FOREIGN KEY (job_posting_id) REFERENCES public.job_postings(id) ON DELETE CASCADE;


--
-- Name: application_notes FK_294856ba6de5790f8d428e9d9ec; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.application_notes
    ADD CONSTRAINT "FK_294856ba6de5790f8d428e9d9ec" FOREIGN KEY (job_application_id) REFERENCES public.job_applications(id) ON DELETE CASCADE;


--
-- Name: medical_expenses FK_2b86efba241325d148d1c7ace8c; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.medical_expenses
    ADD CONSTRAINT "FK_2b86efba241325d148d1c7ace8c" FOREIGN KEY (job_posting_id) REFERENCES public.job_postings(id) ON DELETE CASCADE;


--
-- Name: candidate_documents FK_2d1a14e9cb167a840b369a6cb71; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.candidate_documents
    ADD CONSTRAINT "FK_2d1a14e9cb167a840b369a6cb71" FOREIGN KEY (candidate_id) REFERENCES public.candidates(id);


--
-- Name: notifications FK_322c637c538f711d35441b1e6ff; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT "FK_322c637c538f711d35441b1e6ff" FOREIGN KEY (job_application_id) REFERENCES public.job_applications(id) ON DELETE CASCADE;


--
-- Name: agency_reviews FK_3be96197319fc5a348749a3253d; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.agency_reviews
    ADD CONSTRAINT "FK_3be96197319fc5a348749a3253d" FOREIGN KEY (candidate_id) REFERENCES public.candidates(id);


--
-- Name: job_posting_titles FK_44bfa80560a4cf0eb9d5cf4f800; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.job_posting_titles
    ADD CONSTRAINT "FK_44bfa80560a4cf0eb9d5cf4f800" FOREIGN KEY (job_posting_id) REFERENCES public.job_postings(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: job_contracts FK_46bac25dbfe2284ff9370d54ab8; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.job_contracts
    ADD CONSTRAINT "FK_46bac25dbfe2284ff9370d54ab8" FOREIGN KEY (job_posting_id) REFERENCES public.job_postings(id) ON DELETE CASCADE;


--
-- Name: job_contracts FK_4fcaac30ac16d0ef51cec0c5630; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.job_contracts
    ADD CONSTRAINT "FK_4fcaac30ac16d0ef51cec0c5630" FOREIGN KEY (posting_agency_id) REFERENCES public.posting_agencies(id);


--
-- Name: salary_conversions FK_5460d5823c1464d96f678d69092; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.salary_conversions
    ADD CONSTRAINT "FK_5460d5823c1464d96f678d69092" FOREIGN KEY (job_position_id) REFERENCES public.job_positions(id) ON DELETE CASCADE;


--
-- Name: job_positions FK_59490736bb178a1ad26761d74d3; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.job_positions
    ADD CONSTRAINT "FK_59490736bb178a1ad26761d74d3" FOREIGN KEY (job_contract_id) REFERENCES public.job_contracts(id) ON DELETE CASCADE;


--
-- Name: agency_reviews FK_6246b3b328fc893aa6693308a8f; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.agency_reviews
    ADD CONSTRAINT "FK_6246b3b328fc893aa6693308a8f" FOREIGN KEY (agency_id) REFERENCES public.posting_agencies(id);


--
-- Name: insurance_expenses FK_9c3eef3e622a39072ccd99d52a9; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.insurance_expenses
    ADD CONSTRAINT "FK_9c3eef3e622a39072ccd99d52a9" FOREIGN KEY (job_posting_id) REFERENCES public.job_postings(id) ON DELETE CASCADE;


--
-- Name: training_expenses FK_9f251b6406cbe10b6eecc09a445; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.training_expenses
    ADD CONSTRAINT "FK_9f251b6406cbe10b6eecc09a445" FOREIGN KEY (job_posting_id) REFERENCES public.job_postings(id) ON DELETE CASCADE;


--
-- Name: job_contracts FK_a67560007dba252d638ae36dfbd; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.job_contracts
    ADD CONSTRAINT "FK_a67560007dba252d638ae36dfbd" FOREIGN KEY (employer_id) REFERENCES public.employers(id);


--
-- Name: interview_details FK_acb8e748edef219f82d6e49c778; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.interview_details
    ADD CONSTRAINT "FK_acb8e748edef219f82d6e49c778" FOREIGN KEY (job_application_id) REFERENCES public.job_applications(id) ON DELETE CASCADE;


--
-- Name: travel_expenses FK_b9b6e10666f950c2165f63cea00; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.travel_expenses
    ADD CONSTRAINT "FK_b9b6e10666f950c2165f63cea00" FOREIGN KEY (job_posting_id) REFERENCES public.job_postings(id) ON DELETE CASCADE;


--
-- Name: visa_permit_expenses FK_be961a7576b4362deeca8dd767c; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.visa_permit_expenses
    ADD CONSTRAINT "FK_be961a7576b4362deeca8dd767c" FOREIGN KEY (job_posting_id) REFERENCES public.job_postings(id) ON DELETE CASCADE;


--
-- Name: interview_details FK_c25c478c5c7dc088a9536b29b4f; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.interview_details
    ADD CONSTRAINT "FK_c25c478c5c7dc088a9536b29b4f" FOREIGN KEY (job_posting_id) REFERENCES public.job_postings(id) ON DELETE CASCADE;


--
-- Name: candidate_documents FK_ca50a4611a400579032cec68da7; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.candidate_documents
    ADD CONSTRAINT "FK_ca50a4611a400579032cec68da7" FOREIGN KEY (document_type_id) REFERENCES public.document_types(id);


--
-- Name: job_posting_titles FK_edfa680307645e2933bebc9cbfc; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.job_posting_titles
    ADD CONSTRAINT "FK_edfa680307645e2933bebc9cbfc" FOREIGN KEY (job_title_id) REFERENCES public.job_titles(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict lwvs5SlQgjrEdiMogpwPx7WziMaTS5gkrGtZCPOUrGe37GVC6nw22aBNuRhC8n5

