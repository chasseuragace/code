# Job Title Linking Analysis: Relevant Jobs Recommendation System

## Overview
This document explains how job titles are linked between job postings and candidate preferences in the relevant jobs recommendation system.

---

## Key Components

### 1. **Job Posting Entity** (`src/modules/domain/domain.entity.ts`)

The `JobPosting` entity has a **many-to-many relationship** with `JobTitle`:

```typescript
@ManyToMany(() => JobTitle)
@JoinTable({
  name: 'job_posting_titles',
  joinColumn: { name: 'job_posting_id', referencedColumnName: 'id' },
  inverseJoinColumn: { name: 'job_title_id', referencedColumnName: 'id' }
})
canonical_titles?: JobTitle[];
```

**Database Table**: `job_posting_titles`
- Links job postings to canonical job titles
- Enables a job posting to be associated with multiple job titles
- Example: A "Senior Electrician" posting could be linked to both "Electrician" and "Senior Technician" titles

### 2. **Candidate Preference Entity** (`src/modules/candidate/candidate-preference.entity.ts`)

Candidates store their preferred job titles:

```typescript
@Entity('candidate_preferences')
export class CandidatePreference {
  @Column('uuid')
  candidate_id!: string;

  @Column('uuid')
  job_title_id: string;  // FK to job_titles.id

  @Column({ type: 'varchar', length: 255 })
  title!: string;  // Denormalized title string

  @Column({ type: 'int' })
  priority!: number;  // 1-based priority
}
```

**Key Points**:
- Each candidate can have multiple preferred job titles
- Each preference has a `job_title_id` (FK to `JobTitle`)
- Priorities determine the order of preferences (lower number = higher priority)

---

## The Matching Flow

### Step 1: Candidate Sets Preferred Job Titles

When a candidate creates/updates their job profile, they select preferred job titles:

```
POST /candidates/:id/preferences
{
  "title": "Electrician"  // or use job_title_id directly
}
```

This creates a `CandidatePreference` record with:
- `candidate_id`: The candidate's ID
- `job_title_id`: The ID of the selected `JobTitle`
- `title`: The title string (denormalized)
- `priority`: Ordering preference

### Step 2: Job Posting Gets Tagged with Job Titles

When an agency creates/updates a job posting, they tag it with canonical job titles:

```
PATCH /agencies/:license/job-postings/:id/tags
{
  "canonical_title_ids": ["uuid-1", "uuid-2"],
  "skills": ["welding", "safety"],
  "education_requirements": ["High School"],
  "experience_requirements": { "min_years": 2, "level": "experienced" }
}
```

This creates entries in the `job_posting_titles` junction table linking:
- `job_posting_id`: The job posting's ID
- `job_title_id`: The canonical job title ID

### Step 3: Relevant Jobs Matching Algorithm

When a candidate requests relevant jobs:

```
GET /candidates/:id/relevant-jobs?country=UAE&useCanonicalTitles=true&includeScore=true
```

The `CandidateService.getRelevantJobs()` method:

1. **Fetches candidate's preferred job title IDs**:
   ```typescript
   const prefRows = await this.preferences.find({ 
     where: { candidate_id: candidateId }, 
     order: { priority: 'ASC' } 
   });
   let preferredIds: string[] = prefRows.map((p) => p.job_title_id!);
   ```

2. **Builds a query with title matching**:
   ```typescript
   const titleGroup = new Brackets((qb1) => {
     if (hasPreferences) {
       qb1.where(
         `EXISTS (
           SELECT 1 FROM job_posting_titles jpt
           WHERE jpt.job_posting_id = jp.id 
           AND jpt.job_title_id IN (:...preferredIds)
         )`,
         { preferredIds }
       );
     }
   });
   ```

3. **Applies additional filters** (skills, education, experience):
   - Checks if job posting's `skills` array overlaps with candidate's skills
   - Checks if job posting's `education_requirements` match candidate's education
   - Checks if job posting's `experience_requirements` match candidate's experience

4. **Calculates fitness score** (if `includeScore=true`):
   - Combines skills overlap, education match, and experience compatibility
   - Returns jobs ordered by fitness score (descending)

---

## API Endpoints

### For Candidates

**Get Relevant Jobs**:
```
GET /candidates/:id/relevant-jobs
Query params:
  - country: Filter by country
  - useCanonicalTitles: true/false (default: false)
  - includeScore: true/false (default: false)
  - page: Pagination
  - limit: Results per page
```

**Get Relevant Jobs Grouped by Title**:
```
GET /candidates/:id/relevant-jobs/grouped
Returns jobs grouped by each preferred title
```

**Get Relevant Jobs for Single Title**:
```
GET /candidates/:id/relevant-jobs/by-title?title=Electrician
```

