# Documentation Index: Job Tagging & Recommendation System

## Overview

This documentation set explains how to tag jobs in the frontend and ensure they're recommended to users through the matching algorithm.

---

## Quick Navigation

### 🚀 Start Here
- **[README_TAGGING_GUIDE.md](README_TAGGING_GUIDE.md)** - Overview and quick start guide
  - Quick answers to your questions
  - Complete 5-step workflow
  - Key takeaways

### 📋 For Frontend Developers
- **[FRONTEND_TAGGING_SUMMARY.md](FRONTEND_TAGGING_SUMMARY.md)** - Frontend-specific details
  - What the frontend provides/consumes
  - TagsSection component details
  - How to tag a job
  - Limitations and next steps

- **[FRONTEND_JOB_TAGGING_AND_RECOMMENDATION_GUIDE.md](FRONTEND_JOB_TAGGING_AND_RECOMMENDATION_GUIDE.md)** - Complete guide
  - Detailed step-by-step instructions
  - Component reference
  - API endpoints
  - Troubleshooting guide

### 🔧 For API Testing
- **[API_CALLS_EXAMPLE.md](API_CALLS_EXAMPLE.md)** - Exact API calls with examples
  - Complete cURL commands
  - JavaScript examples
  - Postman collection
  - Real data examples

### ✅ Quick Reference
- **[QUICK_TAGGING_CHECKLIST.md](QUICK_TAGGING_CHECKLIST.md)** - Quick reference checklist
  - Step-by-step checklist
  - Troubleshooting decision tree
  - API reference summary
  - Pro tips

### 📊 Visual Guides
- **[VISUAL_GUIDE.md](VISUAL_GUIDE.md)** - Visual diagrams and flowcharts
  - UI mockups
  - Data flow diagrams
  - Database schema diagrams
  - Matching algorithm visualization
  - Component hierarchy

### 🔍 Deep Dive
- **[JOB_TITLE_LINKING_ANALYSIS.md](JOB_TITLE_LINKING_ANALYSIS.md)** - Detailed matching algorithm
  - Job posting entity structure
  - Candidate preference entity structure
  - Complete matching flow
  - Database schema details
  - Example scenarios

---

## Document Descriptions

### README_TAGGING_GUIDE.md
**Best for:** Getting started, understanding the big picture
**Contains:**
- Quick answers to main questions
- 5-step workflow overview
- What gets matched
- Frontend components overview
- API endpoints summary
- Database schema overview
- Matching algorithm overview
- Troubleshooting basics
- Example complete flow

**Read time:** 10 minutes

---

### FRONTEND_TAGGING_SUMMARY.md
**Best for:** Frontend developers, understanding UI capabilities
**Contains:**
- What the frontend provides/consumes
- TagsSection component details
- How to tag a job (step-by-step)
- Code examples
- API endpoints consumed
- Limitations (no canonical title selector)
- Next steps to enhance
- Files reference

**Read time:** 15 minutes

---

### FRONTEND_JOB_TAGGING_AND_RECOMMENDATION_GUIDE.md
**Best for:** Complete implementation guide
**Contains:**
- Detailed step-by-step instructions
- Frontend UI walkthrough
- Backend API calls
- Complete end-to-end example
- API endpoints summary
- Troubleshooting guide
- Frontend component reference
- Related documentation

**Read time:** 20 minutes

---

### API_CALLS_EXAMPLE.md
**Best for:** Testing APIs, integration
**Contains:**
- Exact cURL commands
- JavaScript examples
- Postman collection
- Real data examples
- Expected responses
- Why job was recommended
- Alternative endpoints
- Complete JavaScript flow

**Read time:** 15 minutes

---

### QUICK_TAGGING_CHECKLIST.md
**Best for:** Quick reference, during implementation
**Contains:**
- Frontend tagging checklist
- Backend API calls (copy-paste ready)
- Verification steps
- Troubleshooting decision tree
- What gets matched table
- Key points
- API reference
- Pro tips

**Read time:** 5 minutes

