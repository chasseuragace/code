# Comprehensive Test Data Seeding Guide

## Overview

The `seed-comprehensive-test-data.js` script creates realistic test data with proper ownership relationships:

- **n candidates** - Cloned from template candidate
- **m agencies** - Cloned from template agency
- **p job postings per agency** - Cloned from template job posting
- **q positions per job posting** - Cloned from template position
- **r job applications per candidate** - Randomly assigned to agencies/postings/positions

All relationships are correctly maintained (ownership matters).

---

## Quick Start

```bash
# Create 5 candidates, 2 agencies, 3 postings per agency, 2 positions per posting, 4 apps per candidate
node seed-comprehensive-test-data.js 5 2 3 2 4

# Create 10 candidates, 3 agencies, 2 postings per agency, 3 positions per posting, 5 apps per candidate
node seed-comprehensive-test-data.js 10 3 2 3 5

# Create 20 candidates, 5 agencies, 4 postings per agency, 2 positions per posting, 3 apps per candidate
node seed-comprehensive-test-data.js 20 5 4 2 3
```

---

## Parameters

| Parameter | Description | Example |
|-----------|-------------|---------|
| `n` | Number of candidates to create | 5 |
| `m` | Number of agencies to create | 2 |
| `p` | Job postings per agency | 3 |
| `q` | Positions per job posting | 2 |
| `r` | Applications per candidate | 4 |

---

## Data Structure

### Relationships

```
Candidate (n)
  ├── Job Application (r per candidate)
  │   ├── Job Posting (p per agency)
  │   │   ├── Job Contract
  │   │   │   ├── Employer
  │   │   │   └── Agency (m total)
  │   │   └── Job Position (q per posting)
  │   └── Interview Details
```

### Example with n=2, m=1, p=2, q=2, r=2

```
Candidates: 2
├── Seed Candidate 001
│   ├── Application 1 → Job Posting 1 → Position 1 → Interview
│   └── Application 2 → Job Posting 2 → Position 2 → Interview
└── Seed Candidate 002
    ├── Application 3 → Job Posting 1 → Position 1 → Interview
    └── Application 4 → Job Posting 2 → Position 2 → Interview

Agencies: 1
├── Seed Agency 01
    ├── Job Posting 1 (Seed Job 101)
    │   ├── Position 1 (Seed Position 01)
    │   └── Position 2 (Seed Position 02)
    └── Job Posting 2 (Seed Job 102)
        ├── Position 1 (Seed Position 01)
        └── Position 2 (Seed Position 02)
```

---

## What Gets Created

### Candidates
- Named: "Seed Candidate 001", "Seed Candidate 002", etc.
- Phone: `98999` + 5-digit number
- Cloned from template candidate (gender, DOB, address)

### Agencies
- Named: "Seed Agency 01", "Seed Agency 02", etc.
- License: `SEED{timestamp}{index}`
- Cloned from template agency (country, city, contact info)

### Employers
- Named: "Seed Employer 01", "Seed Employer 02", etc.
- Cloned from template employer (country, city)

### Job Postings
- Named: "Seed Job 001", "Seed Job 002", etc.
- Cloned from template job posting (city, country, notes, skills)

### Job Contracts
- Links job posting to employer and agency
- Cloned from template contract (period, hours, benefits)

### Job Positions
- Named: "Seed Position 01", "Seed Position 02", etc.
- Salary: 2500 + (index * 100) AED
- Cloned from template position

### Job Applications
- Status: `interview_scheduled`
- Randomly assigned to agencies/postings/positions
- Maintains correct ownership relationships

### Interview Details
- Scheduled with varied dates (distributed across 8 days)
- Times: 9 AM to 4 PM in 15-minute intervals
- Duration: 60 minutes
- Location: "Test Office"
- Interviewer: "HR Manager"

---

## Usage Examples

### Example 1: Small Test Set
```bash
node seed-comprehensive-test-data.js 5 2 3 2 4
```

Creates:
- 5 candidates
- 2 agencies
- 6 job postings (2 agencies × 3 postings)
- 12 positions (6 postings × 2 positions)
- 20 job applications (5 candidates × 4 applications)
- 20 interviews

### Example 2: Medium Test Set
```bash
node seed-comprehensive-test-data.js 10 3 2 3 5
```

Creates:
- 10 candidates
- 3 agencies
- 6 job postings (3 agencies × 2 postings)
- 18 positions (6 postings × 3 positions)
- 50 job applications (10 candidates × 5 applications)
- 50 interviews

