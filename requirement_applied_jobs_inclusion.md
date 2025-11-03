# Requirement: Applied Jobs Inclusion Flag

## Overview
Add a `has_applied` flag to job position DTOs in two candidate-facing APIs to indicate whether the candidate has already applied to a specific position.

## Affected APIs

### 1. GET `/candidates/{id}/relevant-jobs/grouped`
**Purpose:** Returns relevant jobs grouped by preferred titles with fitness scores  
**Current Response:** `GroupedJobsResponseDto` containing `CandidateJobCardDto[]`  
**Position DTO:** `PositionSummaryDto` (nested in `CandidateJobCardDto.positions`)

### 2. GET `/candidates/{id}/jobs/{jobId}/mobile`
**Purpose:** Returns mobile-optimized job details with match percentage  
**Current Response:** `MobileJobPostingDto`  
**Position DTO:** `MobileJobPositionDto` (nested in `MobileJobPostingDto.positions`)

## Current Architecture Analysis

### Data Flow

#### API 1: `/candidates/{id}/relevant-jobs/grouped`
```
CandidateController.getRelevantJobsGrouped()
  ↓
CandidateService.getRelevantJobsGrouped()
  ↓
CandidateService.getRelevantJobs() (per title)
  ↓
Maps JobPosting entities to CandidateJobCardDto
  ↓
Positions mapped to PositionSummaryDto[]
```

**Location:** `/src/modules/candidate/candidate.controller.ts` (lines 531-681)  
**Service:** `/src/modules/candidate/candidate.service.ts` (lines 669-710)

#### API 2: `/candidates/{id}/jobs/{jobId}/mobile`
```
CandidateController.getJobMobile()
  ↓
DomainService.jobbyidmobile()
  ↓
Maps JobPosting to MobileJobPostingDto
  ↓
Positions mapped to MobileJobPositionDto[]
```

**Location:** `/src/modules/candidate/candidate.controller.ts` (lines 99-171)  
**Service:** `/src/modules/domain/domain.service.ts` (lines 270-349)

### Application Tracking

**Entity:** `JobApplication` (`/src/modules/application/job-application.entity.ts`)

**Key Fields:**
- `candidate_id` (UUID) - The candidate who applied
- `job_posting_id` (UUID) - The job posting
- `position_id` (UUID) - The specific position within the posting
- `status` - Application status (applied, shortlisted, interview_scheduled, etc.)

**Indexes:**
- `idx_job_applications_candidate` on `candidate_id`
- `idx_job_applications_posting` on `job_posting_id`
- `idx_job_applications_candidate_created` on `(candidate_id, created_at)`

**Service:** `ApplicationService` (`/src/modules/application/application.service.ts`)

## Requirements

### Functional Requirements

1. **Add `has_applied` flag to Position DTOs**
   - `PositionSummaryDto` (for grouped API)
   - `MobileJobPositionDto` (for mobile API)

2. **Query Logic**
   - For a given `candidate_id` and list of `position_id`s, determine which positions have applications
   - Check `job_applications` table: `WHERE candidate_id = ? AND position_id IN (?)`
   - Flag should be `true` if an application exists (regardless of status)
   - Flag should be `false` if no application exists

3. **Performance Considerations**
   - Batch query all position IDs at once (avoid N+1 queries)
   - Use a single query with `IN` clause for multiple positions
   - Consider caching if needed (future optimization)

### Non-Functional Requirements

1. **Backward Compatibility**
   - New field should be optional in DTOs
   - Existing API consumers should not break

2. **Performance**
   - Single batch query per API call
   - No additional database round trips per position

## Implementation Plan

### Phase 1: Update DTOs

#### Task 1.1: Update `PositionSummaryDto`
**File:** `/src/modules/candidate/dto/position-summary.dto.ts`

**Changes:**
```typescript
@ApiProperty({ 
  description: 'Whether the candidate has applied to this position',
  example: true,
  required: false 
})
has_applied?: boolean;
```

#### Task 1.2: Update `MobileJobPositionDto`
**File:** `/src/modules/candidate/dto/mobile-job.dto.ts`

**Changes:**
```typescript
@ApiPropertyOptional({ 
  type: Boolean,
  description: 'Whether the candidate has applied to this position'
})
hasApplied?: boolean;
```

