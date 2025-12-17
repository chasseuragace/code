# Frontend Job Tagging & Recommendation - Summary

## Quick Answer

**Does the frontend provide/consume API to tag?**

✅ **YES** - The frontend has a complete UI for tagging jobs.

**Location:** `admin_panel/UdaanSarathi2/src/components/job-management/TagsSection.jsx`

**API Endpoint:** `PATCH /agencies/:license/job-management/:jobId/tags`

---

## What the Frontend Provides

### TagsSection Component

The frontend provides a **Tags section** in the Job Management Edit page with:

1. **Skills Input**
   - Add/remove skills
   - Example: "Welding", "Safety"

2. **Education Requirements Input**
   - Add/remove education requirements
   - Example: "High School Diploma", "Technical Certificate"

3. **Experience Requirements Input**
   - Min years (number input)
   - Max years (number input)
   - Level (dropdown: entry, junior, mid, senior, expert)

4. **Save Button**
   - Disabled until changes made
   - Shows loading state while saving
   - Shows success/error feedback

### What's NOT in the Frontend UI

❌ **Canonical Job Titles** - No UI selector for linking to job titles
- The backend API supports it: `canonical_title_ids`
- But the frontend doesn't have a UI for it yet
- Would need to be added as a multi-select dropdown

---

## How to Tag a Job (Frontend)

### Step-by-Step

1. **Navigate to Job Edit**
   ```
   /job-management/edit/:jobId
   ```

2. **Click "Tags" Section**
   - In the section navigation tabs

3. **Add Skills**
   - Type skill name
   - Click + button
   - Repeat for each skill

4. **Add Education Requirements**
   - Type education requirement
   - Click + button
   - Repeat for each requirement

5. **Add Experience Requirements**
   - Set min/max years
   - Select level from dropdown

6. **Click Save**
   - Wait for success message

### Code Example (Frontend)

```javascript
import JobDataSource from '../api/datasources/JobDataSource.js'

const license = localStorage.getItem('udaan_agency_license')
const jobId = 'job-uuid-123'

await JobDataSource.updateTags(license, jobId, {
  skills: ["Welding", "Safety"],
  education_requirements: ["High School Diploma"],
  experience_requirements: {
    min_years: 2,
    max_years: 5,
    level: "experienced"
  }
})
```

---

## How to Ensure Job is Recommended

### Complete Flow

#### 1. Tag the Job (Frontend)
```
PATCH /agencies/LICENSE/job-management/job-123/tags
{
  "skills": ["Welding", "Safety"],
  "education_requirements": ["High School Diploma"],
  "experience_requirements": { "min_years": 2, "max_years": 5, "level": "experienced" }
}
```

#### 2. Create Candidate (Backend API)
```
POST /candidates
{
  "name": "John Electrician",
  "email": "john@example.com",
  "phone": "+9779810010001",
  "country": "Nepal"
}
```

#### 3. Add Job Profile (Backend API)
```
PUT /candidates/:id/job-profiles
{
  "profile_blob": {
    "skills": ["Welding", "Safety"],
    "education": ["High School Diploma"],
    "experience_years": 3
  }
}
```

#### 4. Add Preference (Backend API)
```
POST /candidates/:id/preferences
{
  "title": "Electrician"
}
```

#### 5. Verify Recommendation (Backend API)
```
GET /candidates/:id/relevant-jobs?country=UAE&includeScore=true
```

**Response includes your job with fitness_score!**

---

## Key Requirements for Matching

### For the Job
✅ Must be tagged with:
- Skills (at least one)
- Education requirements (optional but recommended)
- Experience requirements (optional but recommended)

### For the Candidate
✅ Must have:
- Job profile with skills/education
- At least one preferred job title
- Matching skills/education with the job

### For the Match
✅ Must satisfy:
- Job title matches candidate preference
- Skills overlap (at least one)
- Education overlap (if job requires it)
- Experience level compatible
- Country matches (if filtered)

---

## Frontend Components

### TagsSection.jsx

**Location:** `admin_panel/UdaanSarathi2/src/components/job-management/TagsSection.jsx`

**Features:**
- Add/remove skills
- Add/remove education requirements
- Set experience min/max years and level
- Save with loading/success states
- Error handling

**Limitations:**
- No canonical job title selector
- No skill suggestions/autocomplete
- No education suggestions/autocomplete

### JobDataSource.js

**Location:** `admin_panel/UdaanSarathi2/src/api/datasources/JobDataSource.js`

**Method:**
```javascript
async updateTags(license, jobId, data) {
  return httpClient.patch(
    `/agencies/${license}/job-management/${jobId}/tags`,
    data
  )
}
```

**Supported Fields:**
- `skills`: string[]
- `education_requirements`: string[]
- `experience_requirements`: { min_years, max_years, level }
- `canonical_title_ids`: string[] (not in UI)
- `canonical_title_names`: string[] (not in UI)

---

## API Endpoints

### Frontend Consumes

