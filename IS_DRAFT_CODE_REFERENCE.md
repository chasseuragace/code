# is_draft Implementation - Code Reference Guide

**Quick lookup for all is_draft related code**

---

## Backend Code Locations

### 1. Database Schema

**File**: `src/modules/domain/domain.entity.ts`

```typescript
@Column({ type: 'boolean', default: true })
is_draft: boolean;
```

**Migration**: `database/migrations/add_is_draft_to_job_postings.sql`

---

### 2. Toggle Draft Endpoint

**File**: `src/modules/agency/agency.controller.ts`

**Endpoint**: `PATCH /agencies/:license/job-postings/:id/toggle-draft`

```typescript
@Patch(':id/toggle-draft')
@UseGuards(AgencyAuthGuard)
async toggleJobPostingDraft(
  @Param('license') license: string,
  @Param('id') id: string,
  @Body() body: { is_draft: boolean }
) {
  // Implementation
}
```

---

### 3. Toggle Service Method

**File**: `src/modules/domain/domain.service.ts`

**Method**: `toggleJobPostingDraft()`

```typescript
async toggleJobPostingDraft(jobPostingId: string, isDraft: boolean): Promise<JobPosting> {
  const jobPosting = await this.jobPostingRepository.findOne({ where: { id: jobPostingId } });
  if (!jobPosting) {
    throw new NotFoundException(`Job posting with ID ${jobPostingId} not found`);
  }

  jobPosting.is_draft = isDraft;
  await this.jobPostingRepository.save(jobPosting);
  return this.findJobPostingById(jobPostingId);
}
```

---

### 4. Candidate Relevant Jobs Filtering

**File**: `src/modules/candidate/candidate.service.ts`

**Method**: `getRelevantJobs()` (line 540)

```typescript
const qb = this.jobPostings
  .createQueryBuilder('jp')
  .leftJoinAndSelect('jp.contracts', 'contracts')
  .leftJoinAndSelect('contracts.positions', 'positions')
  .leftJoinAndSelect('positions.salaryConversions', 'salaryConversions')
  .leftJoinAndSelect('contracts.employer', 'employer')
  .leftJoinAndSelect('contracts.agency', 'agency')
  .addSelect(['jp.skills', 'jp.education_requirements', 'jp.experience_requirements'])
  .addSelect('positions.monthly_salary_amount::numeric', 'positions_monthly_salary_amount')
  .where('jp.is_active = :active', { active: true })
  .andWhere('jp.is_draft = :isDraft', { isDraft: false })  // ← FILTER HERE
  .orderBy('jp.posting_date_ad', 'DESC');
```

**Affected Methods**:
- `getRelevantJobs()` - Direct filtering
- `getRelevantJobsGrouped()` - Uses `getRelevantJobs()` internally
- `getRelevantJobsByTitle()` - Uses `getRelevantJobs()` internally

---

### 5. Public Job Search Filtering

**File**: `src/modules/domain/domain.service.ts`

**Method**: `searchJobsByKeyword()` (line 860)

```typescript
const qb = this.jobPostingRepository
  .createQueryBuilder('jp')
  .leftJoinAndSelect('jp.contracts', 'contracts')
  .leftJoinAndSelect('contracts.employer', 'employer')
  .leftJoinAndSelect('contracts.agency', 'agency')
  .leftJoinAndSelect('contracts.positions', 'positions')
  .leftJoinAndSelect('positions.salaryConversions', 'salaryConversions')
  .where('jp.is_active = :isActive', { isActive: true })
  .andWhere('jp.is_draft = :isDraft', { isDraft: false })  // ← FILTER HERE
```

---

### 6. Editable Job Details DTO

**File**: `src/modules/agency/dto/job-management.dto.ts`

```typescript
export class EditableJobDetailsDto {
  // ... other fields
  is_draft: boolean;
}
```

---

### 7. Editable Job Details Service

**File**: `src/modules/agency/agency-job-management.service.ts`

**Method**: `getEditableJobDetails()`

