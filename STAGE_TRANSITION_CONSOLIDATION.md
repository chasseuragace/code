# Stage Transition API Consolidation Plan

## Current Status: Multiple Implementations Found ❌

The frontend has **multiple scattered implementations** of stage transition logic across different files. This needs to be consolidated into a **single service**.

## Existing Working API Endpoints (Backend)

These are the **ONLY** endpoints we should use:

```
✅ POST /applications/:id/shortlist
✅ POST /applications/:id/schedule-interview
✅ POST /applications/:id/reschedule-interview
✅ POST /applications/:id/complete-interview
✅ POST /applications/:id/withdraw
✅ POST /applications/:id/update-status (generic fallback)
```

## Files Using Stage Transitions (Need Update)

### 1. **applicationService.js** ⚠️ DUPLICATE IMPLEMENTATION
**Location:** `src/services/applicationService.js`

**Current Issues:**
- Has its own `updateApplicationStage()` method (lines 343-372)
- Calls ApplicationDataSource and InterviewDataSource directly
- Duplicates logic that should be in stageTransitionService

**Action Required:**
- ✅ Keep the method for backward compatibility
- ✅ Make it delegate to `stageTransitionService.updateStage()`
- ✅ Remove duplicate logic

### 2. **WorkflowV2.jsx** ✅ UPDATED
**Location:** `src/pages/WorkflowV2.jsx`

**Status:** Already updated to use `stageTransitionService`

### 3. **Workflow.jsx** ⚠️ NEEDS UPDATE
**Location:** `src/pages/Workflow.jsx`

**Current Code:**
```javascript
await applicationService.updateApplicationStage(candidate.application.id, newStage)
```

**Should Be:**
```javascript
await stageTransitionService.updateStage(
  candidate.application.id,
  candidate.application.stage,
  newStage,
  { note: 'Updated from workflow' }
)
```

### 4. **Applications.jsx** ⚠️ NEEDS UPDATE
**Location:** `src/pages/Applications.jsx`

**Multiple Calls Found:**
- Line 356: `applicationService.updateApplicationStage()`
- Line 431: `applicationService.updateApplicationStage()`
- Line 492: `applicationService.updateApplicationStage()` (bulk)
- Line 596: `applicationService.updateApplicationStage()`

**Action Required:**
- Replace all with `stageTransitionService.updateStage()`
- Use `stageTransitionService.bulkShortlist()` for bulk operations

### 5. **JobDetails.jsx** ⚠️ NEEDS UPDATE
**Location:** `src/pages/JobDetails.jsx`

**Multiple Calls Found:**
- Line 287: `ApplicationDataSource.shortlistApplication()` (direct call)
- Line 480: `applicationService.updateApplicationStage()`
- Line 569: `applicationService.updateApplicationStage()`

**Action Required:**
- Replace all with `stageTransitionService` methods

### 6. **CandidateSummaryS2.jsx** ⚠️ NEEDS UPDATE
**Location:** `src/components/CandidateSummaryS2.jsx`

**Current Code:**
```javascript
await applicationService.updateApplicationStage(applicationId, newStage)
```

**Action Required:**
- Replace with `stageTransitionService.updateStage()`

### 7. **CandidateShortlist.jsx** ⚠️ NEEDS UPDATE
**Location:** `src/components/CandidateShortlist.jsx`

**Current Code:**
```javascript
await applicationService.updateApplicationStage(candidate.application.id, newStage)
```

**Action Required:**
- Replace with `stageTransitionService.updateStage()`

## Unified Service Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                  stageTransitionService.js                   │
│                  (SINGLE SOURCE OF TRUTH)                    │
│                                                              │
│  Methods:                                                    │
│  - shortlistApplication(appId, note)                        │
│  - scheduleInterview(appId, details)                        │
│  - rescheduleInterview(appId, interviewId, updates)         │
│  - passInterview(appId, note)                               │
│  - failInterview(appId, note)                               │
│  - rejectApplication(appId, reason)                         │
│  - updateStage(appId, currentStage, targetStage, options)   │
│  - bulkShortlist(appIds, note)                              │
│  - bulkReject(appIds, reason)                               │
│                                                              │
│  Validation:                                                 │
│  - validateStageTransition(current, target)                 │
│  - getValidNextStages(current)                              │
│  - getNextAllowedStage(current)                             │
└─────────────────────────────────────────────────────────────┘
                            ↓
                            ↓ Uses
                            ↓