### Example 3: Large Test Set
```bash
node seed-comprehensive-test-data.js 20 5 4 2 3
```

Creates:
- 20 candidates
- 5 agencies
- 20 job postings (5 agencies × 4 postings)
- 40 positions (20 postings × 2 positions)
- 60 job applications (20 candidates × 3 applications)
- 60 interviews

---

## Database Schema

### Key Tables

**candidates**
```
id (UUID, PK)
full_name (VARCHAR)
phone (VARCHAR, UNIQUE)
gender (VARCHAR)
date_of_birth (DATE)
address (JSONB)
```

**posting_agencies**
```
id (UUID, PK)
name (VARCHAR)
license_number (VARCHAR, UNIQUE)
country (VARCHAR)
city (VARCHAR)
address (TEXT)
contact_email (VARCHAR)
contact_phone (VARCHAR)
is_active (BOOLEAN)
```

**employers**
```
id (UUID, PK)
company_name (VARCHAR)
country (VARCHAR)
city (VARCHAR)
```

**job_postings**
```
id (UUID, PK)
posting_title (VARCHAR)
city (VARCHAR)
country (VARCHAR)
notes (TEXT)
education_requirements (ARRAY)
skills (ARRAY)
is_active (BOOLEAN)
```

**job_contracts**
```
id (UUID, PK)
job_posting_id (UUID, FK)
employer_id (UUID, FK)
posting_agency_id (UUID, FK)
period_years (INTEGER)
renewable (BOOLEAN)
hours_per_day (INTEGER)
days_per_week (INTEGER)
overtime_policy (ENUM)
weekly_off_days (INTEGER)
food (VARCHAR)
accommodation (VARCHAR)
transport (VARCHAR)
annual_leave_days (INTEGER)
```

**job_positions**
```
id (UUID, PK)
job_contract_id (UUID, FK)
title (VARCHAR)
male_vacancies (INTEGER)
female_vacancies (INTEGER)
total_vacancies (INTEGER)
monthly_salary_amount (NUMERIC)
salary_currency (VARCHAR)
```

**job_applications**
```
id (UUID, PK)
candidate_id (UUID, FK)
job_posting_id (UUID, FK)
position_id (UUID, FK)
status (VARCHAR)
history_blob (JSONB)
```

**interview_details**
```
id (UUID, PK)
job_posting_id (UUID, FK)
job_application_id (UUID, FK)
interview_date_ad (DATE)
interview_time (TIME)
duration_minutes (INTEGER)
location (TEXT)
contact_person (VARCHAR)
status (VARCHAR)
type (VARCHAR)
```

---

## Ownership Relationships

### Correct Ownership Chain

```
Candidate
  ↓
Job Application
  ├── candidate_id → Candidate
  ├── job_posting_id → Job Posting
  └── position_id → Job Position
      ↓
      Job Position
        ↓
        job_contract_id → Job Contract
          ├── job_posting_id → Job Posting
          ├── employer_id → Employer
          └── posting_agency_id → Agency
```

### Verification Queries

```sql
-- Verify all applications have correct relationships
SELECT 
  ja.id,
  c.full_name,
  jp.posting_title,
  jpos.title,
  jc.posting_agency_id,
  pa.name
FROM job_applications ja
JOIN candidates c ON ja.candidate_id = c.id
JOIN job_postings jp ON ja.job_posting_id = jp.id
JOIN job_positions jpos ON ja.position_id = jpos.id
JOIN job_contracts jc ON jpos.job_contract_id = jc.id
JOIN posting_agencies pa ON jc.posting_agency_id = pa.id
WHERE c.full_name LIKE 'Seed Candidate%'
LIMIT 10;

-- Count test data
SELECT 
  (SELECT COUNT(*) FROM candidates WHERE full_name LIKE 'Seed Candidate%') as candidates,
  (SELECT COUNT(*) FROM posting_agencies WHERE name LIKE 'Seed Agency%') as agencies,
  (SELECT COUNT(*) FROM job_postings WHERE posting_title LIKE 'Seed Job%') as postings,
  (SELECT COUNT(*) FROM job_positions WHERE title LIKE 'Seed Position%') as positions,
  (SELECT COUNT(*) FROM job_applications ja 
   JOIN candidates c ON ja.candidate_id = c.id 
   WHERE c.full_name LIKE 'Seed Candidate%') as applications,
  (SELECT COUNT(*) FROM interview_details id
   JOIN job_applications ja ON id.job_application_id = ja.id
   JOIN candidates c ON ja.candidate_id = c.id
   WHERE c.full_name LIKE 'Seed Candidate%') as interviews;
```

