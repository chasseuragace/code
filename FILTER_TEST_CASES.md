# Filter Test Cases & cURL Commands

## Job Search API Test Cases

### Test Case 1: Basic Keyword Search
**Endpoint:** `GET /jobs/search`  
**Purpose:** Verify keyword search works across multiple fields

**cURL Command:**
```bash
curl -X GET "http://192.168.1.128:3000/jobs/search?keyword=Job&page=1&limit=2" \
  -H "Content-Type: application/json"
```

**Expected Result:**
- Status: 200 OK
- Returns jobs with "Job" in title, position, employer, or agency name
- Response includes pagination metadata

**Actual Result:** ✅ PASS
```json
{
  "data": [
    {
      "posting_title": "Job A",
      "id": "381ed0d7-5883-4898-a9d6-531aec0c409b"
    },
    {
      "posting_title": "Seed Job 101",
      "id": "b57b44e4-d99c-4155-b085-c5d0b817cd59"
    }
  ],
  "total": 45,
  "page": 1,
  "limit": 2
}
```

---

### Test Case 2: Country Filter
**Endpoint:** `GET /jobs/search`  
**Purpose:** Verify country filtering works (case-insensitive)

**cURL Command:**
```bash
curl -X GET "http://192.168.1.128:3000/jobs/search?country=France&page=1&limit=5" \
  -H "Content-Type: application/json"
```

**Expected Result:**
- Status: 200 OK
- All returned jobs have country = "France"
- Case-insensitive matching works

**Actual Result:** ✅ PASS
```json
{
  "data": [
    {
      "country": "France",
      "posting_title": "Seed Job 101"
    }
  ],
  "total": 44,
  "page": 1,
  "limit": 5
}
```

---

### Test Case 3: Minimum Salary Filter
**Endpoint:** `GET /jobs/search`  
**Purpose:** Verify min_salary filter works with currency

**cURL Command:**
```bash
curl -X GET "http://192.168.1.128:3000/jobs/search?min_salary=2500&currency=AED&page=1&limit=5" \
  -H "Content-Type: application/json"
```

**Expected Result:**
- Status: 200 OK
- All positions have salary >= 2500 AED
- Salary conversions included in response

**Actual Result:** ✅ PASS
```json
{
  "data": [
    {
      "positions": [
        {
          "salary": {
            "monthly_amount": 2600,
            "currency": "AED",
            "converted": [
              { "amount": 93600, "currency": "NPR" },
              { "amount": 704, "currency": "USD" }
            ]
          }
        }
      ]
    }
  ],
  "total": 22,
  "page": 1,
  "limit": 5
}
```

---

### Test Case 4: Maximum Salary Filter
**Endpoint:** `GET /jobs/search`  
**Purpose:** Verify max_salary filter works with currency

**cURL Command:**
```bash
curl -X GET "http://192.168.1.128:3000/jobs/search?max_salary=2700&currency=AED&page=1&limit=5" \
  -H "Content-Type: application/json"
```

**Expected Result:**
- Status: 200 OK
- All positions have salary <= 2700 AED
- Salary conversions included

**Actual Result:** ✅ PASS
```json
{
  "data": [
    {
      "positions": [
        {
          "salary": {
            "monthly_amount": 2600,
            "currency": "AED"
          }
        }
      ]
    }
  ],
  "total": 22,
  "page": 1,
  "limit": 5
}
```

---

### Test Case 5: Salary Range Filter
**Endpoint:** `GET /jobs/search`  
**Purpose:** Verify both min and max salary filters work together

**cURL Command:**
```bash
curl -X GET "http://192.168.1.128:3000/jobs/search?min_salary=2600&max_salary=2700&currency=AED&page=1&limit=5" \
  -H "Content-Type: application/json"
```

**Expected Result:**
- Status: 200 OK
- All positions have 2600 <= salary <= 2700 AED
- Both filters applied correctly

**Actual Result:** ✅ PASS
```json
{
  "data": [
    {
      "positions": [
        {
          "salary": {
            "monthly_amount": 2600,
            "currency": "AED"
          }
        }
      ]
    }
  ],
  "total": 22,
  "page": 1,
  "limit": 5
}
```

