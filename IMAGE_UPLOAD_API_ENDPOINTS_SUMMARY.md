# Image Upload API Endpoints Summary

## 📋 **Complete Endpoint Inventory**

### **✅ Total Endpoints: 9**

## **1. Candidate Endpoints (4 endpoints)**

### **Profile Image Management**
- **`POST /candidates/:id/profile-image`** - Upload candidate profile image
- **`DELETE /candidates/:id/profile-image`** - Remove candidate profile image

### **Document Management**  
- **`POST /candidates/:id/documents`** - Upload candidate document
- **`DELETE /candidates/:id/documents/:documentId`** - Remove candidate document
- **`GET /candidates/:id/documents`** - List candidate documents

## **2. Agency Endpoints (4 endpoints)**

### **Logo Management**
- **`POST /agencies/:license/logo`** - Upload agency logo
- **`DELETE /agencies/:license/logo`** - Remove agency logo

### **Banner Management**
- **`POST /agencies/:license/banner`** - Upload agency banner
- **`DELETE /agencies/:license/banner`** - Remove agency banner

## **3. Job Posting Endpoints (2 endpoints)**

### **Cutout Image Management**
- **`POST /agencies/:license/job-postings/:id/cutout`** - Upload job cutout image
- **`DELETE /agencies/:license/job-postings/:id/cutout`** - Remove job cutout image

---

## 🔧 **DTO Corrections Applied**

### **✅ Fixed Issues:**

#### **1. Missing `@ApiConsumes` Decorators - FIXED**
Added `@ApiConsumes('multipart/form-data')` to all upload endpoints:
- ✅ `POST /agencies/:license/logo`
- ✅ `POST /agencies/:license/banner`  
- ✅ `POST /agencies/:license/job-postings/:id/cutout`
- ✅ `POST /candidates/:id/profile-image` (already had it)
- ✅ `POST /candidates/:id/documents` (already had it)

#### **2. Enhanced UploadResponseDto - IMPROVED**
```typescript
export class UploadResponseDto {
  @ApiProperty({ 
    description: 'Upload operation success status',
    example: true,
    type: 'boolean'
  })
  success!: boolean;

  @ApiPropertyOptional({ 
    description: 'File URL if upload successful',
    example: '/uploads/candidates/123e4567-e89b-12d3-a456-426614174000/profile.jpg',
    type: 'string'
  })
  url?: string;

  @ApiPropertyOptional({ 
    description: 'Success message',
    example: 'File uploaded successfully',
    type: 'string'
  })
  message?: string;

  @ApiPropertyOptional({ 
    description: 'Error message if upload failed',
    example: 'File size exceeds 5MB limit',
    type: 'string'
  })
  error?: string;
}
```

#### **3. Enhanced CandidateDocumentResponseDto - IMPROVED**
```typescript
export class CandidateDocumentResponseDto {
  @ApiProperty({ 
    description: 'Document unique identifier',
    example: '123e4567-e89b-12d3-a456-426614174000',
    format: 'uuid'
  })
  id!: string;

  @ApiProperty({ 
    description: 'Candidate unique identifier',
    example: '987fcdeb-51a2-43d1-9f12-345678901234',
    format: 'uuid'
  })
  candidate_id!: string;

  @ApiProperty({ 
    description: 'Document file URL',
    example: '/uploads/candidates/987fcdeb-51a2-43d1-9f12-345678901234/documents/resume.pdf'
  })
  document_url!: string;

  @ApiProperty({ 
    description: 'Document name',
    example: 'Resume - Software Engineer'
  })
  name!: string;

  @ApiPropertyOptional({ 
    description: 'Document description',
    example: 'Updated resume with latest work experience'
  })
  description?: string;

  @ApiPropertyOptional({ 
    description: 'Additional notes',
    example: 'Verified by HR department'
  })
  notes?: string;

  @ApiPropertyOptional({ 
    description: 'File MIME type',
    example: 'application/pdf'
  })
  file_type?: string;

  @ApiPropertyOptional({ 
    description: 'File size in bytes',
    example: 1048576,
    type: 'integer'
  })
  file_size?: number;

  @ApiProperty({ 
    description: 'Document active status',
    example: true,
    type: 'boolean'
  })
  is_active!: boolean;

  @ApiProperty({ 
    description: 'Document creation timestamp',
    example: '2024-01-15T10:30:00Z',
    type: 'string',
    format: 'date-time'
  })
  created_at!: Date;

  @ApiProperty({ 
    description: 'Document last update timestamp',
    example: '2024-01-15T10:30:00Z',
    type: 'string',
    format: 'date-time'
  })
  updated_at!: Date;
}
```

---

## 📝 **Detailed Endpoint Specifications**

### **Candidate Profile Image**

#### **Upload Profile Image**
```typescript
POST /candidates/:id/profile-image
@ApiConsumes('multipart/form-data')
@ApiBody({
  schema: {
    type: 'object',
    properties: {
      file: { type: 'string', format: 'binary' }
    }
  }
})
@ApiOkResponse({ type: UploadResponseDto })
```

#### **Delete Profile Image**
```typescript
DELETE /candidates/:id/profile-image
@ApiOkResponse({ type: UploadResponseDto })
```

### **Candidate Documents**

