# Frontend Job Tagging & Recommendation Guide

## Overview

This guide explains how to:
1. **Tag a job** you created in the frontend
2. **Create a user** with matching preferences
3. **Verify the job is recommended** to that user

---

## Part 1: Tagging a Job in the Frontend

### Step 1: Navigate to Job Management Edit

After creating a job, you'll be in the **Job Management Edit** page:
```
/job-management/edit/:jobId
```

### Step 2: Go to Tags Section

The page has a **Section Navigation** with tabs:
- Basic Info
- Employer
- Contract
- Positions
- **Tags** ← Click here
- Expenses
- Image Upload

### Step 3: Add Tags

The **TagsSection** component (`admin_panel/UdaanSarathi2/src/components/job-management/TagsSection.jsx`) provides:

#### A. Add Skills
```
Input: "Welding"
Click: + button
Result: Tag appears as blue pill
```

#### B. Add Education Requirements
```
Input: "High School Diploma"
Click: + button
Result: Tag appears as green pill
```

#### C. Add Experience Requirements
```
Min Years: 2
Max Years: 5
Level: "experienced" (dropdown)
```

### Step 4: Save Tags

Click the **Save** button at the top right of the Tags section.

**What happens behind the scenes:**
```javascript
// Frontend calls:
await JobDataSource.updateTags(license, jobId, {
  skills: ["Welding", "Safety"],
  education_requirements: ["High School Diploma"],
  experience_requirements: {
    min_years: 2,
    max_years: 5,
    level: "experienced"
  },
  canonical_title_ids: []  // Optional: link to job titles
})

// This calls the backend API:
PATCH /agencies/:license/job-management/:jobId/tags
```

### Important: Canonical Title IDs

**Currently, the frontend TagsSection does NOT have a UI for selecting canonical job titles.**

However, the backend API supports it:
```javascript
{
  canonical_title_ids: ["uuid-1", "uuid-2"]  // Job title UUIDs
}
```

**To tag with canonical titles, you need to:**
1. Get the job title IDs from the backend
2. Either:
   - Use the API directly (via Postman/curl)
   - Or extend the TagsSection component to include a job title selector

---

## Part 2: Creating a User with Matching Preferences

### Option A: Create Candidate via Backend API

**Endpoint:**
```
POST /candidates
```

**Request Body:**
```json
{
  "name": "John Electrician",
  "email": "john@example.com",
  "phone": "+9779810010001",
  "country": "Nepal"
}
```

**Response:**
```json
{
  "id": "candidate-uuid-123",
  "name": "John Electrician",
  "email": "john@example.com"
}
```

### Step 2: Add Job Profile to Candidate

**Endpoint:**
```
PUT /candidates/:id/job-profiles
```

**Request Body:**
```json
{
  "profile_blob": {
    "summary": "Experienced electrician",
    "skills": ["Welding", "Safety", "Electrical work"],
    "education": ["High School Diploma"],
    "experience_years": 3
  },
  "label": "Default"
}
```

### Step 3: Add Preferred Job Titles

**Endpoint:**
```
POST /candidates/:id/preferences
```

**Request Body:**
```json
{
  "title": "Electrician"
}
```

**Important:** The backend will automatically resolve the title to a `job_title_id` if it exists in the database.

**Response:**
```json
{
  "id": "preference-uuid",
  "candidate_id": "candidate-uuid-123",
  "job_title_id": "job-title-uuid",
  "title": "Electrician",
  "priority": 1
}
```

---

## Part 3: Verify Job is Recommended

### Step 1: Call the Relevant Jobs API

**Endpoint:**
```
GET /candidates/:candidateId/relevant-jobs
```

**Query Parameters:**
```
?country=UAE
&useCanonicalTitles=true
&includeScore=true
&page=1
&limit=10
```

### Step 2: Check Response

**Expected Response:**
```json
{
  "data": [
    {
      "id": "job-posting-uuid",
      "posting_title": "Senior Electrician needed in UAE",
      "country": "UAE",
      "skills": ["Welding", "Safety"],
      "education_requirements": ["High School Diploma"],
      "experience_requirements": {
        "min_years": 2,
        "max_years": 5,
        "level": "experienced"
      },
      "canonical_titles": ["Electrician", "Technician"],
      "fitness_score": 85.5,  // If includeScore=true
      "contracts": [...],
      "view_count": 0
    }
  ],
  "total": 1,
  "page": 1,
  "limit": 10
}
```

### Step 3: Verify Matching

The job appears in the response if:

✅ **Title Match:**
- Job's `canonical_titles` includes "Electrician"
- Candidate's preference has `job_title_id` matching that title

✅ **Skills Match:**
- Job's `skills` array overlaps with candidate's skills
- Example: Job has ["Welding", "Safety"], Candidate has ["Welding", "Safety", "Electrical work"]

