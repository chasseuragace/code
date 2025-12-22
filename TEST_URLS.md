# Test URLs for Interview Filters

## Setup
Before testing, create test candidates:
```bash
node seed-interview-test-candidates.js 10 381ed0d7-5883-4898-a9d6-531aec0c409b 12345067068
```

---

## Job Candidates Endpoint Tests
**Base URL:** `http://localhost:3000/agencies/12345067068/jobs/381ed0d7-5883-4898-a9d6-531aec0c409b/candidates`

### 1. All interview_scheduled candidates (default sorting)
```
http://localhost:3000/agencies/12345067068/jobs/381ed0d7-5883-4898-a9d6-531aec0c409b/candidates?stage=interview_scheduled&limit=100&offset=0&sort_by=priority_score&sort_order=desc
```
**Expected:** All candidates in interview_scheduled status, sorted by priority score (highest first)

---

### 2. Today's interviews only
```
http://localhost:3000/agencies/12345067068/jobs/381ed0d7-5883-4898-a9d6-531aec0c409b/candidates?stage=interview_scheduled&limit=100&interview_filter=today
```
**Expected:** Only candidates with interviews scheduled for today

---

### 3. Tomorrow's interviews only
```
http://localhost:3000/agencies/12345067068/jobs/381ed0d7-5883-4898-a9d6-531aec0c409b/candidates?stage=interview_scheduled&limit=100&interview_filter=tomorrow
```
**Expected:** Only candidates with interviews scheduled for tomorrow

---

### 4. Unattended interviews (no-shows)
```
http://localhost:3000/agencies/12345067068/jobs/381ed0d7-5883-4898-a9d6-531aec0c409b/candidates?stage=interview_scheduled&limit=100&interview_filter=unattended
```
**Expected:** Candidates whose interviews are past the scheduled time + duration + 30min grace period

---

### 5. All interviews (explicit)
```
http://localhost:3000/agencies/12345067068/jobs/381ed0d7-5883-4898-a9d6-531aec0c409b/candidates?stage=interview_scheduled&limit=100&interview_filter=all
```
**Expected:** All interview_scheduled candidates (same as no interview_filter)

---

### 6. This week's interviews
```
http://localhost:3000/agencies/12345067068/jobs/381ed0d7-5883-4898-a9d6-531aec0c409b/candidates?stage=interview_scheduled&limit=100&date_alias=this_week
```
**Expected:** Candidates with interviews from Monday to Sunday of current week

---

### 7. Next week's interviews
```
http://localhost:3000/agencies/12345067068/jobs/381ed0d7-5883-4898-a9d6-531aec0c409b/candidates?stage=interview_scheduled&limit=100&date_alias=next_week
```
**Expected:** Candidates with interviews from Monday to Sunday of next week

---

### 8. This month's interviews
```
http://localhost:3000/agencies/12345067068/jobs/381ed0d7-5883-4898-a9d6-531aec0c409b/candidates?stage=interview_scheduled&limit=100&date_alias=this_month
```
**Expected:** Candidates with interviews from 1st to last day of current month

---

### 9. Custom date range (specific date)
```
http://localhost:3000/agencies/12345067068/jobs/381ed0d7-5883-4898-a9d6-531aec0c409b/candidates?stage=interview_scheduled&limit=100&date_from=2025-12-21&date_to=2025-12-21
```
**Expected:** Candidates with interviews on December 21, 2025 only

---

### 10. Custom date range (multiple days)
```
http://localhost:3000/agencies/12345067068/jobs/381ed0d7-5883-4898-a9d6-531aec0c409b/candidates?stage=interview_scheduled&limit=100&date_from=2025-12-21&date_to=2025-12-31
```
**Expected:** Candidates with interviews between December 21-31, 2025

---

### 11. Sort by application date (ascending)
```
http://localhost:3000/agencies/12345067068/jobs/381ed0d7-5883-4898-a9d6-531aec0c409b/candidates?stage=interview_scheduled&limit=100&sort_by=applied_at&sort_order=asc
```
**Expected:** Candidates sorted by application date (oldest first)

---

### 12. Sort by candidate name (descending)
```
http://localhost:3000/agencies/12345067068/jobs/381ed0d7-5883-4898-a9d6-531aec0c409b/candidates?stage=interview_scheduled&limit=100&sort_by=name&sort_order=desc
```
**Expected:** Candidates sorted by name (Z to A)

---

### 13. Pagination test (first 10)
```
http://localhost:3000/agencies/12345067068/jobs/381ed0d7-5883-4898-a9d6-531aec0c409b/candidates?stage=interview_scheduled&limit=10&offset=0
```
**Expected:** First 10 candidates

---

### 14. Pagination test (next 10)
```
http://localhost:3000/agencies/12345067068/jobs/381ed0d7-5883-4898-a9d6-531aec0c409b/candidates?stage=interview_scheduled&limit=10&offset=10
```
**Expected:** Candidates 11-20

---

### 15. Search by candidate name
```
http://localhost:3000/agencies/12345067068/jobs/381ed0d7-5883-4898-a9d6-531aec0c409b/candidates?stage=interview_scheduled&limit=100&search=Test%20Candidate%20001
```
**Expected:** Only "Test Candidate 001"

---

