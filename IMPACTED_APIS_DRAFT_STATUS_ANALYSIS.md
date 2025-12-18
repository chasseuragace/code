# Impacted APIs - Draft Status (is_draft) Analysis

## Executive Summary
With the addition of the `is_draft` field to job postings, **listing, search, and recommendation APIs** used by the candidate Flutter app need to filter out draft jobs. Individual job detail endpoints do NOT need to check the draft flag.

**Scope**: Only APIs used by candidate Flutter app for browsing and recommendations.

---

## APIs IMPACTED BY is_draft FLAG

### 1. **Candidate Relevant Jobs APIs** ⚠️ CRITICAL
**Status**: NEEDS UPDATE  
**Frontend Usage**: YES - Used in candidate portal

#### Endpoints:
- `GET /candidates/:id/relevant-jobs`
- `GET /candidates/:id/relevant-jobs/grouped`
- `GET /candidates/:id/relevant-jobs/by-title`

#### Location:
- **Controller**: `src/modules/candidate/candidate.controller.ts` (lines 410-696)
- **Service**: `src/modules/candidate/candidate.service.ts` (lines 776-850)

#### Current Behavior:
These endpoints query job postings for candidates based on their preferences and skills. Currently, they return ALL active jobs including draft jobs.

#### Required Change:
Add filter: `WHERE jp.is_draft = false` to exclude draft jobs from candidate search results.

#### Implementation Details:
```typescript
// In candidate.service.ts getRelevantJobs() method
// Add to the query builder:
.where('jp.is_active = :active', { active: true })
.andWhere('jp.is_draft = :isDraft', { isDraft: false })  // ADD THIS LINE
```

#### Frontend Impact:
- **File**: `admin_panel/UdaanSarathi2/src/api/datasources/CandidateDataSource.js`
- **Methods**: None - Frontend doesn't directly call these; backend handles filtering
- **Action**: No frontend changes needed if backend filters correctly

---

### 2. **Public Job Search API** ⚠️ CRITICAL
**Status**: NEEDS UPDATE  
**Frontend Usage**: YES - Used in public landing page and job search

#### Endpoint:
- `GET /jobs/search`

#### Location:
- **Controller**: `src/modules/domain/public-jobs.controller.ts` (lines 19-100)
- **Service**: `src/modules/domain/domain.service.ts` (searchJobsByKeyword method)

#### Current Behavior:
Public endpoint for searching jobs by keyword. Currently returns ALL active jobs including drafts.

#### Required Change:
Add filter: `WHERE is_draft = false` to exclude draft jobs from public search.

#### Implementation Details:
```typescript
// In domain.service.ts searchJobsByKeyword() method
// Add to the query builder:
.where('jp.is_active = :active', { active: true })
.andWhere('jp.is_draft = :isDraft', { isDraft: false })  // ADD THIS LINE
```

#### Frontend Impact:
- **File**: `admin_panel/UdaanSarathi2/src/api/datasources/JobDataSource.js`
- **Methods**: None - Frontend doesn't directly call this endpoint
- **Action**: No frontend changes needed

---

### 3. **Public Job Details API** ✅ NO CHANGE NEEDED
**Status**: SKIP - Individual job detail endpoints don't need draft filtering

#### Endpoint:
- `GET /jobs/:id`

#### Reason:
If a candidate has a direct link to a job (from email, notification, etc.), they should be able to view it regardless of draft status. The draft flag is only relevant for **listings and recommendations**.

#### Frontend Impact:
- No changes needed

---

### 4. **Agency Job Postings List API** ✅ NO CHANGE NEEDED
**Status**: INTERNAL ONLY - No change needed

#### Endpoint:
- `GET /agencies/:license/job-postings`

#### Location:
- **Controller**: `src/modules/agency/agency.controller.ts` (line 890)

#### Current Behavior:
Lists job postings for an agency (admin view). Should show ALL jobs including drafts.

#### Required Change:
**NONE** - This is an internal agency endpoint. Agencies should see their draft jobs in their admin panel.

#### Frontend Impact:
- **File**: `admin_panel/UdaanSarathi2/src/api/datasources/JobDataSource.js`
- **Methods**: `getAdminJobs()` - calls `/admin/jobs`
- **Action**: No changes needed

---

### 5. **Mobile Job Details API** ✅ NO CHANGE NEEDED
**Status**: SKIP - Individual job detail endpoints don't need draft filtering

