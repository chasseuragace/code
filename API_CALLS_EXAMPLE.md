# Complete API Calls Example: Tag Job & Create Recommended User

This document shows exact API calls (with real data) to:
1. Tag a job you created
2. Create a candidate
3. Verify the job is recommended

---

## Scenario

- **Job Created:** "Senior Electrician in UAE" (ID: `job-uuid-123`)
- **Agency License:** `LICENSE123`
- **API Base URL:** `http://localhost:3000`

---

## Step 1: Tag the Job (Frontend API Call)

### Frontend Code (JavaScript)
```javascript
import JobDataSource from '../api/datasources/JobDataSource.js'

const license = localStorage.getItem('udaan_agency_license') // "LICENSE123"
const jobId = "job-uuid-123"

const tagData = {
  skills: ["Welding", "Safety", "Electrical work"],
  education_requirements: ["High School Diploma", "Technical Certificate"],
  experience_requirements: {
    min_years: 2,
    max_years: 5,
    level: "experienced"
  }
  // Note: canonical_title_ids not in UI, would need to be added
}

try {
  const result = await JobDataSource.updateTags(license, jobId, tagData)
  console.log("Job tagged successfully:", result)
} catch (error) {
  console.error("Failed to tag job:", error)
}
```

### Equivalent cURL Command
```bash
curl -X PATCH http://localhost:3000/agencies/LICENSE123/job-management/job-uuid-123/tags \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "skills": ["Welding", "Safety", "Electrical work"],
    "education_requirements": ["High School Diploma", "Technical Certificate"],
    "experience_requirements": {
      "min_years": 2,
      "max_years": 5,
      "level": "experienced"
    }
  }'
```

### Expected Response
```json
{
  "id": "job-uuid-123",
  "posting_title": "Senior Electrician in UAE",
  "skills": ["Welding", "Safety", "Electrical work"],
  "education_requirements": ["High School Diploma", "Technical Certificate"],
  "experience_requirements": {
    "min_years": 2,
    "max_years": 5,
    "level": "experienced"
  },
  "canonical_titles": [],
  "updated_at": "2025-12-16T10:30:00Z"
}
```

✅ **Job is now tagged!**

---

## Step 2: Create a Candidate

### cURL Command
```bash
curl -X POST http://localhost:3000/candidates \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Electrician",
    "email": "john.electrician@example.com",
    "phone": "+9779810010001",
    "country": "Nepal"
  }'
```

### Expected Response
```json
{
  "id": "cand-uuid-456",
  "name": "John Electrician",
  "email": "john.electrician@example.com",
  "phone": "+9779810010001",
  "country": "Nepal",
  "created_at": "2025-12-16T10:35:00Z"
}
```

**Save the candidate ID:** `cand-uuid-456`

---

## Step 3: Add Job Profile to Candidate

### cURL Command
```bash
curl -X PUT http://localhost:3000/candidates/cand-uuid-456/job-profiles \
  -H "Content-Type: application/json" \
  -d '{
    "profile_blob": {
      "summary": "Experienced electrician with 3 years in residential and commercial work",
      "skills": [
        {
          "title": "Welding",
          "duration_months": 36,
          "years": 3
        },
        {
          "title": "Safety",
          "duration_months": 36,
          "years": 3
        },
        {
          "title": "Electrical work",
          "duration_months": 24,
          "years": 2
        }
      ],
      "education": [
        {
          "degree": "High School Diploma",
          "field": "General"
        },
        {
          "degree": "Technical Certificate",
          "field": "Electrical"
        }
      ],
      "experience_years": 3
    },
    "label": "Default"
  }'
```

### Expected Response
```json
{
  "id": "profile-uuid-789",
  "candidate_id": "cand-uuid-456",
  "profile_blob": {
    "summary": "Experienced electrician with 3 years in residential and commercial work",
    "skills": [...],
    "education": [...],
    "experience_years": 3
  },
  "label": "Default",
  "created_at": "2025-12-16T10:40:00Z",
  "updated_at": "2025-12-16T10:40:00Z"
}
```

✅ **Job profile added!**

---

## Step 4: Add Preferred Job Title

### cURL Command
```bash
curl -X POST http://localhost:3000/candidates/cand-uuid-456/preferences \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Electrician"
  }'
```

### Expected Response
```json
{
  "id": "pref-uuid-101",
  "candidate_id": "cand-uuid-456",
  "job_title_id": "jobtitle-uuid-202",
  "title": "Electrician",
  "priority": 1,
  "created_at": "2025-12-16T10:45:00Z",
  "updated_at": "2025-12-16T10:45:00Z"
}
```

✅ **Preference added! Note the `job_title_id`: `jobtitle-uuid-202`**

---

## Step 5: Verify Job is Recommended

