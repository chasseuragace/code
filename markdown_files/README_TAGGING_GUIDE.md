# Job Tagging & Recommendation System - Complete Guide

## Quick Answer to Your Questions

### Q1: Does the frontend provide/consume API to tag?

✅ **YES** - The frontend has a complete UI for tagging jobs.

**Component:** `TagsSection.jsx`
**Location:** `admin_panel/UdaanSarathi2/src/components/job-management/TagsSection.jsx`
**API Endpoint:** `PATCH /agencies/:license/job-management/:jobId/tags`

### Q2: How do I make sure the job is recommended to the user?

✅ **Follow these 5 steps:**

1. **Tag the job** (Frontend) - Add skills, education, experience
2. **Create a candidate** (Backend API) - Create user profile
3. **Add job profile** (Backend API) - Add candidate's skills/education
4. **Add preference** (Backend API) - Select preferred job title
5. **Verify** (Backend API) - Call relevant jobs endpoint

---

## Complete Workflow

### Step 1: Tag Your Job (Frontend)

**Navigate to:** `/job-management/edit/:jobId`

**Click:** "Tags" section in the navigation

**Add:**
- Skills: "Welding", "Safety"
- Education: "High School Diploma"
- Experience: Min 2 years, Max 5 years, Level: experienced

**Click:** Save button

**Result:** Job is tagged with skills, education, and experience requirements

---

### Step 2: Create Candidate (Backend API)

**Endpoint:** `POST /candidates`

**Request:**
```json
{
  "name": "John Electrician",
  "email": "john@example.com",
  "phone": "+9779810010001",
  "country": "Nepal"
}
```

**Response:** `{ id: "cand-456", ... }`

**Save the ID:** You'll need it for next steps

---

### Step 3: Add Job Profile (Backend API)

**Endpoint:** `PUT /candidates/:id/job-profiles`

**Request:**
```json
{
  "profile_blob": {
    "skills": ["Welding", "Safety"],
    "education": ["High School Diploma"],
    "experience_years": 3
  },
  "label": "Default"
}
```

**Important:** Skills and education must match the job's tags!

---

### Step 4: Add Preference (Backend API)

**Endpoint:** `POST /candidates/:id/preferences`

**Request:**
```json
{
  "title": "Electrician"
}
```

**Important:** The title must match a job title in the database

---

### Step 5: Verify Recommendation (Backend API)

**Endpoint:** `GET /candidates/:id/relevant-jobs?country=UAE&includeScore=true`

**Expected Response:**
```json
{
  "data": [
    {
      "id": "job-123",
      "posting_title": "Senior Electrician",
      "fitness_score": 87.5,
      ...
    }
  ],
  "total": 1
}
```

✅ **If your job appears, it's being recommended!**

---

## What Gets Matched

The job is recommended if:

| Criteria | Must Match |
|----------|-----------|
| **Job Title** | Candidate's preferred title |
| **Skills** | At least one skill overlaps |
| **Education** | At least one education overlaps |
| **Experience** | Candidate's experience within job's range |
| **Country** | If filtered, must match |

---

## Frontend Components

### TagsSection Component

**File:** `admin_panel/UdaanSarathi2/src/components/job-management/TagsSection.jsx`

**Features:**
- ✅ Add/remove skills
- ✅ Add/remove education requirements
- ✅ Set experience min/max years and level
- ✅ Save with loading/success states
- ❌ No canonical job title selector (would need to be added)

**Usage:**
```javascript
<TagsSection 
  data={jobData}
  onSave={async (updates) => {
    await JobDataSource.updateTags(license, jobId, updates)
  }}
/>
```

---

## API Endpoints

### Frontend (JobDataSource)

```javascript
// Update job tags
await JobDataSource.updateTags(license, jobId, {
  skills: ["Welding"],
  education_requirements: ["High School"],
  experience_requirements: { min_years: 2, max_years: 5, level: "experienced" }
})

// Get job titles (for future canonical title selector)
await JobDataSource.getJobTitles({ q: 'Electrician', limit: 10 })
```

### Backend (Candidate Endpoints)

```
POST   /candidates                              # Create candidate
PUT    /candidates/:id/job-profiles             # Add job profile
POST   /candidates/:id/preferences              # Add preference
GET    /candidates/:id/relevant-jobs            # Get recommended jobs
GET    /candidates/:id/relevant-jobs/grouped    # Get jobs grouped by title
GET    /candidates/:id/relevant-jobs/by-title   # Get jobs for one title
```

### Backend (Job Tagging Endpoints)

```
PATCH  /agencies/:license/job-management/:jobId/tags  # Update tags
GET    /agencies/:license/job-postings/:id/tags       # Get tags
```

---

## Database Schema

### Job Tagging

```
job_postings
├─ id: job-123
├─ posting_title: "Senior Electrician"
├─ skills: ["Welding", "Safety"]
├─ education_requirements: ["High School Diploma"]
├─ experience_requirements: { min_years: 2, max_years: 5, level: "experienced" }
└─ canonical_titles: [JobTitle] (many-to-many via job_posting_titles)

job_posting_titles (junction table)
├─ job_posting_id: job-123
└─ job_title_id: jobtitle-202

job_titles
├─ id: jobtitle-202
└─ title: "Electrician"
```