### 16. Search by phone number
```
http://localhost:3000/agencies/12345067068/jobs/381ed0d7-5883-4898-a9d6-531aec0c409b/candidates?stage=interview_scheduled&limit=100&search=98999
```
**Expected:** Candidates matching phone number starting with 98999

---

### 17. Search by interviewer name
```
http://localhost:3000/agencies/12345067068/jobs/381ed0d7-5883-4898-a9d6-531aec0c409b/candidates?stage=interview_scheduled&limit=100&search=HR%20Manager
```
**Expected:** Candidates with "HR Manager" as interviewer

---

### 18. Combined filters: Today + Priority sort
```
http://localhost:3000/agencies/12345067068/jobs/381ed0d7-5883-4898-a9d6-531aec0c409b/candidates?stage=interview_scheduled&interview_filter=today&sort_by=priority_score&sort_order=desc&limit=100
```
**Expected:** Today's interviews sorted by priority score (highest first)

---

### 19. Combined filters: This week + Name sort
```
http://localhost:3000/agencies/12345067068/jobs/381ed0d7-5883-4898-a9d6-531aec0c409b/candidates?stage=interview_scheduled&date_alias=this_week&sort_by=name&sort_order=asc&limit=100
```
**Expected:** This week's interviews sorted by name (A to Z)

---

### 20. Other stages: Applied candidates
```
http://localhost:3000/agencies/12345067068/jobs/381ed0d7-5883-4898-a9d6-531aec0c409b/candidates?stage=applied&limit=100
```
**Expected:** All candidates in "applied" stage (no interview filters available)

---

### 21. Other stages: Shortlisted candidates
```
http://localhost:3000/agencies/12345067068/jobs/381ed0d7-5883-4898-a9d6-531aec0c409b/candidates?stage=shortlisted&limit=100
```
**Expected:** All candidates in "shortlisted" stage

---

### 22. Other stages: Interview passed
```
http://localhost:3000/agencies/12345067068/jobs/381ed0d7-5883-4898-a9d6-531aec0c409b/candidates?stage=interview_passed&limit=100
```
**Expected:** All candidates who passed interviews

---

### 23. Other stages: Interview failed
```
http://localhost:3000/agencies/12345067068/jobs/381ed0d7-5883-4898-a9d6-531aec0c409b/candidates?stage=interview_failed&limit=100
```
**Expected:** All candidates who failed interviews

---

## Agency Interviews Endpoint Tests
**Base URL:** `http://localhost:3000/agencies/12345067068/interviews`

### 1. Today's interviews
```
http://localhost:3000/agencies/12345067068/interviews?interview_filter=today&limit=100
```
**Expected:** All interviews scheduled for today across all jobs

---

### 2. Tomorrow's interviews
```
http://localhost:3000/agencies/12345067068/interviews?interview_filter=tomorrow&limit=100
```
**Expected:** All interviews scheduled for tomorrow across all jobs

---

### 3. Unattended interviews
```
http://localhost:3000/agencies/12345067068/interviews?interview_filter=unattended&limit=100
```
**Expected:** All unattended interviews (no-shows) across all jobs

---

### 4. All interviews
```
http://localhost:3000/agencies/12345067068/interviews?interview_filter=all&limit=100
```
**Expected:** All interviews across all jobs

---

### 5. Custom date range (single day)
```
http://localhost:3000/agencies/12345067068/interviews?date_from=2025-12-21&date_to=2025-12-21&limit=100
```
**Expected:** All interviews on December 21, 2025

---

### 6. Custom date range (multiple days)
```
http://localhost:3000/agencies/12345067068/interviews?date_from=2025-12-21&date_to=2025-12-31&limit=100
```
**Expected:** All interviews between December 21-31, 2025

---

### 7. Pagination test
```
http://localhost:3000/agencies/12345067068/interviews?interview_filter=all&limit=10&offset=0
```
**Expected:** First 10 interviews

---

## Expected Behavior

### Filter Combinations
- ✅ `interview_filter` + `sort_by` = Works
- ✅ `interview_filter` + `sort_order` = Works
- ✅ `date_alias` + `sort_by` = Works
- ✅ `date_from`/`date_to` + `sort_by` = Works
- ✅ `search` + any filter = Works
- ✅ `skills` + any filter = Works

### Filter Precedence
- `date_alias` takes precedence over `date_from`/`date_to`
- If both are provided, `date_alias` is used and `date_from`/`date_to` are ignored

### Pagination
- `limit` max is 100
- `offset` starts at 0
- Response includes `has_more` flag to indicate if more results exist

### Response Fields
Each candidate includes:
- `id` - Candidate UUID
- `name` - Full name
- `gender` - Gender
- `priority_score` - Fitness score (0-100)
- `address` - Address
- `phone` - Phone number
- `email` - Email (optional)
- `position` - Position details with salary info
- `applied_at` - Application timestamp
- `application_id` - Application UUID
- `status` - Current status
- `interview` - Interview details (if scheduled)

---

## Notes

- All test candidates are named "Test Candidate 001", "Test Candidate 002", etc.
- All test candidates have phone numbers starting with 98999
- Interviews are distributed across today, tomorrow, and next 7 days
- Interview times vary from 9 AM to 4 PM
- All candidates are in `interview_scheduled` status
- Use URL encoding for special characters (e.g., space = %20)
