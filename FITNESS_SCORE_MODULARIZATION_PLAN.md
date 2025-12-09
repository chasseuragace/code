# Fitness Score Modularization Plan

## Overview
The fitness score (also called match percentage) is calculated in multiple locations across the codebase. This document identifies all relevant files and outlines a plan to extract this logic into a unified service.

## Current State Analysis

### Locations Where Fitness Score is Calculated

#### 1. CandidateController - Mobile Job Endpoint
**File**: `src/modules/candidate/candidate.controller.ts`
**Lines**: 130-182
**Endpoint**: `GET /candidates/:id/jobs/:jobId/mobile`
**Purpose**: Calculate match percentage for job details page (candidate view)

```typescript
// Current implementation (lines 130-182)
const skills = Array.isArray(profileBlob.skills) ? ...
const skillsLower = skills.map((s: string) => s.toLowerCase());
const education = Array.isArray(profileBlob.education) ? ...
const educationLower = education.map((e: string) => e.toLowerCase());

let parts = 0;
let sumPct = 0;
// skills matching
// education matching  
// experience matching
const fitness_score = parts > 0 ? Math.round((sumPct / parts) * 100) : undefined;
mobile.matchPercentage = String(fitness_score);
```

#### 2. CandidateController - Job Details with Fitness
**File**: `src/modules/candidate/candidate.controller.ts`
**Lines**: 230-400
**Endpoint**: `GET /candidates/:id/jobs/:jobId`
**Purpose**: Full job details with fitness score

```typescript
// Similar calculation pattern at lines 260-308
const fitness_score = parts > 0 ? Math.round((sumPct / parts) * 100) : undefined;
```

#### 3. CandidateService - Relevant Jobs
**File**: `src/modules/candidate/candidate.service.ts`
**Lines**: 640-675
**Method**: `getRelevantJobs()`
**Purpose**: Calculate fitness score for job recommendations

```typescript
// Compute simple fitness score per posting
for (const p of data as any[]) {
  let parts = 0;
  let sumPct = 0;
  // skills, education, experience matching
  if (parts > 0) {
    p.fitness_score = Math.round((sumPct / parts) * 100);
  }
}
```

#### 4. CandidateService - Grouped Relevant Jobs
**File**: `src/modules/candidate/candidate.service.ts`
**Lines**: 679-720
**Method**: `getRelevantJobsGrouped()`
**Purpose**: Group jobs by preference with fitness scores

```typescript
// Uses getRelevantJobs() which includes scoring
const ordered = (res.data as any[]).slice().sort((a, b) => 
  ((b.fitness_score ?? 0) - (a.fitness_score ?? 0))
);
```

#### 5. AgencyApplicationsService - Priority Score
**File**: `src/modules/agency/agency-applications.service.ts`
**Lines**: 360-432
**Method**: `calculatePriorityScore()`
**Purpose**: Calculate candidate priority for agency view

```typescript
private calculatePriorityScore(
  jobPosting: JobPosting,
  profileBlob: any,
  candidateSkills: string[],
): number {
  let parts = 0;
  let sumPct = 0;
  // Same algorithm: skills, education, experience
  return parts > 0 ? Math.round((sumPct / parts) * 100) : 0;
}
```

---

## Files to Modify

### Backend Files

| File | Purpose | Changes Needed |
|------|---------|----------------|
| `src/modules/candidate/candidate.controller.ts` | Mobile & job details endpoints | Import and use FitnessScoreService |
| `src/modules/candidate/candidate.service.ts` | Relevant jobs calculation | Import and use FitnessScoreService |
| `src/modules/agency/agency-applications.service.ts` | Priority score for agencies | Replace with FitnessScoreService |
| `src/modules/agency/job-candidates.controller.ts` | Candidate details for agency | Add fitness score to response |
| `src/modules/domain/domain.service.ts` | Mobile job projection | Already has matchPercentage field |

### DTO Files

| File | Purpose | Changes Needed |
|------|---------|----------------|
| `src/modules/candidate/dto/mobile-job.dto.ts` | Mobile job response | Already has matchPercentage ✅ |
| `src/modules/candidate/dto/candidate-job-card.dto.ts` | Job card response | Already has fitness_score ✅ |
| `src/modules/domain/dto/job-details.dto.ts` | Job details response | Already has fitness_score ✅ |
| `src/modules/agency/dto/candidate-full-details.dto.ts` | Candidate details for agency | Add fitness_score field |