---

### Test Case 6: Combined Filters
**Endpoint:** `GET /jobs/search`  
**Purpose:** Verify multiple filters work together

**cURL Command:**
```bash
curl -X GET "http://192.168.1.128:3000/jobs/search?keyword=Job&country=France&min_salary=2600&currency=AED&page=1&limit=5" \
  -H "Content-Type: application/json"
```

**Expected Result:**
- Status: 200 OK
- Results match ALL criteria:
  - Keyword contains "Job"
  - Country is "France"
  - Salary >= 2600 AED

**Actual Result:** ✅ PASS
```json
{
  "data": [
    {
      "posting_title": "Seed Job 203",
      "country": "France",
      "positions": [
        {
          "salary": {
            "monthly_amount": 2600,
            "currency": "AED"
          }
        }
      ]
    }
  ],
  "total": 22,
  "page": 1,
  "limit": 5
}
```

---

### Test Case 7: Sort by Posted Date (Descending)
**Endpoint:** `GET /jobs/search`  
**Purpose:** Verify sorting by posted_at in descending order

**cURL Command:**
```bash
curl -X GET "http://192.168.1.128:3000/jobs/search?sort_by=posted_at&order=desc&page=1&limit=3" \
  -H "Content-Type: application/json"
```

**Expected Result:**
- Status: 200 OK
- Jobs sorted by posting_date_ad in descending order
- Most recent jobs first

**Actual Result:** ✅ PASS
```json
{
  "data": [
    {
      "posting_date_ad": "2025-12-22",
      "posting_title": "Job A"
    },
    {
      "posting_date_ad": "2025-12-22",
      "posting_title": "Seed Job 101"
    },
    {
      "posting_date_ad": "2025-12-22",
      "posting_title": "Seed Job 102"
    }
  ]
}
```

---

### Test Case 8: Sort by Posted Date (Ascending)
**Endpoint:** `GET /jobs/search`  
**Purpose:** Verify sorting by posted_at in ascending order

**cURL Command:**
```bash
curl -X GET "http://192.168.1.128:3000/jobs/search?sort_by=posted_at&order=asc&page=1&limit=3" \
  -H "Content-Type: application/json"
```

**Expected Result:**
- Status: 200 OK
- Jobs sorted by posting_date_ad in ascending order
- Oldest jobs first

**Actual Result:** ✅ PASS

---

### Test Case 9: Sort by Salary (Ascending)
**Endpoint:** `GET /jobs/search`  
**Purpose:** Verify sorting by salary in ascending order

**cURL Command:**
```bash
curl -X GET "http://192.168.1.128:3000/jobs/search?sort_by=salary&order=asc&currency=AED&page=1&limit=3" \
  -H "Content-Type: application/json"
```

**Expected Result:**
- Status: 200 OK
- Jobs sorted by salary in ascending order
- Lowest salaries first

**Actual Result:** ✅ PASS
```json
{
  "data": [
    {
      "positions": [
        {
          "salary": {
            "monthly_amount": 2600,
            "currency": "AED"
          }
        }
      ]
    },
    {
      "positions": [
        {
          "salary": {
            "monthly_amount": 2600,
            "currency": "AED"
          }
        }
      ]
    },
    {
      "positions": [
        {
          "salary": null
        }
      ]
    }
  ]
}
```

---

### Test Case 10: Sort by Salary (Descending)
**Endpoint:** `GET /jobs/search`  
**Purpose:** Verify sorting by salary in descending order

**cURL Command:**
```bash
curl -X GET "http://192.168.1.128:3000/jobs/search?sort_by=salary&order=desc&currency=AED&page=1&limit=3" \
  -H "Content-Type: application/json"
```

**Expected Result:**
- Status: 200 OK
- Jobs sorted by salary in descending order
- Highest salaries first

**Actual Result:** ✅ PASS

---

### Test Case 11: Pagination - Page 1
**Endpoint:** `GET /jobs/search`  
**Purpose:** Verify pagination returns correct page 1

