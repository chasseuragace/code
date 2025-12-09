# Workflow Page Status

## ✅ Search Functionality
**Status:** FULLY SUPPORTED

The workflow API supports search with the following fields:
- Name
- Phone
- Passport number
- Email

**Implementation:**
```javascript
// In workflowApiService.js
if (filters.search) {
  params.append('search', filters.search);
}
```

The search parameter is sent to the backend endpoint:
```
GET /workflow/candidates?search=<query>
```

The UI placeholder text correctly states: "Search by name, phone, passport, email..."

## ⚠️ Interview Failed Stage
**Status:** BACKEND SUPPORTED, UI DEPENDS ON BACKEND RESPONSE

### Backend Support:
✅ The `stageTransitionService` fully supports `interview_failed`:
- `failInterview(applicationId, note)` method exists
- Stage transition validation allows `interview_scheduled` → `interview_failed`
- Stage label: "Interview Failed"
- Stage color: Red chip

### UI Implementation:
✅ The WorkflowV2 page has a **Fail** button for `interview_scheduled` and `interview_rescheduled` statuses
✅ The CandidateSummaryS2 component has a **Fail** button for `interview_scheduled` status
✅ Clicking Fail shows a confirmation dialog and moves the candidate to `interview_failed`

### Stage Display:
The stages shown in the analytics section come from the backend API:
```
GET /workflow/stages
```

**If `interview_failed` is not showing in the UI:**
1. Check if the backend `/workflow/stages` endpoint returns `interview_failed` in the stages list
2. Check if there are any candidates with `interview_failed` status in `analytics.by_stage.interview_failed`

**The UI will automatically display the stage if:**
- The backend includes it in the stages response
- There are candidates with that status

## 🔧 Recent Fixes Applied

### 1. Filter Update Issue - FIXED ✅
**Problem:** UI wasn't updating when filters changed
**Solution:** 
- Wrapped `loadData` in `useCallback` with proper dependencies
- Removed unnecessary `setTimeout` in `handleStageChange`
- Fixed useEffect dependencies to trigger on filter changes

### 2. JSX Syntax Error - FIXED ✅
**Problem:** Leftover code fragments in Applications.jsx
**Solution:** Removed stray closing tags from removed Move/Reject buttons

### 3. Reschedule Button - FIXED ✅
**Problem:** Reschedule button in WorkflowV2 couldn't access parent state
**Solution:** Added `onRescheduleInterview` prop to CandidateWorkflowCard component

## 📊 Current Stage Flow

```
applied
  ↓ (Shortlist button)
shortlisted
  ↓ (Schedule Interview button)
interview_scheduled / interview_rescheduled
  ↓ (Pass button)          ↓ (Fail button)
interview_passed        interview_failed
```

## 🎯 Action Buttons by Stage

| Stage | Available Actions |
|-------|------------------|
| `applied` | Shortlist |
| `shortlisted` | Schedule Interview |
| `interview_scheduled` | Pass, Fail, Reschedule |
| `interview_rescheduled` | Pass, Fail, Reschedule |
| `interview_passed` | Final Stage (no actions) |
| `interview_failed` | Final Stage (no actions) |

## 🔍 To Verify Backend Support

Run these checks:

1. **Check stages endpoint:**
```bash
curl -H "Authorization: Bearer <token>" \
  http://localhost:3000/workflow/stages
```

Expected response should include:
```json
{
  "success": true,
  "data": {
    "stages": [
      { "id": "applied", "label": "Applied" },
      { "id": "shortlisted", "label": "Shortlisted" },
      { "id": "interview_scheduled", "label": "Interview Scheduled" },
      { "id": "interview_rescheduled", "label": "Interview Rescheduled" },
      { "id": "interview_passed", "label": "Interview Passed" },
      { "id": "interview_failed", "label": "Interview Failed" }
    ]
  }
}
```

2. **Check if search works:**
```bash
curl -H "Authorization: Bearer <token>" \
  "http://localhost:3000/workflow/candidates?search=john"
```

3. **Check analytics for interview_failed count:**
```bash
curl -H "Authorization: Bearer <token>" \
  http://localhost:3000/workflow/candidates
```

Look for `analytics.by_stage.interview_failed` in the response.
