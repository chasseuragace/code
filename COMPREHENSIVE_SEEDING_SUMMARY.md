# Comprehensive Seeding - Complete Summary

## Overview

The `seed-comprehensive-test-data.js` script creates realistic, interconnected test data with proper ownership relationships.

**Key Difference from Simple Seeder:**
- Simple seeder: Creates candidates and applies them to ONE existing job
- Comprehensive seeder: Creates candidates, agencies, postings, positions, and randomly assigns applications

---

## What Gets Created

### 1. Candidates (n)
- Named: "Seed Candidate 001", "Seed Candidate 002", etc.
- Phone: `98999` + 5-digit number
- Cloned from template candidate
- Status: Active

### 2. Agencies (m)
- Named: "Seed Agency 01", "Seed Agency 02", etc.
- License: `SEED{timestamp}{index}` (unique)
- Cloned from template agency
- Status: Active

### 3. Employers (m × p)
- Named: "Seed Employer 01", "Seed Employer 02", etc.
- Cloned from template employer
- One per job posting

### 4. Job Postings (m × p)
- Named: "Seed Job 001", "Seed Job 002", etc.
- Cloned from template job posting
- Status: Active

### 5. Job Contracts (m × p)
- Links job posting to employer and agency
- Cloned from template contract
- Maintains ownership relationships

### 6. Job Positions (m × p × q)
- Named: "Seed Position 01", "Seed Position 02", etc.
- Salary: 2500 + (index × 100) AED
- Cloned from template position
- Linked to job contract

### 7. Job Applications (n × r)
- Status: `interview_scheduled`
- Randomly assigned to agencies/postings/positions
- Maintains correct ownership relationships

### 8. Interview Details (n × r)
- Scheduled with varied dates (distributed across 8 days)
- Times: 9 AM to 4 PM in 15-minute intervals
- Duration: 60 minutes
- Location: "Test Office"
- Interviewer: "HR Manager"

---

## Usage

### Basic Syntax
```bash
node seed-comprehensive-test-data.js [n] [m] [p] [q] [r]
```

### Parameters
- `n` - Number of candidates
- `m` - Number of agencies
- `p` - Job postings per agency
- `q` - Positions per job posting
- `r` - Applications per candidate

### Examples

**Small Test Set**
```bash
node seed-comprehensive-test-data.js 5 2 3 2 4
```
Creates: 5 candidates, 2 agencies, 6 postings, 12 positions, 20 applications

**Medium Test Set**
```bash
node seed-comprehensive-test-data.js 10 3 2 3 5
```
Creates: 10 candidates, 3 agencies, 6 postings, 18 positions, 50 applications

**Large Test Set**
```bash
node seed-comprehensive-test-data.js 20 5 4 2 3
```
Creates: 20 candidates, 5 agencies, 20 postings, 40 positions, 60 applications

---

## Data Relationships

### Ownership Chain
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

### Example Structure (n=2, m=1, p=2, q=2, r=2)

```
Candidates: 2
├── Seed Candidate 001
│   ├── Application 1
│   │   ├── Job Posting 1 (Seed Job 101)
│   │   ├── Position 1 (Seed Position 01)
│   │   ├── Contract → Agency 1 (Seed Agency 01)
│   │   └── Interview (2025-12-22 09:00)
│   └── Application 2
│       ├── Job Posting 2 (Seed Job 102)
│       ├── Position 2 (Seed Position 02)
│       ├── Contract → Agency 1 (Seed Agency 01)
│       └── Interview (2025-12-23 10:15)
└── Seed Candidate 002
    ├── Application 3
    │   ├── Job Posting 1 (Seed Job 101)
    │   ├── Position 1 (Seed Position 01)
    │   ├── Contract → Agency 1 (Seed Agency 01)
    │   └── Interview (2025-12-24 11:30)
    └── Application 4
        ├── Job Posting 2 (Seed Job 102)
        ├── Position 2 (Seed Position 02)
        ├── Contract → Agency 1 (Seed Agency 01)
        └── Interview (2025-12-25 12:45)

Agencies: 1
└── Seed Agency 01
    ├── Job Posting 1 (Seed Job 101)
    │   ├── Employer: Seed Employer 101
    │   ├── Position 1 (Seed Position 01) - Salary: 2600 AED
    │   └── Position 2 (Seed Position 02) - Salary: 2700 AED
    └── Job Posting 2 (Seed Job 102)
        ├── Employer: Seed Employer 102
        ├── Position 1 (Seed Position 01) - Salary: 2600 AED
        └── Position 2 (Seed Position 02) - Salary: 2700 AED
```

