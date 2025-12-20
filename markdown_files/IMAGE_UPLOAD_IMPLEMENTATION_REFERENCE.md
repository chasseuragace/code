# Image Upload Implementation Reference

## Overview
This document outlines the implementation plan for adding image upload functionality to the portal system with dedicated APIs for profile images, agency assets, and job posting cutouts.

## Current State Analysis

### 1. Agency Images (logo_url, banner_url)
- **Entity**: `PostingAgency` in `/src/modules/domain/PostingAgency.ts`
- **Fields**: 
  - `logo_url?: string` (line 42)
  - `banner_url?: string` (line 45)
- **DTO**: `CreateAgencyDto` and `UpdateAgencyDto` in `/src/modules/agency/dto/agency.dto.ts`
  - `logo_url?: string` (line 240, 387)
  - `banner_url?: string` (line 245, 392)
- **Status**: Fields exist but no dedicated upload APIs

### 2. Job Posting Cutout (cutout_url)
- **Entity**: `JobPosting` in `/src/modules/domain/domain.entity.ts`
- **Field**: `cutout_url?: string` (line 51)
- **Status**: Field exists but not used in creation/update APIs

### 3. Candidate Profile Image
- **Entity**: `Candidate` in `/src/modules/candidate/candidate.entity.ts`
- **Status**: **MISSING** - needs `profile_image?: string` field
- **Current Fields**: full_name, phone, email, gender, address, passport_number, is_active

### 4. Candidate Documents
- **Status**: **MISSING** - needs new entity for document storage
- **Required Fields**: candidate_id, document_url, name, description, notes

## Implementation Plan

### Phase 1: Database Schema Updates

#### 1.1 Add profile_image to Candidate entity
```typescript
@Column({ type: 'varchar', length: 1000, nullable: true })
profile_image?: string;
```

#### 1.2 Create CandidateDocument entity
```typescript
@Entity('candidate_documents')
export class CandidateDocument {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  candidate_id: string;

  @Column({ type: 'varchar', length: 1000 })
  document_url: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updated_at: Date;
}
```

### Phase 2: Image Upload Service

#### 2.1 Create ImageUploadService
- **Location**: `/src/modules/shared/image-upload.service.ts`
- **Functionality**:
  - Accept file uploads (images only)
  - Store in local filesystem (`/public/uploads/`)
  - Generate accessible URLs
  - Validate file types and sizes
  - Handle file cleanup for updates/deletions

#### 2.2 File Storage Structure
```
/public/uploads/
├── agencies/
│   ├── {agency_id}/
│   │   ├── logo.{ext}
│   │   └── banner.{ext}
├── candidates/
│   ├── {candidate_id}/
│   │   ├── profile.{ext}
│   │   └── documents/
│   │       ├── {document_id}.{ext}
└── jobs/
    ├── {job_id}/
    │   └── cutout.{ext}
```

### Phase 3: Dedicated Image APIs

#### 3.1 Agency Image APIs
- `POST /agencies/{id}/logo` - Upload agency logo
- `DELETE /agencies/{id}/logo` - Remove agency logo
- `POST /agencies/{id}/banner` - Upload agency banner
- `DELETE /agencies/{id}/banner` - Remove agency banner

#### 3.2 Job Posting Cutout APIs
- `POST /jobs/{id}/cutout` - Upload job cutout image
- `DELETE /jobs/{id}/cutout` - Remove job cutout image

#### 3.3 Candidate Profile APIs
- `POST /candidates/{id}/profile-image` - Upload candidate profile image
- `DELETE /candidates/{id}/profile-image` - Remove candidate profile image

#### 3.4 Candidate Document APIs
- `POST /candidates/{id}/documents` - Upload candidate document
- `GET /candidates/{id}/documents` - List candidate documents
- `DELETE /candidates/{id}/documents/{document_id}` - Remove candidate document

### Phase 4: Static File Serving
- Configure NestJS to serve static files from `/public/uploads/`
- Implement proper security headers
- Add file access logging

## Technical Specifications

### File Upload Constraints
- **Max file size**: 5MB for images, 10MB for documents
- **Allowed image types**: jpg, jpeg, png, gif, webp
- **Allowed document types**: pdf, doc, docx
- **Image dimensions**: Auto-resize large images to max 2048x2048

### Security Considerations
- Validate file types using magic numbers, not just extensions
- Sanitize file names
- Implement rate limiting on upload endpoints
- Add virus scanning for document uploads (future enhancement)

### API Response Format
```typescript
interface UploadResponse {
  success: boolean;
  url?: string;
  message?: string;
  error?: string;
}
```

## File Structure Changes

### New Files to Create
1. `/src/modules/shared/image-upload.service.ts`
2. `/src/modules/shared/image-upload.module.ts`
3. `/src/modules/candidate/candidate-document.entity.ts`
4. `/src/modules/candidate/dto/candidate-document.dto.ts`
5. `/src/modules/agency/dto/image-upload.dto.ts`
6. `/src/modules/domain/dto/cutout-upload.dto.ts`

### Files to Modify
1. `/src/modules/candidate/candidate.entity.ts` - Add profile_image field
2. `/src/modules/candidate/candidate.controller.ts` - Add image upload endpoints
3. `/src/modules/candidate/candidate.service.ts` - Add image handling logic
4. `/src/modules/agency/agency.controller.ts` - Add image upload endpoints
5. `/src/modules/agency/agency.service.ts` - Add image handling logic
6. `/src/modules/domain/domain.controller.ts` - Add cutout upload endpoints
7. `/src/modules/domain/domain.service.ts` - Add cutout handling logic
8. `/src/app.module.ts` - Configure static file serving

## Testing Strategy
- Unit tests for ImageUploadService
- Integration tests for all upload endpoints
- File cleanup tests
- Security validation tests
- Error handling tests

## Migration Notes
- Existing `logo_url`, `banner_url`, and `cutout_url` fields will remain
- New upload APIs will populate these fields with generated URLs
- Backward compatibility maintained for existing URL-based updates