┌─────────────────────────────────────────────────────────────┐
│              ApplicationDataSource.js                        │
│              InterviewDataSource.js                          │
│              (Direct API Calls)                              │
└─────────────────────────────────────────────────────────────┘
                            ↓
                            ↓ Calls
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    Backend API                               │
│  POST /applications/:id/shortlist                           │
│  POST /applications/:id/schedule-interview                  │
│  POST /applications/:id/complete-interview                  │
│  etc.                                                        │
└─────────────────────────────────────────────────────────────┘
```

## Migration Plan

### Phase 1: Update applicationService.js ✅
Make `updateApplicationStage()` delegate to `stageTransitionService`:

```javascript
async updateApplicationStage(applicationId, newStage) {
  // Delegate to unified service
  return stageTransitionService.updateStage(
    applicationId,
    'unknown', // We don't have current stage here
    newStage,
    { note: 'Updated via application service' }
  )
}
```

### Phase 2: Update All Pages
Replace all direct calls with `stageTransitionService`:

**Before:**
```javascript
await applicationService.updateApplicationStage(appId, newStage)
```

**After:**
```javascript
await stageTransitionService.updateStage(appId, currentStage, newStage, {
  note: 'Updated from [page name]'
})
```

### Phase 3: Update Components
Same as Phase 2 but for components like CandidateSummaryS2, CandidateShortlist, etc.

### Phase 4: Remove Duplicates
Once all pages/components are updated:
- Keep `applicationService.updateApplicationStage()` as a thin wrapper
- Remove any other duplicate implementations

## Benefits of Consolidation

### ✅ Single Source of Truth
- All stage transitions go through one service
- Easier to maintain and debug
- Consistent validation across the app

### ✅ Reuse Existing APIs
- No new backend endpoints needed
- Uses proven, working endpoints
- Reduces backend complexity

### ✅ Better Validation
- Centralized stage transition rules
- Consistent error messages
- Prevents invalid transitions

### ✅ Easier Testing
- Test one service instead of many
- Mock once, use everywhere
- Better test coverage

### ✅ Audit Trail
- All transitions logged in one place
- Easier to track who changed what
- Better compliance

## Implementation Checklist

- [x] Create `stageTransitionService.js`
- [x] Update `WorkflowV2.jsx` to use it
- [ ] Update `applicationService.js` to delegate
- [ ] Update `Workflow.jsx`
- [ ] Update `Applications.jsx`
- [ ] Update `JobDetails.jsx`
- [ ] Update `CandidateSummaryS2.jsx`
- [ ] Update `CandidateShortlist.jsx`
- [ ] Test all pages
- [ ] Remove duplicate code
- [ ] Update documentation

## Testing Strategy

### Unit Tests
```javascript
describe('stageTransitionService', () => {
  it('should validate stage transitions', () => {
    expect(service.validateStageTransition('applied', 'shortlisted')).toBe(true)
    expect(service.validateStageTransition('applied', 'interview_passed')).toBe(false)
  })
  
  it('should shortlist application', async () => {
    const result = await service.shortlistApplication('app-123', 'Good candidate')
    expect(result.status).toBe('shortlisted')
  })
})
```

### Integration Tests
- Test from each page (Workflow, JobDetails, Applications)
- Verify API calls are made correctly
- Verify UI updates after transition
- Verify error handling

### E2E Tests
- Complete workflow: applied → shortlisted → interview_scheduled → interview_passed
- Test invalid transitions are blocked
- Test bulk operations
- Test from different pages

## API Endpoint Usage Map

| Frontend Method | Backend Endpoint | Status |
|----------------|------------------|--------|
| `shortlistApplication()` | `POST /applications/:id/shortlist` | ✅ Working |
| `scheduleInterview()` | `POST /applications/:id/schedule-interview` | ✅ Working |
| `rescheduleInterview()` | `POST /applications/:id/reschedule-interview` | ✅ Working |
| `passInterview()` | `POST /applications/:id/complete-interview` | ✅ Working |
| `failInterview()` | `POST /applications/:id/complete-interview` | ✅ Working |
| `rejectApplication()` | `POST /applications/:id/withdraw` | ✅ Working |
| `updateStage()` (generic) | `POST /applications/:id/update-status` | ✅ Working |

## Files to Update Summary

```
Total Files: 7
Updated: 1 (WorkflowV2.jsx)
Remaining: 6

Priority Order:
1. applicationService.js (high - used by many)
2. Workflow.jsx (high - main workflow page)
3. Applications.jsx (high - multiple calls)
4. JobDetails.jsx (medium - multiple calls)
5. CandidateSummaryS2.jsx (medium - used in multiple places)
6. CandidateShortlist.jsx (low - single call)
```

## Next Steps

1. Update `applicationService.js` to delegate to `stageTransitionService`
2. Update all pages one by one
3. Test each page after update
4. Remove any duplicate code
5. Update documentation
6. Create migration guide for other developers