### Phase 2: Create Helper Service Method

#### Task 2.1: Add method to `ApplicationService`
**File:** `/src/modules/application/application.service.ts`

**New Method:**
```typescript
/**
 * Check which positions a candidate has applied to
 * @param candidateId - The candidate's UUID
 * @param positionIds - Array of position UUIDs to check
 * @returns Set of position IDs that have applications
 */
async getAppliedPositionIds(
  candidateId: string, 
  positionIds: string[]
): Promise<Set<string>> {
  if (positionIds.length === 0) return new Set();
  
  const applications = await this.appRepo.find({
    where: {
      candidate_id: candidateId,
      position_id: In(positionIds)
    },
    select: ['position_id']
  });
  
  return new Set(applications.map(app => app.position_id));
}
```

### Phase 3: Update API 1 - Grouped Jobs

#### Task 3.1: Inject `ApplicationService` into `CandidateController`
**File:** `/src/modules/candidate/candidate.controller.ts`

**Changes:**
- Add `ApplicationService` to constructor dependencies
- Import from `../application/application.service`

#### Task 3.2: Update `CandidateModule` imports
**File:** `/src/modules/candidate/candidate.module.ts`

**Changes:**
- Import `ApplicationModule` 
- Add to module imports array

#### Task 3.3: Modify `getRelevantJobsGrouped` method
**File:** `/src/modules/candidate/candidate.controller.ts` (lines 545-681)

**Implementation Strategy:**
1. After fetching grouped jobs, collect all position IDs from all jobs
2. Call `applicationService.getAppliedPositionIds(candidateId, allPositionIds)`
3. When mapping positions to DTOs (line 605-630), check if position.id is in the applied set
4. Set `has_applied` flag accordingly

**Pseudo-code:**
```typescript
// After line 596: const res = await this.candidates.getRelevantJobsGrouped(id, opts);

// Collect all position IDs
const allPositionIds: string[] = [];
for (const group of res.groups || []) {
  for (const job of group.jobs || []) {
    const contract = Array.isArray(job.contracts) ? job.contracts[0] : undefined;
    const positions = contract?.positions || [];
    allPositionIds.push(...positions.map(p => p.id));
  }
}

// Batch query for applications
const appliedPositionIds = await this.applicationService.getAppliedPositionIds(id, allPositionIds);

// Then in the position mapping (line 618-629), add:
has_applied: appliedPositionIds.has(position.id)
```

### Phase 4: Update API 2 - Mobile Job

#### Task 4.1: Modify `getJobMobile` method
**File:** `/src/modules/candidate/candidate.controller.ts` (lines 104-171)

**Implementation Strategy:**
1. After getting mobile job data (line 109), extract position IDs
2. Call `applicationService.getAppliedPositionIds(candidateId, positionIds)`
3. Add `hasApplied` flag to each position in the response

**Pseudo-code:**
```typescript
// After line 109: const mobile = await this.jobPostingService.jobbyidmobile(jobId);

// Extract position IDs
const positionIds = mobile.positions?.map(p => p.id) || [];

// Query for applications
const appliedPositionIds = await this.applicationService.getAppliedPositionIds(id, positionIds);

// Add hasApplied flag to each position
if (mobile.positions) {
  mobile.positions = mobile.positions.map(pos => ({
    ...pos,
    hasApplied: appliedPositionIds.has(pos.id)
  }));
}
```

### Phase 5: Testing

#### Task 5.1: Unit Tests
- Test `ApplicationService.getAppliedPositionIds()` with various scenarios:
  - Empty position list
  - No applications
  - Some applications
  - All positions applied

#### Task 5.2: Integration Tests
- Test both APIs with:
  - Candidate who has not applied to any positions
  - Candidate who has applied to some positions
  - Candidate who has applied to all positions

#### Task 5.3: Manual Testing
- Verify API responses include `has_applied` / `hasApplied` flags
- Verify performance (no N+1 queries)
- Check database query logs

## Database Query Pattern

### Efficient Batch Query
```sql
SELECT position_id 
FROM job_applications 
WHERE candidate_id = $1 
  AND position_id IN ($2, $3, $4, ...)
```