---

## Testing

### Test All Candidates
```
http://localhost:3000/agencies/12345067068/jobs/381ed0d7-5883-4898-a9d6-531aec0c409b/candidates?stage=interview_scheduled&limit=100
```

### Test Today's Interviews
```
http://localhost:3000/agencies/12345067068/jobs/381ed0d7-5883-4898-a9d6-531aec0c409b/candidates?stage=interview_scheduled&interview_filter=today&limit=100
```

### Test Agency Interviews
```
http://localhost:3000/agencies/12345067068/interviews?interview_filter=all&limit=100
```

---

## Troubleshooting

### Connection refused
```bash
docker-compose up -d
docker port nest_pg
```

### No template data found
```bash
# Check if templates exist
docker exec -it nest_pg psql -U postgres -d app_db -c "
  SELECT 'Candidates' as type, COUNT(*) FROM candidates WHERE full_name NOT LIKE 'Seed%'
  UNION ALL
  SELECT 'Agencies', COUNT(*) FROM posting_agencies WHERE name NOT LIKE 'Seed%'
  UNION ALL
  SELECT 'Employers', COUNT(*) FROM employers WHERE company_name NOT LIKE 'Seed%'
  UNION ALL
  SELECT 'Job Postings', COUNT(*) FROM job_postings WHERE posting_title NOT LIKE 'Seed%';
"
```

### Verify created data
```bash
docker exec -it nest_pg psql -U postgres -d app_db -c "
  SELECT 
    (SELECT COUNT(*) FROM candidates WHERE full_name LIKE 'Seed Candidate%') as candidates,
    (SELECT COUNT(*) FROM posting_agencies WHERE name LIKE 'Seed Agency%') as agencies,
    (SELECT COUNT(*) FROM job_postings WHERE posting_title LIKE 'Seed Job%') as postings,
    (SELECT COUNT(*) FROM job_applications ja 
     JOIN candidates c ON ja.candidate_id = c.id 
     WHERE c.full_name LIKE 'Seed Candidate%') as applications;
"
```

---

## Performance Notes

- Creating 100 candidates with 5 agencies, 3 postings per agency, 2 positions per posting, and 5 applications per candidate takes ~30-60 seconds
- Database indexes are used for lookups
- All inserts are optimized with batch operations where possible

---

## Cleanup

### Delete all seed data
```bash
docker exec -it nest_pg psql -U postgres -d app_db << 'EOF'
-- Delete interviews
DELETE FROM interview_details id
WHERE EXISTS (
  SELECT 1 FROM job_applications ja
  JOIN candidates c ON ja.candidate_id = c.id
  WHERE c.full_name LIKE 'Seed Candidate%'
  AND id.job_application_id = ja.id
);

-- Delete applications
DELETE FROM job_applications ja
WHERE EXISTS (
  SELECT 1 FROM candidates c
  WHERE c.full_name LIKE 'Seed Candidate%'
  AND ja.candidate_id = c.id
);

-- Delete positions
DELETE FROM job_positions
WHERE job_contract_id IN (
  SELECT id FROM job_contracts
  WHERE posting_agency_id IN (
    SELECT id FROM posting_agencies WHERE name LIKE 'Seed Agency%'
  )
);

-- Delete contracts
DELETE FROM job_contracts
WHERE posting_agency_id IN (
  SELECT id FROM posting_agencies WHERE name LIKE 'Seed Agency%'
);

-- Delete postings
DELETE FROM job_postings
WHERE posting_title LIKE 'Seed Job%';

-- Delete employers
DELETE FROM employers
WHERE company_name LIKE 'Seed Employer%';

-- Delete agencies
DELETE FROM posting_agencies
WHERE name LIKE 'Seed Agency%';

-- Delete candidates
DELETE FROM candidates
WHERE full_name LIKE 'Seed Candidate%';

COMMIT;
EOF
```

---

## Notes

- All test data is identified by the "Seed" prefix
- Relationships are maintained correctly (ownership matters)
- Interviews are distributed across 8 days for comprehensive testing
- Applications are randomly assigned to agencies/postings/positions
- The seeder is idempotent - run multiple times to create more data
- No existing data is modified or deleted