```typescript
async getEditableJobDetails(license: string, jobId: string): Promise<EditableJobDetailsDto> {
  // ... fetch job
  return {
    // ... other fields
    is_draft: jobPosting.is_draft,
  };
}
```

---

### 8. Job Creation Default

**File**: `src/modules/agency/agency.controller.ts`

**Method**: `createJobPostingForAgency()`

```typescript
const jobPosting = await this.jobPostingService.createJobPosting({
  // ... other fields
  is_draft: true,  // ← DEFAULT TO DRAFT
});
```

---

## Frontend Code Locations

### 1. Toggle Button Component

**File**: `admin_panel/UdaanSarathi2/src/pages/JobManagementEdit.jsx`

**Lines**: ~38, ~177-190, ~404-415

```javascript
// State
const [isTogglingDraft, setIsTogglingDraft] = useState(false);

// Handler
const handleToggleDraft = async () => {
  setIsTogglingDraft(true);
  try {
    const newDraftStatus = !jobData.is_draft;
    await JobDataSource.toggleJobPostingDraft(license, id, newDraftStatus);
    setJobData(prev => ({ ...prev, is_draft: newDraftStatus }));
  } catch (err) {
    alert(tPage('messages.draftToggleFailed'));
  } finally {
    setIsTogglingDraft(false);
  }
};

// Button JSX
<button
  onClick={handleToggleDraft}
  disabled={isTogglingDraft}
  className={`px-4 py-2 rounded-lg flex items-center text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
    jobData?.is_draft
      ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
  }`}
>
  <FileText className="w-4 h-4 mr-2" />
  {isTogglingDraft ? '...' : (jobData?.is_draft ? tPage('buttons.publishFromDraft') || 'Publish' : tPage('buttons.markAsDraft') || 'Mark as Draft')}
</button>
```

---

### 2. Status Badge

**File**: `admin_panel/UdaanSarathi2/src/pages/JobManagementEdit.jsx`

**Lines**: ~490-495

```javascript
<span className={`px-3 py-1 rounded-full text-sm font-medium ${
  jobData?.is_draft
    ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
    : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
}`}>
  {jobData?.is_draft ? tPage('status.draft') : tPage('status.published')}
</span>
```

---

### 3. API Data Source Method

**File**: `admin_panel/UdaanSarathi2/src/api/datasources/JobDataSource.js`

**Lines**: ~383-388

```javascript
/**
 * Toggle job posting draft status
 * @param {string} license - Agency license
 * @param {string} jobId - Job posting ID
 * @param {boolean} isDraft - New draft status
 * @returns {Promise<Object>} Updated draft status with success flag
 */
async toggleJobPostingDraft(license, jobId, isDraft) {
  return httpClient.patch(
    `/agencies/${license}/job-postings/${jobId}/toggle-draft`,
    { is_draft: isDraft }
  );
}
```

---

### 4. Translation Loading Fix

**File**: `admin_panel/UdaanSarathi2/src/hooks/useLanguage.js`

```javascript
const tPageSync = (key, params = {}) => {
  // Direct access to i18nService for synchronous translation lookup
  if (window.__i18nService) {
    return window.__i18nService.tPage(key, params);
  }
  return key; // Fallback
};
```

---

### 5. i18nService Exposure

**File**: `admin_panel/UdaanSarathi2/src/contexts/LanguageContext.jsx`

```javascript
// Expose i18nService globally for synchronous access
window.__i18nService = i18nService;
```

---

### 6. English Translations

**File**: `admin_panel/UdaanSarathi2/public/translations/en/pages/job-management.json`

```json
{
  "buttons": {
    "markAsDraft": "Mark as Draft",
    "publishFromDraft": "Publish"
  },
  "status": {
    "draft": "Draft",
    "published": "Published"
  },
  "messages": {
    "draftToggleSuccess": "Draft status updated successfully",
    "draftToggleFailed": "Failed to update draft status"
  }
}
```

---

### 7. Nepali Translations