**Indexes Used:**
- `idx_job_applications_candidate` (on `candidate_id`)
- Composite lookup on `(candidate_id, position_id)`

**Expected Performance:**
- Single query per API call
- O(1) lookup using Set data structure
- Minimal overhead

## Edge Cases

1. **No positions in job posting** → Return empty array, no query needed
2. **Candidate has multiple applications to same position** → Should not happen (unique constraint), but flag should still be true
3. **Withdrawn applications** → Still count as "applied" (has_applied = true)
4. **Position deleted but application exists** → Flag will be false (position not in current job)

## Rollout Strategy

1. Deploy DTO changes (backward compatible)
2. Deploy service method
3. Deploy controller changes
4. Monitor performance and error rates
5. Verify with frontend team

## Success Criteria

- [ ] Both DTOs updated with new flag
- [ ] Helper method added to ApplicationService
- [ ] API 1 returns `has_applied` for each position
- [ ] API 2 returns `hasApplied` for each position
- [ ] Single batch query per API call (verified in logs)
- [ ] No breaking changes to existing consumers
- [ ] Tests pass
- [ ] Performance metrics acceptable

## Files to Modify

1. `/src/modules/candidate/dto/position-summary.dto.ts` - Add `has_applied` field
2. `/src/modules/candidate/dto/mobile-job.dto.ts` - Add `hasApplied` field
3. `/src/modules/application/application.service.ts` - Add `getAppliedPositionIds()` method
4. `/src/modules/candidate/candidate.controller.ts` - Update both API methods
5. `/src/modules/candidate/candidate.module.ts` - Import ApplicationModule

## Dependencies

- `ApplicationModule` must be imported into `CandidateModule`
- `ApplicationService` must be injected into `CandidateController`
- TypeORM `In()` operator for batch queries

## Example API Responses

### API 1: GET `/candidates/{candidateId}/relevant-jobs/grouped`

**Response Structure:**
```json
{
  "groups": [
    {
      "title": "Electrician",
      "jobs": [
        {
          "id": "550e8400-e29b-41d4-a716-446655440000",
          "posting_title": "Electrical Workers Needed - UAE",
          "country": "United Arab Emirates",
          "city": "Dubai",
          "primary_titles": ["Senior Electrician", "Junior Electrician"],
          "salary": {
            "monthly_min": 2500,
            "monthly_max": 4000,
            "currency": "USD",
            "converted": [
              { "amount": 333333.33, "currency": "NPR" },
              { "amount": 2500, "currency": "USD" }
            ]
          },
          "agency": {
            "name": "Global Manpower Services",
            "license_number": "MAN-2023-001"
          },
          "employer": {
            "company_name": "Dubai Construction Ltd",
            "country": "United Arab Emirates",
            "city": "Dubai"
          },
          "posting_date_ad": "2024-10-15T00:00:00.000Z",
          "cutout_url": "https://example.com/images/job-123.jpg",
          "fitness_score": 85,
          "positions": [
            {
              "id": "a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d",
              "title": "Senior Electrician",
              "male_vacancies": 5,
              "female_vacancies": 0,
              "total_vacancies": 5,
              "monthly_salary_amount": 4000,
              "salary_currency": "USD",
              "salary_display": "4000 USD",
              "converted_salaries": [
                { "amount": 533333.33, "currency": "NPR" },
                { "amount": 4000, "currency": "USD" }
              ],
              "notes": "5+ years experience required",
              "has_applied": true
            },
            {
              "id": "b2c3d4e5-f6a7-4b5c-9d0e-1f2a3b4c5d6e",
              "title": "Junior Electrician",
              "male_vacancies": 3,
              "female_vacancies": 2,
              "total_vacancies": 5,
              "monthly_salary_amount": 2500,
              "salary_currency": "USD",
              "salary_display": "2500 USD",
              "converted_salaries": [
                { "amount": 333333.33, "currency": "NPR" },
                { "amount": 2500, "currency": "USD" }
              ],
              "notes": "1-2 years experience",
              "has_applied": false
            }
          ]
        }
      ]
    },
    {
      "title": "Plumber",
      "jobs": [
        {
          "id": "660e8400-e29b-41d4-a716-446655440001",
          "posting_title": "Skilled Plumbers - Qatar",
          "country": "Qatar",
          "city": "Doha",
          "primary_titles": ["Master Plumber"],
          "salary": {
            "monthly_min": 3000,
            "monthly_max": 3000,
            "currency": "USD",
            "converted": [
              { "amount": 400000, "currency": "NPR" },
              { "amount": 3000, "currency": "USD" }
            ]
          },
          "agency": {
            "name": "Overseas Employment Agency",
            "license_number": "MAN-2023-045"
          },
          "employer": {
            "company_name": "Qatar Infrastructure Corp",
            "country": "Qatar",
            "city": "Doha"
          },
          "posting_date_ad": "2024-10-20T00:00:00.000Z",
          "cutout_url": null,
          "fitness_score": 78,
          "positions": [
            {
              "id": "c3d4e5f6-a7b8-4c5d-0e1f-2a3b4c5d6e7f",
              "title": "Master Plumber",
              "male_vacancies": 10,
              "female_vacancies": 0,
              "total_vacancies": 10,
              "monthly_salary_amount": 3000,
              "salary_currency": "USD",
              "salary_display": "3000 USD",
              "converted_salaries": [
                { "amount": 400000, "currency": "NPR" },
                { "amount": 3000, "currency": "USD" }
              ],
              "notes": "Industrial plumbing experience preferred",
              "has_applied": false
            }
          ]
        }
      ]
    }
  ]
}
```