### Candidate Preferences

```
candidates
├─ id: cand-456
├─ name: "John Electrician"
└─ email: "john@example.com"

candidate_job_profiles
├─ id: profile-789
├─ candidate_id: cand-456
└─ profile_blob: { skills: [...], education: [...] }

candidate_preferences
├─ id: pref-101
├─ candidate_id: cand-456
├─ job_title_id: jobtitle-202  ← LINKS TO JOB TITLE
└─ title: "Electrician"
```

---

## Matching Algorithm

```
1. Get candidate's preferred job_title_ids
2. Find jobs with matching canonical_title_ids
3. Check skills overlap (at least one match)
4. Check education overlap (at least one match)
5. Check experience compatibility (within range)
6. Filter by country (if specified)
7. Calculate fitness score (average of match percentages)
8. Return jobs ordered by fitness score (descending)
```

---

## Troubleshooting

### Job Not Appearing?

**Check 1: Job is Tagged**
```bash
GET /agencies/LICENSE/job-postings/job-123/tags
```

**Check 2: Candidate Has Preference**
```bash
GET /candidates/cand-456/preferences
```

**Check 3: Candidate Has Job Profile**
```bash
GET /candidates/cand-456/job-profiles
```

**Check 4: Skills Match**
- Job skills: ["Welding", "Safety"]
- Candidate skills: ["Welding", "Safety", "Electrical work"]
- ✅ Match!

**Check 5: Country Matches**
- Job country: "UAE"
- Query: `?country=UAE`
- ✅ Match!

---

## Files Reference

### Frontend Files
- `admin_panel/UdaanSarathi2/src/components/job-management/TagsSection.jsx` - UI component
- `admin_panel/UdaanSarathi2/src/api/datasources/JobDataSource.js` - API client
- `admin_panel/UdaanSarathi2/src/pages/JobManagementEdit.jsx` - Edit page

### Backend Files
- `src/modules/domain/domain.service.ts` - updateJobPostingTags method
- `src/modules/domain/dto/update-job-tags.dto.ts` - DTO
- `src/modules/candidate/candidate.service.ts` - getRelevantJobs method
- `src/modules/agency/agency.controller.ts` - PATCH tags endpoint

---

## Example: Complete Flow

### 1. Tag Job (Frontend)
```
PATCH /agencies/LICENSE123/job-management/job-uuid-123/tags
{
  "skills": ["Welding", "Safety"],
  "education_requirements": ["High School Diploma"],
  "experience_requirements": { "min_years": 2, "max_years": 5, "level": "experienced" }
}
```

### 2. Create Candidate (Backend)
```
POST /candidates
{
  "name": "John Electrician",
  "email": "john@example.com",
  "phone": "+9779810010001"
}
→ Returns: { id: "cand-456" }
```

### 3. Add Job Profile (Backend)
```
PUT /candidates/cand-456/job-profiles
{
  "profile_blob": {
    "skills": ["Welding", "Safety"],
    "education": ["High School Diploma"],
    "experience_years": 3
  }
}
```

### 4. Add Preference (Backend)
```
POST /candidates/cand-456/preferences
{
  "title": "Electrician"
}
```

### 5. Verify (Backend)
```
GET /candidates/cand-456/relevant-jobs?country=UAE&includeScore=true
→ Returns: { data: [{ id: "job-uuid-123", fitness_score: 87.5 }] }
```

✅ **Job is recommended!**

---

## Next Steps to Enhance

### 1. Add Canonical Title Selector to Frontend
- Add multi-select dropdown in TagsSection
- Fetch job titles via JobDataSource.getJobTitles()
- Pass canonical_title_ids to updateTags()

### 2. Create Candidate Portal
- Add page to create candidates
- Add job preferences UI
- Display relevant jobs with fitness scores

### 3. Add Testing Page
- Show matching debug info
- Display fitness score breakdown
- Verify recommendations work

---

## Key Takeaways

✅ **Frontend provides:** TagsSection component with UI for tagging
✅ **Frontend consumes:** JobDataSource.updateTags() API
✅ **Backend provides:** Matching algorithm via relevant jobs endpoint
✅ **To ensure recommendation:** Tag job + Create candidate + Add preference + Verify
✅ **Matching is based on:** Title + Skills + Education + Experience + Country

---

## Documentation Files

This guide is part of a complete documentation set:

1. **README_TAGGING_GUIDE.md** (this file) - Overview and quick start
2. **FRONTEND_TAGGING_SUMMARY.md** - Frontend-specific details
3. **FRONTEND_JOB_TAGGING_AND_RECOMMENDATION_GUIDE.md** - Complete guide
4. **QUICK_TAGGING_CHECKLIST.md** - Quick reference checklist
5. **API_CALLS_EXAMPLE.md** - Exact API calls with examples
6. **VISUAL_GUIDE.md** - Visual diagrams and flowcharts
7. **JOB_TITLE_LINKING_ANALYSIS.md** - Detailed matching algorithm

---

## Support

For questions or issues:
1. Check the troubleshooting section
2. Review the API_CALLS_EXAMPLE.md for exact endpoints
3. Check the VISUAL_GUIDE.md for flowcharts
4. Review the backend code in src/modules/candidate/candidate.service.ts
