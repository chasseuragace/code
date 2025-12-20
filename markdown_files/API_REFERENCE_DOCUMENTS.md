# Document Management API Reference

## Base URL
```
http://localhost:3000
```

## Endpoints

### 1. Get Document Types
Returns all available document types that candidates can upload.

**Endpoint:** `GET /document-types`

**Response:** `200 OK`
```json
[
  {
    "id": "uuid",
    "name": "Passport",
    "type_code": "PASSPORT",
    "description": "Valid passport document",
    "is_required": true,
    "display_order": 1,
    "allowed_mime_types": ["application/pdf", "image/jpeg", "image/jpg", "image/png"],
    "max_file_size_mb": 10
  },
  {
    "id": "uuid",
    "name": "Medical Certificate",
    "type_code": "MEDICAL",
    "description": "Medical fitness certificate",
    "is_required": true,
    "display_order": 2,
    "allowed_mime_types": ["application/pdf", "image/jpeg", "image/jpg", "image/png"],
    "max_file_size_mb": 10
  }
  // ... 5 more types
]
```

---

### 2. Get Candidate Documents (Slot View)
Returns all document types with upload status for a specific candidate.

**Endpoint:** `GET /candidates/:id/documents`

**Parameters:**
- `id` (path, required): Candidate UUID

**Response:** `200 OK`
```json
{
  "data": [
    {
      "document_type": {
        "id": "uuid",
        "name": "Passport",
        "type_code": "PASSPORT",
        "description": "Valid passport document",
        "is_required": true,
        "display_order": 1,
        "allowed_mime_types": ["application/pdf", "image/jpeg", "image/jpg", "image/png"],
        "max_file_size_mb": 10
      },
      "document": {
        "id": "uuid",
        "document_url": "/uploads/candidates/uuid/documents/passport.pdf",
        "name": "My Passport",
        "notes": "Valid until 2030",
        "file_type": "application/pdf",
        "file_size": 1048576,
        "verification_status": "pending",
        "rejection_reason": null,
        "created_at": "2024-01-15T10:30:00Z",
        "updated_at": "2024-01-15T10:30:00Z"
      }
    },
    {
      "document_type": {
        "id": "uuid",
        "name": "Medical Certificate",
        "type_code": "MEDICAL",
        "description": "Medical fitness certificate",
        "is_required": true,
        "display_order": 2,
        "allowed_mime_types": ["application/pdf", "image/jpeg", "image/jpg", "image/png"],
        "max_file_size_mb": 10
      },
      "document": null
    }
    // ... 5 more slots
  ],
  "summary": {
    "total_types": 7,
    "uploaded": 1,
    "pending": 6,
    "required_pending": 1
  }
}
```

**Error Responses:**
- `404 Not Found` - Candidate not found

---

### 3. Upload Document
Upload a document for a candidate. If a document of the same type already exists, it will be replaced.

**Endpoint:** `POST /candidates/:id/documents`

**Parameters:**
- `id` (path, required): Candidate UUID

**Request:** `multipart/form-data`
- `file` (required): The document file (PDF, JPEG, JPG, PNG)
- `document_type_id` (required): UUID of the document type
- `name` (required): Document name
- `description` (optional): Document description
- `notes` (optional): Additional notes

**Example (curl):**
```bash
curl -X POST http://localhost:3000/candidates/{candidate_id}/documents \
  -F "file=@passport.pdf" \
  -F "document_type_id=123e4567-e89b-12d3-a456-426614174000" \
  -F "name=My Passport" \
  -F "notes=Valid until 2030"
```

**Response:** `201 Created`
```json
{
  "id": "uuid",
  "candidate_id": "uuid",
  "document_type_id": "uuid",
  "document_url": "/uploads/candidates/uuid/documents/passport.pdf",
  "name": "My Passport",
  "description": null,
  "notes": "Valid until 2030",
  "file_type": "application/pdf",
  "file_size": 1048576,
  "is_active": true,
  "verification_status": "pending",
  "verified_by": null,
  "verified_at": null,
  "rejection_reason": null,
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-15T10:30:00Z"
}
```

