# Application Reapplication Logic Implementation

## Overview
Implemented logic to prevent duplicate job applications while allowing candidates to reapply after withdrawing a previous application.

## Changes Made

### 1. Modified `apply()` method in `application.service.ts`
**Location:** Line 103-109

**Before:**
```typescript
const existing = await this.appRepo.findOne({ 
  where: { 
    candidate_id: candidateId, 
    job_posting_id: jobPostingId,
    position_id: positionId
  } 
});
if (existing) throw new Error('Candidate has already applied to this position');
```

**After:**
```typescript
const existing = await this.appRepo.findOne({ 
  where: { 
    candidate_id: candidateId, 
    job_posting_id: jobPostingId,
    position_id: positionId
  } 
});
if (existing && existing.status !== 'withdrawn') {
  throw new Error('Candidate has already applied to this position');
}
```

**Behavior:**
- Prevents duplicate applications for the same candidate/job/position combination
- Allows reapplication only if the previous application was withdrawn
- Blocks reapplication if the previous application is in any other status (applied, shortlisted, interview_scheduled, interview_rescheduled, interview_passed, interview_failed)

### 2. Updated `getAppliedPositionIds()` method in `application.service.ts`
**Location:** Line 470-495

**Before:**
```typescript
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

**After:**
```typescript
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
    select: ['position_id', 'status']
  });
  
  // Filter out withdrawn applications
  return new Set(
    applications
      .filter(app => app.status !== 'withdrawn')
      .map(app => app.position_id)
  );
}
```

**Behavior:**
- Now excludes withdrawn applications when checking which positions a candidate has applied to
- This ensures that withdrawn positions are not marked as "already applied" in the UI
- Allows the frontend to show withdrawn positions as available for reapplication

## Business Logic

### Application Workflow
1. **Initial Application:** Candidate applies for a job → Status: `applied`
2. **During Processing:** Application can transition through various statuses (shortlisted, interview_scheduled, etc.)
3. **Withdrawal:** Candidate withdraws application → Status: `withdrawn`
4. **Reapplication:** After withdrawal, candidate can apply again for the same job/position

### Prevented Scenarios
- ❌ Candidate cannot apply twice while application is in `applied` status
- ❌ Candidate cannot apply while application is in `shortlisted` status
- ❌ Candidate cannot apply while application is in `interview_scheduled` status
- ❌ Candidate cannot apply while application is in `interview_rescheduled` status
- ❌ Candidate cannot apply while application is in `interview_passed` status
- ❌ Candidate cannot apply while application is in `interview_failed` status (rejected)

### Allowed Scenarios
- ✅ Candidate can apply after withdrawing a previous application
- ✅ Candidate can apply to the same job/position multiple times if each previous application was withdrawn

## API Endpoint
**POST /applications**

### Request Body
```json
{
  "candidate_id": "uuid",
  "job_posting_id": "uuid",
  "position_id": "uuid",
  "note": "optional note",
  "updatedBy": "optional user identifier"
}
```

### Error Responses
- **400 Bad Request:** "Candidate has already applied to this position" (if previous application is not withdrawn)
- **400 Bad Request:** "Candidate not found"
- **400 Bad Request:** "Job posting not found"
- **400 Bad Request:** "Position not found"
- **400 Bad Request:** "Job posting is not active"
- **400 Bad Request:** "Position does not belong to the specified job posting"

## Testing Scenarios

### Test Case 1: Prevent Duplicate Application
1. Candidate applies for Job A, Position X → Success (Status: applied)
2. Candidate tries to apply for Job A, Position X again → Error: "Candidate has already applied to this position"

### Test Case 2: Allow Reapplication After Withdrawal
1. Candidate applies for Job A, Position X → Success (Status: applied)
2. Candidate withdraws application → Success (Status: withdrawn)
3. Candidate applies for Job A, Position X again → Success (New application created)

### Test Case 3: Prevent Application During Interview
1. Candidate applies for Job A, Position X → Success (Status: applied)
2. Application is shortlisted → Success (Status: shortlisted)
3. Interview is scheduled → Success (Status: interview_scheduled)
4. Candidate tries to apply for Job A, Position X again → Error: "Candidate has already applied to this position"

### Test Case 4: Prevent Application After Rejection
1. Candidate applies for Job A, Position X → Success (Status: applied)
2. Application is rejected → Success (Status: interview_failed)
3. Candidate tries to apply for Job A, Position X again → Error: "Candidate has already applied to this position"

## Database Considerations
- No schema changes required
- Existing `status` field in `job_applications` table is used
- Existing `withdrawn_at` timestamp field tracks withdrawal time
- History is maintained in `history_blob` JSONB field for audit trail