**cURL Command:**
```bash
curl -X GET "http://192.168.1.128:3000/jobs/search?page=1&limit=2" \
  -H "Content-Type: application/json"
```

**Expected Result:**
- Status: 200 OK
- Returns 2 items
- Metadata shows: page=1, limit=2

**Actual Result:** ✅ PASS

---

### Test Case 12: Pagination - Page 2
**Endpoint:** `GET /jobs/search`  
**Purpose:** Verify pagination returns correct page 2

**cURL Command:**
```bash
curl -X GET "http://192.168.1.128:3000/jobs/search?page=2&limit=2" \
  -H "Content-Type: application/json"
```

**Expected Result:**
- Status: 200 OK
- Returns different items than page 1
- Metadata shows: page=2, limit=2

**Actual Result:** ✅ PASS

---

### Test Case 13: Salary Filter Without Currency (Edge Case)
**Endpoint:** `GET /jobs/search`  
**Purpose:** Verify behavior when salary filter provided without currency

**cURL Command:**
```bash
curl -X GET "http://192.168.1.128:3000/jobs/search?min_salary=2500&page=1&limit=5" \
  -H "Content-Type: application/json"
```

**Expected Result:**
- Status: 200 OK
- Salary filter is silently ignored
- Returns all jobs (no salary filtering)

**Actual Result:** ✅ PASS (Salary filter ignored as expected)

---

## Agency Search API Test Cases

### Test Case 1: Basic Keyword Search
**Endpoint:** `GET /agencies/search`  
**Purpose:** Verify keyword search works

**cURL Command:**
```bash
curl -X GET "http://192.168.1.128:3000/agencies/search?keyword=Suresh&page=1&limit=3" \
  -H "Content-Type: application/json"
```

**Expected Result:**
- Status: 200 OK
- Returns agencies matching "Suresh"
- Includes job_posting_count

**Actual Result:** ✅ PASS
```json
{
  "data": [
    {
      "name": "Suresh Manpower Services Pvt. Ltd.",
      "license_number": "12345067068",
      "country": "Nepal",
      "city": "Kathmandu",
      "job_posting_count": 1
    }
  ],
  "meta": {
    "total": 1,
    "page": 1,
    "limit": 3,
    "totalPages": 1
  }
}
```

---

### Test Case 2: Keyword Search - Location
**Endpoint:** `GET /agencies/search`  
**Purpose:** Verify keyword search works for location

**cURL Command:**
```bash
curl -X GET "http://192.168.1.128:3000/agencies/search?keyword=Nepal&page=1&limit=5" \
  -H "Content-Type: application/json"
```

**Expected Result:**
- Status: 200 OK
- Returns agencies with "Nepal" in country or city
- Multiple results expected

**Actual Result:** ✅ PASS
```json
{
  "data": [
    {
      "country": "Nepal",
      "city": "Kathmandu"
    },
    {
      "country": "Nepal",
      "city": "Kathmandu"
    },
    {
      "country": "Nepal",
      "city": "Kathmandu"
    }
  ],
  "meta": {
    "total": 3,
    "page": 1,
    "limit": 5,
    "totalPages": 1
  }
}
```

---

### Test Case 3: Sort by Name (Ascending)
**Endpoint:** `GET /agencies/search`  
**Purpose:** Verify sorting by name in ascending order

**cURL Command:**
```bash
curl -X GET "http://192.168.1.128:3000/agencies/search?sortBy=name&sortOrder=asc&page=1&limit=5" \
  -H "Content-Type: application/json"
```

**Expected Result:**
- Status: 200 OK
- Agencies sorted alphabetically by name
- Ascending order

**Actual Result:** ✅ PASS

---

### Test Case 4: Sort by Name (Descending)
**Endpoint:** `GET /agencies/search`  
**Purpose:** Verify sorting by name in descending order

**cURL Command:**
```bash
curl -X GET "http://192.168.1.128:3000/agencies/search?sortBy=name&sortOrder=desc&page=1&limit=5" \
  -H "Content-Type: application/json"
```

**Expected Result:**
- Status: 200 OK
- Agencies sorted alphabetically by name
- Descending order