#### Endpoint:
- `GET /candidates/:id/jobs/:jobId/mobile`

#### Reason:
Detail endpoints are accessed directly by candidates. Draft filtering only applies to listings/recommendations.

---

### 6. **Candidate Job Details with Fitness Score API** ✅ NO CHANGE NEEDED
**Status**: SKIP - Individual job detail endpoints don't need draft filtering

#### Endpoint:
- `GET /candidates/:id/jobs/:jobId`

#### Reason:
Detail endpoints are accessed directly by candidates. Draft filtering only applies to listings/recommendations.

---

## FRONTEND API CONSUMPTION ANALYSIS

### Frontend DataSources Checked:
1. ✅ `JobDataSource.js` - Admin job management (NO PUBLIC SEARCH CALLS)
2. ✅ `CandidateDataSource.js` - Candidate operations (NO DIRECT RELEVANT-JOBS CALLS)
3. ✅ `ApplicationDataSource.js` - Application management
4. ✅ `InterviewDataSource.js` - Interview management
5. ✅ `AgencyDataSource.js` - Agency operations

### Key Finding:
**The frontend does NOT directly call the public APIs that need filtering.** The frontend:
- Uses `/agencies/:license/job-management/` endpoints for admin panel (internal)
- Uses `/agencies/:license/job-postings` for agency admin (internal)
- Does NOT call `/jobs/search` or `/candidates/:id/relevant-jobs` directly

**This means: No frontend changes are required. Backend filtering is sufficient.**

---

## SUMMARY OF REQUIRED CHANGES

| API | Endpoint | Status | Change Required | Frontend Impact |
|-----|----------|--------|-----------------|-----------------|
| Candidate Relevant Jobs | `GET /candidates/:id/relevant-jobs` | ✅ IMPLEMENTED | Added `is_draft = false` filter | None |
| Candidate Relevant Jobs Grouped | `GET /candidates/:id/relevant-jobs/grouped` | ✅ IMPLEMENTED | Uses `getRelevantJobs()` internally | None |
| Candidate Relevant Jobs by Title | `GET /candidates/:id/relevant-jobs/by-title` | ✅ IMPLEMENTED | Uses `getRelevantJobs()` internally | None |
| Public Job Search | `GET /jobs/search` | ✅ IMPLEMENTED | Added `is_draft = false` filter | None |
| Public Job Details | `GET /jobs/:id` | ✅ NO CHANGE | Individual detail endpoints don't filter | None |
| Mobile Job Details | `GET /candidates/:id/jobs/:jobId/mobile` | ✅ NO CHANGE | Individual detail endpoints don't filter | None |
| Candidate Job Details | `GET /candidates/:id/jobs/:jobId` | ✅ NO CHANGE | Individual detail endpoints don't filter | None |
| Agency Job Postings List | `GET /agencies/:license/job-postings` | ✅ NO CHANGE | Keep showing drafts | None |

---

## IMPLEMENTATION PRIORITY

### Phase 1 (Critical):
1. Update `getRelevantJobs()` in `candidate.service.ts`
2. Update `searchJobsByKeyword()` in `domain.service.ts`

### Phase 2 (Important):
3. Update `getJobDetails()` in `public-jobs.controller.ts`
4. Update `getJobMobile()` in `candidate.controller.ts`
5. Update `getJobDetailsWithFitness()` in `candidate.controller.ts`

### Phase 3 (Verification):
6. Test all endpoints with draft and published jobs
7. Verify frontend still works correctly
8. Update API documentation

---

## TESTING CHECKLIST

- [ ] Create a draft job posting
- [ ] Verify draft job does NOT appear in `/jobs/search`
- [ ] Verify draft job does NOT appear in `/candidates/:id/relevant-jobs`
- [ ] Verify draft job does NOT appear in `/candidates/:id/relevant-jobs/grouped`
- [ ] Verify draft job does NOT appear in `/candidates/:id/relevant-jobs/by-title`
- [ ] Verify draft job DOES appear in `/agencies/:license/job-postings` (admin view)
- [ ] Publish the draft job
- [ ] Verify published job DOES appear in all public endpoints
- [ ] Verify frontend job management still works correctly

---

## NOTES

- The `is_draft` field defaults to `true` when creating jobs via template endpoint
- Draft jobs should only be visible to the agency that created them (admin panel)
- Published jobs (is_draft = false) should be visible to all candidates and public users
- No database migration needed (dev environment uses sync)
- All changes are backend-only; no frontend code changes required
