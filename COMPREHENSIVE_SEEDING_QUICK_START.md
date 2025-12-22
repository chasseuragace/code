# Comprehensive Seeding - Quick Start

## One-Liner Examples

```bash
# Small test set: 5 candidates, 2 agencies, 3 postings, 2 positions, 4 apps
node seed-comprehensive-test-data.js 5 2 3 2 4

# Medium test set: 10 candidates, 3 agencies, 2 postings, 3 positions, 5 apps
node seed-comprehensive-test-data.js 10 3 2 3 5

# Large test set: 20 candidates, 5 agencies, 4 postings, 2 positions, 3 apps
node seed-comprehensive-test-data.js 20 5 4 2 3

# Minimal test: 2 candidates, 1 agency, 1 posting, 1 position, 1 app
node seed-comprehensive-test-data.js 2 1 1 1 1

# Heavy load: 50 candidates, 10 agencies, 5 postings, 3 positions, 10 apps
node seed-comprehensive-test-data.js 50 10 5 3 10
```

## Parameters

```
node seed-comprehensive-test-data.js [n] [m] [p] [q] [r]

n = number of candidates
m = number of agencies
p = job postings per agency
q = positions per job posting
r = applications per candidate
```

## What Gets Created

```
Total Postings = m × p
Total Positions = m × p × q
Total Applications = n × r
Total Interviews = n × r
```

## Examples

### Example 1: 5 2 3 2 4
```
Candidates:    5
Agencies:      2
Postings:      6 (2 × 3)
Positions:     12 (6 × 2)
Applications:  20 (5 × 4)
Interviews:    20
```

### Example 2: 10 3 2 3 5
```
Candidates:    10
Agencies:      3
Postings:      6 (3 × 2)
Positions:      18 (6 × 3)
Applications:  50 (10 × 5)
Interviews:    50
```

### Example 3: 20 5 4 2 3
```
Candidates:    20
Agencies:      5
Postings:      20 (5 × 4)
Positions:     40 (20 × 2)
Applications:  60 (20 × 3)
Interviews:    60
```

## Data Naming

- Candidates: `Seed Candidate 001`, `Seed Candidate 002`, etc.
- Agencies: `Seed Agency 01`, `Seed Agency 02`, etc.
- Employers: `Seed Employer 01`, `Seed Employer 02`, etc.
- Postings: `Seed Job 001`, `Seed Job 002`, etc.
- Positions: `Seed Position 01`, `Seed Position 02`, etc.

## Ownership Chain

```
Candidate
  → Job Application
    → Job Posting
      → Job Contract
        → Agency (posting_agency_id)
        → Employer (employer_id)
    → Job Position
      → Job Contract
        → Agency
```

## Verify Data

```bash
# Count all seed data
docker exec -it nest_pg psql -U postgres -d app_db -c "
  SELECT 
    (SELECT COUNT(*) FROM candidates WHERE full_name LIKE 'Seed Candidate%') as candidates,
    (SELECT COUNT(*) FROM posting_agencies WHERE name LIKE 'Seed Agency%') as agencies,
    (SELECT COUNT(*) FROM job_postings WHERE posting_title LIKE 'Seed Job%') as postings,
    (SELECT COUNT(*) FROM job_positions WHERE title LIKE 'Seed Position%') as positions,
    (SELECT COUNT(*) FROM job_applications ja 
     JOIN candidates c ON ja.candidate_id = c.id 
     WHERE c.full_name LIKE 'Seed Candidate%') as applications;
"
```

## Test URLs

```
# All interview_scheduled candidates
http://localhost:3000/agencies/12345067068/jobs/381ed0d7-5883-4898-a9d6-531aec0c409b/candidates?stage=interview_scheduled&limit=100

# Today's interviews
http://localhost:3000/agencies/12345067068/jobs/381ed0d7-5883-4898-a9d6-531aec0c409b/candidates?stage=interview_scheduled&interview_filter=today&limit=100

# Agency interviews
http://localhost:3000/agencies/12345067068/interviews?interview_filter=all&limit=100
```

## Cleanup

```bash
# Delete all seed data
docker exec -it nest_pg psql -U postgres -d app_db << 'EOF'
DELETE FROM interview_details WHERE job_application_id IN (
  SELECT ja.id FROM job_applications ja
  JOIN candidates c ON ja.candidate_id = c.id
  WHERE c.full_name LIKE 'Seed Candidate%'
);
DELETE FROM job_applications WHERE candidate_id IN (
  SELECT id FROM candidates WHERE full_name LIKE 'Seed Candidate%'
);
DELETE FROM job_positions WHERE job_contract_id IN (
  SELECT id FROM job_contracts WHERE posting_agency_id IN (
    SELECT id FROM posting_agencies WHERE name LIKE 'Seed Agency%'
  )
);
DELETE FROM job_contracts WHERE posting_agency_id IN (
  SELECT id FROM posting_agencies WHERE name LIKE 'Seed Agency%'
);
DELETE FROM job_postings WHERE posting_title LIKE 'Seed Job%';
DELETE FROM employers WHERE company_name LIKE 'Seed Employer%';
DELETE FROM posting_agencies WHERE name LIKE 'Seed Agency%';
DELETE FROM candidates WHERE full_name LIKE 'Seed Candidate%';
EOF
```

## Key Features

✅ Creates realistic test data with proper ownership relationships
✅ Clones existing templates for consistency
✅ Randomly assigns applications to agencies/postings/positions
✅ Schedules interviews with varied dates and times
✅ Maintains referential integrity
✅ Idempotent - run multiple times to create more data
✅ No existing data is modified or deleted

## Performance

- Small set (5 2 3 2 4): ~5-10 seconds
- Medium set (10 3 2 3 5): ~10-20 seconds
- Large set (20 5 4 2 3): ~20-40 seconds
- Heavy load (50 10 5 3 10): ~60-120 seconds
