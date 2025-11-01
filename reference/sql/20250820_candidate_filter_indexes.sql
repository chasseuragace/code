-- Persistent indexes for Candidate Relevant Jobs filtering
-- Run in dev now; include in deployment steps for production

-- job_postings activity + recency + country
CREATE INDEX IF NOT EXISTS idx_job_postings_active_date ON job_postings (is_active, posting_date_ad DESC);
CREATE INDEX IF NOT EXISTS idx_job_postings_country ON job_postings (country);

-- job_positions linkage and predicates
CREATE INDEX IF NOT EXISTS idx_job_positions_contract ON job_positions (job_contract_id);
CREATE INDEX IF NOT EXISTS idx_job_positions_salary ON job_positions (job_contract_id, monthly_salary_amount, salary_currency);
CREATE INDEX IF NOT EXISTS idx_job_positions_title_lower ON job_positions (LOWER(title));

-- salary_conversions for converted salary queries
CREATE INDEX IF NOT EXISTS idx_salary_conversions_position ON salary_conversions (job_position_id);
CREATE INDEX IF NOT EXISTS idx_salary_conversions_currency_amount ON salary_conversions (converted_currency, converted_amount);