### API 2: GET `/candidates/{candidateId}/jobs/{jobId}/mobile`

**Response Structure:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "postingTitle": "Electrical Workers Needed - UAE",
  "country": "United Arab Emirates",
  "city": "Dubai",
  "agency": "Global Manpower Services",
  "employer": "Dubai Construction Ltd",
  "positions": [
    {
      "id": "a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d",
      "title": "Senior Electrician",
      "baseSalary": "USD 4000",
      "convertedSalary": "NPR 533333.33",
      "currency": "USD",
      "requirements": ["5+ years experience required"],
      "hasApplied": true
    },
    {
      "id": "b2c3d4e5-f6a7-4b5c-9d0e-1f2a3b4c5d6e",
      "title": "Junior Electrician",
      "baseSalary": "USD 2500",
      "convertedSalary": "NPR 333333.33",
      "currency": "USD",
      "requirements": ["1-2 years experience"],
      "hasApplied": false
    }
  ],
  "description": "We are seeking qualified electricians for various projects in Dubai...",
  "contractTerms": {
    "type": "Full-time",
    "duration": "2 years",
    "isRenewable": true
  },
  "isActive": true,
  "postedDate": "2024-10-15T00:00:00.000Z",
  "location": "Dubai, United Arab Emirates",
  "experience": "1-5 years",
  "salary": "USD 2500 - USD 4000",
  "type": "Full-time",
  "isRemote": false,
  "isFeatured": true,
  "matchPercentage": "85",
  "applications": 42
}
```

### Key Differences Between APIs

| Aspect | API 1 (Grouped) | API 2 (Mobile) |
|--------|----------------|----------------|
| **Flag Name** | `has_applied` | `hasApplied` |
| **Naming Convention** | snake_case | camelCase |
| **Position Details** | Full details (vacancies, salary breakdown) | Simplified (formatted strings) |
| **Context** | Multiple jobs grouped by title | Single job with match percentage |
| **Use Case** | Job browsing/discovery | Detailed job view |

### Flag Behavior Examples

**Scenario 1: Candidate has applied to Senior Electrician position**
- Senior Electrician: `has_applied: true` / `hasApplied: true`
- Junior Electrician: `has_applied: false` / `hasApplied: false`

**Scenario 2: Candidate has not applied to any positions**
- All positions: `has_applied: false` / `hasApplied: false`

**Scenario 3: Candidate has withdrawn application**
- Position with withdrawn application: `has_applied: true` / `hasApplied: true`
- *(Flag indicates "has ever applied", not current active status)*

## Timeline Estimate

- Phase 1 (DTOs): 15 minutes
- Phase 2 (Service method): 20 minutes
- Phase 3 (API 1): 30 minutes
- Phase 4 (API 2): 20 minutes
- Phase 5 (Testing): 30 minutes

**Total:** ~2 hours