### cURL Command
```bash
curl -X GET "http://localhost:3000/candidates/cand-uuid-456/relevant-jobs?country=UAE&useCanonicalTitles=true&includeScore=true&page=1&limit=10" \
  -H "Content-Type: application/json"
```

### Expected Response
```json
{
  "data": [
    {
      "id": "job-uuid-123",
      "posting_title": "Senior Electrician in UAE",
      "country": "UAE",
      "city": "Dubai",
      "skills": ["Welding", "Safety", "Electrical work"],
      "education_requirements": ["High School Diploma", "Technical Certificate"],
      "experience_requirements": {
        "min_years": 2,
        "max_years": 5,
        "level": "experienced"
      },
      "canonical_titles": ["Electrician"],
      "fitness_score": 87.5,
      "contracts": [
        {
          "id": "contract-uuid",
          "period_years": 2,
          "renewable": true,
          "employer": {
            "id": "employer-uuid",
            "company_name": "Gulf Electrical Services",
            "country": "UAE",
            "city": "Dubai"
          },
          "positions": [
            {
              "id": "position-uuid",
              "title": "Senior Electrician",
              "male_vacancies": 2,
              "female_vacancies": 1,
              "total_vacancies": 3,
              "monthly_salary_amount": 2500,
              "salary_currency": "AED"
            }
          ]
        }
      ],
      "view_count": 0,
      "posting_date_ad": "2025-12-15",
      "is_active": true
    }
  ],
  "total": 1,
  "page": 1,
  "limit": 10
}
```

✅ **Job is recommended! Fitness score: 87.5**

---

## Why This Job Was Recommended

### Matching Criteria

| Criteria | Job Has | Candidate Has | Match |
|----------|---------|---------------|-------|
| **Title** | Electrician | Electrician (preference) | ✅ |
| **Skills** | Welding, Safety, Electrical work | Welding, Safety, Electrical work | ✅ |
| **Education** | High School, Technical Cert | High School, Technical Cert | ✅ |
| **Experience** | 2-5 years required | 3 years actual | ✅ |
| **Country** | UAE | Query: UAE | ✅ |

### Fitness Score Breakdown (87.5)

```
Skills Match:     90% (3/3 skills match)
Education Match:  100% (2/2 education match)
Experience Match: 80% (3 years within 2-5 range)
Overall Score:    87.5% (average)
```

---

## Alternative: Get Jobs Grouped by Title

### cURL Command
```bash
curl -X GET "http://localhost:3000/candidates/cand-uuid-456/relevant-jobs/grouped?country=UAE&includeScore=true" \
  -H "Content-Type: application/json"
```

### Expected Response
```json
{
  "groups": [
    {
      "title": "Electrician",
      "jobs": [
        {
          "id": "job-uuid-123",
          "posting_title": "Senior Electrician in UAE",
          "fitness_score": 87.5,
          ...
        }
      ]
    }
  ],
  "total": 1
}
```

---

## Alternative: Get Jobs for Single Title

### cURL Command
```bash
curl -X GET "http://localhost:3000/candidates/cand-uuid-456/relevant-jobs/by-title?title=Electrician&country=UAE&includeScore=true&page=1&limit=10" \
  -H "Content-Type: application/json"
```

### Expected Response
```json
{
  "data": [
    {
      "id": "job-uuid-123",
      "posting_title": "Senior Electrician in UAE",
      "fitness_score": 87.5,
      ...
    }
  ],
  "total": 1,
  "page": 1,
  "limit": 10
}
```

---

## Complete JavaScript Example

