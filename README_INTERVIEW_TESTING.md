# Interview Testing - Complete Setup Guide

## 📋 Overview

This package contains everything needed to test the interview filter endpoints for the MadiramMaps job application system.

**What's Included:**
- ✅ 2 seeding scripts (Node.js + Docker)
- ✅ Complete filter documentation
- ✅ 23 example test URLs
- ✅ Database connection info
- ✅ Troubleshooting guides

---

## 🚀 Quick Start (2 minutes)

### 1. Start the database
```bash
docker-compose up -d
```

### 2. Create test candidates
```bash
node seed-interview-candidates-direct.js 10
```

### 3. Test the endpoints
```
http://localhost:3000/agencies/12345067068/jobs/381ed0d7-5883-4898-a9d6-531aec0c409b/candidates?stage=interview_scheduled&limit=100
```

---

## 📁 Files in This Package

### Seeding Scripts

| File | Type | Purpose |
|------|------|---------|
| `seed-interview-candidates-direct.js` | Node.js | Direct database seeding (recommended) |
| `seed-interview-candidates-docker.sh` | Bash | Docker-based seeding |
| `seed-interview-test-candidates.js` | Node.js | API-based seeding (legacy) |

### Documentation

| File | Purpose |
|------|---------|
| `INTERVIEW_FILTERS_DOCUMENTATION.md` | Complete filter reference |
| `INTERVIEW_FILTERS_QUICK_REFERENCE.md` | Quick lookup table |
| `TEST_URLS.md` | 23 example test URLs |
| `SEEDING_GUIDE.md` | Detailed seeding instructions |
| `DATABASE_INFO.md` | Database connection details |
| `INTERVIEW_TESTING_SUMMARY.md` | Complete technical summary |
| `README_INTERVIEW_TESTING.md` | This file |

---

## 🗄️ Database Details

**Container:** `nest_pg` (PostgreSQL 15)
**Database:** `app_db`
**Port:** `5431`
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

## 🎯 Available Filters

### Job Candidates Endpoint
**URL:** `GET /agencies/:license/jobs/:jobId/candidates`

**Required:**
- `stage` - Application stage

**Optional:**
- `limit` - Results per page (1-100)
- `offset` - Pagination offset
- `sort_by` - Sort field (priority_score, applied_at, name)
- `sort_order` - Sort direction (asc, desc)
- `interview_filter` - Interview date filter (today, tomorrow, unattended, all) *
- `date_alias` - Quick date filter (today, tomorrow, this_week, next_week, this_month) *
- `date_from` - Start date (YYYY-MM-DD) *
- `date_to` - End date (YYYY-MM-DD) *
- `skills` - Comma-separated skills (AND logic)
- `search` - Search by name/phone/interviewer

*Only for `stage=interview_scheduled`

### Agency Interviews Endpoint
**URL:** `GET /agencies/:license/interviews`

**Optional:**
- `interview_filter` - Interview date filter (today, tomorrow, unattended, all)
- `date_from` - Start date (YYYY-MM-DD)
- `date_to` - End date (YYYY-MM-DD)
- `limit` - Results per page

---

## 📊 Test Data

### Template Candidate
```
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
```

### Test Candidates Created
- Named: "Test Candidate 001", "Test Candidate 002", etc.
- Phone: `98999` + 5-digit number
- Status: `interview_scheduled`
- Interviews: Distributed across today through +7 days
- Times: 9 AM to 4 PM in 15-minute intervals

---

## 🔧 Usage Examples

### Create 10 test candidates
```bash
node seed-interview-candidates-direct.js 10
```

### Create 50 test candidates
```bash
node seed-interview-candidates-direct.js 50
```

### Create for specific job
```bash
node seed-interview-candidates-direct.js 10 381ed0d7-5883-4898-a9d6-531aec0c409b
```

### Using Docker script
```bash
chmod +x seed-interview-candidates-docker.sh
./seed-interview-candidates-docker.sh 10
```

---

## 🧪 Test URLs

### All interview_scheduled candidates
```
http://localhost:3000/agencies/12345067068/jobs/381ed0d7-5883-4898-a9d6-531aec0c409b/candidates?stage=interview_scheduled&limit=100
```

### Today's interviews
```
http://localhost:3000/agencies/12345067068/jobs/381ed0d7-5883-4898-a9d6-531aec0c409b/candidates?stage=interview_scheduled&interview_filter=today&limit=100
```

### Tomorrow's interviews
```
http://localhost:3000/agencies/12345067068/jobs/381ed0d7-5883-4898-a9d6-531aec0c409b/candidates?stage=interview_scheduled&interview_filter=tomorrow&limit=100
```