---

### VISUAL_GUIDE.md
**Best for:** Understanding architecture, visual learners
**Contains:**
- Frontend UI mockup
- Data flow diagrams
- Database schema diagrams
- Matching algorithm visualization
- Fitness score calculation
- Troubleshooting decision tree
- Component hierarchy
- Complete end-to-end flow diagram

**Read time:** 15 minutes

---

### JOB_TITLE_LINKING_ANALYSIS.md
**Best for:** Deep understanding, backend developers
**Contains:**
- Job posting entity structure
- Candidate preference entity structure
- Many-to-many relationship details
- Complete matching flow
- Database schema (SQL)
- Key requirements
- Matching logic summary
- Example scenario
- Related files

**Read time:** 20 minutes

---

## Reading Paths

### Path 1: Quick Start (15 minutes)
1. README_TAGGING_GUIDE.md
2. QUICK_TAGGING_CHECKLIST.md
3. API_CALLS_EXAMPLE.md

### Path 2: Frontend Developer (30 minutes)
1. README_TAGGING_GUIDE.md
2. FRONTEND_TAGGING_SUMMARY.md
3. VISUAL_GUIDE.md
4. FRONTEND_JOB_TAGGING_AND_RECOMMENDATION_GUIDE.md

### Path 3: Backend Developer (30 minutes)
1. README_TAGGING_GUIDE.md
2. JOB_TITLE_LINKING_ANALYSIS.md
3. VISUAL_GUIDE.md
4. API_CALLS_EXAMPLE.md

### Path 4: API Testing (20 minutes)
1. QUICK_TAGGING_CHECKLIST.md
2. API_CALLS_EXAMPLE.md
3. VISUAL_GUIDE.md

### Path 5: Complete Understanding (60 minutes)
1. README_TAGGING_GUIDE.md
2. FRONTEND_TAGGING_SUMMARY.md
3. FRONTEND_JOB_TAGGING_AND_RECOMMENDATION_GUIDE.md
4. JOB_TITLE_LINKING_ANALYSIS.md
5. VISUAL_GUIDE.md
6. API_CALLS_EXAMPLE.md

---

## Key Concepts

### Job Tagging
- **What:** Adding skills, education, and experience requirements to a job posting
- **Where:** Frontend TagsSection component
- **How:** PATCH /agencies/:license/job-management/:jobId/tags
- **Why:** Enables matching with candidate profiles

### Candidate Preferences
- **What:** Selecting preferred job titles
- **Where:** Backend API
- **How:** POST /candidates/:id/preferences
- **Why:** Enables job recommendations

### Matching Algorithm
- **What:** Finding jobs that match candidate profile
- **Where:** Backend CandidateService.getRelevantJobs()
- **How:** Compares job tags with candidate profile
- **Why:** Recommends relevant jobs to candidates

### Fitness Score
- **What:** Numerical score (0-100) indicating job match quality
- **Where:** Returned in relevant jobs response
- **How:** Average of skills, education, experience match percentages
- **Why:** Helps rank jobs by relevance

---

## Common Questions

### Q: Does the frontend provide API to tag?
**A:** Yes, see FRONTEND_TAGGING_SUMMARY.md

### Q: How do I tag a job?
**A:** See QUICK_TAGGING_CHECKLIST.md or FRONTEND_JOB_TAGGING_AND_RECOMMENDATION_GUIDE.md

### Q: How do I ensure a job is recommended?
**A:** See README_TAGGING_GUIDE.md (5-step workflow)

### Q: What's the matching algorithm?
**A:** See JOB_TITLE_LINKING_ANALYSIS.md or VISUAL_GUIDE.md

### Q: What API calls do I need?
**A:** See API_CALLS_EXAMPLE.md

### Q: How do I test this?
**A:** See QUICK_TAGGING_CHECKLIST.md or API_CALLS_EXAMPLE.md

### Q: What are the limitations?
**A:** See FRONTEND_TAGGING_SUMMARY.md (Limitations section)

