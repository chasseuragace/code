# Quick Test Guide - Admin Job API

## ✅ Backend is Running (Docker Dev Mode)

The backend should automatically pick up the new files. Check the Docker logs to confirm:

```bash
# Check if the server restarted and loaded AdminModule
docker logs <container-name> --tail 50
```

Look for:
- ✅ `AdminModule dependencies initialized`
- ✅ `Mapped {/admin/jobs, GET} route`
- ✅ `Mapped {/admin/jobs/statistics/countries, GET} route`

---

## 🧪 Test the API Endpoints

### 1. Check Swagger Documentation

Open: `http://localhost:3000/api-docs`

Look for the **admin** tag. You should see:
- `GET /admin/jobs` - Get job listings for admin panel
- `GET /admin/jobs/statistics/countries` - Get country distribution

### 2. Test with cURL

**Test 1: Get all jobs**
```bash
curl http://localhost:3000/admin/jobs | jq
```

Expected: JSON response with jobs array

**Test 2: Search for "cook"**
```bash
curl "http://localhost:3000/admin/jobs?search=cook" | jq
```

Expected: Only jobs with "cook" in title or company

**Test 3: Filter by country**
```bash
curl "http://localhost:3000/admin/jobs?country=UAE" | jq
```

Expected: Only UAE jobs

**Test 4: Sort by applications**
```bash
curl "http://localhost:3000/admin/jobs?sort_by=applications&order=desc" | jq
```

Expected: Jobs sorted by application count (highest first)

**Test 5: Get country distribution**
```bash
curl http://localhost:3000/admin/jobs/statistics/countries | jq
```

Expected: Object with country names and counts
```json
{
  "UAE": 15,
  "Qatar": 8,
  "Saudi Arabia": 5
}
```

### 3. Test with Browser

**Simple test**:
```
http://localhost:3000/admin/jobs
```

Should return JSON in browser.

---

## 🎨 Test Frontend Integration

### 1. Start Frontend (if not running)
```bash
cd portal/agency_research/code/admin_panel/UdaanSarathi2
npm run dev
```

### 2. Open Jobs Page
```
http://localhost:5173/jobs
```

### 3. Check Browser Console
Open DevTools (F12) → Console

Look for:
- ✅ No errors
- ✅ API calls to `/admin/jobs`
- ✅ API calls to `/admin/jobs/statistics/countries`

### 4. Check Network Tab
Open DevTools (F12) → Network → Filter by "Fetch/XHR"

You should see:
```
GET http://localhost:3000/admin/jobs?search=&country=All%20Countries&sort_by=published_date&order=desc&page=1&limit=1000
Status: 200 OK

GET http://localhost:3000/admin/jobs/statistics/countries
Status: 200 OK
```

### 5. Test Filters

**Search**:
1. Type "cook" in search box
2. Check Network tab for: `GET /admin/jobs?search=cook`
3. Verify only cook jobs display

**Country Filter (Dropdown)**:
1. Select "UAE" from dropdown
2. Check Network tab for: `GET /admin/jobs?country=UAE`
3. Verify only UAE jobs display

**Country Filter (Row)**:
1. Click "UAE (15)" button
2. Check Network tab for: `GET /admin/jobs?country=UAE`
3. Verify dropdown also shows "UAE"

**Sort**:
1. Select "Applications" from sort dropdown
2. Check Network tab for: `GET /admin/jobs?sort_by=applications`
3. Verify jobs with most applications appear first

---

## 🐛 Troubleshooting

### Issue 1: 404 Not Found
**Symptom**: `GET /admin/jobs` returns 404

**Solution**:
```bash
# Check if AdminModule is loaded
docker logs <container-name> | grep AdminModule

# If not found, restart Docker container
docker restart <container-name>
```

### Issue 2: Empty Response
**Symptom**: API returns `{"data": [], "total": 0}`

**Solution**:
```bash
# Check if job_postings table has data
docker exec -it <postgres-container> psql -U postgres -d dbname -c "SELECT COUNT(*) FROM job_postings WHERE is_active = true;"

# If 0, seed some data
curl -X POST http://localhost:3000/jobs/seedv1
```

### Issue 3: Statistics Show 0
**Symptom**: `applications_count`, `shortlisted_count` all show 0

**Solution**:
```bash
# Check if job_applications table has data
docker exec -it <postgres-container> psql -U postgres -d dbname -c "SELECT COUNT(*) FROM job_applications;"

# If 0, you need to create some test applications
# Or the statistics query might need adjustment
```

### Issue 4: CORS Error
**Symptom**: Frontend shows CORS error in console

**Solution**:
Check backend CORS configuration allows `http://localhost:5173`

### Issue 5: TypeScript Compilation Error
**Symptom**: Docker logs show TypeScript errors

**Solution**:
```bash
# Check the specific error in logs
docker logs <container-name> --tail 100

# Common fixes:
# - Missing imports
# - Type mismatches
# - Module not found
```

---

## ✅ Success Criteria

- [ ] Swagger shows admin endpoints
- [ ] `GET /admin/jobs` returns jobs array
- [ ] `GET /admin/jobs/statistics/countries` returns country object
- [ ] Search filter works
- [ ] Country filter works
- [ ] Sort options work
- [ ] Statistics display correctly (applications, shortlisted, interviews)
- [ ] Frontend loads without errors
- [ ] Network tab shows successful API calls
- [ ] Jobs display in UI

---

## 📊 Sample Response

**GET /admin/jobs?limit=2**
```json
{
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "title": "Cook",
      "company": "Al Manara Restaurant",
      "country": "UAE",
      "city": "Dubai",
      "created_at": "2025-08-23T10:30:00.000Z",
      "published_at": "2025-08-25T10:30:00.000Z",
      "salary": "1200 AED",
      "currency": "AED",
      "salary_amount": 1200,
      "applications_count": 45,
      "shortlisted_count": 12,
      "interviews_today": 2,
      "total_interviews": 8,
      "view_count": 0,
      "category": "Cook",
      "tags": ["cooking", "arabic cuisine"],
      "requirements": ["Experience: 2+ years", "Language: Basic English"],
      "description": "Cook",
      "working_hours": "8 hours/day",
      "accommodation": "free",
      "food": "free",
      "visa_status": "Company will provide",
      "contract_duration": "2 years",
      "agency": {
        "id": "agency-uuid",
        "name": "Inspire International",
        "license_number": "LIC-001"
      }
    }
  ],
  "total": 42,
  "page": 1,
  "limit": 2,
  "filters": {
    "search": null,
    "country": null,
    "agency_id": null
  }
}
```

---

## 🎉 Next Steps After Testing

1. **If everything works**:
   - ✅ Mark as complete
   - ✅ Update documentation
   - ✅ Create PR for review

2. **If issues found**:
   - 🐛 Document the issue
   - 🔧 Fix the issue
   - 🧪 Re-test
   - ✅ Verify fix works

3. **Future enhancements**:
   - Add authentication (JWT guard)
   - Add rate limiting
   - Add caching (Redis)
   - Add view tracking
   - Add more filters (date range, salary range)

---

**Last Updated**: 2025-11-26