### For Agencies (Admin Panel)

**Update Job Posting Tags**:
```
PATCH /agencies/:license/job-postings/:id/tags
Body:
{
  "canonical_title_ids": ["uuid-1", "uuid-2"],
  "skills": ["skill1", "skill2"],
  "education_requirements": ["requirement1"],
  "experience_requirements": {
    "min_years": 2,
    "max_years": 10,
    "level": "experienced"
  }
}
```

---

## Database Schema

### `job_posting_titles` (Junction Table)
```sql
CREATE TABLE job_posting_titles (
  job_posting_id UUID NOT NULL,
  job_title_id UUID NOT NULL,
  PRIMARY KEY (job_posting_id, job_title_id),
  FOREIGN KEY (job_posting_id) REFERENCES job_postings(id),
  FOREIGN KEY (job_title_id) REFERENCES job_titles(id)
);
```

### `candidate_preferences`
```sql
CREATE TABLE candidate_preferences (
  id UUID PRIMARY KEY,
  candidate_id UUID NOT NULL,
  job_title_id UUID NOT NULL,
  title VARCHAR(255) NOT NULL,
  priority INT NOT NULL,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  UNIQUE(candidate_id, title),
  FOREIGN KEY (candidate_id) REFERENCES candidates(id),
  FOREIGN KEY (job_title_id) REFERENCES job_titles(id)
);
```

---

## Key Requirements for Matching

### For Candidates:
1. **Must have selected preferred job titles** via:
   - `POST /candidates/:id/preferences` (add preference)
   - Or through job profile update

2. **Must have a job profile** with:
   - Skills (optional but recommended for better matching)
   - Education (optional but recommended)
   - Experience level (optional)

### For Job Postings:
1. **Must be tagged with canonical job titles** via:
   - `PATCH /agencies/:license/job-postings/:id/tags`
   - With `canonical_title_ids` array

2. **Should have tags for better matching**:
   - `skills`: Array of required skills
   - `education_requirements`: Array of education levels
   - `experience_requirements`: Object with min/max years and level

---

## Matching Logic Summary

```
A job posting is recommended to a candidate IF:

1. The job posting has at least one canonical_title_id that matches 
   one of the candidate's preferred job_title_ids
   
   OR (if useCanonicalTitles=false)
   
2. The job posting's skills/education/experience overlap with 
   the candidate's profile

AND

3. Other filters match (country, salary range, etc.)
```

---

## Example Flow

### Scenario: Electrician Candidate Finds Jobs

1. **Candidate Setup**:
   - Creates candidate profile
   - Adds job profile with skills: ["welding", "electrical work"]
   - Adds preference: "Electrician" (job_title_id: "abc-123")

2. **Job Posting Setup**:
   - Agency creates job posting: "Senior Electrician needed in UAE"
   - Tags it with canonical_title_ids: ["abc-123", "def-456"]
   - Adds skills: ["electrical work", "safety"]
   - Adds experience_requirements: { min_years: 3, level: "experienced" }

3. **Matching**:
   - Candidate calls: `GET /candidates/:id/relevant-jobs?useCanonicalTitles=true`
   - System finds the job because:
     - Job's canonical_title_ids includes "abc-123" (candidate's preferred title)
     - Job's skills overlap with candidate's skills
     - Job's experience requirement matches candidate's profile
   - Job is returned with fitness_score calculated

---

## Important Notes

1. **Canonical Titles are the Link**: The `job_posting_titles` junction table is the critical link between job postings and candidate preferences.

2. **Denormalization**: `CandidatePreference.title` is denormalized for backward compatibility and quick reference, but the actual matching uses `job_title_id`.

3. **Fitness Score**: When `includeScore=true`, jobs are ordered by a calculated fitness score that combines:
   - Skills overlap percentage
   - Education match percentage
   - Experience compatibility

4. **Flexibility**: If a candidate has no preferences set, the system shows all jobs (better UX for new users).

5. **Multiple Titles**: A single job posting can be linked to multiple job titles, allowing for flexible matching (e.g., "Electrician" and "Technician").

---

## Related Files

- **Service**: `src/modules/candidate/candidate.service.ts` (getRelevantJobs method)
- **Controller**: `src/modules/candidate/candidate.controller.ts` (API endpoints)
- **Entity**: `src/modules/domain/domain.entity.ts` (JobPosting)
- **Entity**: `src/modules/candidate/candidate-preference.entity.ts` (CandidatePreference)
- **DTO**: `src/modules/domain/dto/update-job-tags.dto.ts` (Tag update structure)
- **Service**: `src/modules/domain/domain.service.ts` (updateJobPostingTags method)
- **Controller**: `src/modules/agency/agency.controller.ts` (PATCH tags endpoint)