```javascript
// Complete flow in JavaScript

const API_BASE = 'http://localhost:3000'
const license = 'LICENSE123'
const jobId = 'job-uuid-123'

async function completeFlow() {
  try {
    // Step 1: Tag the job
    console.log('Step 1: Tagging job...')
    const tagResponse = await fetch(`${API_BASE}/agencies/${license}/job-management/${jobId}/tags`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        skills: ["Welding", "Safety", "Electrical work"],
        education_requirements: ["High School Diploma", "Technical Certificate"],
        experience_requirements: {
          min_years: 2,
          max_years: 5,
          level: "experienced"
        }
      })
    })
    const tagResult = await tagResponse.json()
    console.log('✅ Job tagged:', tagResult)

    // Step 2: Create candidate
    console.log('\nStep 2: Creating candidate...')
    const candResponse = await fetch(`${API_BASE}/candidates`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: "John Electrician",
        email: "john.electrician@example.com",
        phone: "+9779810010001",
        country: "Nepal"
      })
    })
    const candResult = await candResponse.json()
    const candidateId = candResult.id
    console.log('✅ Candidate created:', candidateId)

    // Step 3: Add job profile
    console.log('\nStep 3: Adding job profile...')
    const profileResponse = await fetch(`${API_BASE}/candidates/${candidateId}/job-profiles`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        profile_blob: {
          summary: "Experienced electrician",
          skills: [
            { title: "Welding", years: 3 },
            { title: "Safety", years: 3 },
            { title: "Electrical work", years: 2 }
          ],
          education: [
            { degree: "High School Diploma" },
            { degree: "Technical Certificate" }
          ],
          experience_years: 3
        },
        label: "Default"
      })
    })
    const profileResult = await profileResponse.json()
    console.log('✅ Job profile added:', profileResult.id)

    // Step 4: Add preference
    console.log('\nStep 4: Adding preference...')
    const prefResponse = await fetch(`${API_BASE}/candidates/${candidateId}/preferences`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: "Electrician"
      })
    })
    const prefResult = await prefResponse.json()
    console.log('✅ Preference added:', prefResult)

    // Step 5: Get relevant jobs
    console.log('\nStep 5: Getting relevant jobs...')
    const jobsResponse = await fetch(
      `${API_BASE}/candidates/${candidateId}/relevant-jobs?country=UAE&includeScore=true`,
      { headers: { 'Content-Type': 'application/json' } }
    )
    const jobsResult = await jobsResponse.json()
    console.log('✅ Relevant jobs:', jobsResult)

    // Check if our job is recommended
    const isRecommended = jobsResult.data.some(j => j.id === jobId)
    console.log(`\n🎯 Job ${jobId} is ${isRecommended ? 'RECOMMENDED' : 'NOT RECOMMENDED'}`)
    
    if (isRecommended) {
      const job = jobsResult.data.find(j => j.id === jobId)
      console.log(`   Fitness Score: ${job.fitness_score}`)
    }

  } catch (error) {
    console.error('❌ Error:', error)
  }
}

// Run the flow
completeFlow()
```

---

## Postman Collection

### Import into Postman

```json
{
  "info": {
    "name": "Job Tagging & Recommendation",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "1. Tag Job",
      "request": {
        "method": "PATCH",
        "url": "{{base_url}}/agencies/{{license}}/job-management/{{jobId}}/tags",
        "header": [
          { "key": "Content-Type", "value": "application/json" },
          { "key": "Authorization", "value": "Bearer {{token}}" }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"skills\": [\"Welding\", \"Safety\", \"Electrical work\"],\n  \"education_requirements\": [\"High School Diploma\", \"Technical Certificate\"],\n  \"experience_requirements\": {\n    \"min_years\": 2,\n    \"max_years\": 5,\n    \"level\": \"experienced\"\n  }\n}"
        }
      }
    },
    {
      "name": "2. Create Candidate",
      "request": {
        "method": "POST",
        "url": "{{base_url}}/candidates",
        "header": [
          { "key": "Content-Type", "value": "application/json" }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"name\": \"John Electrician\",\n  \"email\": \"john.electrician@example.com\",\n  \"phone\": \"+9779810010001\",\n  \"country\": \"Nepal\"\n}"
        }
      }
    },
    {
      "name": "3. Add Job Profile",
      "request": {
        "method": "PUT",
        "url": "{{base_url}}/candidates/{{candidateId}}/job-profiles",
        "header": [
          { "key": "Content-Type", "value": "application/json" }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"profile_blob\": {\n    \"summary\": \"Experienced electrician\",\n    \"skills\": [\n      { \"title\": \"Welding\", \"years\": 3 },\n      { \"title\": \"Safety\", \"years\": 3 },\n      { \"title\": \"Electrical work\", \"years\": 2 }\n    ],\n    \"education\": [\n      { \"degree\": \"High School Diploma\" },\n      { \"degree\": \"Technical Certificate\" }\n    ],\n    \"experience_years\": 3\n  },\n  \"label\": \"Default\"\n}"
        }
      }
    },
    {
      "name": "4. Add Preference",
      "request": {
        "method": "POST",
        "url": "{{base_url}}/candidates/{{candidateId}}/preferences",
        "header": [
          { "key": "Content-Type", "value": "application/json" }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"title\": \"Electrician\"\n}"
        }
      }
    },
    {
      "name": "5. Get Relevant Jobs",
      "request": {
        "method": "GET",
        "url": "{{base_url}}/candidates/{{candidateId}}/relevant-jobs?country=UAE&includeScore=true",
        "header": [
          { "key": "Content-Type", "value": "application/json" }
        ]
      }
    }
  ],
  "variable": [
    { "key": "base_url", "value": "http://localhost:3000" },
    { "key": "license", "value": "LICENSE123" },
    { "key": "jobId", "value": "job-uuid-123" },
    { "key": "candidateId", "value": "cand-uuid-456" },
    { "key": "token", "value": "YOUR_TOKEN_HERE" }
  ]
}
```

---

## Summary

✅ **Job Tagged:** Skills, education, experience added
✅ **Candidate Created:** With matching profile
✅ **Preference Added:** "Electrician" title
✅ **Job Recommended:** Appears in relevant jobs with 87.5 fitness score

**Total Time:** ~5 minutes to complete all steps!