### New Files to Create

| File | Purpose |
|------|---------|
| `src/modules/shared/fitness-score.service.ts` | Unified fitness score calculation |
| `src/modules/shared/fitness-score.module.ts` | Module for dependency injection |
| `src/modules/shared/dto/fitness-score.dto.ts` | Input/output DTOs |

---

## Proposed Architecture

### FitnessScoreService

```typescript
// src/modules/shared/fitness-score.service.ts

export interface CandidateProfile {
  skills: string[];
  education: string[];
  experience_years: number;
}

export interface JobRequirements {
  skills: string[];
  education_requirements: string[];
  experience_requirements?: {
    min_years?: number;
    max_years?: number;
  };
}

export interface FitnessScoreResult {
  score: number;           // 0-100
  breakdown: {
    skills_match: number;  // 0-100
    education_match: number;
    experience_match: number;
  };
  matched_skills: string[];
  matched_education: string[];
  experience_ok: boolean;
}

@Injectable()
export class FitnessScoreService {
  
  /**
   * Calculate fitness score for a candidate against a job
   */
  calculateScore(
    candidate: CandidateProfile,
    job: JobRequirements,
  ): FitnessScoreResult {
    // Unified algorithm
  }

  /**
   * Extract candidate profile from profile blob
   */
  extractCandidateProfile(profileBlob: any): CandidateProfile {
    // Normalize profile data
  }

  /**
   * Extract job requirements from job posting
   */
  extractJobRequirements(jobPosting: JobPosting): JobRequirements {
    // Normalize job data
  }

  /**
   * Calculate score for candidate ID and job ID
   * (convenience method that fetches data)
   */
  async calculateForCandidateAndJob(
    candidateId: string,
    jobPostingId: string,
  ): Promise<FitnessScoreResult> {
    // Fetch data and calculate
  }
}
```

---

## Endpoints to Update

### 1. Mobile Job Details (Candidate View)
**Endpoint**: `GET /candidates/:id/jobs/:jobId/mobile`
**Current**: ✅ Already includes `matchPercentage`
**Action**: Refactor to use FitnessScoreService

### 2. Relevant Jobs Grouped (Candidate View)
**Endpoint**: `GET /candidates/:id/relevant-jobs/grouped`
**Current**: ✅ Already includes `fitness_score`
**Action**: Refactor to use FitnessScoreService

### 3. Candidate Details (Agency View)
**Endpoint**: `GET /agencies/:license/jobs/:jobId/candidates/:candidateId/details`
**Current**: ❌ Missing fitness score
**Action**: Add `fitness_score` to response using FitnessScoreService

### 4. Job Candidates List (Agency View)
**Endpoint**: `GET /agencies/:license/jobs/:jobId/candidates`
**Current**: Uses `calculatePriorityScore()` internally
**Action**: Refactor to use FitnessScoreService, expose in response

---

## Frontend Impact

### Flutter App (Candidate)

| Endpoint | UI Location | Field | Status |
|----------|-------------|-------|--------|
| `/candidates/:id/jobs/:jobId/mobile` | Job Details Page | `matchPercentage` | ✅ Available |
| `/candidates/:id/relevant-jobs/grouped` | Home Page | `fitness_score` | ✅ Available |

### Admin Panel (Agency)

| Endpoint | UI Location | Field | Status |
|----------|-------------|-------|--------|
| `/agencies/:license/jobs/:jobId/candidates/:candidateId/details` | Candidate Details | `fitness_score` | ❌ Missing |
| `/agencies/:license/jobs/:jobId/candidates` | Candidates List | `priority_score` | ⚠️ Internal only |

---

## Implementation Steps

### Phase 1: Create Unified Service
1. Create `src/modules/shared/fitness-score.service.ts`
2. Create `src/modules/shared/fitness-score.module.ts`
3. Implement core calculation algorithm
4. Add unit tests

### Phase 2: Refactor Candidate Module
1. Update `candidate.controller.ts` to use FitnessScoreService
2. Update `candidate.service.ts` to use FitnessScoreService
3. Verify existing endpoints still work

### Phase 3: Refactor Agency Module
1. Update `agency-applications.service.ts` to use FitnessScoreService
2. Add fitness score to `job-candidates.controller.ts` candidate details endpoint
3. Update `CandidateFullDetailsDto` to include fitness_score

