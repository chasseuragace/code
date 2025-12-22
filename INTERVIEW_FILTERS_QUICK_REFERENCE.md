# Interview Filters - Quick Reference

## Available Filters Summary

### For `/agencies/:license/jobs/:jobId/candidates` endpoint:

| Filter | Type | Values | Default | Notes |
|--------|------|--------|---------|-------|
| `stage` | required | `applied`, `shortlisted`, `interview_scheduled`, `interview_rescheduled`, `interview_passed`, `interview_failed` | - | Application stage |
| `limit` | optional | 1-100 | 10 | Results per page |
| `offset` | optional | ≥0 | 0 | Pagination offset |
| `sort_by` | optional | `priority_score`, `applied_at`, `name` | `priority_score` | Sort field |
| `sort_order` | optional | `asc`, `desc` | `desc` | Sort direction |
| `interview_filter` | optional* | `today`, `tomorrow`, `unattended`, `all` | `all` | Interview date filter |
| `date_alias` | optional* | `today`, `tomorrow`, `this_week`, `next_week`, `this_month` | - | Quick date filter |
| `date_from` | optional* | YYYY-MM-DD | - | Start date |
| `date_to` | optional* | YYYY-MM-DD | - | End date |
| `skills` | optional | comma-separated | - | AND logic |
| `search` | optional | text | - | Name/phone/interviewer |

*Only for `stage=interview_scheduled`

---

### For `/agencies/:license/interviews` endpoint:

| Filter | Type | Values | Default | Notes |
|--------|------|--------|---------|-------|
| `interview_filter` | optional | `today`, `tomorrow`, `unattended`, `all` | - | Interview date filter |
| `date_from` | optional | YYYY-MM-DD | - | Start date |
| `date_to` | optional | YYYY-MM-DD | - | End date |
| `limit` | optional | number | 10 | Results per page |

---

## Filter Definitions

### `interview_filter` Values:
- **`today`** - Interviews scheduled for today
- **`tomorrow`** - Interviews scheduled for tomorrow  
- **`unattended`** - Interviews past their scheduled time + duration + 30min grace period (no-show)
- **`all`** - All interviews (default)

### `date_alias` Values:
- **`today`** - Today's date
- **`tomorrow`** - Tomorrow's date
- **`this_week`** - Monday to Sunday of current week
- **`next_week`** - Monday to Sunday of next week
- **`this_month`** - 1st to last day of current month

### `sort_by` Values:
- **`priority_score`** - Fitness/priority score (0-100)
- **`applied_at`** - Application date
- **`name`** - Candidate name

### `stage` Values:
- **`applied`** - Initial application
- **`shortlisted`** - Shortlisted candidates
- **`interview_scheduled`** - Interview scheduled
- **`interview_rescheduled`** - Interview rescheduled
- **`interview_passed`** - Interview passed
- **`interview_failed`** - Interview failed

---

## Common Use Cases

### 1. Get all interview_scheduled candidates sorted by priority
```
?stage=interview_scheduled&limit=100&sort_by=priority_score&sort_order=desc
```

### 2. Get today's interviews only
```
?stage=interview_scheduled&interview_filter=today&limit=100
```

### 3. Get unattended interviews (no-shows)
```
?stage=interview_scheduled&interview_filter=unattended&limit=100
```

### 4. Get this week's interviews
```
?stage=interview_scheduled&date_alias=this_week&limit=100
```

### 5. Get custom date range
```
?stage=interview_scheduled&date_from=2025-12-21&date_to=2025-12-31&limit=100
```

### 6. Search by candidate name
```
?stage=interview_scheduled&search=John&limit=100
```

### 7. Filter by skills (AND logic)
```
?stage=interview_scheduled&skills=Cooking,English&limit=100
```

### 8. Combine multiple filters
```
?stage=interview_scheduled&interview_filter=today&skills=Cooking&sort_by=priority_score&sort_order=desc&limit=100
```

---

## Testing with Seed Data

### Create test candidates:
```bash
node seed-interview-test-candidates.js 10 381ed0d7-5883-4898-a9d6-531aec0c409b 12345067068
```

This creates:
- 10 test candidates (Test Candidate 001 - 010)
- All in `interview_scheduled` status
- Interviews distributed across today, tomorrow, and next 7 days
- Varied interview times for realistic testing

---

## Key Points

✅ **`interview_filter` only works with `stage=interview_scheduled`**

✅ **`date_alias` takes precedence over `date_from`/`date_to`**

✅ **`skills` filter uses AND logic** (candidate must have ALL skills)

✅ **`search` matches** candidate name, phone, or interviewer name

✅ **Maximum `limit` is 100** candidates per request

✅ **`unattended` = past scheduled time + duration + 30min grace period**

✅ **All dates in `YYYY-MM-DD` format**

✅ **All times in `HH:MM:SS` format**
