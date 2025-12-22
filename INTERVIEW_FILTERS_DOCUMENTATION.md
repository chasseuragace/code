# Interview Filters Documentation

## Overview
This document outlines all available filters for the interview and candidate endpoints in the MadiramMaps API.

---

## Endpoint 1: Get Job Candidates
**URL:** `GET /agencies/:license/jobs/:jobId/candidates`

### Query Parameters

#### Required
- **`stage`** (string, enum)
  - Application stage filter
  - Values: `applied`, `shortlisted`, `interview_scheduled`, `interview_rescheduled`, `interview_passed`, `interview_failed`
  - Example: `stage=interview_scheduled`

#### Pagination
- **`limit`** (number, optional, default: 10)
  - Number of candidates to return
  - Range: 1-100
  - Example: `limit=100`

- **`offset`** (number, optional, default: 0)
  - Pagination offset
  - Minimum: 0
  - Example: `offset=0`

#### Sorting
- **`sort_by`** (string, optional, default: `priority_score`)
  - Sort field
  - Values: `priority_score`, `applied_at`, `name`
  - Example: `sort_by=priority_score`

- **`sort_order`** (string, optional, default: `desc`)
  - Sort direction
  - Values: `asc`, `desc`
  - Example: `sort_order=desc`

#### Interview Filtering (Only for `stage=interview_scheduled`)
- **`interview_filter`** (string, optional, default: `all`)
  - Interview date filter
  - Values:
    - `today` - Interviews scheduled for today
    - `tomorrow` - Interviews scheduled for tomorrow
    - `unattended` - Interviews past their scheduled time + duration + 30min grace period (no-show)
    - `all` - All interviews (default)
  - Example: `interview_filter=today`

#### Date Range Filtering (Only for `stage=interview_scheduled`)
- **`date_alias`** (string, optional)
  - Quick date filter (takes precedence over `date_from`/`date_to`)
  - Values: `today`, `tomorrow`, `this_week`, `next_week`, `this_month`
  - Example: `date_alias=this_week`

- **`date_from`** (string, optional)
  - Start date for custom date range
  - Format: `YYYY-MM-DD`
  - Example: `date_from=2025-12-21`

- **`date_to`** (string, optional)
  - End date for custom date range
  - Format: `YYYY-MM-DD`
  - Example: `date_to=2025-12-31`

#### Skill Filtering
- **`skills`** (string, optional)
  - Comma-separated list of skills
  - Uses AND logic (candidate must have ALL specified skills)
  - Example: `skills=Cooking,English,Fast Food`

#### Search
- **`search`** (string, optional)
  - Search query for candidate name, phone, or interviewer name
  - Example: `search=John Doe`

### Complete Example URLs

```
# All interview_scheduled candidates with priority score sorting
http://localhost:3000/agencies/12345067068/jobs/381ed0d7-5883-4898-a9d6-531aec0c409b/candidates?stage=interview_scheduled&limit=100&offset=0&sort_by=priority_score&sort_order=desc

# Today's interviews only
http://localhost:3000/agencies/12345067068/jobs/381ed0d7-5883-4898-a9d6-531aec0c409b/candidates?stage=interview_scheduled&limit=100&interview_filter=today

# Tomorrow's interviews
http://localhost:3000/agencies/12345067068/jobs/381ed0d7-5883-4898-a9d6-531aec0c409b/candidates?stage=interview_scheduled&limit=100&interview_filter=tomorrow

# Unattended interviews (no-shows)
http://localhost:3000/agencies/12345067068/jobs/381ed0d7-5883-4898-a9d6-531aec0c409b/candidates?stage=interview_scheduled&limit=100&interview_filter=unattended

# This week's interviews
http://localhost:3000/agencies/12345067068/jobs/381ed0d7-5883-4898-a9d6-531aec0c409b/candidates?stage=interview_scheduled&limit=100&date_alias=this_week

# Custom date range
http://localhost:3000/agencies/12345067068/jobs/381ed0d7-5883-4898-a9d6-531aec0c409b/candidates?stage=interview_scheduled&limit=100&date_from=2025-12-21&date_to=2025-12-31

# With skill filtering
http://localhost:3000/agencies/12345067068/jobs/381ed0d7-5883-4898-a9d6-531aec0c409b/candidates?stage=interview_scheduled&limit=100&skills=Cooking,English

# Search by name
http://localhost:3000/agencies/12345067068/jobs/381ed0d7-5883-4898-a9d6-531aec0c409b/candidates?stage=interview_scheduled&limit=100&search=John
```

---

## Endpoint 2: Get Agency Interviews
**URL:** `GET /agencies/:license/interviews`