### Phase 4: Frontend Updates
1. Update Flutter models if needed
2. Display fitness score in relevant UI components
3. Update admin panel to show fitness score

---

## Algorithm Details

### Current Algorithm (to be unified)

```typescript
function calculateFitnessScore(
  candidateSkills: string[],
  candidateEducation: string[],
  candidateExperienceYears: number,
  jobSkills: string[],
  jobEducation: string[],
  jobExperience: { min_years?: number; max_years?: number },
): number {
  let parts = 0;
  let sumPct = 0;

  // 1. Skills Match (if job has skill requirements)
  if (jobSkills.length > 0) {
    const jobSkillsLower = jobSkills.map(s => s.toLowerCase());
    const candidateSkillsLower = candidateSkills.map(s => s.toLowerCase());
    const intersection = candidateSkillsLower.filter(s => jobSkillsLower.includes(s));
    const pct = intersection.length / jobSkills.length;
    parts++;
    sumPct += pct;
  }

  // 2. Education Match (if job has education requirements)
  if (jobEducation.length > 0) {
    const jobEduLower = jobEducation.map(e => e.toLowerCase());
    const candidateEduLower = candidateEducation.map(e => e.toLowerCase());
    const intersection = candidateEduLower.filter(e => jobEduLower.includes(e));
    const pct = intersection.length / jobEducation.length;
    parts++;
    sumPct += pct;
  }

  // 3. Experience Match (if job has experience requirements)
  if (jobExperience && (jobExperience.min_years != null || jobExperience.max_years != null)) {
    const minOk = jobExperience.min_years != null ? candidateExperienceYears >= jobExperience.min_years : true;
    const maxOk = jobExperience.max_years != null ? candidateExperienceYears <= jobExperience.max_years : true;
    const pct = minOk && maxOk ? 1 : 0;
    parts++;
    sumPct += pct;
  }

  // Final score: average of matched components (0-100)
  return parts > 0 ? Math.round((sumPct / parts) * 100) : 0;
}
```

### Score Interpretation

| Score | Meaning |
|-------|---------|
| 0-25 | Poor match |
| 26-50 | Fair match |
| 51-75 | Good match |
| 76-100 | Excellent match |

---

## Testing Checklist

### Unit Tests
- [ ] FitnessScoreService.calculateScore() with various inputs
- [ ] Edge cases: empty skills, no requirements, etc.
- [ ] Score breakdown accuracy

### Integration Tests
- [ ] Mobile job endpoint returns correct matchPercentage
- [ ] Relevant jobs endpoint returns correct fitness_score
- [ ] Agency candidate details includes fitness_score
- [ ] Scores are consistent across all endpoints

### E2E Tests
- [ ] Candidate sees match percentage on job details
- [ ] Agency sees fitness score on candidate details
- [ ] Sorting by fitness score works correctly

---

## Summary

### Files to Read/Modify

**Core Implementation**:
1. `src/modules/candidate/candidate.controller.ts` - Lines 130-182, 260-308
2. `src/modules/candidate/candidate.service.ts` - Lines 640-675
3. `src/modules/agency/agency-applications.service.ts` - Lines 360-432
4. `src/modules/agency/job-candidates.controller.ts` - Lines 1070-1260

**DTOs**:
5. `src/modules/candidate/dto/mobile-job.dto.ts`
6. `src/modules/candidate/dto/candidate-job-card.dto.ts`
7. `src/modules/domain/dto/job-details.dto.ts`
8. `src/modules/agency/dto/candidate-full-details.dto.ts`

**New Files**:
9. `src/modules/shared/fitness-score.service.ts` (create)
10. `src/modules/shared/fitness-score.module.ts` (create)

**Frontend (Flutter)**:
11. `lib/app/udaan_saarathi/features/data/models/jobs/mobile_job_model.dart`
12. `lib/app/variant_dashboard/features/variants/presentation/variants/pages/home/job_posting.dart`

**Frontend (Admin Panel)**:
13. Check admin panel candidate details component

---

## Next Steps

1. ✅ Analysis complete
2. ⏳ Create FitnessScoreService
3. ⏳ Refactor candidate module
4. ⏳ Refactor agency module
5. ⏳ Add to agency candidate details endpoint
6. ⏳ Update frontend to display scores
7. ⏳ Test all endpoints