**Actual Result:** ✅ PASS

---

### Test Case 5: Sort by Country
**Endpoint:** `GET /agencies/search`  
**Purpose:** Verify sorting by country

**cURL Command:**
```bash
curl -X GET "http://192.168.1.128:3000/agencies/search?sortBy=country&sortOrder=asc&page=1&limit=5" \
  -H "Content-Type: application/json"
```

**Expected Result:**
- Status: 200 OK
- Agencies sorted by country

**Actual Result:** ✅ PASS

---

### Test Case 6: Sort by City
**Endpoint:** `GET /agencies/search`  
**Purpose:** Verify sorting by city

**cURL Command:**
```bash
curl -X GET "http://192.168.1.128:3000/agencies/search?sortBy=city&sortOrder=asc&page=1&limit=5" \
  -H "Content-Type: application/json"
```

**Expected Result:**
- Status: 200 OK
- Agencies sorted by city

**Actual Result:** ✅ PASS

---

### Test Case 7: Sort by Created Date (Descending)
**Endpoint:** `GET /agencies/search`  
**Purpose:** Verify sorting by creation date (newest first)

**cURL Command:**
```bash
curl -X GET "http://192.168.1.128:3000/agencies/search?sortBy=created_at&sortOrder=desc&page=1&limit=5" \
  -H "Content-Type: application/json"
```

**Expected Result:**
- Status: 200 OK
- Agencies sorted by created_at in descending order
- Newest agencies first

**Actual Result:** ✅ PASS
```json
{
  "data": [
    {
      "created_at": "2025-12-22T06:15:03.631Z"
    },
    {
      "created_at": "2025-12-22T06:15:03.620Z"
    },
    {
      "created_at": "2025-12-22T06:11:56.841Z"
    }
  ]
}
```

---

### Test Case 8: Sort by Created Date (Ascending)
**Endpoint:** `GET /agencies/search`  
**Purpose:** Verify sorting by creation date (oldest first)

**cURL Command:**
```bash
curl -X GET "http://192.168.1.128:3000/agencies/search?sortBy=created_at&sortOrder=asc&page=1&limit=5" \
  -H "Content-Type: application/json"
```

**Expected Result:**
- Status: 200 OK
- Agencies sorted by created_at in ascending order
- Oldest agencies first

**Actual Result:** ✅ PASS

---

### Test Case 9: Pagination - Page 1
**Endpoint:** `GET /agencies/search`  
**Purpose:** Verify pagination returns correct page 1

**cURL Command:**
```bash
curl -X GET "http://192.168.1.128:3000/agencies/search?page=1&limit=3" \
  -H "Content-Type: application/json"
```

**Expected Result:**
- Status: 200 OK
- Returns 3 items
- Metadata shows: page=1, limit=3

**Actual Result:** ✅ PASS

---

### Test Case 10: Pagination - Page 2
**Endpoint:** `GET /agencies/search`  
**Purpose:** Verify pagination returns correct page 2

**cURL Command:**
```bash
curl -X GET "http://192.168.1.128:3000/agencies/search?page=2&limit=3" \
  -H "Content-Type: application/json"
```

**Expected Result:**
- Status: 200 OK
- Returns different items than page 1
- Metadata shows: page=2, limit=3

**Actual Result:** ✅ PASS

---

### Test Case 11: Combined Filters
**Endpoint:** `GET /agencies/search`  
**Purpose:** Verify multiple filters work together

**cURL Command:**
```bash
curl -X GET "http://192.168.1.128:3000/agencies/search?keyword=Nepal&sortBy=name&sortOrder=asc&page=1&limit=5" \
  -H "Content-Type: application/json"
```

**Expected Result:**
- Status: 200 OK
- Results match keyword filter
- Results sorted by name ascending

**Actual Result:** ✅ PASS

---

## Summary

**Total Test Cases:** 21
- Job Search API: 13 tests
- Agency Search API: 8 tests

**Pass Rate:** 100% (21/21)

**Status:** ✅ ALL TESTS PASSED

All filters are working correctly and appropriately.
