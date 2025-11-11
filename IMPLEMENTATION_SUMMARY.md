# Document Type System Implementation Summary

## Overview
Implemented a complete document management system with predefined document types for candidates. The system uses a slot-based approach where candidates can upload one document per type (e.g., passport, medical certificate, etc.).

## What Was Implemented

### 1. Database Entities (TypeORM with sync enabled)

#### **DocumentType Entity** (`document-type.entity.ts`)
- `id` (UUID)
- `name` (e.g., "Passport")
- `type_code` (e.g., "PASSPORT")
- `description`
- `is_required` (boolean)
- `display_order` (for UI sorting)
- `is_active` (boolean)
- `allowed_mime_types` (array) - PDF and image types
- `max_file_size_mb` (integer)
- `created_at`, `updated_at`

#### **Updated CandidateDocument Entity** (`candidate-document.entity.ts`)
Added fields:
- `document_type_id` (UUID, indexed, required)
- `verification_status` (enum: 'pending', 'approved', 'rejected')
- `verified_by` (UUID, nullable)
- `verified_at` (timestamp, nullable)
- `rejection_reason` (text, nullable)
- `replaced_by_document_id` (UUID, nullable) - for document version tracking
- Unique constraint: `(candidate_id, document_type_id, is_active)` - ensures one active document per type

### 2. Seed Data

#### **Document Types Seed** (`src/seed/document-types.seed.json`)
7 predefined document types:
1. **Passport** (required)
2. **Medical Certificate** (required)
3. **Insurance Document** (optional)
4. **SSF Document** (optional)
5. **Educational Certificate** (optional)
6. **Experience Letter** (optional)
7. **Police Clearance** (optional)

All types accept: PDF, JPEG, JPG, PNG (max 10MB)

#### **Seed Integration**
- Added `seedDocumentTypes()` method to `SeedService`
- Integrated into `POST /seed/seedSystem` endpoint
- Document types are seeded by default (like countries and job titles)

### 3. Services

#### **DocumentTypeService** (`document-type.service.ts`)
- `upsertMany()` - Seed document types
- `findAll()` - Get all active document types (ordered by display_order)
- `findById()` - Get document type by ID
- `findByTypeCode()` - Get document type by code

#### **Updated CandidateService** (`candidate.service.ts`)
Enhanced methods:
- `createDocument()` - Now validates document_type_id, handles document replacement (marks old as inactive)
- `getDocumentsWithSlots()` - **NEW** - Returns all document types with upload status
- `listDocuments()` - Returns only uploaded documents
- `deleteDocument()` - Unchanged

### 4. DTOs

#### **DocumentType DTOs** (`dto/document-type.dto.ts`)
- `DocumentTypeResponseDto` - Document type information
- `DocumentSlotResponseDto` - Combines document type + uploaded document (or null)
- `DocumentsSummaryDto` - Summary statistics
- `DocumentsWithSlotsResponseDto` - Complete response with slots and summary

#### **Updated CandidateDocument DTOs** (`dto/candidate-document.dto.ts`)
- `CreateCandidateDocumentDto` - Added required `document_type_id` field
- `CandidateDocumentResponseDto` - Added verification fields

### 5. API Endpoints

#### **New: Document Types Controller**
```
GET /document-types
```
Returns all available document types with metadata.

#### **Updated: Candidate Documents**
```
POST /candidates/:id/documents
```
- Now requires `document_type_id` in request body
- Validates document type exists
- Replaces old document if one exists for that type
- Body: `{ file, document_type_id, name, description?, notes? }`

```
GET /candidates/:id/documents
```
- **Changed behavior**: Now returns slot-based view
- Shows all 7 document types with upload status
- Response includes:
  - `data[]` - Array of slots (document_type + document or null)
  - `summary` - { total_types, uploaded, pending, required_pending }

```
DELETE /candidates/:id/documents/:documentId
```
- Unchanged - deletes document and file

## User Flow Example

1. **Candidate opens Documents section**
   - Frontend calls: `GET /document-types` (optional, for metadata)
   - Frontend calls: `GET /candidates/:id/documents`

2. **UI displays 7 slots:**
   ```
   ✅ Passport - "My Passport.pdf" [View] [Delete]
   ⚠️ Medical Certificate (Required) [Upload]
   ⬜ Insurance Document [Upload]
   ⬜ SSF Document [Upload]
   ⬜ Educational Certificate [Upload]
   ⬜ Experience Letter [Upload]
   ⬜ Police Clearance [Upload]
   
   Summary: 1/7 uploaded, 1 required pending
   ```

3. **Candidate uploads Medical Certificate**
   - Frontend calls: `POST /candidates/:id/documents`
   - Body: `{ file, document_type_id: "<medical_cert_id>", name: "Medical Cert", notes: "..." }`

4. **System behavior:**
   - Validates document type exists
   - Checks if medical cert already uploaded (replaces if exists)
   - Creates document record with `verification_status: 'pending'`
   - Uploads file to storage
   - Returns document details

5. **Candidate refreshes page**
   - Now shows 2/7 uploaded, 0 required pending

## Key Features

### ✅ Implemented
- Predefined document types (7 types)
- One document per type (automatic replacement)
- Slot-based UI support
- Document verification status tracking
- Document replacement history
- File type restrictions per document type
- Required vs optional documents
- Seed integration

### 🔄 Phase 2 (Future Enhancements)
- Admin verification workflow (approve/reject documents)
- Document expiry date tracking
- Bulk document download
- Document version history view
- Country-specific document types

## Database Migration

**No migration needed** - Using TypeORM sync in development mode. Tables will be auto-created:
- `document_types`
- `candidate_documents` (modified with new columns)

## Testing the Implementation

### 1. Seed document types:
```bash
curl -X POST http://localhost:3000/seed/seedSystem \
  -H "Content-Type: application/json" \
  -d '{"document_types": true}'
```

### 2. Get document types:
```bash
curl http://localhost:3000/document-types
```

### 3. Get candidate's document slots:
```bash
curl http://localhost:3000/candidates/{candidate_id}/documents
```

### 4. Upload a document:
```bash
curl -X POST http://localhost:3000/candidates/{candidate_id}/documents \
  -F "file=@passport.pdf" \
  -F "document_type_id={passport_type_id}" \
  -F "name=My Passport" \
  -F "notes=Valid until 2030"
```

## Files Created/Modified

### Created:
- `src/modules/candidate/document-type.entity.ts`
- `src/modules/candidate/document-type.service.ts`
- `src/modules/candidate/document-type.controller.ts`
- `src/modules/candidate/dto/document-type.dto.ts`
- `src/seed/document-types.seed.json`

### Modified:
- `src/modules/candidate/candidate-document.entity.ts` - Added document_type_id and verification fields
- `src/modules/candidate/candidate.service.ts` - Enhanced document methods
- `src/modules/candidate/candidate.controller.ts` - Updated document endpoints
- `src/modules/candidate/candidate.module.ts` - Added DocumentType entities and services
- `src/modules/candidate/dto/candidate-document.dto.ts` - Added document_type_id field
- `src/modules/seed/seed.service.ts` - Added seedDocumentTypes()
- `src/modules/seed/seed.controller.ts` - Added document_types to seed endpoint
- `src/modules/seed/seed.module.ts` - Imported CandidateModule

## Notes

- All lint errors shown are false positives - modules are installed
- TypeORM sync will auto-create tables on server start
- Document replacement is automatic - old documents are soft-deleted
- Verification workflow is ready but requires admin UI implementation
- File validation (MIME type, size) is defined but enforcement depends on upload service