**Error Responses:**
- `400 Bad Request` - Invalid document_type_id or file upload failed
- `404 Not Found` - Candidate not found

**Notes:**
- If a document of the same type already exists, it will be marked as inactive and replaced
- The old document is kept in the database with `is_active: false` and `replaced_by_document_id` set
- Verification status is automatically set to 'pending'

---

### 4. Delete Document
Delete a candidate's document.

**Endpoint:** `DELETE /candidates/:id/documents/:documentId`

**Parameters:**
- `id` (path, required): Candidate UUID
- `documentId` (path, required): Document UUID

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Document removed successfully"
}
```

**Error Responses:**
- `404 Not Found` - Candidate or document not found

**Notes:**
- Deletes both the database record and the physical file
- Document record is permanently deleted (not soft-deleted)

---

## Seed Endpoint

### Seed Document Types
Seeds the predefined document types into the database.

**Endpoint:** `POST /seed/seedSystem`

**Request:** `application/json`
```json
{
  "document_types": true
}
```

**Response:** `200 OK`
```json
{
  "document_types": {
    "affected": 7
  }
}
```

**Notes:**
- Idempotent - safe to run multiple times
- Uses upsert based on `type_code`
- Automatically included when seeding with default options

---

## Document Types

| Name | Code | Required | Description |
|------|------|----------|-------------|
| Passport | `PASSPORT` | ✅ Yes | Valid passport document |
| Medical Certificate | `MEDICAL` | ✅ Yes | Medical fitness certificate |
| Insurance Document | `INSURANCE` | ❌ No | Health or travel insurance document |
| SSF Document | `SSF` | ❌ No | Social Security Fund document |
| Educational Certificate | `EDUCATION` | ❌ No | Educational qualifications and certificates |
| Experience Letter | `EXPERIENCE` | ❌ No | Work experience letters and references |
| Police Clearance | `POLICE_CLEARANCE` | ❌ No | Police clearance certificate |

All document types accept:
- **MIME Types:** `application/pdf`, `image/jpeg`, `image/jpg`, `image/png`
- **Max File Size:** 10 MB

---

## Verification Status

Documents have a verification status that tracks their approval state:

| Status | Description |
|--------|-------------|
| `pending` | Document uploaded, awaiting verification |
| `approved` | Document verified and approved |
| `rejected` | Document rejected (see `rejection_reason`) |

**Note:** Verification workflow requires admin implementation (Phase 2)

---

## Frontend Integration Example

### React/TypeScript Example

```typescript
// 1. Fetch document types (optional, for metadata)
const documentTypes = await fetch('/document-types').then(r => r.json());

// 2. Fetch candidate's documents with slots
const { data: slots, summary } = await fetch(`/candidates/${candidateId}/documents`)
  .then(r => r.json());

// 3. Display slots
slots.forEach(slot => {
  console.log(`${slot.document_type.name}: ${slot.document ? 'Uploaded' : 'Not uploaded'}`);
});

// 4. Upload document
const formData = new FormData();
formData.append('file', fileInput.files[0]);
formData.append('document_type_id', passportTypeId);
formData.append('name', 'My Passport');
formData.append('notes', 'Valid until 2030');

const response = await fetch(`/candidates/${candidateId}/documents`, {
  method: 'POST',
  body: formData
});

// 5. Delete document
await fetch(`/candidates/${candidateId}/documents/${documentId}`, {
  method: 'DELETE'
});
```

---

## Error Handling

All endpoints follow standard HTTP status codes:

- `200 OK` - Request successful
- `201 Created` - Resource created successfully
- `400 Bad Request` - Invalid request parameters
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

Error response format:
```json
{
  "statusCode": 400,
  "message": "document_type_id is required",
  "error": "Bad Request"
}
```