---

## Database Schema

### Key Tables

**candidates**
```
id (UUID, PK)
full_name (VARCHAR) - "Seed Candidate XXX"
phone (VARCHAR, UNIQUE) - "98999XXXXX"
gender (VARCHAR)
date_of_birth (DATE)
address (JSONB)
```

**posting_agencies**
```
id (UUID, PK)
name (VARCHAR) - "Seed Agency XX"
license_number (VARCHAR, UNIQUE) - "SEED{timestamp}{index}"
country (VARCHAR)
city (VARCHAR)
is_active (BOOLEAN)
```

**employers**
```
id (UUID, PK)
company_name (VARCHAR) - "Seed Employer XX"
country (VARCHAR)
city (VARCHAR)
```

**job_postings**
```
id (UUID, PK)
posting_title (VARCHAR) - "Seed Job XXX"
city (VARCHAR)
country (VARCHAR)
is_active (BOOLEAN)
```

**job_contracts**
```
id (UUID, PK)
job_posting_id (UUID, FK) → job_postings
employer_id (UUID, FK) → employers
posting_agency_id (UUID, FK) → posting_agencies
period_years (INTEGER)
renewable (BOOLEAN)
hours_per_day (INTEGER)
days_per_week (INTEGER)
```

**job_positions**
```
id (UUID, PK)
job_contract_id (UUID, FK) → job_contracts
title (VARCHAR) - "Seed Position XX"
total_vacancies (INTEGER)
monthly_salary_amount (NUMERIC) - 2500 + (index × 100)
salary_currency (VARCHAR) - "AED"
```

**job_applications**
```
id (UUID, PK)
candidate_id (UUID, FK) → candidates
job_posting_id (UUID, FK) → job_postings
position_id (UUID, FK) → job_positions
status (VARCHAR) - "interview_scheduled"
```

**interview_details**
```
id (UUID, PK)
job_posting_id (UUID, FK) → job_postings
job_application_id (UUID, FK) → job_applications
interview_date_ad (DATE)
interview_time (TIME)
duration_minutes (INTEGER) - 60
location (VARCHAR) - "Test Office"
contact_person (VARCHAR) - "HR Manager"
status (VARCHAR) - "scheduled"
type (VARCHAR) - "In-person"
```

---

## Verification Queries

### Count All Seed Data
```sql
SELECT 
  (SELECT COUNT(*) FROM candidates WHERE full_name LIKE 'Seed Candidate%') as candidates,
  (SELECT COUNT(*) FROM posting_agencies WHERE name LIKE 'Seed Agency%') as agencies,
  (SELECT COUNT(*) FROM employers WHERE company_name LIKE 'Seed Employer%') as employers,
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

### Verify Ownership Relationships
```sql
SELECT 
  c.full_name as candidate,
  jp.posting_title as posting,
  jpos.title as position,
  pa.name as agency,
  e.company_name as employer,
  id.interview_date_ad as interview_date,
  id.interview_time as interview_time
FROM job_applications ja
JOIN candidates c ON ja.candidate_id = c.id
JOIN job_postings jp ON ja.job_posting_id = jp.id
JOIN job_positions jpos ON ja.position_id = jpos.id
JOIN job_contracts jc ON jpos.job_contract_id = jc.id
JOIN posting_agencies pa ON jc.posting_agency_id = pa.id
JOIN employers e ON jc.employer_id = e.id
LEFT JOIN interview_details id ON ja.id = id.job_application_id
WHERE c.full_name LIKE 'Seed Candidate%'
ORDER BY c.full_name, ja.created_at
LIMIT 20;
```

### Check for Orphaned Records
```sql
-- Applications without valid positions
SELECT COUNT(*) FROM job_applications 
WHERE position_id NOT IN (SELECT id FROM job_positions);

-- Positions without valid contracts
SELECT COUNT(*) FROM job_positions 
WHERE job_contract_id NOT IN (SELECT id FROM job_contracts);

