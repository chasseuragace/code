# Interview Testing - Complete Summary

## Database Configuration

**Container:** `nest_pg` (PostgreSQL 15)
**Database:** `app_db`
**Port:** `5431` (localhost)
**Credentials:** `postgres:postgres`

From `docker-compose.yml`:
```yaml
db:
  image: postgres:15-alpine
  container_name: nest_pg
  environment:
    POSTGRES_USER: postgres
    POSTGRES_PASSWORD: postgres
    POSTGRES_DB: app_db
  ports:
    - "5431:5432"
```

---

## Available Filters

### Job Candidates Endpoint
**URL:** `GET /agencies/:license/jobs/:jobId/candidates`

| Filter | Type | Values | Notes |
|--------|------|--------|-------|
| `stage` | required | `applied`, `shortlisted`, `interview_scheduled`, `interview_rescheduled`, `interview_passed`, `interview_failed` | Application stage |
| `limit` | optional | 1-100 | Results per page (default: 10) |
| `offset` | optional | ≥0 | Pagination offset (default: 0) |
| `sort_by` | optional | `priority_score`, `applied_at`, `name` | Sort field (default: `priority_score`) |
| `sort_order` | optional | `asc`, `desc` | Sort direction (default: `desc`) |
| `interview_filter` | optional* | `today`, `tomorrow`, `unattended`, `all` | Interview date filter (default: `all`) |
| `date_alias` | optional* | `today`, `tomorrow`, `this_week`, `next_week`, `this_month` | Quick date filter |
| `date_from` | optional* | YYYY-MM-DD | Start date |
| `date_to` | optional* | YYYY-MM-DD | End date |
| `skills` | optional | comma-separated | AND logic |
| `search` | optional | text | Name/phone/interviewer |

*Only for `stage=interview_scheduled`

### Agency Interviews Endpoint
**URL:** `GET /agencies/:license/interviews`

| Filter | Type | Values | Notes |
|--------|------|--------|-------|
| `interview_filter` | optional | `today`, `tomorrow`, `unattended`, `all` | Interview date filter |
| `date_from` | optional | YYYY-MM-DD | Start date |
| `date_to` | optional | YYYY-MM-DD | End date |
| `limit` | optional | number | Results per page (default: 10) |

---

## Database Schema

### Key Tables

**candidates**
- `id` (UUID, PK)
- `full_name` (VARCHAR, NOT NULL)
- `phone` (VARCHAR, NOT NULL, UNIQUE)
- `email` (VARCHAR, nullable)
- `gender` (VARCHAR, nullable)
- `date_of_birth` (DATE, nullable)
- `address` (JSONB, nullable)
- `passport_number` (VARCHAR, nullable)
- `profile_image` (VARCHAR, nullable)
- `is_active` (BOOLEAN, default: true)
- `created_at` (TIMESTAMP, NOT NULL)
- `updated_at` (TIMESTAMP, NOT NULL)

**job_applications**
- `id` (UUID, PK)
- `candidate_id` (UUID, FK → candidates)
- `job_posting_id` (UUID, FK → job_postings)
- `position_id` (UUID, FK → job_positions)
- `status` (VARCHAR, NOT NULL)
- `history_blob` (JSONB)
- `withdrawn_at` (TIMESTAMP, nullable)
- `created_at` (TIMESTAMP, NOT NULL)
- `updated_at` (TIMESTAMP, NOT NULL)

