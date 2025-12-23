# Currency Filter Bug - Fix Implementation

## Problem
The `currency` filter parameter does not work independently. It only functions when combined with salary filters.

## Root Cause
In `src/modules/domain/domain.service.ts` (lines 954-959), the currency filter is only applied when `min_salary` or `max_salary` is present.

## Current Code (BROKEN)
```typescript
// Other filters
if (country) qb.andWhere('jp.country ILIKE :country', { country: `%${country}%` });
if (min_salary && currency) {
  qb.andWhere('positions.monthly_salary_amount >= :min_salary AND positions.salary_currency = :currency', { min_salary, currency });
}
if (max_salary && currency) {
  qb.andWhere('positions.monthly_salary_amount <= :max_salary AND positions.salary_currency = :currency', { max_salary, currency });
}
```

**Problem:** Currency filter only applied when salary filters are present.

## Fixed Code (SOLUTION)

### Option 1: Add Standalone Currency Filter (Recommended)

```typescript
// Other filters
if (country) qb.andWhere('jp.country ILIKE :country', { country: `%${country}%` });

// Add standalone currency filter
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

**Advantages:**
- Currency filter works independently
- Salary filters work independently
- All combinations work correctly
- Cleaner logic

### Option 2: Keep Combined Logic (Alternative)

```typescript
// Other filters
if (country) qb.andWhere('jp.country ILIKE :country', { country: `%${country}%` });

// Apply currency filter independently
if (currency) {
  qb.andWhere('positions.salary_currency = :currency', { currency });
}

// Apply salary filters with currency if present
if (min_salary && currency) {
  qb.andWhere('positions.monthly_salary_amount >= :min_salary AND positions.salary_currency = :currency', { min_salary, currency });
}
if (max_salary && currency) {
  qb.andWhere('positions.monthly_salary_amount <= :max_salary AND positions.salary_currency = :currency', { max_salary, currency });
}
```

**Note:** This is redundant - Option 1 is better.

## Implementation Steps

1. Open `src/modules/domain/domain.service.ts`
2. Locate the `searchJobsByKeyword` method (around line 908)
3. Find the filter section (around lines 954-959)
4. Replace with Option 1 code above
5. Save the file

## Testing After Fix

### Test 1: Currency Filter Alone
```bash
curl "http://192.168.1.128:3000/jobs/search?currency=AED"
```
**Expected:** Only AED jobs returned

### Test 2: Currency Filter with Min Salary
```bash
curl "http://192.168.1.128:3000/jobs/search?currency=AED&min_salary=2600"
```
**Expected:** Only AED jobs with salary >= 2600

### Test 3: Currency Filter with Max Salary
```bash
curl "http://192.168.1.128:3000/jobs/search?currency=AED&max_salary=2700"
```
**Expected:** Only AED jobs with salary <= 2700

### Test 4: Currency Filter with Salary Range
```bash
curl "http://192.168.1.128:3000/jobs/search?currency=AED&min_salary=2600&max_salary=2700"
```
**Expected:** Only AED jobs with salary between 2600-2700

### Test 5: Min Salary Without Currency
```bash
curl "http://192.168.1.128:3000/jobs/search?min_salary=2600"
```
**Expected:** All jobs with salary >= 2600 (any currency)

### Test 6: Max Salary Without Currency
```bash
curl "http://192.168.1.128:3000/jobs/search?max_salary=2700"
```
**Expected:** All jobs with salary <= 2700 (any currency)

## Verification Script

```bash
#!/bin/bash

BASE_URL="http://192.168.1.128:3000"

echo "Testing currency filter fix..."

# Test 1: Currency alone
echo -e "\n1. Currency=AED (should have 0 USD):"
curl -s "$BASE_URL/jobs/search?currency=AED&page=1&limit=100" | jq '[.data[] | .positions[] | select(.salary.currency != "AED")] | length'

# Test 2: Currency with min salary
echo -e "\n2. Currency=AED&min_salary=2600 (should have 0 USD):"
curl -s "$BASE_URL/jobs/search?currency=AED&min_salary=2600&page=1&limit=100" | jq '[.data[] | .positions[] | select(.salary.currency != "AED")] | length'

# Test 3: Min salary without currency
echo -e "\n3. Min_salary=2600 (should have jobs with any currency):"
curl -s "$BASE_URL/jobs/search?min_salary=2600&page=1&limit=100" | jq '.data | length'

echo -e "\nAll tests should show 0 for USD positions in currency-filtered results."
```

## Expected Results After Fix

| Test | Before Fix | After Fix |
|------|-----------|-----------|
| `currency=AED` | Returns USD jobs ❌ | Returns only AED ✅ |
| `currency=AED&min_salary=2600` | Works ✅ | Works ✅ |
| `min_salary=2600` | Works ✅ | Works ✅ |
| `currency=USD` | Returns AED jobs ❌ | Returns only USD ✅ |

## Files Modified
- `src/modules/domain/domain.service.ts` (lines 954-959)

## Deployment Checklist
- [ ] Code reviewed
- [ ] Fix implemented
- [ ] Tests passed
- [ ] No regressions
- [ ] Documentation updated
- [ ] Deployed to production

## Related Issues
- See: `BUG_REPORT_CURRENCY_FILTER.md`
- See: `RIGOROUS_FILTER_TEST_RESULTS.md`
