# Draft Toggle Button - Edit Page Implementation

## Overview
Added a toggle draft button to the JobManagementEdit page with full Nepali translation support and API integration.

## Changes Made

### 1. JobManagementEdit Component
**File:** `admin_panel/UdaanSarathi2/src/pages/JobManagementEdit.jsx`

#### Imports
- Added `FileText` icon from lucide-react

#### State
- Added `isTogglingDraft` state to track loading status

#### Handler Function
```javascript
const handleToggleDraft = async () => {
  setIsTogglingDraft(true);
  try {
    const newDraftStatus = !jobData.is_draft;
    await JobDataSource.toggleJobPostingDraft(license, id, newDraftStatus);
    setJobData(prev => ({ ...prev, is_draft: newDraftStatus }));
  } catch (err) {
    console.error('Failed to toggle draft status:', err);
    alert(tPage('messages.draftToggleFailed'));
  } finally {
    setIsTogglingDraft(false);
  }
};
```

#### UI Components

**1. Toggle Draft Button (Header)**
- Location: Top right of the page header, next to upload buttons
- Styling:
  - Yellow background when draft: `bg-yellow-100 text-yellow-800`
  - Blue background when published: `bg-blue-100 text-blue-800`
  - Dark mode support
  - Hover effects
- Text:
  - "Mark as Draft" when published
  - "Publish" when in draft
  - "..." while toggling
- Icon: FileText icon
- Disabled during API call

**2. Draft Status Badge (Title Section)**
- Location: Right side of the title area
- Shows current draft status:
  - Yellow badge with "Draft" text
  - Blue badge with "Published" text
- Updates in real-time when toggled

### 2. Translation Files
**Files:** 
- `admin_panel/UdaanSarathi2/src/translations/en/pages/job-management.json`
- `admin_panel/UdaanSarathi2/src/translations/ne/pages/job-management.json`

#### Keys Used
- `buttons.markAsDraft`: "Mark as Draft" / "ड्राफ्टको रूपमा चिन्हित गर्नुहोस्"
- `buttons.publishFromDraft`: "Publish" / "प्रकाशित गर्नुहोस्"
- `status.draft`: "Draft" / "ड्राफ्ट"
- `status.published`: "Published" / "प्रकाशित"
- `messages.draftToggleFailed`: "Failed to update draft status" / "ड्राफ्ट स्थिति अपडेट गर्न असफल"

### 3. API Data Source
**File:** `admin_panel/UdaanSarathi2/src/api/datasources/JobDataSource.js`

#### Method
```javascript
async toggleJobPostingDraft(license, jobId, isDraft) {
  return httpClient.patch(
    `/agencies/${license}/job-postings/${jobId}/toggle-draft`,
    { is_draft: isDraft }
  )
}
```

## User Flow

1. User navigates to job edit page
2. Page displays:
   - Job title
   - Location (country, city)
   - Draft/Published status badge
   - Toggle draft button in header
3. User clicks toggle draft button
4. Button shows loading state ("...")
5. API call is made to toggle draft status
6. On success:
   - Button text updates
   - Status badge updates
   - Job data is updated
7. On error:
   - Alert shows error message
   - Button re-enables

## UI Layout

```
┌─────────────────────────────────────────────────────────────┐
│ ← Back to Job Management    [Toggle Draft] [Upload] [Upload] │
├─────────────────────────────────────────────────────────────┤
│ Job Title                                    [Draft/Published] │
│ Country, City                                                  │
└─────────────────────────────────────────────────────────────┘
```

## Styling Details

### Toggle Draft Button
- **Draft State (Yellow)**
  - Background: `bg-yellow-100`
  - Text: `text-yellow-800`
  - Dark: `dark:bg-yellow-900 dark:text-yellow-200`
  - Hover: `hover:bg-yellow-200 dark:hover:bg-yellow-800`

- **Published State (Blue)**
  - Background: `bg-blue-100`
  - Text: `text-blue-800`
  - Dark: `dark:bg-blue-900 dark:text-blue-200`
  - Hover: `hover:bg-blue-200 dark:hover:bg-blue-800`

- **Disabled State**
  - Opacity: `disabled:opacity-50`
  - Cursor: `disabled:cursor-not-allowed`

### Status Badge
- Same color scheme as button
- Positioned in title section
- Smaller font size (text-xs)
- Rounded corners

## Error Handling
- Try-catch block catches API errors
- User-friendly alert message
- Button re-enables after error
- Console logs error for debugging

## State Management
- Local state tracks toggling status
- Job data updates immediately on success
- No page refresh needed
- Real-time UI updates

## Responsive Design
- Works on mobile, tablet, and desktop
- Button layout adjusts with gap spacing
- Title section flexes to accommodate badge
- Maintains dark mode support

## Accessibility
- Proper button semantics
- Disabled state prevents interaction
- Clear visual feedback
- Icon + text for clarity
- Keyboard accessible