### Query Parameters

#### Interview Filtering
- **`interview_filter`** (string, optional)
  - Interview date filter
  - Values: `today`, `tomorrow`, `unattended`, `all`
  - Example: `interview_filter=today`

#### Date Range Filtering
- **`date_from`** (string, optional)
  - Start date for custom date range
  - Format: `YYYY-MM-DD`
  - Example: `date_from=2025-12-21`

- **`date_to`** (string, optional)
  - End date for custom date range
  - Format: `YYYY-MM-DD`
  - Example: `date_to=2025-12-21`

#### Pagination
- **`limit`** (number, optional, default: 10)
  - Number of interviews to return
  - Example: `limit=100`

### Complete Example URLs

```
# Today's interviews
http://localhost:3000/agencies/12345067068/interviews?interview_filter=today&limit=100

# Tomorrow's interviews
http://localhost:3000/agencies/12345067068/interviews?interview_filter=tomorrow&limit=100

# Unattended interviews (no-shows)
http://localhost:3000/agencies/12345067068/interviews?interview_filter=unattended&limit=100

# All interviews
http://localhost:3000/agencies/12345067068/interviews?interview_filter=all&limit=100

# Custom date range
http://localhost:3000/agencies/12345067068/interviews?date_from=2025-12-21&date_to=2025-12-21&limit=100
```

---

## Filter Logic Details

### Interview Filter: `unattended`
An interview is considered "unattended" (no-show) when:
- Current time > (interview_time + duration_minutes + 30 minute grace period)
- Example: If interview is at 10:00 AM with 60 minute duration, it's unattended after 10:30 AM + 60 min = 11:30 AM

### Date Alias: Precedence
When both `date_alias` and `date_from`/`date_to` are provided:
- `date_alias` takes precedence
- `date_from`/`date_to` are ignored

### Skills Filter: AND Logic
When multiple skills are provided (comma-separated):
- Candidate must have ALL specified skills
- Example: `skills=Cooking,English,Fast Food` returns only candidates with all three skills

### Search: Multi-field
Search queries match against:
- Candidate full name
- Candidate phone number
- Interviewer name (contact_person)

---

## Testing with Seed Data

### Create Test Candidates
Run the seed script to create test candidates in interview_scheduled status:

```bash
# Create 10 test candidates (001-010)
node seed-interview-test-candidates.js 10 381ed0d7-5883-4898-a9d6-531aec0c409b 12345067068

# Create 50 test candidates (001-050)
node seed-interview-test-candidates.js 50 381ed0d7-5883-4898-a9d6-531aec0c409b 12345067068
```

**Parameters:**
- `count` - Number of test candidates to create (default: 10)
- `jobId` - Job posting ID (default: 381ed0d7-5883-4898-a9d6-531aec0c409b)
- `agencyLicense` - Agency license number (default: 12345067068)

**Features:**
- Creates candidates named "Test Candidate 001", "Test Candidate 002", etc.
- Clones data from existing candidates for consistency
- Distributes interviews across today, tomorrow, and next 7 days
- Varies interview times for realistic testing
- All candidates are in `interview_scheduled` status

---

## Response Format

### Candidates Endpoint Response
```json
{
  "candidates": [
    {
      "id": "candidate-uuid",
      "name": "Test Candidate 001",
      "gender": "Male",
      "priority_score": 85,
      "address": "Kathmandu, Nepal",
      "phone": "+977-9899900001",
      "email": "test@example.com",
      "position": {
        "id": "position-uuid",
        "title": "Cook",
        "salary": {
          "amount": 2500,
          "currency": "AED",
          "converted_amount": 150000,
          "converted_currency": "NPR",
          "conversion_rate": 60.5
        }
      },
      "applied_at": "2025-12-21T10:30:00.000Z",
      "application_id": "application-uuid",
      "status": "interview_scheduled",
      "interview": {
        "id": "interview-uuid",
        "scheduled_at": "2025-12-22T00:00:00.000Z",
        "time": "10:00:00",
        "duration": 60,
        "location": "Test Office",
        "interviewer": "HR Manager"
      }
    }
  ],
  "pagination": {
    "total": 45,
    "limit": 100,
    "offset": 0,
    "has_more": false
  }
}
```

---

## Notes

- All timestamps are in ISO 8601 format (UTC)
- Dates are in `YYYY-MM-DD` format
- Times are in `HH:MM:SS` format
- Pagination is 0-indexed (offset starts at 0)
- Maximum limit is 100 candidates per request
- Interview filter only applies to `interview_scheduled` stage
- Date filters only apply to `interview_scheduled` stage
