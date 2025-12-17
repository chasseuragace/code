# Quick Tagging & Recommendation Checklist

## ✅ Frontend: Tag Your Job

1. **Navigate to Job Edit Page**
   - URL: `/job-management/edit/:jobId`
   - You should see the job details form

2. **Click "Tags" Section**
   - In the section navigation, click the "Tags" tab
   - You'll see the TagsSection component

3. **Add Skills**
   - Input field: "Add a skill..."
   - Type: "Welding"
   - Click: + button
   - Repeat for each skill

4. **Add Education Requirements**
   - Input field: "Add education requirement..."
   - Type: "High School Diploma"
   - Click: + button
   - Repeat for each requirement

5. **Add Experience Requirements**
   - Min Years: 2
   - Max Years: 5
   - Level: Select "experienced" from dropdown

6. **Click Save**
   - Button at top right: "Save"
   - Wait for success message
   - ✅ Job is now tagged!

---

## ✅ Backend: Create Candidate with Preferences

### Using Postman or curl:

### 1. Create Candidate
```bash
POST http://localhost:3000/candidates
Content-Type: application/json

{
  "name": "John Electrician",
  "email": "john@example.com",
  "phone": "+9779810010001",
  "country": "Nepal"
}
```

**Save the returned `id` (e.g., `cand-123`)**

### 2. Add Job Profile
```bash
PUT http://localhost:3000/candidates/cand-123/job-profiles
Content-Type: application/json

{
  "profile_blob": {
    "skills": ["Welding", "Safety"],
    "education": ["High School Diploma"],
    "experience_years": 3
  },
  "label": "Default"
}
```

### 3. Add Preference
```bash
POST http://localhost:3000/candidates/cand-123/preferences
Content-Type: application/json

{
  "title": "Electrician"
}
```

**Note:** The backend will automatically find the job_title_id for "Electrician"

---

## ✅ Verify: Check if Job is Recommended

### Call the Relevant Jobs API
```bash
GET http://localhost:3000/candidates/cand-123/relevant-jobs?country=UAE&includeScore=true
```

### Expected Response
```json
{
  "data": [
    {
      "id": "job-123",
      "posting_title": "Senior Electrician",
      "skills": ["Welding", "Safety"],
      "education_requirements": ["High School Diploma"],
      "fitness_score": 85.5,
      ...
    }
  ],
  "total": 1,
  "page": 1,
  "limit": 10
}
```

✅ **If your job appears in the response, it's being recommended!**

---

## 🔍 Troubleshooting

### Job Not Appearing?

**Check 1: Job is Tagged**
```bash
GET http://localhost:3000/agencies/LICENSE/job-postings/job-123/tags
```
Should return: `skills`, `education_requirements`, `experience_requirements`

**Check 2: Candidate Has Preference**
```bash
GET http://localhost:3000/candidates/cand-123/preferences
```
Should return: Array with at least one preference with `job_title_id`

**Check 3: Job Title Exists**
```bash
GET http://localhost:3000/job-titles?q=Electrician
```
Should return: Job title with matching name

**Check 4: Candidate Has Job Profile**
```bash
GET http://localhost:3000/candidates/cand-123/job-profiles
```
Should return: Profile with skills and education

**Check 5: Country Matches**
- Job country: "UAE"
- Query param: `?country=UAE`
- Must match!

---

## 📋 What Gets Matched

The job is recommended if:

| Criteria | Job Has | Candidate Has | Match? |
|----------|---------|---------------|--------|
| **Title** | Electrician | Electrician preference | ✅ |
| **Skills** | Welding, Safety | Welding, Safety | ✅ |
| **Education** | High School | High School | ✅ |
| **Experience** | 2-5 years | 3 years | ✅ |
| **Country** | UAE | (query: UAE) | ✅ |

If all match → **Job is recommended!**

---

## 🎯 Key Points

1. **Frontend TagsSection** does NOT have UI for canonical job titles
   - Only supports: skills, education, experience
   - Canonical titles must be set via API

2. **Candidate preferences** must have a matching `job_title_id`
   - Backend auto-resolves title string to ID
   - Verify with: `GET /candidates/:id/preferences`

3. **Fitness score** is calculated based on:
   - Skills overlap percentage
   - Education match percentage
   - Experience compatibility
   - Returned when `includeScore=true`

4. **Country filter** is optional but recommended
   - If specified, job country must match
   - Example: `?country=UAE`

---

## 🚀 Next: Enhance Frontend

To add canonical title selection to the frontend:

1. **Edit TagsSection.jsx**
   - Add job title selector dropdown
   - Fetch titles via `JobDataSource.getJobTitles()`
   - Pass `canonical_title_ids` to `updateTags()`

2. **Create Candidate Portal**
   - Add page to create candidates
   - Add job preferences UI
   - Display relevant jobs

3. **Add Testing Page**
   - Show matching debug info
   - Display fitness score breakdown
   - Verify recommendations work

---

## 📞 API Reference

### Frontend (JobDataSource)
```javascript
// Update job tags
await JobDataSource.updateTags(license, jobId, {
  skills: ["Welding"],
  education_requirements: ["High School"],
  experience_requirements: { min_years: 2, max_years: 5, level: "experienced" },
  canonical_title_ids: []  // Not in UI yet
})

// Get job titles
await JobDataSource.getJobTitles({ q: 'Electrician', limit: 10 })
```

### Backend (Candidate)
```
POST   /candidates
PUT    /candidates/:id/job-profiles
POST   /candidates/:id/preferences
GET    /candidates/:id/relevant-jobs
GET    /candidates/:id/relevant-jobs?country=UAE&includeScore=true
```

### Backend (Job Tagging)
```
PATCH  /agencies/:license/job-management/:jobId/tags
GET    /agencies/:license/job-postings/:id/tags
```

---

## 💡 Pro Tips

1. **Use Postman** to test APIs before frontend integration
2. **Check browser console** for API errors
3. **Verify job_title_id** matches between job and preference
4. **Test with multiple candidates** to ensure consistency
5. **Use `includeScore=true`** to see fitness score calculation

---

## 📚 Full Documentation

- See `JOB_TITLE_LINKING_ANALYSIS.md` for detailed matching algorithm
- See `FRONTEND_JOB_TAGGING_AND_RECOMMENDATION_GUIDE.md` for complete guide