**File**: `admin_panel/UdaanSarathi2/public/translations/ne/pages/job-management.json`

```json
{
  "buttons": {
    "markAsDraft": "ड्राफ्टको रूपमा चिन्हित गर्नुहोस्",
    "publishFromDraft": "प्रकाशित गर्नुहोस्"
  },
  "status": {
    "draft": "ड्राफ्ट",
    "published": "प्रकाशित"
  },
  "messages": {
    "draftToggleSuccess": "ड्राफ्ट स्थिति सफलतापूर्वक अपडेट गरिएको",
    "draftToggleFailed": "ड्राफ्ट स्थिति अपडेट गर्न असफल"
  }
}
```

---

## API Endpoints Reference

### Toggle Draft
```
PATCH /agencies/:license/job-postings/:id/toggle-draft
Content-Type: application/json

{
  "is_draft": false
}

Response:
{
  "success": true,
  "is_draft": false,
  "message": "Job posting draft status updated"
}
```

### Get Editable Job Details
```
GET /agencies/:license/job-management/:id

Response includes:
{
  "id": "...",
  "posting_title": "...",
  "is_draft": true,
  ...
}
```

### Candidate Relevant Jobs (Filtered)
```
GET /candidates/:id/relevant-jobs

Returns only jobs where is_draft = false
```

### Public Job Search (Filtered)
```
GET /jobs/search?keyword=...

Returns only jobs where is_draft = false
```

### Agency Job Postings (NOT Filtered)
```
GET /agencies/:license/job-postings

Returns all jobs including drafts
```

---

## Search Patterns

### Find All is_draft References
```bash
grep -r "is_draft" src/ --include="*.ts" --include="*.tsx"
grep -r "is_draft" admin_panel/ --include="*.js" --include="*.jsx"
```

### Find Toggle Implementation
```bash
grep -r "toggleJobPostingDraft" src/ --include="*.ts"
grep -r "toggleJobPostingDraft" admin_panel/ --include="*.js"
```

### Find Filtering Implementation
```bash
grep -r "isDraft.*false" src/ --include="*.ts"
```

---

## Quick Navigation

| Component | File | Lines |
|-----------|------|-------|
| Entity Field | `domain.entity.ts` | - |
| Toggle Service | `domain.service.ts` | - |
| Toggle Endpoint | `agency.controller.ts` | - |
| Candidate Filtering | `candidate.service.ts` | 540 |
| Search Filtering | `domain.service.ts` | 860 |
| Toggle Button | `JobManagementEdit.jsx` | 38, 177-190, 404-415 |
| API Method | `JobDataSource.js` | 383-388 |
| English Translations | `job-management.json` (en) | - |
| Nepali Translations | `job-management.json` (ne) | - |

---

## Testing Commands

### Backend
```bash
# Check column exists
psql -U postgres -d agency_research -c "SELECT column_name FROM information_schema.columns WHERE table_name='job_postings' AND column_name='is_draft';"

# Count draft vs published
psql -U postgres -d agency_research -c "SELECT is_draft, COUNT(*) FROM job_postings GROUP BY is_draft;"

# View toggle actions
psql -U postgres -d agency_research -c "SELECT * FROM audit_logs WHERE action='TOGGLE_JOB_POSTING_DRAFT' ORDER BY created_at DESC LIMIT 10;"
```

### Frontend
```bash
# Check if button renders
grep -n "handleToggleDraft" admin_panel/UdaanSarathi2/src/pages/JobManagementEdit.jsx

# Check translations
grep -n "markAsDraft\|publishFromDraft" admin_panel/UdaanSarathi2/public/translations/*/pages/job-management.json
```

---

## Summary

All `is_draft` related code is organized as follows:

- **Backend**: Database schema, service methods, API endpoints, filtering logic
- **Frontend**: Toggle button, API calls, translations, language support
- **Translations**: English and Nepali language files
- **Testing**: Quick commands for verification

Use this guide to quickly locate and understand any part of the implementation.

