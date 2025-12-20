# Backend-Frontend Sync: Draft Status Implementation

## Overview
Updated the backend API to include `is_draft` flag in the editable job details response, ensuring frontend and backend are in sync for draft status operations.

## Changes Made

### 1. Backend DTO Update
**File:** `src/modules/agency/dto/job-management.dto.ts`

#### EditableJobDetailsDto Class
Added `is_draft` field to the response DTO:

```typescript
@ApiProperty({ description: 'Whether job posting is in draft status' })
is_draft!: boolean;
```

**Location:** After `is_active` field (line ~1240)

### 2. Backend Service Update
**File:** `src/modules/agency/agency-job-management.service.ts`

#### getEditableJobDetails Method
Updated the return statement to include `is_draft`:

```typescript
return {
  id: posting.id,
  posting_title: posting.posting_title,
  country: posting.country,
  // ... other fields ...
  is_active: posting.is_active,
  is_draft: posting.is_draft,  // Added this line
  cutout_url: posting.cutout_url || null,
  // ... rest of fields ...
};
```

**Location:** Line ~375

### 3. Frontend Sync
**File:** `admin_panel/UdaanSarathi2/src/pages/JobManagementEdit.jsx`

The frontend already syncs properly:
- Fetches job details via `JobDataSource.getEditableJobDetails(license, id)`
- Stores response in `jobData` state
- `is_draft` is now included in the response
- Toggle draft button uses `jobData.is_draft` to determine button text
- Status badge displays current draft status

### 4. Translations (Already Configured)

#### English Translations
**File:** `admin_panel/UdaanSarathi2/src/translations/en/pages/job-management.json`

```json
{
  "buttons": {
    "markAsDraft": "Mark as Draft",
    "publishFromDraft": "Publish"
  },
  "status": {
    "draft": "Draft",
    "published": "Published"
  },
  "messages": {
    "draftToggleSuccess": "Draft status updated successfully",
    "draftToggleFailed": "Failed to update draft status"
  }
}
```

#### Nepali Translations
**File:** `admin_panel/UdaanSarathi2/src/translations/ne/pages/job-management.json`

```json
{
  "buttons": {
    "markAsDraft": "ड्राफ्टको रूपमा चिन्हित गर्नुहोस्",
    "publishFromDraft": "प्रकाशित गर्नुहोस्"
  },
  "status": {
    "draft": "ड्राफ्ट",
    "published": "प्रकाशित"
  },
  "messages": {
    "draftToggleSuccess": "ड्राफ्ट स्थिति सफलतापूर्वक अपडेट गरिएको",
    "draftToggleFailed": "ड्राफ्ट स्थिति अपडेट गर्न असफल"
  }
}
```

## API Response Example

### Request
```
GET /agencies/123098111/job-management/35c932cb-2df7-4b1d-9cef-2d58cdcaa4bd/editable
Authorization: Bearer <token>
```

### Response (200 OK)
```json
{
  "id": "35c932cb-2df7-4b1d-9cef-2d58cdcaa4bd",
  "posting_title": "Software Engineer",
  "country": "Nepal",
  "city": "Kathmandu",
  "is_active": true,
  "is_draft": true,
  "cutout_url": null,
  "employer": {
    "id": "...",
    "company_name": "Tech Company",
    "country": "Nepal",
    "city": "Kathmandu"
  },
  "contract": {
    "id": "...",
    "period_years": 2,
    "renewable": true,
    "hours_per_day": 8,
    "days_per_week": 5,
    ...
  },
  "positions": [...],
  "tags": {...},
  "expenses": {...},
  "created_at": "2024-12-18T10:30:00Z",
  "updated_at": "2024-12-18T10:30:00Z"
}
```

## Frontend Button Behavior

### Toggle Draft Button
Located in JobManagementEdit page header

**When is_draft = true (Draft Status):**
- Button text: "Publish" (Nepali: "प्रकाशित गर्नुहोस्")
- Button color: Yellow background
- Action: Calls toggle API with `is_draft: false`

**When is_draft = false (Published Status):**
- Button text: "Mark as Draft" (Nepali: "ड्राफ्टको रूपमा चिन्हित गर्नुहोस्")
- Button color: Blue background
- Action: Calls toggle API with `is_draft: true`

### Status Badge
Located in title section

**When is_draft = true:**
- Badge text: "Draft" (Nepali: "ड्राफ्ट")
- Badge color: Yellow

**When is_draft = false:**
- Badge text: "Published" (Nepali: "प्रकाशित")
- Badge color: Blue

## Data Flow

```
1. User navigates to edit page
   ↓
2. Frontend fetches job details
   GET /agencies/:license/job-management/:id/editable
   ↓
3. Backend returns EditableJobDetailsDto with is_draft field
   ↓
4. Frontend stores response in jobData state
   ↓
5. Toggle button and status badge use jobData.is_draft
   ↓
6. User clicks toggle button
   ↓
7. Frontend calls toggle API
   PATCH /agencies/:license/job-postings/:id/toggle-draft
   ↓
8. Backend updates is_draft status
   ↓
9. Frontend updates jobData state
   ↓
10. UI re-renders with new status
```

## Sync Points

### Backend → Frontend
- API response includes `is_draft` field
- Frontend receives and stores in state
- UI components read from state

### Frontend → Backend
- Toggle button sends new `is_draft` value
- Backend updates database
- Backend returns updated status
- Frontend updates state

## Error Handling

**Toggle Failure:**
- Alert message: "Failed to update draft status" (Nepali: "ड्राफ्ट स्थिति अपडेट गर्न असफल")
- Button re-enables
- State remains unchanged
- Error logged to console

**Toggle Success:**
- Button text updates
- Status badge updates
- State synchronized
- No alert shown

## Testing Checklist

- [ ] Create new job posting (should be draft by default)
- [ ] Verify `is_draft: true` in API response
- [ ] Toggle to published (button text changes to "Mark as Draft")
- [ ] Verify `is_draft: false` in API response
- [ ] Toggle back to draft (button text changes to "Publish")
- [ ] Verify status badge updates in real-time
- [ ] Test with Nepali language selected
- [ ] Verify all translations display correctly
- [ ] Test error handling (network failure, etc.)
- [ ] Verify audit logs capture draft status changes

## Summary

✅ Backend API now includes `is_draft` in editable job details response
✅ Frontend automatically syncs with response data
✅ Toggle draft button uses current status from API response
✅ Status badge displays current draft status
✅ All translations configured (English & Nepali)
✅ Full error handling and user feedback
✅ Audit logging tracks all draft status changes
