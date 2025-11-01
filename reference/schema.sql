-- Overseas Job Portal Database Schema
-- PostgreSQL implementation

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create ENUM types
CREATE TYPE announcement_type AS ENUM ('full_ad', 'short_ad', 'update');
CREATE TYPE provision_type AS ENUM ('free', 'paid', 'not_provided');
CREATE TYPE overtime_policy AS ENUM ('as_per_company_policy', 'paid', 'unpaid', 'not_applicable');
CREATE TYPE expense_payer AS ENUM ('company', 'worker', 'shared', 'not_applicable', 'agency');
CREATE TYPE ticket_type AS ENUM ('one_way', 'round_trip', 'return_only');
CREATE TYPE expense_type AS ENUM ('visa_fee', 'work_permit', 'medical_exam', 'insurance', 'air_ticket', 'orientation_training', 'document_processing', 'service_charge', 'welfare_fund', 'other');

-- Main job posting table
CREATE TABLE job_postings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    posting_title VARCHAR(500) NOT NULL,
    country VARCHAR(100) NOT NULL,
    city VARCHAR(100),
    lt_number VARCHAR(100), -- Labor/approval LT No. from DoFE
    chalani_number VARCHAR(100), -- Chalani/dispatch number
    approval_date_bs VARCHAR(20), -- BS date (YYYY/MM/DD)
    approval_date_ad DATE,
    posting_date_ad DATE NOT NULL DEFAULT CURRENT_DATE,
    posting_date_bs VARCHAR(20),
    announcement_type announcement_type DEFAULT 'full_ad',
    notes TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Posting agencies table
CREATE TABLE posting_agencies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    license_number VARCHAR(100) NOT NULL UNIQUE,
    address TEXT,
    phones TEXT[], -- Array of phone numbers
    emails TEXT[], -- Array of email addresses
    website VARCHAR(500),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Employers table
CREATE TABLE employers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_name VARCHAR(255) NOT NULL,
    country VARCHAR(100) NOT NULL,
    city VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(company_name, country, city)
);

-- Job contracts table
CREATE TABLE job_contracts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_posting_id UUID NOT NULL REFERENCES job_postings(id) ON DELETE CASCADE,
    employer_id UUID NOT NULL REFERENCES employers(id),
    posting_agency_id UUID NOT NULL REFERENCES posting_agencies(id),
    period_years INTEGER NOT NULL CHECK (period_years >= 1),
    renewable BOOLEAN DEFAULT false,
    
    -- Work schedule
    hours_per_day INTEGER CHECK (hours_per_day BETWEEN 1 AND 16),
    days_per_week INTEGER CHECK (days_per_week BETWEEN 1 AND 7),
    overtime_policy overtime_policy DEFAULT 'as_per_company_policy',
    weekly_off_days INTEGER CHECK (weekly_off_days BETWEEN 0 AND 7),
    
    -- Benefits
    food provision_type,
    accommodation provision_type,
    transport provision_type,
    annual_leave_days INTEGER CHECK (annual_leave_days >= 0),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Job positions table
