# Draft Toggle UI Implementation

## Overview
Added a toggle draft button to the JobManagement page with full Nepali translation support and API integration.

## Changes Made

### 1. Translation Files Updated

#### English Translations
**File:** `admin_panel/UdaanSarathi2/src/translations/en/pages/job-management.json`
- Added `subtitle`: "Create and manage job postings"
- Added button translations:
  - `toggleDraft`: "Toggle Draft"
  - `markAsDraft`: "Mark as Draft"
  - `publishFromDraft`: "Publish"
- Added status translations:
  - `draft`: "Draft"
  - `published`: "Published"
- Added labels for positions and vacancies with pluralization
- Added action translations: `createNewJob`, `edit`, `retry`
- Added search placeholder
- Added empty state messages
- Added error messages
- Added success/failure messages for draft toggle

#### Nepali Translations
**File:** `admin_panel/UdaanSarathi2/src/translations/ne/pages/job-management.json`
- Complete Nepali translations for all English keys:
  - `subtitle`: "जागिर पोस्टिङ्ग बनाउनुहोस् र व्यवस्थापन गर्नुहोस्"
  - `markAsDraft`: "ड्राफ्टको रूपमा चिन्हित गर्नुहोस्"
  - `publishFromDraft`: "प्रकाशित गर्नुहोस्"
  - `draft`: "ड्राफ्ट"
  - `published`: "प्रकाशित"
  - And all other translations

### 2. API Data Source
**File:** `admin_panel/UdaanSarathi2/src/api/datasources/JobDataSource.js`

#### New Method: toggleJobPostingDraft
```javascript
async toggleJobPostingDraft(license, jobId, isDraft) {
  return httpClient.patch(
    `/agencies/${license}/job-postings/${jobId}/toggle-draft`,
    { is_draft: isDraft }
  )
}
```
- Calls the backend API endpoint
- Parameters: license, jobId, isDraft boolean
- Returns: Updated draft status response

### 3. UI Component Updates
**File:** `admin_panel/UdaanSarathi2/src/pages/JobManagement.jsx`

#### Added Imports
- `FileText` icon from lucide-react for the draft toggle button

#### Updated JobCard Component
- Added `onDraftToggle` callback prop
- Added `license` prop for API calls
- Added draft status badge showing "Draft" or "Published"
- Added toggle draft button with:
  - Dynamic styling (yellow for draft, blue for published)
  - Loading state with "..." indicator
  - Click handler that calls the API
  - Error handling with user feedback
  - Prevents event propagation to avoid triggering card click

#### Updated JobManagement Component
- Added `handleDraftToggle` function to update local state
- Passes `onDraftToggle` and `license` to JobCard component
- Updates job list when draft status changes

## UI Features

### Draft Status Badge
- Yellow badge with "Draft" text for draft jobs
- Blue badge with "Published" text for published jobs
- Positioned next to the active/inactive status badge

### Toggle Draft Button
- Positioned in the card footer next to the Edit button
- Shows "Mark as Draft" when job is published
- Shows "Publish" when job is in draft
- Displays "..." while toggling
- Disabled during API call
- Hover effect with opacity change
- FileText icon for visual clarity

### Responsive Design
- Works on mobile, tablet, and desktop
- Button layout adjusts with gap spacing
- Maintains dark mode support

## User Flow

1. User views job management page
2. Each job card displays:
   - Job title
   - Active/Inactive status badge
   - Draft/Published status badge
   - Location, positions, vacancies
   - Created date
3. User clicks toggle draft button
4. Button shows loading state ("...")
5. API call is made to toggle draft status
6. On success: Job card updates with new status
7. On error: Alert shows error message

## API Integration

### Endpoint
```
PATCH /agencies/:license/job-postings/:id/toggle-draft
```

### Request Body
```json
{
  "is_draft": true
}
```

### Response
```json
{
  "success": true,
  "is_draft": true,
  "message": "Job posting marked as draft"
}
```

## Translations Used

### English
- `buttons.markAsDraft`: "Mark as Draft"
- `buttons.publishFromDraft`: "Publish"
- `status.draft`: "Draft"
- `status.published`: "Published"
- `messages.draftToggleFailed`: "Failed to update draft status"

### Nepali
- `buttons.markAsDraft`: "ड्राफ्टको रूपमा चिन्हित गर्नुहोस्"
- `buttons.publishFromDraft`: "प्रकाशित गर्नुहोस्"
- `status.draft`: "ड्राफ्ट"
- `status.published`: "प्रकाशित"
- `messages.draftToggleFailed`: "ड्राफ्ट स्थिति अपडेट गर्न असफल"

## Error Handling
- Try-catch block catches API errors
- User-friendly error message displayed
- Button re-enables after error
- Console logs error for debugging

## State Management
- Local state tracks toggling status
- Parent component updates job list
- No page refresh needed
- Optimistic UI updates