#### **Upload Document**
```typescript
POST /candidates/:id/documents
@ApiConsumes('multipart/form-data')
@ApiBody({
  schema: {
    type: 'object',
    properties: {
      file: { type: 'string', format: 'binary' },
      name: { type: 'string', description: 'Document name' },
      description: { type: 'string', description: 'Document description' },
      notes: { type: 'string', description: 'Additional notes' }
    }
  }
})
@ApiCreatedResponse({ type: CandidateDocumentResponseDto })
```

#### **List Documents**
```typescript
GET /candidates/:id/documents
@ApiOkResponse({ type: [CandidateDocumentResponseDto] })
```

#### **Delete Document**
```typescript
DELETE /candidates/:id/documents/:documentId
@ApiOkResponse({ type: UploadResponseDto })
```

### **Agency Logo**

#### **Upload Logo**
```typescript
POST /agencies/:license/logo
@ApiConsumes('multipart/form-data')
@ApiBody({
  schema: {
    type: 'object',
    properties: {
      file: { type: 'string', format: 'binary' }
    }
  }
})
@ApiOkResponse({ type: UploadResponseDto })
```

#### **Delete Logo**
```typescript
DELETE /agencies/:license/logo
@ApiOkResponse({ type: UploadResponseDto })
```

### **Agency Banner**

#### **Upload Banner**
```typescript
POST /agencies/:license/banner
@ApiConsumes('multipart/form-data')
@ApiBody({
  schema: {
    type: 'object',
    properties: {
      file: { type: 'string', format: 'binary' }
    }
  }
})
@ApiOkResponse({ type: UploadResponseDto })
```

#### **Delete Banner**
```typescript
DELETE /agencies/:license/banner
@ApiOkResponse({ type: UploadResponseDto })
```

### **Job Posting Cutout**

#### **Upload Cutout**
```typescript
POST /agencies/:license/job-postings/:id/cutout
@ApiConsumes('multipart/form-data')
@ApiBody({
  schema: {
    type: 'object',
    properties: {
      file: { type: 'string', format: 'binary' }
    }
  }
})
@ApiOkResponse({ type: UploadResponseDto })
```

#### **Delete Cutout**
```typescript
DELETE /agencies/:license/job-postings/:id/cutout
@ApiOkResponse({ type: UploadResponseDto })
```

---

## 🎯 **Client Generation Readiness**

### **✅ Ready for TypeScript Client Generation**
All endpoints now have:
- ✅ Proper `@ApiConsumes('multipart/form-data')` decorators
- ✅ Detailed `@ApiBody` schemas with `format: 'binary'` for files
- ✅ Comprehensive `@ApiResponse` types
- ✅ Enhanced DTOs with examples and type specifications

### **✅ Ready for Dart Client Generation**
All DTOs include:
- ✅ Detailed descriptions for each field
- ✅ Example values for better code generation
- ✅ Proper type annotations (`string`, `boolean`, `integer`)
- ✅ Format specifications (`uuid`, `date-time`, `binary`)

---

## 🔄 **File Storage Structure**

```
/public/uploads/
├── agencies/
│   └── {agency-id}/
│       ├── logo.{ext}
│       └── banner.{ext}
├── candidates/
│   └── {candidate-id}/
│       ├── profile.{ext}
│       └── documents/
│           └── {document-id}.{ext}
└── jobs/
    └── {job-id}/
        └── cutout.{ext}
```

---

## 📊 **Validation Rules**

### **File Size Limits**
- **Images**: 5MB maximum (logo, banner, profile, cutout)
- **Documents**: 10MB maximum (candidate documents)

### **Supported File Types**
- **Images**: JPG, JPEG, PNG, GIF, WebP
- **Documents**: PDF, DOC, DOCX

### **URL Format**
- **Pattern**: `/uploads/{type}/{entity-id}/{filename}`
- **Examples**:
  - `/uploads/candidates/123e4567-e89b-12d3-a456-426614174000/profile.jpg`
  - `/uploads/agencies/987fcdeb-51a2-43d1-9f12-345678901234/logo.png`
  - `/uploads/jobs/456789ab-cdef-1234-5678-90abcdef1234/cutout.jpg`

---

## 🚀 **Next Steps for Client Generation**

### **1. Generate TypeScript Client**
```bash
cd /Volumes/shared_code/code_shared/portal/dev_tools/package_form_open_api/
./build.sh
```

### **2. Generate Dart Client**
```bash
cd /Volumes/shared_code/code_shared/portal/dev_tools/package_form_open_api/
./build_from_web.sh
```

### **3. Verify Generated Clients**
- Check that all 9 endpoints are present
- Verify multipart/form-data support
- Confirm proper TypeScript/Dart type generation
- Test file upload parameter handling

---

## ✅ **Summary**

**All image upload endpoints are now properly configured with:**
- ✅ **9 total endpoints** across candidates, agencies, and job postings
- ✅ **Correct `@ApiConsumes` decorators** for multipart uploads
- ✅ **Enhanced DTOs** with detailed type annotations and examples
- ✅ **Proper response types** for consistent client generation
- ✅ **Comprehensive validation** and error handling
- ✅ **Ready for both TypeScript and Dart client generation**

The API is now fully prepared for frontend client generation and E2E testing implementation.