CREATE TABLE job_positions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_contract_id UUID NOT NULL REFERENCES job_contracts(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    male_vacancies INTEGER DEFAULT 0 CHECK (male_vacancies >= 0),
    female_vacancies INTEGER DEFAULT 0 CHECK (female_vacancies >= 0),
    total_vacancies INTEGER GENERATED ALWAYS AS (male_vacancies + female_vacancies) STORED,
    
    -- Salary information
    monthly_salary_amount DECIMAL(12,2) NOT NULL CHECK (monthly_salary_amount >= 0),
    salary_currency VARCHAR(10) NOT NULL,
    
    -- Position-specific overrides (nullable - inherit from contract if null)
    hours_per_day_override INTEGER CHECK (hours_per_day_override BETWEEN 1 AND 16),
    days_per_week_override INTEGER CHECK (days_per_week_override BETWEEN 1 AND 7),
    overtime_policy_override overtime_policy,
    weekly_off_days_override INTEGER CHECK (weekly_off_days_override BETWEEN 0 AND 7),
    
    -- Benefits overrides
    food_override provision_type,
    accommodation_override provision_type,
    transport_override provision_type,
    
    position_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Salary conversions table (for multiple currency display)
CREATE TABLE salary_conversions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_position_id UUID NOT NULL REFERENCES job_positions(id) ON DELETE CASCADE,
    converted_amount DECIMAL(12,2) NOT NULL CHECK (converted_amount >= 0),
    converted_currency VARCHAR(10) NOT NULL,
    conversion_rate DECIMAL(10,6),
    conversion_date DATE DEFAULT CURRENT_DATE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Medical expenses table
CREATE TABLE medical_expenses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_posting_id UUID NOT NULL REFERENCES job_postings(id) ON DELETE CASCADE,
    
    -- Domestic medical
    domestic_who_pays expense_payer,
    domestic_is_free BOOLEAN DEFAULT false,
    domestic_amount DECIMAL(10,2) CHECK (domestic_amount >= 0),
    domestic_currency VARCHAR(10),
    domestic_notes TEXT,
    
    -- Foreign medical
    foreign_who_pays expense_payer,
    foreign_is_free BOOLEAN DEFAULT false,
    foreign_amount DECIMAL(10,2) CHECK (foreign_amount >= 0),
    foreign_currency VARCHAR(10),
    foreign_notes TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insurance expenses table
CREATE TABLE insurance_expenses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_posting_id UUID NOT NULL REFERENCES job_postings(id) ON DELETE CASCADE,
    
    -- Term life insurance domestic
    who_pays expense_payer,
    is_free BOOLEAN DEFAULT false,
    amount DECIMAL(10,2) CHECK (amount >= 0),
    currency VARCHAR(10),
    coverage_amount DECIMAL(12,2) CHECK (coverage_amount >= 0),
    coverage_currency VARCHAR(10),
    notes TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Travel expenses table
CREATE TABLE travel_expenses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_posting_id UUID NOT NULL REFERENCES job_postings(id) ON DELETE CASCADE,
    
    -- Air ticket
    who_provides expense_payer,
    ticket_type ticket_type,
    is_free BOOLEAN DEFAULT false,
    amount DECIMAL(10,2) CHECK (amount >= 0),
    currency VARCHAR(10),
    notes TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Visa and permits expenses table
CREATE TABLE visa_permit_expenses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_posting_id UUID NOT NULL REFERENCES job_postings(id) ON DELETE CASCADE,
    
    -- Visa fee
    who_pays expense_payer,
    is_free BOOLEAN DEFAULT false,
    amount DECIMAL(10,2) CHECK (amount >= 0),
    currency VARCHAR(10),
    refundable BOOLEAN DEFAULT false,
    notes TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Training and orientation expenses table
CREATE TABLE training_expenses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_posting_id UUID NOT NULL REFERENCES job_postings(id) ON DELETE CASCADE,
    
    -- Orientation fee
    who_pays expense_payer,
    is_free BOOLEAN DEFAULT false,
    amount DECIMAL(10,2) CHECK (amount >= 0),
    currency VARCHAR(10),
    duration_days INTEGER CHECK (duration_days >= 0),
    mandatory BOOLEAN DEFAULT true,
    notes TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Welfare and service fees table
CREATE TABLE welfare_service_expenses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_posting_id UUID NOT NULL REFERENCES job_postings(id) ON DELETE CASCADE,
    
    -- Welfare fund
    welfare_who_pays expense_payer,
    welfare_is_free BOOLEAN DEFAULT false,
    welfare_amount DECIMAL(10,2) CHECK (welfare_amount >= 0),
    welfare_currency VARCHAR(10),
    welfare_fund_purpose TEXT,
    welfare_refundable BOOLEAN DEFAULT false,
    welfare_notes TEXT,
    
    -- Service charge
    service_who_pays expense_payer,
    service_is_free BOOLEAN DEFAULT false,
    service_amount DECIMAL(10,2) CHECK (service_amount >= 0),
    service_currency VARCHAR(10),
    service_type TEXT,
    service_refundable BOOLEAN DEFAULT false,
    service_notes TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Interview details table
CREATE TABLE interview_details (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_posting_id UUID NOT NULL REFERENCES job_postings(id) ON DELETE CASCADE,
    interview_date_ad DATE,
    interview_date_bs VARCHAR(20),
    interview_time TIME,
    location TEXT,
    contact_person VARCHAR(255),
    required_documents TEXT[], -- Array of required documents
    notes TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Interview expenses table (flexible expense items)
CREATE TABLE interview_expenses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    interview_id UUID NOT NULL REFERENCES interview_details(id) ON DELETE CASCADE,
    expense_type expense_type NOT NULL,
    who_pays expense_payer NOT NULL,
    is_free BOOLEAN DEFAULT false,
    amount DECIMAL(10,2) CHECK (amount >= 0),
    currency VARCHAR(10),
    refundable BOOLEAN DEFAULT false,
    notes TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_job_postings_country ON job_postings(country);
CREATE INDEX idx_job_postings_posting_date ON job_postings(posting_date_ad DESC);
CREATE INDEX idx_job_postings_active ON job_postings(is_active);
CREATE INDEX idx_posting_agencies_license ON posting_agencies(license_number);
CREATE INDEX idx_job_contracts_posting_id ON job_contracts(job_posting_id);
CREATE INDEX idx_job_positions_contract_id ON job_positions(job_contract_id);
CREATE INDEX idx_job_positions_title ON job_positions(title);
CREATE INDEX idx_employers_company_country ON employers(company_name, country);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers to main tables
CREATE TRIGGER update_job_postings_updated_at BEFORE UPDATE ON job_postings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_posting_agencies_updated_at BEFORE UPDATE ON posting_agencies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_employers_updated_at BEFORE UPDATE ON employers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_job_contracts_updated_at BEFORE UPDATE ON job_contracts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_job_positions_updated_at BEFORE UPDATE ON job_positions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_medical_expenses_updated_at BEFORE UPDATE ON medical_expenses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_insurance_expenses_updated_at BEFORE UPDATE ON insurance_expenses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_travel_expenses_updated_at BEFORE UPDATE ON travel_expenses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_visa_permit_expenses_updated_at BEFORE UPDATE ON visa_permit_expenses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_training_expenses_updated_at BEFORE UPDATE ON training_expenses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_welfare_service_expenses_updated_at BEFORE UPDATE ON welfare_service_expenses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_interview_details_updated_at BEFORE UPDATE ON interview_details FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();