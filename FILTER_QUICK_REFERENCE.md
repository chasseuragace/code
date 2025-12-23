# API Filters Quick Reference

## Job Search API - `/jobs/search`

### Basic Usage
```
GET /jobs/search?keyword=electrician&country=UAE&page=1&limit=10
```

### All Parameters

| Parameter | Example | Notes |
|-----------|---------|-------|
| `keyword` | `electrician` | Searches: title, position, employer, agency |
| `country` | `UAE` | Case-insensitive |
| `min_salary` | `2000` | **Requires `currency`** |
| `max_salary` | `5000` | **Requires `currency`** |
| `currency` | `AED` | AED, USD, NPR, QAR, SAR, KWD, BHD, OMR |
| `page` | `1` | Default: 1 |
| `limit` | `10` | Default: 10, Max: 100 |
| `sort_by` | `posted_at` | `posted_at`, `salary`, `relevance` |
| `order` | `desc` | `asc` or `desc` |

### Example Queries

**Search by keyword:**
```
/jobs/search?keyword=electrician
```

**Filter by country and salary:**
```
/jobs/search?country=UAE&min_salary=2000&max_salary=5000&currency=AED
```

**Sort by salary ascending:**
```
/jobs/search?sort_by=salary&order=asc&currency=AED
```

**Pagination:**
```
/jobs/search?page=2&limit=20
```

**Combined filters:**
```
/jobs/search?keyword=electrician&country=UAE&min_salary=2000&currency=AED&sort_by=salary&order=desc&page=1&limit=10
```

---

## Agency Search API - `/agencies/search`

### Basic Usage
```
GET /agencies/search?keyword=tech&page=1&limit=10
```

### All Parameters

| Parameter | Example | Notes |
|-----------|---------|-------|
| `keyword` | `tech` | Searches: name, license, description, location, specializations |
| `page` | `1` | Default: 1 |
| `limit` | `10` | Default: 10, Max: 100 |
| `sortBy` | `name` | `name`, `country`, `city`, `created_at` |
| `sortOrder` | `asc` | `asc` or `desc` |

### Example Queries

**Search by keyword:**
```
/agencies/search?keyword=manpower
```

**Sort by name:**
```
/agencies/search?sortBy=name&sortOrder=asc
```

**Sort by creation date (newest first):**
```
/agencies/search?sortBy=created_at&sortOrder=desc
```

**Pagination:**
```
/agencies/search?page=2&limit=20
```

**Combined filters:**
```
/agencies/search?keyword=nepal&sortBy=created_at&sortOrder=desc&page=1&limit=10
```

---

## Filter Behavior

### Job Search Filters

✅ **Working Correctly:**
- Keyword search across multiple fields
- Country filtering (case-insensitive)
- Salary range filtering (with currency)
- Sorting by posted date, salary, relevance
- Pagination

⚠️ **Important Notes:**
- Salary filters (`min_salary`, `max_salary`) **require** the `currency` parameter
- Without currency, salary filters are silently ignored
- Only returns published jobs (`is_draft = false`)
- Only returns active jobs (`is_active = true`)

### Agency Search Filters

✅ **Working Correctly:**
- Keyword search across name, license, description, location, specializations
- Sorting by name, country, city, created_at
- Pagination
- Only returns active agencies (`is_active = true`)

---

## Response Format

### Job Search Response
```json
{
  "data": [
    {
      "id": "uuid",
      "posting_title": "Senior Electrician",
      "country": "UAE",
      "city": "Dubai",
      "posting_date_ad": "2024-01-15T10:30:00Z",
      "employer": {
        "company_name": "ACME Corp",
        "country": "UAE",
        "city": "Dubai"
      },
      "agency": {
        "name": "ElectroTech Agency",
        "license_number": "LIC-001"
      },
      "positions": [
        {
          "title": "Electrician",
          "vacancies": { "male": 3, "female": 1, "total": 4 },
          "salary": {
            "monthly_amount": 2500,
            "currency": "AED",
            "converted": [
              { "amount": 680, "currency": "USD" },
              { "amount": 90000, "currency": "NPR" }
            ]
          }
        }
      ]
    }
  ],
  "total": 42,
  "page": 1,
  "limit": 10,
  "search": {
    "keyword": "electrician",
    "filters": {
      "country": "UAE",
      "min_salary": 2000,
      "max_salary": null,
      "currency": "AED"
    }
  }
}
```

### Agency Search Response
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "ElectroTech Agency",
      "license_number": "LIC-001",
      "logo_url": "https://...",
      "description": "Leading recruitment agency...",
      "city": "Dubai",
      "country": "UAE",
      "website": "https://...",
      "is_active": true,
      "created_at": "2023-10-31T12:00:00.000Z",
      "specializations": ["Electrical", "Construction"],
      "job_posting_count": 5
    }
  ],
  "meta": {
    "total": 42,
    "page": 1,
    "limit": 10,
    "totalPages": 5
  }
}
```

---

## Common Issues & Solutions

### Issue: Salary filters return no results
**Solution:** Make sure you include the `currency` parameter
```
❌ /jobs/search?min_salary=2000
✅ /jobs/search?min_salary=2000&currency=AED
```

### Issue: No results for valid search
**Solution:** Check if jobs are published (not in draft)
- Jobs must have `is_draft = false` and `is_active = true`

### Issue: Sorting not working
**Solution:** Use correct sort field names
```
❌ /jobs/search?sort_by=date
✅ /jobs/search?sort_by=posted_at
```

### Issue: Pagination returns empty
**Solution:** Check if page number exceeds total pages
```
GET /jobs/search?page=1&limit=10  // Check total in response
GET /jobs/search?page=2&limit=10  // Make sure page <= totalPages
```

---

## Performance Tips

1. **Use pagination:** Always use `limit` to avoid large responses
2. **Be specific with keywords:** More specific searches are faster
3. **Combine filters:** Use multiple filters to narrow results
4. **Sort efficiently:** Avoid sorting by relevance for large datasets

---

## Testing the Filters

### Using cURL

**Job Search:**
```bash
curl "http://192.168.1.128:3000/jobs/search?keyword=electrician&country=UAE&page=1&limit=10"
```

**Agency Search:**
```bash
curl "http://192.168.1.128:3000/agencies/search?keyword=tech&page=1&limit=10"
```

### Using JavaScript/Fetch

```javascript
// Job Search
const response = await fetch(
  '/jobs/search?keyword=electrician&country=UAE&page=1&limit=10'
);
const data = await response.json();

// Agency Search
const response = await fetch(
  '/agencies/search?keyword=tech&page=1&limit=10'
);
const data = await response.json();
```

---

## Status Summary

| API | Filters | Status |
|-----|---------|--------|
| Job Search | All | ✅ Working |
| Agency Search | All | ✅ Working |

**Last Tested:** December 22, 2025
