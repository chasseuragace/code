# is_draft Implementation - Quick Testing Guide

**Quick Reference for Testing the Draft Status Feature**

---

## 1. BACKEND VERIFICATION (5 minutes)

### Check Database Schema
```bash
# Verify is_draft column exists in job_postings table
psql -U postgres -d agency_research -c "\d job_postings" | grep is_draft
```

Expected output: `is_draft | boolean | not null default true`

### Check API Endpoints

#### 1.1 Create a Draft Job
```bash
curl -X POST http://localhost:3000/agencies/TEST-LICENSE/job-postings \
  -H "Content-Type: application/json" \
  -d '{
    "posting_title": "Test Draft Job",
    "country": "Nepal",
    "posting_agency": {"name": "Test Agency", "license_number": "TEST-LICENSE"},
    "employer": {"company_name": "Test Company", "country": "Nepal"},
    "contract": {"period_years": 2},
    "positions": [{"title": "Test Position", "vacancies": {"male": 1, "female": 0}, "salary": {"monthly_amount": 50000, "currency": "NPR"}}]
  }'
```

Expected: Job created with `is_draft: true`

#### 1.2 Toggle Draft Status
```bash
# Get the job ID from the response above, then:
curl -X PATCH http://localhost:3000/agencies/TEST-LICENSE/job-postings/{JOB_ID}/toggle-draft \
  -H "Content-Type: application/json" \
  -d '{"is_draft": false}'
```

Expected: `{ "success": true, "is_draft": false, "message": "..." }`

#### 1.3 Verify Filtering in Candidate APIs
```bash
# Search for jobs (should NOT include draft jobs)
curl http://localhost:3000/jobs/search?keyword=test

# Get relevant jobs for candidate (should NOT include draft jobs)
curl http://localhost:3000/candidates/{CANDIDATE_ID}/relevant-jobs
```

Expected: Draft jobs should NOT appear in results

#### 1.4 Verify Admin Panel Shows Drafts
```bash
# Get agency job postings (should include draft jobs)
curl http://localhost:3000/agencies/TEST-LICENSE/job-postings
```

Expected: Draft jobs SHOULD appear in results

---

## 2. FRONTEND VERIFICATION (5 minutes)

### 2.1 Load Job Edit Page
1. Navigate to: `http://localhost:3000/admin/jobs/{JOB_ID}/edit`
2. Look for toggle button in header (next to upload buttons)

### 2.2 Test Toggle Button
1. **Initial State**: Button should show "Publish" (yellow) if job is draft
2. **Click Button**: Status should toggle
3. **Loading State**: Button should show "..." while toggling
4. **Final State**: Button text should change to "Mark as Draft" (blue) after publishing

### 2.3 Test Translations
1. **English**: Button should show "Publish" or "Mark as Draft"
2. **Nepali**: 
   - Draft: "प्रकाशित गर्नुहोस्" (Publish)
   - Published: "ड्राफ्टको रूपमा चिन्हित गर्नुहोस्" (Mark as Draft)

### 2.4 Test Status Badge
1. Look for status badge in title section
2. Should show "Draft" (yellow) or "Published" (blue)
3. Should update when toggle button is clicked

---

## 3. INTEGRATION TEST (10 minutes)

### Step 1: Create Job via Admin Panel
1. Go to Job Management
2. Create new job (should default to draft)
3. Note the job ID

### Step 2: Verify Not Visible in Candidate App
1. Open candidate app
2. Search for the job by title
3. **Expected**: Job should NOT appear

### Step 3: Publish Job via Admin Panel
1. Go back to job edit page
2. Click toggle button to publish
3. Wait for confirmation

### Step 4: Verify Visible in Candidate App
1. Go back to candidate app
2. Search for the job by title
3. **Expected**: Job SHOULD appear now

### Step 5: Unpublish Job
1. Go back to job edit page
2. Click toggle button to mark as draft
3. Wait for confirmation

### Step 6: Verify Hidden Again
1. Go back to candidate app
2. Search for the job by title
3. **Expected**: Job should NOT appear anymore

---

## 4. QUICK CHECKLIST

### Backend
- [ ] `is_draft` column exists in database
- [ ] New jobs default to `is_draft: true`
- [ ] Toggle endpoint works: `PATCH /agencies/:license/job-postings/:id/toggle-draft`
- [ ] Draft jobs excluded from `/jobs/search`
- [ ] Draft jobs excluded from `/candidates/:id/relevant-jobs`
- [ ] Draft jobs excluded from `/candidates/:id/relevant-jobs/grouped`
- [ ] Draft jobs excluded from `/candidates/:id/relevant-jobs/by-title`
- [ ] Draft jobs INCLUDED in `/agencies/:license/job-postings`
- [ ] Audit log records toggle action

### Frontend
- [ ] Toggle button visible in job edit page header
- [ ] Button text changes based on draft status
- [ ] Button shows "..." while toggling
- [ ] Status badge displays and updates
- [ ] English translations work
- [ ] Nepali translations work
- [ ] Toggle action updates UI immediately

### Integration
- [ ] Draft jobs don't appear in candidate app
- [ ] Published jobs appear in candidate app
- [ ] Toggle works bidirectionally
- [ ] No errors in console

---

## 5. TROUBLESHOOTING

### Button Not Showing
- Check if `jobData.is_draft` is being loaded from API
- Verify `getEditableJobDetails()` includes `is_draft` field
- Check browser console for errors

### Translations Not Working
- Verify translation files exist in `public/translations/`
- Check if language is set correctly in localStorage
- Verify `tPageSync()` is being called correctly

### Toggle Not Working
- Check if API endpoint is accessible
- Verify license is correct in localStorage
- Check browser network tab for API errors
- Verify job ID is correct

### Filtering Not Working
- Verify `is_draft` filter is in query builder
- Check if jobs are actually being created with `is_draft: true`
- Verify candidate API is calling correct service method

---

## 6. EXPECTED BEHAVIOR

### Draft Job Lifecycle
1. **Created**: `is_draft: true` (not visible to candidates)
2. **Published**: `is_draft: false` (visible to candidates)
3. **Unpublished**: `is_draft: true` (hidden from candidates again)

### Admin Panel
- Always shows all jobs (draft and published)
- Can toggle status at any time
- Status updates immediately in UI

### Candidate App
- Only sees published jobs (`is_draft: false`)
- Draft jobs are completely hidden
- No indication that draft jobs exist

---

## 7. PERFORMANCE NOTES

- Toggle operation is fast (single UPDATE query)
- Filtering adds minimal overhead (single WHERE clause)
- No N+1 queries introduced
- Audit logging is asynchronous

---

## 8. ROLLBACK PLAN (If Needed)

If issues arise:
1. Remove `is_draft` filter from `getRelevantJobs()` in `candidate.service.ts`
2. Remove `is_draft` filter from `searchJobsByKeyword()` in `domain.service.ts`
3. Hide toggle button in frontend (comment out button code)
4. All data remains intact (column still exists)

---

## Quick Commands

```bash
# Check if column exists
psql -U postgres -d agency_research -c "SELECT column_name FROM information_schema.columns WHERE table_name='job_postings' AND column_name='is_draft';"

# Count draft vs published jobs
psql -U postgres -d agency_research -c "SELECT is_draft, COUNT(*) FROM job_postings GROUP BY is_draft;"

# View recent toggle actions in audit log
psql -U postgres -d agency_research -c "SELECT * FROM audit_logs WHERE action='TOGGLE_JOB_POSTING_DRAFT' ORDER BY created_at DESC LIMIT 10;"
```

---

**Status**: Ready for testing ✅