```
PATCH /agencies/:license/job-management/:jobId/tags
GET  /agencies/:license/job-management/:jobId/editable
GET  /job-titles?q=...&limit=...
```

### Backend Provides

```
POST   /candidates
PUT    /candidates/:id/job-profiles
POST   /candidates/:id/preferences
GET    /candidates/:id/relevant-jobs
GET    /candidates/:id/relevant-jobs/grouped
GET    /candidates/:id/relevant-jobs/by-title
```

---

## Workflow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│ FRONTEND: Tag Job                                           │
├─────────────────────────────────────────────────────────────┤
│ 1. Navigate to Job Edit Page                                │
│ 2. Click "Tags" Section                                     │
│ 3. Add Skills, Education, Experience                        │
│ 4. Click Save                                               │
│    ↓                                                         │
│    PATCH /agencies/:license/job-management/:jobId/tags      │
│    ↓                                                         │
│ 5. Success! Job is tagged                                   │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ BACKEND: Create Candidate & Add Preferences                 │
├─────────────────────────────────────────────────────────────┤
│ 1. POST /candidates                                         │
│    → Returns: candidate_id                                  │
│ 2. PUT /candidates/:id/job-profiles                         │
│    → Add skills, education, experience                      │
│ 3. POST /candidates/:id/preferences                         │
│    → Add preferred job title                                │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ BACKEND: Verify Recommendation                              │
├─────────────────────────────────────────────────────────────┤
│ GET /candidates/:id/relevant-jobs?country=UAE&includeScore=true
│ ↓                                                            │
│ Response includes your job with fitness_score!              │
│ ✅ Job is recommended!                                      │
└─────────────────────────────────────────────────────────────┘
```

---

## Troubleshooting

### Job Not Appearing in Recommendations?

**Check 1: Job is Tagged**
```bash
GET /agencies/LICENSE/job-postings/job-123/tags
```
Should return: skills, education_requirements, experience_requirements

**Check 2: Candidate Has Preference**
```bash
GET /candidates/cand-123/preferences
```
Should return: Array with job_title_id

**Check 3: Candidate Has Job Profile**
```bash
GET /candidates/cand-123/job-profiles
```
Should return: Profile with skills and education

**Check 4: Skills/Education Match**
- Job skills: ["Welding", "Safety"]
- Candidate skills: ["Welding", "Safety", "Electrical work"]
- ✅ Match!

**Check 5: Country Matches**
- Job country: "UAE"
- Query param: `?country=UAE`
- ✅ Match!

---

## Next Steps to Enhance Frontend

### 1. Add Canonical Title Selector
```javascript
// In TagsSection.jsx
const [selectedTitles, setSelectedTitles] = useState([])

// Fetch job titles
const titles = await JobDataSource.getJobTitles({ q: '', limit: 100 })

// Add multi-select dropdown
// Pass canonical_title_ids to updateTags()
```

### 2. Add Skill Suggestions
```javascript
// Fetch common skills from backend
// Show autocomplete suggestions
// Allow custom skills
```

### 3. Add Candidate Portal
```javascript
// Create page to create candidates
// Add job preferences UI
// Display relevant jobs with fitness scores
```

### 4. Add Testing/Debug Page
```javascript
// Show matching debug info
// Display fitness score breakdown
// Verify recommendations work
```

---

## Files Reference

### Frontend
- `admin_panel/UdaanSarathi2/src/components/job-management/TagsSection.jsx` - UI component
- `admin_panel/UdaanSarathi2/src/api/datasources/JobDataSource.js` - API client
- `admin_panel/UdaanSarathi2/src/pages/JobManagementEdit.jsx` - Edit page

### Backend
- `src/modules/domain/domain.service.ts` - updateJobPostingTags method
- `src/modules/domain/dto/update-job-tags.dto.ts` - DTO
- `src/modules/candidate/candidate.service.ts` - getRelevantJobs method
- `src/modules/agency/agency.controller.ts` - PATCH tags endpoint

---

## Summary

| Question | Answer |
|----------|--------|
| **Does frontend provide API to tag?** | ✅ YES - TagsSection component |
| **Can I tag skills?** | ✅ YES - Add/remove skills |
| **Can I tag education?** | ✅ YES - Add/remove education |
| **Can I tag experience?** | ✅ YES - Min/max years and level |
| **Can I tag canonical titles?** | ❌ NO - Not in UI (but API supports it) |
| **How to ensure job is recommended?** | Tag job + Create candidate with matching profile + Add preference |
| **What's the matching algorithm?** | Title + Skills + Education + Experience + Country |
| **How to verify?** | Call GET /candidates/:id/relevant-jobs |

---

## Related Documentation

- `JOB_TITLE_LINKING_ANALYSIS.md` - Detailed matching algorithm
- `FRONTEND_JOB_TAGGING_AND_RECOMMENDATION_GUIDE.md` - Complete guide
- `QUICK_TAGGING_CHECKLIST.md` - Quick reference
- `API_CALLS_EXAMPLE.md` - Exact API calls with examples
