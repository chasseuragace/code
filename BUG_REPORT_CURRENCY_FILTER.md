# Bug Report: Currency Filter Not Working Independently

## Issue Summary
The `currency` filter parameter is **NOT working** when used alone without salary filters (`min_salary` or `max_salary`). When only `currency=AED` is provided, jobs with other currencies (e.g., USD) are still returned.

## Severity
🔴 **HIGH** - Filter produces incorrect results

## Affected Endpoint
`GET /jobs/search`

## Root Cause
In `src/modules/domain/domain.service.ts` (lines 954-959), the currency filter is only applied when `min_salary` or `max_salary` is present:

```typescript
if (min_salary && currency) {
  qb.andWhere('positions.monthly_salary_amount >= :min_salary AND positions.salary_currency = :currency', { min_salary, currency });
}
if (max_salary && currency) {
  qb.andWhere('positions.monthly_salary_amount <= :max_salary AND positions.salary_currency = :currency', { max_salary, currency });
}
```

**Problem:** There's no standalone currency filter. The currency parameter is only used in conjunction with salary filters.

## Test Results

### Test Case 1: Currency Filter Alone
**Request:** `GET /jobs/search?currency=AED`

**Expected:** Only jobs with AED currency positions

**Actual:** Returns jobs with both AED and USD positions

```json
{
  "data": [
    {
      "posting_title": "Job A",
      "positions": [
        {
          "title": "TBD - Position Title",
          "salary": {
            "currency": "USD",  // ❌ Should not be here!
            "monthly_amount": 500
          }
        }
      ]
    }
  ]
}
```

### Test Case 2: Currency Filter with Min Salary
**Request:** `GET /jobs/search?currency=AED&min_salary=2600`

**Expected:** Only jobs with AED currency AND salary >= 2600

**Actual:** ✅ Works correctly (currency filter applied because min_salary is present)

```json
{
  "data": [
    {
      "positions": [
        {
          "salary": {
            "currency": "AED",  // ✅ Correct
            "monthly_amount": 2600
          }
        }
      ]
    }
  ]
}
```

## Database Evidence

**All jobs in database:**
```
Currency Distribution:
- AED: 132 positions
- USD: 1 position
```

**With `currency=AED` filter:**
```
Returned: 68 jobs
Currency Distribution in Results:
- AED: 132 positions
- USD: 1 position  ❌ Should be 0!
```

**With `currency=AED&min_salary=2600` filter:**
```
Returned: 66 jobs
Currency Distribution in Results:
- AED: 132 positions
- USD: 0 positions  ✅ Correct!
```

## Impact
- Users cannot filter jobs by currency alone
- Currency filter only works as a side effect of salary filtering
- API documentation suggests currency filter works independently, but it doesn't

## Solution

Add a standalone currency filter in the query builder:

```typescript
// Add this after the country filter
if (currency) {
  qb.andWhere('positions.salary_currency = :currency', { currency });
}

// Keep existing salary filters
if (min_salary && currency) {
  qb.andWhere('positions.monthly_salary_amount >= :min_salary AND positions.salary_currency = :currency', { min_salary, currency });
}
if (max_salary && currency) {
  qb.andWhere('positions.monthly_salary_amount <= :max_salary AND positions.salary_currency = :currency', { max_salary, currency });
}
```

Or better yet, refactor to:

```typescript
// Apply currency filter independently
if (currency) {
  qb.andWhere('positions.salary_currency = :currency', { currency });
}

// Apply salary filters independently
if (min_salary) {
  qb.andWhere('positions.monthly_salary_amount >= :min_salary', { min_salary });
}
if (max_salary) {
  qb.andWhere('positions.monthly_salary_amount <= :max_salary', { max_salary });
}
```

## Files to Modify
- `src/modules/domain/domain.service.ts` (lines 954-959)

## Testing After Fix

```bash
# Should return only AED jobs
curl "http://192.168.1.128:3000/jobs/search?currency=AED"

# Should return only USD jobs
curl "http://192.168.1.128:3000/jobs/search?currency=USD"

# Should return AED jobs with salary >= 2600
curl "http://192.168.1.128:3000/jobs/search?currency=AED&min_salary=2600"
```

## Additional Issues Found

### Issue 2: Country Filter Returns All Jobs
**Request:** `GET /jobs/search?country=France`

**Expected:** Only jobs with country = "France"

**Actual:** Returns all 68 jobs (all happen to be France, so this works by coincidence)

**Note:** This works correctly but only because all jobs in the database are from France. If there were jobs from other countries, this would fail.

### Issue 3: Keyword Filter May Have False Positives
**Request:** `GET /jobs/search?keyword=Job`

**Expected:** Only jobs containing "Job" in searchable fields

**Actual:** Returns all 68 jobs (all happen to contain "Job")

**Note:** This works correctly but only because all jobs contain "Job" in the title. Need to test with a keyword that doesn't match all jobs.

## Recommendations

1. **Fix the currency filter immediately** - This is a clear bug
2. **Add more diverse test data** - Current data doesn't catch these issues
3. **Add validation** - Ensure filters actually exclude unwanted results
4. **Update API documentation** - Clarify which filters work independently vs. together

## Status
🔴 **OPEN** - Awaiting fix