✅ **Education Match:**
- Job's `education_requirements` overlaps with candidate's education
- Example: Job requires "High School Diploma", Candidate has "High School Diploma"

✅ **Experience Match:**
- Candidate's experience meets job's `experience_requirements`
- Example: Job requires 2-5 years, Candidate has 3 years

✅ **Country Match:**
- If `country` query param is provided, job's country must match

---

## Complete End-to-End Example

### 1. Create Job (Frontend)
```
POST /agencies/LICENSE123/job-management/template
{
  "posting_title": "Senior Electrician",
  "country": "UAE"
}
→ Returns: { id: "job-123", posting_title: "Senior Electrician" }
```

### 2. Tag Job (Frontend)
```
PATCH /agencies/LICENSE123/job-management/job-123/tags
{
  "skills": ["Welding", "Safety"],
  "education_requirements": ["High School Diploma"],
  "experience_requirements": {
    "min_years": 2,
    "max_years": 5,
    "level": "experienced"
  }
}
```

### 3. Create Candidate (Backend API)
```
POST /candidates
{
  "name": "John Electrician",
  "email": "john@example.com",
  "phone": "+9779810010001",
  "country": "Nepal"
}
→ Returns: { id: "cand-456" }
```

### 4. Add Job Profile (Backend API)
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

### 5. Add Preference (Backend API)
```
POST /candidates/cand-456/preferences
{
  "title": "Electrician"
}
```

### 6. Get Relevant Jobs (Backend API)
```
GET /candidates/cand-456/relevant-jobs?country=UAE&includeScore=true
→ Returns: { data: [{ id: "job-123", fitness_score: 85.5, ... }] }
```

✅ **Job is recommended!**

---

## API Endpoints Summary

### Frontend (JobDataSource)

```javascript
// Tag a job
await JobDataSource.updateTags(license, jobId, {
  skills: [],
  education_requirements: [],
  experience_requirements: {},
  canonical_title_ids: []
})

// Get job titles (for canonical title selection)
await JobDataSource.getJobTitles({
  q: 'Electrician',
  is_active: true,
  limit: 10
})
```

### Backend (Candidate Endpoints)

```
POST   /candidates                              # Create candidate
PUT    /candidates/:id/job-profiles             # Add/update job profile
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

## Troubleshooting

### Job Not Appearing in Recommendations

**Check:**
1. ✅ Job is tagged with skills/education/experience
2. ✅ Candidate has a job profile with matching skills/education
3. ✅ Candidate has added a preference for the job title
4. ✅ Job title in preference matches job's canonical titles
5. ✅ Country filter matches (if specified)

**Debug:**
```javascript
// Check candidate preferences
GET /candidates/:id/preferences
→ Should return array with job_title_id

// Check job tags
GET /agencies/:license/job-postings/:jobId/tags
→ Should return skills, education_requirements, canonical_titles

// Check job posting titles
GET /job-postings/:jobId
→ Should have canonical_titles array populated
```

### Canonical Titles Not Linking

**Issue:** Job has canonical_title_ids but they're not matching preferences

**Solution:**
1. Verify job_title_id exists in database:
   ```
   GET /job-titles?q=Electrician
   ```
2. Verify candidate preference has matching job_title_id:
   ```
   GET /candidates/:id/preferences
   ```
3. Ensure both use the same UUID

---

## Frontend Component Reference

### TagsSection Component

**Location:** `admin_panel/UdaanSarathi2/src/components/job-management/TagsSection.jsx`

**Props:**
```javascript
{
  data: {
    skills: [],
    education_requirements: [],
    experience_requirements: {},
    canonical_titles: []  // Read-only, not editable in UI
  },
  onSave: async (updates) => { ... }
}
```

**Features:**
- Add/remove skills
- Add/remove education requirements
- Set experience min/max years and level
- Save button (disabled until changes made)
- Success/error feedback

**Limitation:** No UI for selecting canonical job titles (would need to be added)

---

## Next Steps

### To Enhance the Frontend:

1. **Add Canonical Title Selector to TagsSection**
   - Fetch job titles via `JobDataSource.getJobTitles()`
   - Display as multi-select dropdown
   - Pass `canonical_title_ids` to `updateTags()`

2. **Add Candidate Portal**
   - Create candidate profile page
   - Add job preferences UI
   - Display relevant jobs with fitness scores

3. **Add Recommendation Testing**
   - Create test page to verify matching
   - Show debug info (why job matched/didn't match)
   - Display fitness score breakdown

---

## Related Documentation

- See `JOB_TITLE_LINKING_ANALYSIS.md` for detailed matching algorithm
- See backend API docs for complete endpoint specifications
- See `src/modules/candidate/candidate.service.ts` for matching logic
