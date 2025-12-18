-- Add is_draft column to job_postings table
ALTER TABLE job_postings
ADD COLUMN IF NOT EXISTS is_draft BOOLEAN DEFAULT true NOT NULL;

-- Create index for draft status queries
CREATE INDEX IF NOT EXISTS idx_job_postings_is_draft ON job_postings(is_draft);

-- Add comment
COMMENT ON COLUMN job_postings.is_draft IS 'Indicates if the job posting is in draft status (true) or published (false)';