### Unattended interviews (no-shows)
```
http://localhost:3000/agencies/12345067068/jobs/381ed0d7-5883-4898-a9d6-531aec0c409b/candidates?stage=interview_scheduled&interview_filter=unattended&limit=100
```

### This week's interviews
```
http://localhost:3000/agencies/12345067068/jobs/381ed0d7-5883-4898-a9d6-531aec0c409b/candidates?stage=interview_scheduled&date_alias=this_week&limit=100
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

See `TEST_URLS.md` for 23 more examples.

---

## 📚 Documentation Map

**Start Here:**
1. `README_INTERVIEW_TESTING.md` (this file) - Overview
2. `SEEDING_GUIDE.md` - How to create test data
3. `INTERVIEW_FILTERS_QUICK_REFERENCE.md` - Filter reference

**For Details:**
4. `INTERVIEW_FILTERS_DOCUMENTATION.md` - Complete documentation
5. `TEST_URLS.md` - Example URLs
6. `DATABASE_INFO.md` - Database details
7. `INTERVIEW_TESTING_SUMMARY.md` - Technical summary

---

## 🔍 Filter Logic

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

## 🛠️ Troubleshooting

### Container not running
```bash
docker-compose up -d
docker-compose ps
```

### Connection refused
```bash
# Check port mapping
docker port nest_pg

# Should show: 5432/tcp -> 0.0.0.0:5431
```

### No template candidate found
```bash
# Create a candidate first via the API or manually
docker exec -it nest_pg psql -U postgres -d app_db
```

### Job not found
```bash
# List available jobs
docker exec -it nest_pg psql -U postgres -d app_db -c "SELECT id, posting_title FROM job_postings;"
```

See `DATABASE_INFO.md` for more troubleshooting tips.

---

## 📋 Database Schema

### Key Tables

**candidates**
- `id` (UUID, PK)
- `full_name` (VARCHAR)
- `phone` (VARCHAR, UNIQUE)
- `gender` (VARCHAR)
- `date_of_birth` (DATE)
- `address` (JSONB)

**job_applications**
- `id` (UUID, PK)
- `candidate_id` (UUID, FK)
- `job_posting_id` (UUID, FK)
- `position_id` (UUID, FK)
- `status` (VARCHAR)

**interview_details**
- `id` (UUID, PK)
- `job_posting_id` (UUID, FK)
- `job_application_id` (UUID, FK)
- `interview_date_ad` (DATE)
- `interview_time` (TIME)
- `duration_minutes` (INTEGER)
- `location` (TEXT)
- `contact_person` (VARCHAR)
- `status` (VARCHAR)

See `DATABASE_INFO.md` for complete schema.

---

## 🚀 Next Steps

1. **Setup:** Start database with `docker-compose up -d`
2. **Seed:** Create test data with `node seed-interview-candidates-direct.js 10`
3. **Test:** Use the test URLs to verify filters work
4. **Verify:** Check response format matches expectations
5. **Document:** Update API documentation with filter details

---

## 📞 Support

For issues or questions:

1. Check `DATABASE_INFO.md` for connection troubleshooting
2. Check `SEEDING_GUIDE.md` for seeding issues
3. Check `INTERVIEW_FILTERS_DOCUMENTATION.md` for filter details
4. Review `TEST_URLS.md` for example requests

---

## 📝 Notes

- Test candidates are identified by naming pattern "Test Candidate XXX"
- Phone numbers follow pattern `98999XXXXX` for easy identification
- Interviews are distributed across 8 days for comprehensive testing
- All test data uses the same template candidate's profile
- The seeder is idempotent - run multiple times to create more candidates
- No data is deleted - only new records are created

---

## ✅ Checklist

- [ ] Docker container is running (`docker-compose up -d`)
- [ ] Database is accessible (`docker port nest_pg`)
- [ ] Test candidates created (`node seed-interview-candidates-direct.js 10`)
- [ ] API is running (`http://localhost:3000`)
- [ ] Test URLs return data
- [ ] Filters work correctly
- [ ] Response format is correct

---

## 📄 File Sizes

```
seed-interview-candidates-direct.js    11 KB
seed-interview-candidates-docker.sh    7.4 KB
INTERVIEW_FILTERS_DOCUMENTATION.md     8.3 KB
INTERVIEW_FILTERS_QUICK_REFERENCE.md   4.3 KB
TEST_URLS.md                           9.3 KB
SEEDING_GUIDE.md                       8.7 KB
DATABASE_INFO.md                       7.5 KB
INTERVIEW_TESTING_SUMMARY.md           9.7 KB
README_INTERVIEW_TESTING.md            (this file)
```

---

**Last Updated:** December 22, 2025
**Version:** 1.0
**Status:** Ready for testing
