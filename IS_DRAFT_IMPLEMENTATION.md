# Job Posting Draft Status Implementation

## Overview
Added `isDraft` field to job posting schema with a dedicated API endpoint to toggle draft status. Includes authentication and audit logging.

## Changes Made

### 1. Entity Model
**File:** `src/modules/domain/domain.entity.ts`
- Added `is_draft` field to `JobPosting` entity
- Type: `boolean`
- Default: `true`

### 2. Service Layer
**File:** `src/modules/domain/domain.service.ts`

#### Updated DTO
- Added `is_draft?: boolean` to `CreateJobPostingDto`

#### Updated createJobPosting Method
- Sets `is_draft` to `true` by default when creating new postings
- Allows override via DTO if provided

#### New Method: toggleJobPostingDraft
```typescript
async toggleJobPostingDraft(jobPostingId: string, isDraft: boolean): Promise<JobPosting>
```
- Toggles the draft status of a job posting
- Returns the updated job posting with all relations

### 3. API Endpoint
**File:** `src/modules/agency/agency.controller.ts`

#### New Endpoint: Toggle Draft Status
```
PATCH /agencies/:license/job-postings/:id/toggle-draft
```

**Authentication:** Bearer token required (AgencyAuthGuard)

**Request Body:**
```json
{
  "is_draft": true
}
```

**Response:**
```json
{
  "success": true,
  "is_draft": true,
  "message": "Job posting marked as draft"
}
```

**Features:**
- Bearer token authentication via AgencyAuthGuard
- Ownership validation (agency license check)
- Audit logging with state change tracking
- Error handling with audit failure logging
- Returns success status and updated draft flag

### 4. Audit Logging
**File:** `src/modules/audit/audit.entity.ts`

#### New Audit Action
- Added `TOGGLE_JOB_POSTING_DRAFT: 'toggle_job_posting_draft'` action
- Added description: `'Job posting draft status toggled'`

#### Logged Information
- User ID, phone, and role
- Agency ID
- Request method and path
- Origin IP and user agent
- State change: `is_draft: [oldValue, newValue]`
- Outcome: success or failure with status code
- Duration in milliseconds

## Usage

### Create a Job Posting as Draft
```bash
POST /agencies/LIC-AG-0001/job-postings
Content-Type: application/json
Authorization: Bearer <token>

{
  "posting_title": "Software Engineer",
  "country": "Nepal",
  "is_draft": true,
  ...
}
```

### Toggle Draft Status
```bash
PATCH /agencies/LIC-AG-0001/job-postings/{jobPostingId}/toggle-draft
Content-Type: application/json
Authorization: Bearer <token>

{
  "is_draft": false
}
```

## Default Behavior
- When creating a new job posting, `is_draft` defaults to `true`
- Agencies can toggle between draft and published states
- Draft postings are still stored in the database but can be marked as such for UI filtering
- All toggle operations are tracked in audit logs

## Security
- Requires valid Bearer token (JWT authentication)
- Agency ownership validation ensures users can only modify their own postings
- Audit trail captures all draft status changes for compliance