**interview_details**
- `id` (UUID, PK)
- `job_posting_id` (UUID, FK → job_postings)
- `job_application_id` (UUID, FK → job_applications)
- `interview_date_ad` (DATE, nullable)
- `interview_date_bs` (VARCHAR, nullable)
- `interview_time` (TIME, nullable)
- `duration_minutes` (INTEGER, default: 60)
- `location` (TEXT, nullable)
- `contact_person` (VARCHAR, nullable)
- `required_documents` (ARRAY, nullable)
- `notes` (TEXT, nullable)
- `status` (ENUM, default: 'scheduled')
- `result` (ENUM, nullable)
- `type` (ENUM, default: 'In-person')
- `interviewer_email` (VARCHAR, nullable)
- `feedback` (TEXT, nullable)
- `score` (INTEGER, nullable)
- `recommendation` (TEXT, nullable)
- `rejection_reason` (TEXT, nullable)
- `completed_at` (TIMESTAMP, nullable)
- `cancelled_at` (TIMESTAMP, nullable)
- `rescheduled_at` (TIMESTAMP, nullable)
- `created_at` (TIMESTAMP, NOT NULL)
- `updated_at` (TIMESTAMP, NOT NULL)

**job_positions**
- `id` (UUID, PK)
- `job_contract_id` (UUID, FK → job_contracts)
- `title` (VARCHAR, NOT NULL)
- `male_vacancies` (INTEGER, default: 0)
- `female_vacancies` (INTEGER, default: 0)
- `total_vacancies` (INTEGER, NOT NULL)
- `monthly_salary_amount` (NUMERIC, NOT NULL)
- `salary_currency` (VARCHAR, NOT NULL)
- `hours_per_day_override` (INTEGER, nullable)
- `days_per_week_override` (INTEGER, nullable)
- `overtime_policy_override` (ENUM, nullable)
- `weekly_off_days_override` (INTEGER, nullable)
- `food_override` (ENUM, nullable)
- `accommodation_override` (ENUM, nullable)
- `transport_override` (ENUM, nullable)
- `position_notes` (TEXT, nullable)
- `created_at` (TIMESTAMP, NOT NULL)
- `updated_at` (TIMESTAMP, NOT NULL)

**job_contracts**
- `id` (UUID, PK)
- `job_posting_id` (UUID, FK → job_postings)
- (other fields...)

**job_postings**
- `id` (UUID, PK)
- `posting_title` (VARCHAR)
- (other fields...)

---

## Seeding Scripts

### Option 1: Node.js Direct Seeder
**File:** `seed-interview-candidates-direct.js`

```bash
# Create 10 test candidates
node seed-interview-candidates-direct.js 10

# Create 50 test candidates
node seed-interview-candidates-direct.js 50

# Create for specific job
node seed-interview-candidates-direct.js 10 381ed0d7-5883-4898-a9d6-531aec0c409b
```

**Features:**
- Direct PostgreSQL connection
- No API calls required
- Fast and reliable
- Clones existing candidate data
- Distributes interviews across 8 days
- Varies interview times

### Option 2: Docker Shell Script
**File:** `seed-interview-candidates-docker.sh`

```bash
chmod +x seed-interview-candidates-docker.sh

# Create 10 test candidates
./seed-interview-candidates-docker.sh 10

# Create 50 test candidates
./seed-interview-candidates-docker.sh 50
```

**Features:**
- Uses `docker exec` to run SQL
- No Node.js dependency
- Works with containerized database
- Same functionality as Node.js version

---

## Test Data

### Template Candidate
```
ID: 78043ec5-8420-4bf9-ac06-79522e8257ce
Name: Ajay Dahal
Phone: +9779862146250
Gender: Male
DOB: 2025-12-17
Address: sallaghari bhaktapur
```

### Test Job
```
ID: 381ed0d7-5883-4898-a9d6-531aec0c409b
Title: Job A
```

### Test Position
```
ID: 249851ef-3d30-4128-8845-b12eaedd794d
Title: TBD - Position Title
Contract ID: 00c56c66-3d05-4288-8c97-e28daf2b944e
```

### Test Candidates Created
- Named: "Test Candidate 001", "Test Candidate 002", etc.
- Phone: `98999` + 5-digit number
- Status: `interview_scheduled`
- Interviews: Distributed across today through +7 days
- Times: 9 AM to 4 PM in 15-minute intervals

---

## Test URLs

