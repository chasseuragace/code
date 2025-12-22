# Interview Test Candidates Seeding Guide

## Overview

This guide explains how to create test candidates in `interview_scheduled` status for testing the interview filter endpoints.

**Database Details:**
- Container: `nest_pg` (PostgreSQL 15)
- Database: `app_db`
- Port: `5431` (mapped from container's 5432)
- Credentials: `postgres:postgres`

---

## Quick Start

### Option 1: Using Node.js (Recommended)

```bash
# Create 10 test candidates
node seed-interview-candidates-direct.js 10

# Create 50 test candidates
node seed-interview-candidates-direct.js 50

# Create for a specific job
node seed-interview-candidates-direct.js 10 381ed0d7-5883-4898-a9d6-531aec0c409b
```

### Option 2: Using Docker Shell Script

```bash
# Make script executable
chmod +x seed-interview-candidates-docker.sh

# Create 10 test candidates
./seed-interview-candidates-docker.sh 10

# Create 50 test candidates
./seed-interview-candidates-docker.sh 50
```

---

## What Gets Created

Each seeding operation creates:

1. **Test Candidates** - Named "Test Candidate 001", "Test Candidate 002", etc.
   - Phone: `98999` + 5-digit number (e.g., `9899900001`)
   - Gender: Cloned from template candidate
   - Date of Birth: Cloned from template candidate
   - Address: Cloned from template candidate

2. **Job Applications** - All in `interview_scheduled` status
   - Linked to the specified job
   - Linked to the first available position

3. **Interview Details** - Scheduled with varied dates and times
   - Dates: Distributed across today, tomorrow, and next 7 days
   - Times: Varied from 9 AM to 4 PM in 15-minute intervals
   - Duration: 60 minutes
   - Location: "Test Office"
   - Interviewer: "HR Manager"

---

## Database Schema

### Key Tables

**candidates**
```
id (UUID)
full_name (VARCHAR)
phone (VARCHAR) - UNIQUE
gender (VARCHAR)
date_of_birth (DATE)
address (JSONB)
created_at (TIMESTAMP)
updated_at (TIMESTAMP)
```

**job_applications**
```
id (UUID)
candidate_id (UUID) - FK to candidates
job_posting_id (UUID) - FK to job_postings
position_id (UUID) - FK to job_positions
status (VARCHAR) - 'interview_scheduled', etc.
history_blob (JSONB)
created_at (TIMESTAMP)
updated_at (TIMESTAMP)
```

**interview_details**
```
id (UUID)
job_posting_id (UUID) - FK to job_postings
job_application_id (UUID) - FK to job_applications
interview_date_ad (DATE)
interview_time (TIME)
duration_minutes (INTEGER)
location (TEXT)
contact_person (VARCHAR)
status (VARCHAR) - 'scheduled'
type (VARCHAR) - 'In-person'
created_at (TIMESTAMP)
updated_at (TIMESTAMP)
```

**job_positions**
```
id (UUID)
job_contract_id (UUID) - FK to job_contracts
title (VARCHAR)
monthly_salary_amount (NUMERIC)
salary_currency (VARCHAR)
```

**job_contracts**
```
id (UUID)
job_posting_id (UUID) - FK to job_postings
```

---

## Template Candidate

The seeder automatically finds an existing candidate to use as a template:

```sql
SELECT id, full_name, phone, gender, date_of_birth, address
FROM candidates
WHERE full_name NOT LIKE 'Test Candidate%'
ORDER BY created_at DESC
LIMIT 1;
```

**Current Template:**
- Name: Ajay Dahal
- Phone: +9779862146250
- Gender: Male
- DOB: 2025-12-17
- Address: sallaghari bhaktapur

---

## Usage Examples

### Create 10 test candidates
```bash
node seed-interview-candidates-direct.js 10
```

Output:
```
🌱 Direct Database Seeder - Interview Test Candidates
==========================================

📍 Database: postgresql://postgres:postgres@localhost:5431/app_db
👥 Creating 10 test candidates in interview_scheduled status
🎯 Job ID: 381ed0d7-5883-4898-a9d6-531aec0c409b

✅ Job found: Job A
✅ Template candidate: Ajay Dahal (+9779862146250)
✅ Position: TBD - Position Title

Creating candidates...

[1/10] Creating test candidate 001... ✅ (2025-12-22 09:00:00)
[2/10] Creating test candidate 002... ✅ (2025-12-23 10:15:00)
...
[10/10] Creating test candidate 010... ✅ (2025-12-31 16:45:00)

==========================================
📊 Seeding Summary
==========================================
✅ Success: 10/10 test candidates
❌ Failed: 0/10 test candidates

📋 Created Candidates:
──────────────────────────────────────────────────────────────────────────────────────
No.  | Name                    | Phone           | Interview Date | Time
──────────────────────────────────────────────────────────────────────────────────────
001  | Test Candidate 001      | 9899900001      | 2025-12-22     | 09:00:00
002  | Test Candidate 002      | 9899900002      | 2025-12-23     | 10:15:00
...
──────────────────────────────────────────────────────────────────────────────────────

🎉 Seeding complete!
```

---

## Testing the Filters

After seeding, test the endpoints:

### 1. All interview_scheduled candidates
```
http://localhost:3000/agencies/12345067068/jobs/381ed0d7-5883-4898-a9d6-531aec0c409b/candidates?stage=interview_scheduled&limit=100
```

### 2. Today's interviews
```
http://localhost:3000/agencies/12345067068/jobs/381ed0d7-5883-4898-a9d6-531aec0c409b/candidates?stage=interview_scheduled&interview_filter=today&limit=100
```

### 3. Tomorrow's interviews
```
http://localhost:3000/agencies/12345067068/jobs/381ed0d7-5883-4898-a9d6-531aec0c409b/candidates?stage=interview_scheduled&interview_filter=tomorrow&limit=100
```

### 4. Unattended interviews
```
http://localhost:3000/agencies/12345067068/jobs/381ed0d7-5883-4898-a9d6-531aec0c409b/candidates?stage=interview_scheduled&interview_filter=unattended&limit=100
```

### 5. This week's interviews
```
http://localhost:3000/agencies/12345067068/jobs/381ed0d7-5883-4898-a9d6-531aec0c409b/candidates?stage=interview_scheduled&date_alias=this_week&limit=100
```

---

## Troubleshooting

### Container not running
```bash
# Start the container
docker-compose up -d

# Check status
docker-compose ps
```

### Connection refused
```bash
# Verify port mapping
docker port nest_pg

# Should show: 5432/tcp -> 0.0.0.0:5431
```

### No template candidate found
```bash
# Create a candidate first via the API or manually:
INSERT INTO candidates (id, full_name, phone, gender, date_of_birth, address, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'Template Candidate',
  '+9779800000000',
  'Male',
  '2000-01-01',
  '{"district": "Kathmandu"}',
  NOW(),
  NOW()
);
```

### Job not found
```bash
# List available jobs
SELECT id, posting_title FROM job_postings;

# Use the correct job ID
node seed-interview-candidates-direct.js 10 <job-id>
```

---

## Direct SQL Queries

If you prefer to seed manually:

```bash
# Connect to database
docker exec -it nest_pg psql -U postgres -d app_db

# Then run SQL commands
```

### Create a test candidate
```sql
INSERT INTO candidates (id, full_name, phone, gender, date_of_birth, address, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'Test Candidate 001',
  '9899900001',
  'Male',
  '2000-01-01',
  '{"district": "Kathmandu"}',
  NOW(),
  NOW()
) RETURNING id;
```

### Create a job application
```sql
INSERT INTO job_applications (id, candidate_id, job_posting_id, position_id, status, history_blob, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  '<candidate-id>',
  '381ed0d7-5883-4898-a9d6-531aec0c409b',
  '<position-id>',
  'interview_scheduled',
  '[]',
  NOW(),
  NOW()
) RETURNING id;
```

### Schedule an interview
```sql
INSERT INTO interview_details (id, job_posting_id, job_application_id, interview_date_ad, interview_time, duration_minutes, location, contact_person, status, type, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  '381ed0d7-5883-4898-a9d6-531aec0c409b',
  '<application-id>',
  '2025-12-22',
  '09:00:00',
  60,
  'Test Office',
  'HR Manager',
  'scheduled',
  'In-person',
  NOW(),
  NOW()
) RETURNING id;
```

---

## Notes

- Test candidates are identified by the naming pattern "Test Candidate XXX"
- Phone numbers follow the pattern `98999XXXXX` for easy identification
- Interviews are distributed across 8 days (today through +7 days) for comprehensive testing
- All test data uses the same template candidate's profile information
- The seeder is idempotent - you can run it multiple times to create more candidates
- No data is deleted - only new records are created

---

## Related Documentation

- See `INTERVIEW_FILTERS_DOCUMENTATION.md` for complete filter documentation
- See `INTERVIEW_FILTERS_QUICK_REFERENCE.md` for quick filter reference
- See `TEST_URLS.md` for example test URLs