-- Contracts without valid agencies
SELECT COUNT(*) FROM job_contracts 
WHERE posting_agency_id NOT IN (SELECT id FROM posting_agencies);
```

---

## Testing

### Test URLs

**All interview_scheduled candidates**
```
http://localhost:3000/agencies/12345067068/jobs/381ed0d7-5883-4898-a9d6-531aec0c409b/candidates?stage=interview_scheduled&limit=100
```

**Today's interviews**
```
http://localhost:3000/agencies/12345067068/jobs/381ed0d7-5883-4898-a9d6-531aec0c409b/candidates?stage=interview_scheduled&interview_filter=today&limit=100
```

**Tomorrow's interviews**
```
http://localhost:3000/agencies/12345067068/jobs/381ed0d7-5883-4898-a9d6-531aec0c409b/candidates?stage=interview_scheduled&interview_filter=tomorrow&limit=100
```

**Unattended interviews**
```
http://localhost:3000/agencies/12345067068/jobs/381ed0d7-5883-4898-a9d6-531aec0c409b/candidates?stage=interview_scheduled&interview_filter=unattended&limit=100
```

**Agency interviews (all)**
```
http://localhost:3000/agencies/12345067068/interviews?interview_filter=all&limit=100
```

---

## Performance

| Test Set | Command | Time | Records |
|----------|---------|------|---------|
| Minimal | `2 1 1 1 1` | ~2s | 2 candidates, 1 agency, 1 posting, 1 position, 2 apps |
| Small | `5 2 3 2 4` | ~5-10s | 5 candidates, 2 agencies, 6 postings, 12 positions, 20 apps |
| Medium | `10 3 2 3 5` | ~10-20s | 10 candidates, 3 agencies, 6 postings, 18 positions, 50 apps |
| Large | `20 5 4 2 3` | ~20-40s | 20 candidates, 5 agencies, 20 postings, 40 positions, 60 apps |
| Heavy | `50 10 5 3 10` | ~60-120s | 50 candidates, 10 agencies, 50 postings, 150 positions, 500 apps |

---

## Cleanup

### Delete All Seed Data
```bash
docker exec -it nest_pg psql -U postgres -d app_db << 'EOF'
-- Delete interviews
DELETE FROM interview_details WHERE job_application_id IN (
  SELECT ja.id FROM job_applications ja
  JOIN candidates c ON ja.candidate_id = c.id
  WHERE c.full_name LIKE 'Seed Candidate%'
);

-- Delete applications
DELETE FROM job_applications WHERE candidate_id IN (
  SELECT id FROM candidates WHERE full_name LIKE 'Seed Candidate%'
);

-- Delete positions
DELETE FROM job_positions WHERE job_contract_id IN (
  SELECT id FROM job_contracts WHERE posting_agency_id IN (
    SELECT id FROM posting_agencies WHERE name LIKE 'Seed Agency%'
  )
);

-- Delete contracts
DELETE FROM job_contracts WHERE posting_agency_id IN (
  SELECT id FROM posting_agencies WHERE name LIKE 'Seed Agency%'
);

-- Delete postings
DELETE FROM job_postings WHERE posting_title LIKE 'Seed Job%';

-- Delete employers
DELETE FROM employers WHERE company_name LIKE 'Seed Employer%';

-- Delete agencies
DELETE FROM posting_agencies WHERE name LIKE 'Seed Agency%';

-- Delete candidates
DELETE FROM candidates WHERE full_name LIKE 'Seed Candidate%';

COMMIT;
EOF
```

---

## Key Features

✅ **Realistic Data** - Clones existing templates for consistency
✅ **Proper Ownership** - Maintains referential integrity
✅ **Random Assignment** - Applications randomly assigned to agencies/postings/positions
✅ **Varied Interviews** - Distributed across 8 days with varied times
✅ **Scalable** - Create any number of records
✅ **Idempotent** - Run multiple times to create more data
✅ **Non-destructive** - No existing data is modified or deleted
✅ **Verifiable** - Easy to identify and clean up seed data

---

## Comparison: Simple vs Comprehensive Seeder

| Feature | Simple Seeder | Comprehensive Seeder |
|---------|---------------|----------------------|
| Creates candidates | ✅ | ✅ |
| Creates agencies | ❌ | ✅ |
| Creates postings | ❌ | ✅ |
| Creates positions | ❌ | ✅ |
| Creates applications | ✅ | ✅ |
| Ownership relationships | ❌ | ✅ |
| Random assignment | ❌ | ✅ |
| Scalable | ❌ | ✅ |
| Realistic data | ❌ | ✅ |

---

## Next Steps

1. Start database: `docker-compose up -d`
2. Create test data: `node seed-comprehensive-test-data.js 5 2 3 2 4`
3. Verify data: See verification queries above
4. Test endpoints: Use test URLs above
5. Verify ownership: Check relationships in database
6. Clean up: Use cleanup script when done