### All interview_scheduled candidates
```
http://localhost:3000/agencies/12345067068/jobs/381ed0d7-5883-4898-a9d6-531aec0c409b/candidates?stage=interview_scheduled&limit=100&offset=0&sort_by=priority_score&sort_order=desc
```

### Today's interviews
```
http://localhost:3000/agencies/12345067068/jobs/381ed0d7-5883-4898-a9d6-531aec0c409b/candidates?stage=interview_scheduled&limit=100&interview_filter=today
```

### Tomorrow's interviews
```
http://localhost:3000/agencies/12345067068/jobs/381ed0d7-5883-4898-a9d6-531aec0c409b/candidates?stage=interview_scheduled&limit=100&interview_filter=tomorrow
```

### Unattended interviews
```
http://localhost:3000/agencies/12345067068/jobs/381ed0d7-5883-4898-a9d6-531aec0c409b/candidates?stage=interview_scheduled&limit=100&interview_filter=unattended
```

### This week's interviews
```
http://localhost:3000/agencies/12345067068/jobs/381ed0d7-5883-4898-a9d6-531aec0c409b/candidates?stage=interview_scheduled&limit=100&date_alias=this_week
```

### Agency interviews (today)
```
http://localhost:3000/agencies/12345067068/interviews?interview_filter=today&limit=100
```

### Agency interviews (tomorrow)
```
http://localhost:3000/agencies/12345067068/interviews?interview_filter=tomorrow&limit=100
```

### Agency interviews (unattended)
```
http://localhost:3000/agencies/12345067068/interviews?interview_filter=unattended&limit=100
```

### Agency interviews (all)
```
http://localhost:3000/agencies/12345067068/interviews?interview_filter=all&limit=100
```

---

## Filter Logic

### `interview_filter=unattended`
An interview is "unattended" when:
- Current time > (interview_time + duration_minutes + 30 minute grace period)
- Example: 10:00 AM + 60 min + 30 min grace = 11:30 AM

### `date_alias` Precedence
- `date_alias` takes precedence over `date_from`/`date_to`
- If both provided, `date_alias` is used

### `skills` Filter
- Uses AND logic
- Candidate must have ALL specified skills
- Example: `skills=Cooking,English` returns only candidates with both skills

### `search` Filter
- Matches against:
  - Candidate full name
  - Candidate phone number
  - Interviewer name (contact_person)

---

## Quick Commands

```bash
# Start database
docker-compose up -d

# Check container status
docker-compose ps

# Create 10 test candidates
node seed-interview-candidates-direct.js 10

# Create 50 test candidates
node seed-interview-candidates-direct.js 50

# Connect to database directly
docker exec -it nest_pg psql -U postgres -d app_db

# View test candidates
docker exec -it nest_pg psql -U postgres -d app_db -c "SELECT id, full_name, phone FROM candidates WHERE full_name LIKE 'Test Candidate%' ORDER BY full_name;"

# View test interviews
docker exec -it nest_pg psql -U postgres -d app_db -c "SELECT id, interview_date_ad, interview_time FROM interview_details WHERE location = 'Test Office' ORDER BY interview_date_ad;"

# Count test candidates
docker exec -it nest_pg psql -U postgres -d app_db -c "SELECT COUNT(*) FROM candidates WHERE full_name LIKE 'Test Candidate%';"
```

---

## Documentation Files

1. **INTERVIEW_FILTERS_DOCUMENTATION.md** - Complete filter documentation
2. **INTERVIEW_FILTERS_QUICK_REFERENCE.md** - Quick reference guide
3. **TEST_URLS.md** - 23 example test URLs
4. **SEEDING_GUIDE.md** - Detailed seeding instructions
5. **INTERVIEW_TESTING_SUMMARY.md** - This file

---

## Next Steps

1. Start the database: `docker-compose up -d`
2. Create test candidates: `node seed-interview-candidates-direct.js 10`
3. Test the endpoints using the URLs above
4. Verify filters work correctly
5. Check the response format matches expectations
