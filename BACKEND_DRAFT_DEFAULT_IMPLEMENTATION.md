# Backend: Default Draft Status for Job Postings

## Overview
Updated the backend to ensure all job postings are created as drafts by default when using the template creation endpoint.

## Changes Made

### 1. Controller Update
**File:** `src/modules/agency/agency.controller.ts`

#### Method: createJobPostingForAgency
**Location:** Line 758-820

**Change:**
```typescript
const dto: CreateJobPostingDto = {
  ...jobData,
  is_draft: true, // Always create job postings as draft by default
  posting_agency: {
    name: agency.name,
    license_number: agency.license_number,
    address: agency.address ?? undefined,
    phones: agency.phones ?? undefined,
    emails: agency.emails ?? undefined,
    website: agency.website ?? undefined,
  },
} as any;
```

**Explanation:**
- Explicitly sets `is_draft: true` when creating job postings
- Ensures all template jobs are created in draft status
- Overrides any `is_draft` value sent in the request body
- Provides clear intent in the code

### 2. Service Layer (Already Configured)
**File:** `src/modules/domain/domain.service.ts`

#### Method: createJobPosting
**Location:** Line 284-400

**Current Implementation:**
```typescript
const jp = qr.manager.create(JobPosting, {
  posting_title: dto.posting_title,
  country: dto.country,
  city: dto.city,
  lt_number: dto.lt_number,
  chalani_number: dto.chalani_number,
  approval_date_bs: dto.approval_date_bs,
  approval_date_ad: dto.approval_date_ad ? new Date(dto.approval_date_ad) : undefined,
  posting_date_ad: dto.posting_date_ad ? new Date(dto.posting_date_ad) : new Date(),
  posting_date_bs: dto.posting_date_bs,
  announcement_type: dto.announcement_type || AnnouncementType.FULL_AD,
  notes: dto.notes,
  is_draft: dto.is_draft !== undefined ? dto.is_draft : true,
  ...extra,
});
```

**Features:**
- Defaults to `true` if `is_draft` is not provided
- Respects explicit `is_draft` value if provided
- Provides fallback default

### 3. DTO Definition (Already Configured)
**File:** `src/modules/domain/domain.service.ts`

#### Interface: CreateJobPostingDto
**Location:** Line 171-197

```typescript
export interface CreateJobPostingDto {
  posting_title: string;
  country: string;
  city?: string;
  lt_number?: string;
  chalani_number?: string;
  approval_date_bs?: string;
  approval_date_ad?: string;
  posting_date_ad?: string;
  posting_date_bs?: string;
  announcement_type?: AnnouncementType;
  notes?: string;
  is_draft?: boolean;
  posting_agency: PostingAgencyDto;
  employer: EmployerDto;
  contract: ContractDto;
  positions: PositionDto[];
  
  // Optional expenses
  medical_expense?: MedicalExpenseDto;
  insurance_expense?: InsuranceExpenseDto;
  travel_expense?: TravelExpenseDto;
  visa_permit_expense?: VisaPermitExpenseDto;
  training_expense?: TrainingExpenseDto;
  welfare_service_expense?: WelfareServiceExpenseDto;
}
```

## Behavior

### When Creating a Job Posting

1. **Request:** POST `/agencies/:license/job-postings`
2. **Controller:** Sets `is_draft: true` explicitly
3. **Service:** Creates JobPosting with `is_draft: true`
4. **Database:** Stores job posting with `is_draft = true`
5. **Response:** Returns created job posting with `is_draft: true`

### Job Posting States

- **Draft (is_draft = true)**
  - Job is being edited
  - Not visible to candidates
  - Can be toggled to published
  - Can be deleted

- **Published (is_draft = false)**
  - Job is live
  - Visible to candidates
  - Can receive applications
  - Can be toggled back to draft

## API Endpoint

### Create Job Posting
```
POST /agencies/:license/job-postings
Content-Type: application/json

{
  "posting_title": "Software Engineer",
  "country": "Nepal",
  "city": "Kathmandu",
  "employer": {
    "company_name": "Tech Company",
    "country": "Nepal",
    "city": "Kathmandu"
  },
  "contract": {
    "period_years": 2,
    "renewable": true,
    "hours_per_day": 8,
    "days_per_week": 5
  },
  "positions": [
    {
      "title": "Senior Engineer",
      "vacancies": { "male": 2, "female": 1 },
      "salary": { "monthly_amount": 50000, "currency": "NPR" }
    }
  ]
}
```

### Response
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "posting_title": "Software Engineer",
  "country": "Nepal",
  "city": "Kathmandu",
  "is_draft": true,
  "is_active": true,
  "created_at": "2024-12-18T10:30:00Z",
  "updated_at": "2024-12-18T10:30:00Z"
}
```

## Database Schema

### job_postings Table
```sql
CREATE TABLE job_postings (
  id UUID PRIMARY KEY,
  posting_title VARCHAR(500) NOT NULL,
  country VARCHAR(100) NOT NULL,
  city VARCHAR(100),
  is_draft BOOLEAN DEFAULT true NOT NULL,
  is_active BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  ...
);
```

## Toggle Draft Status

### Endpoint
```
PATCH /agencies/:license/job-postings/:id/toggle-draft
Content-Type: application/json
Authorization: Bearer <token>

{
  "is_draft": false
}
```

### Response
```json
{
  "success": true,
  "is_draft": false,
  "message": "Job posting published from draft"
}
```

## Summary

✅ All job postings created via the template endpoint are now marked as draft by default
✅ Explicit `is_draft: true` set in controller for clarity
✅ Service layer provides fallback default
✅ Users can toggle draft status via dedicated API endpoint
✅ Draft status is tracked in audit logs
✅ Full authentication and authorization checks in place
