-- Create application_notes table
CREATE TABLE IF NOT EXISTS application_notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_application_id UUID NOT NULL,
    agency_id UUID NOT NULL,
    added_by_user_id UUID NOT NULL,
    added_by_name VARCHAR(150) NOT NULL,
    note_text TEXT NOT NULL,
    is_private BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    
    -- Foreign key constraints
    CONSTRAINT fk_application_notes_job_application
        FOREIGN KEY (job_application_id)
        REFERENCES job_applications(id)
        ON DELETE CASCADE,
    
    CONSTRAINT fk_application_notes_agency
        FOREIGN KEY (agency_id)
        REFERENCES posting_agencies(id)
        ON DELETE CASCADE,
    
    CONSTRAINT fk_application_notes_user
        FOREIGN KEY (added_by_user_id)
        REFERENCES agency_users(id)
        ON DELETE CASCADE
);

-- Create indexes for better query performance
CREATE INDEX idx_application_notes_job_application_id ON application_notes(job_application_id);
CREATE INDEX idx_application_notes_agency_id ON application_notes(agency_id);
CREATE INDEX idx_application_notes_created_at ON application_notes(created_at DESC);

-- Add comment
COMMENT ON TABLE application_notes IS 'Notes added by agency users for job applications throughout the candidate journey';