### Q: How do I enhance the frontend?
**A:** See FRONTEND_TAGGING_SUMMARY.md (Next Steps section)

---

## File Locations

### Frontend Files
```
admin_panel/UdaanSarathi2/src/
├─ components/job-management/
│  └─ TagsSection.jsx                    ← Main UI component
├─ api/datasources/
│  └─ JobDataSource.js                   ← API client
└─ pages/
   └─ JobManagementEdit.jsx              ← Edit page
```

### Backend Files
```
src/modules/
├─ domain/
│  ├─ domain.service.ts                  ← updateJobPostingTags method
│  ├─ domain.entity.ts                   ← JobPosting entity
│  └─ dto/update-job-tags.dto.ts         ← DTO
├─ candidate/
│  ├─ candidate.service.ts               ← getRelevantJobs method
│  ├─ candidate.entity.ts                ← Candidate entity
│  └─ candidate-preference.entity.ts     ← CandidatePreference entity
└─ agency/
   └─ agency.controller.ts               ← PATCH tags endpoint
```

---

## API Endpoints

### Frontend Consumes
```
PATCH /agencies/:license/job-management/:jobId/tags
GET   /agencies/:license/job-management/:jobId/editable
GET   /job-titles?q=...&limit=...
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

## Database Tables

### Job Tagging
- `job_postings` - Job posting details
- `job_posting_titles` - Many-to-many junction table
- `job_titles` - Canonical job titles

### Candidate Preferences
- `candidates` - Candidate details
- `candidate_job_profiles` - Candidate skills/education
- `candidate_preferences` - Preferred job titles

---

## Workflow Summary

```
1. Tag Job (Frontend)
   ↓
2. Create Candidate (Backend API)
   ↓
3. Add Job Profile (Backend API)
   ↓
4. Add Preference (Backend API)
   ↓
5. Verify Recommendation (Backend API)
   ↓
✅ Job is recommended!
```

---

## Next Steps

### For Frontend Developers
1. Read FRONTEND_TAGGING_SUMMARY.md
2. Review TagsSection.jsx component
3. Test tagging in the UI
4. Consider adding canonical title selector

### For Backend Developers
1. Read JOB_TITLE_LINKING_ANALYSIS.md
2. Review matching algorithm in candidate.service.ts
3. Test API endpoints
4. Consider performance optimizations

### For QA/Testers
1. Read QUICK_TAGGING_CHECKLIST.md
2. Follow the checklist
3. Test with API_CALLS_EXAMPLE.md
4. Verify recommendations work

---

## Support & Questions

For specific questions, refer to:
- **Frontend questions:** FRONTEND_TAGGING_SUMMARY.md
- **API questions:** API_CALLS_EXAMPLE.md
- **Matching questions:** JOB_TITLE_LINKING_ANALYSIS.md
- **Visual questions:** VISUAL_GUIDE.md
- **Quick answers:** QUICK_TAGGING_CHECKLIST.md

---

## Document Versions

- **Created:** December 16, 2025
- **Last Updated:** December 16, 2025
- **Status:** Complete

---

## Related Documentation

- Backend API documentation
- Frontend component documentation
- Database schema documentation
- Matching algorithm documentation

---

## Quick Links

| Document | Purpose | Read Time |
|----------|---------|-----------|
| README_TAGGING_GUIDE.md | Overview & quick start | 10 min |
| FRONTEND_TAGGING_SUMMARY.md | Frontend details | 15 min |
| FRONTEND_JOB_TAGGING_AND_RECOMMENDATION_GUIDE.md | Complete guide | 20 min |
| API_CALLS_EXAMPLE.md | API testing | 15 min |
| QUICK_TAGGING_CHECKLIST.md | Quick reference | 5 min |
| VISUAL_GUIDE.md | Visual diagrams | 15 min |
| JOB_TITLE_LINKING_ANALYSIS.md | Deep dive | 20 min |

---

**Total Documentation:** 7 files, ~100 pages, ~60,000 words

**Recommended Reading Time:** 15-60 minutes depending on path
