# Image Upload E2E Testing Plan

## Overview
This document outlines the comprehensive end-to-end testing strategy for the image upload functionality across the portal system. The testing covers three main areas:
1. **Agency Image Management** (logo and banner) - TypeScript/Jest tests
2. **Candidate Profile Image** - Dart/Flutter integration tests  
3. **Job Posting Cutout Images** - TypeScript/Jest tests

## Prerequisites

### 1. API Client Generation
Before running tests, generate the required API clients:

#### For Agency Tests (TypeScript)
```bash
cd /Volumes/shared_code/code_shared/portal/dev_tools/package_form_open_api/
./build.sh
```
- **Input**: `http://localhost:3000/docs-yaml` (local server)
- **Output**: `/Volumes/shared_code/code_shared/portal/dev_tools/package_form_open_api/openapi/`
- **Generator**: `typescript-axios`

#### For Candidate Tests (Dart)
```bash
cd /Volumes/shared_code/code_shared/portal/dev_tools/package_form_open_api/
./build_from_web.sh
```
- **Input**: `https://dev.kaha.com.np/job-portal/docs-yaml` (web server)
- **Output**: `/Volumes/shared_code/code_shared/portal/dev_tools/package_form_open_api/web_generated_dart_client/`
- **Generator**: `dart-dio`

### 2. Test Image Files
Create standardized test image files for consistent testing:

```
test_assets/
├── agency_logo_test.png (500x500, ~200KB)
├── agency_banner_test.jpg (1200x400, ~300KB)
├── candidate_profile_test.jpg (400x400, ~150KB)
├── job_cutout_test.png (800x600, ~250KB)
└── large_test_image.jpg (>5MB for size validation)
```

## Test Plan Structure

## 1. Agency Image Upload Tests

### Test File Location
`/Volumes/shared_code/code_shared/portal/dev_tools/test_web_frontend/tests/agency_owner_create_agency.test.ts`

### Test Agency Target
- **Agency Name**: "Suresh International Recruitment Pvt. Ltd"
- **License**: Generated dynamically (REG-YYYY-XXXXXX format)

### Test Scenarios

#### 1.1 Agency Logo Upload & Management
```typescript
describe("Agency Logo Management", () => {
  it("uploads, retrieves, and deletes agency logo", async () => {
    // Prerequisites: Agency created and authenticated
    
    // Step 1: Upload Logo
    const logoFile = fs.readFileSync('test_assets/agency_logo_test.png');
    const uploadResponse = await agencies.uploadLogo(license_number, logoFile);
    expect(uploadResponse.status).toBe(200);
    expect(uploadResponse.data.success).toBe(true);
    expect(uploadResponse.data.url).toContain('/uploads/agencies/');
    
    // Step 2: Verify Logo URL in Agency Profile
    const agencyProfile = await agencies.agencyControllerGetMyAgency();
    expect(agencyProfile.data.logo_url).toBe(uploadResponse.data.url);
    
    // Step 3: Verify File Accessibility
    const fileResponse = await axios.get(`${basePath}${uploadResponse.data.url}`);
    expect(fileResponse.status).toBe(200);
    expect(fileResponse.headers['content-type']).toContain('image');
    
    // Step 4: Upload Different Logo (Should Replace)
    const newLogoFile = fs.readFileSync('test_assets/agency_logo_test_2.png');
    const newUploadResponse = await agencies.uploadLogo(license_number, newLogoFile);
    expect(newUploadResponse.data.url).not.toBe(uploadResponse.data.url);
    
    // Step 5: Verify Old File is Replaced
    const updatedProfile = await agencies.agencyControllerGetMyAgency();
    expect(updatedProfile.data.logo_url).toBe(newUploadResponse.data.url);
    
    // Step 6: Delete Logo
    const deleteResponse = await agencies.deleteLogo(license_number);
    expect(deleteResponse.status).toBe(200);
    expect(deleteResponse.data.success).toBe(true);
    
    // Step 7: Verify Logo Removed from Profile
    const finalProfile = await agencies.agencyControllerGetMyAgency();
    expect(finalProfile.data.logo_url).toBeNull();
  });
});
```

#### 1.2 Agency Banner Upload & Management
```typescript
describe("Agency Banner Management", () => {
  it("uploads, retrieves, and deletes agency banner", async () => {
    // Similar structure to logo test but for banner
    // Test banner-specific endpoints and banner_url field
  });
});
```

#### 1.3 File Validation Tests
```typescript
describe("Agency Image Validation", () => {
  it("rejects oversized files", async () => {
    const largeFile = fs.readFileSync('test_assets/large_test_image.jpg');
    try {
      await agencies.uploadLogo(license_number, largeFile);
      fail('Should have rejected large file');
    } catch (error) {
      expect(error.response.status).toBe(400);
      expect(error.response.data.message).toContain('File size exceeds limit');
    }
  });
  
  it("rejects invalid file types", async () => {
    const textFile = Buffer.from('This is not an image', 'utf8');
    try {
      await agencies.uploadLogo(license_number, textFile);
      fail('Should have rejected non-image file');
    } catch (error) {
      expect(error.response.status).toBe(400);
      expect(error.response.data.message).toContain('Invalid file type');
    }
  });
});
```

## 2. Candidate Profile Image Tests

### Test File Location
`/Volumes/shared_code/code_shared/portal/agency_research/code/variant_dashboard/integration_test/ramesh_happy_path_test.dart`

### Test Candidate Target
- **Name**: "Ramesh Bahadur"
- **Phone**: Generated dynamically or use existing test phone

### Test Integration Point
Add image upload tests after **Step 4.6** (Personal Profile Update) in the existing test:

```dart
// Step 4.7: Profile Image Upload & Management
print('\n📸 Step 4.7: Profile Image Upload & Management');
print('🖼️ Ramesh uploads his profile photo...');

// Load test image file
final imageFile = File('test_assets/candidate_profile_test.jpg');
final imageBytes = await imageFile.readAsBytes();

// Upload profile image
final uploadResponse = await candidateApi.uploadProfileImage(
  candidateId, 
  MultipartFile.fromBytes(imageBytes, filename: 'profile.jpg')
);
expect(uploadResponse.success, isTrue);
expect(uploadResponse.url, contains('/uploads/candidates/'));

print('✅ Profile image uploaded: ${uploadResponse.url}');

// Verify image URL in candidate profile
final updatedCandidate = await candidateApi.getCandidateById(candidateId);
expect(updatedCandidate.profileImage, equals(uploadResponse.url));

print('✅ Profile image URL saved to candidate profile');

// Test image accessibility
final imageAccessResponse = await dio.get(
  '${baseUrl}${uploadResponse.url}',
  options: Options(responseType: ResponseType.bytes)
);
expect(imageAccessResponse.statusCode, equals(200));
expect(imageAccessResponse.headers.value('content-type'), contains('image'));

print('✅ Profile image accessible via URL');

// Upload different image (should replace)
final newImageFile = File('test_assets/candidate_profile_test_2.jpg');
final newImageBytes = await newImageFile.readAsBytes();

final newUploadResponse = await candidateApi.uploadProfileImage(
  candidateId,
  MultipartFile.fromBytes(newImageBytes, filename: 'new_profile.jpg')
);
expect(newUploadResponse.url, isNot(equals(uploadResponse.url)));

print('✅ New profile image uploaded, old image replaced');

// Delete profile image
final deleteResponse = await candidateApi.deleteProfileImage(candidateId);
expect(deleteResponse.success, isTrue);

// Verify image removed from profile
final finalCandidate = await candidateApi.getCandidateById(candidateId);
expect(finalCandidate.profileImage, isNull);

print('✅ Profile image deleted and removed from profile');
```

### Candidate Image Validation Tests
```dart
// Step 4.8: Profile Image Validation Tests
print('\n🔍 Step 4.8: Profile Image Validation');

// Test file size validation
try {
  final largeImageFile = File('test_assets/large_test_image.jpg');
  final largeImageBytes = await largeImageFile.readAsBytes();
  
  await candidateApi.uploadProfileImage(
    candidateId,
    MultipartFile.fromBytes(largeImageBytes, filename: 'large.jpg')
  );
  fail('Should have rejected large file');
} catch (e) {
  expect(e.toString(), contains('File size exceeds limit'));
  print('✅ Large file rejection validated');
}

// Test invalid file type
try {
  final textBytes = utf8.encode('This is not an image');
  await candidateApi.uploadProfileImage(
    candidateId,
    MultipartFile.fromBytes(textBytes, filename: 'fake.txt')
  );
  fail('Should have rejected non-image file');
} catch (e) {
  expect(e.toString(), contains('Invalid file type'));
  print('✅ Invalid file type rejection validated');
}
```

## 3. Job Posting Cutout Image Tests

### Test Integration
Add to existing agency test after job posting creation:

```typescript
describe("Job Posting Cutout Management", () => {
  it("uploads and manages job posting cutout images", async () => {
    // Use first created job posting from existing test
    const jobPostingId = createdJobPostings[0].id;
    
    // Step 1: Upload Cutout
    const cutoutFile = fs.readFileSync('test_assets/job_cutout_test.png');
    const uploadResponse = await agencies.uploadCutout(
      license_number, 
      jobPostingId, 
      cutoutFile
    );
    expect(uploadResponse.status).toBe(201);
    expect(uploadResponse.data.success).toBe(true);
    expect(uploadResponse.data.url).toContain('/uploads/jobs/');
    
    // Step 2: Verify Cutout URL in Job Posting
    const jobPosting = await agencies.getJobPosting(license_number, jobPostingId);
    expect(jobPosting.data.cutout_url).toBe(uploadResponse.data.url);
    
    // Step 3: Upload Different Cutout (Should Replace)
    const newCutoutFile = fs.readFileSync('test_assets/job_cutout_test_2.png');
    const newUploadResponse = await agencies.uploadCutout(
      license_number,
      jobPostingId,
      newCutoutFile
    );
    expect(newUploadResponse.data.url).not.toBe(uploadResponse.data.url);
    
    // Step 4: Delete Cutout
    const deleteResponse = await agencies.removeCutout(license_number, jobPostingId);
    expect(deleteResponse.status).toBe(200);
    expect(deleteResponse.data.success).toBe(true);
    
    // Step 5: Verify Cutout Removed
    const finalJobPosting = await agencies.getJobPosting(license_number, jobPostingId);
    expect(finalJobPosting.data.cutout_url).toBeNull();
  });
});
```

## 4. Cross-Platform Validation Tests

### File Storage Consistency
```typescript
describe("File Storage Consistency", () => {
  it("maintains consistent file structure across all upload types", async () => {
    // Upload files for all types
    const logoUpload = await agencies.uploadLogo(license_number, logoFile);
    const bannerUpload = await agencies.uploadBanner(license_number, bannerFile);
    const cutoutUpload = await agencies.uploadCutout(license_number, jobId, cutoutFile);
    
    // Verify URL patterns
    expect(logoUpload.data.url).toMatch(/\/uploads\/agencies\/[^\/]+\/logo\./);
    expect(bannerUpload.data.url).toMatch(/\/uploads\/agencies\/[^\/]+\/banner\./);
    expect(cutoutUpload.data.url).toMatch(/\/uploads\/jobs\/[^\/]+\/cutout\./);
    
    // Verify all files are accessible
    const responses = await Promise.all([
      axios.get(`${basePath}${logoUpload.data.url}`),
      axios.get(`${basePath}${bannerUpload.data.url}`),
      axios.get(`${basePath}${cutoutUpload.data.url}`)
    ]);
    
    responses.forEach(response => {
      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toContain('image');
    });
  });
});
```

## 5. API Endpoints Summary

### Agency Endpoints
- `POST /agencies/:license/logo` - Upload agency logo
- `DELETE /agencies/:license/logo` - Remove agency logo
- `POST /agencies/:license/banner` - Upload agency banner
- `DELETE /agencies/:license/banner` - Remove agency banner

### Candidate Endpoints
- `POST /candidates/:id/profile-image` - Upload candidate profile image
- `DELETE /candidates/:id/profile-image` - Remove candidate profile image

### Job Posting Endpoints
- `POST /agencies/:license/job-postings/:id/cutout` - Upload job cutout
- `DELETE /agencies/:license/job-postings/:id/cutout` - Remove job cutout

## 6. Expected File Structure

```
/public/uploads/
├── agencies/
│   └── {agency-id}/
│       ├── logo.{ext}
│       └── banner.{ext}
├── candidates/
│   └── {candidate-id}/
│       └── profile.{ext}
└── jobs/
    └── {job-id}/
        └── cutout.{ext}
```

## 7. Validation Rules

### File Size Limits
- **Images**: Maximum 5MB
- **Documents**: Maximum 10MB (for future document uploads)

### Supported File Types
- **Images**: JPG, JPEG, PNG, GIF, WebP
- **Documents**: PDF, DOC, DOCX (for candidate documents)

### File Naming Convention
- Files are renamed to their type (logo, banner, profile, cutout) + extension
- Original filenames are not preserved
- Unique entity IDs ensure no conflicts

## 8. Error Scenarios to Test

### File Validation Errors
1. **Oversized files** - Should return 400 with size limit message
2. **Invalid file types** - Should return 400 with type validation message
3. **Corrupted files** - Should return 400 with file corruption message
4. **Empty files** - Should return 400 with empty file message

### Authentication Errors
1. **Missing JWT token** - Should return 401
2. **Invalid JWT token** - Should return 401
3. **Expired JWT token** - Should return 401

### Authorization Errors
1. **Wrong agency license** - Should return 403
2. **Wrong candidate ID** - Should return 403
3. **Non-existent entities** - Should return 404

### Storage Errors
1. **Disk space full** - Should return 500 with storage error
2. **Permission issues** - Should return 500 with permission error

## 9. Performance Considerations

### Upload Speed Tests
- Test upload times for various file sizes
- Ensure reasonable timeout limits
- Test concurrent uploads

### Storage Efficiency
- Verify old files are properly cleaned up on replacement
- Test storage space usage patterns
- Validate file compression if implemented

## 10. Test Execution Order

### Phase 1: Agency Tests (TypeScript)
1. Generate TypeScript API client
2. Run agency creation test with image upload extensions
3. Validate all agency image endpoints

### Phase 2: Candidate Tests (Dart)
1. Generate Dart API client
2. Run Ramesh happy path test with profile image extensions
3. Validate candidate profile image functionality

### Phase 3: Integration Tests
1. Cross-platform file accessibility tests
2. Storage consistency validation
3. Performance and load testing

## 11. Test Data Cleanup

### Automated Cleanup
- Tests should clean up uploaded files after completion
- Use try/finally blocks to ensure cleanup even on test failures
- Implement test-specific file naming to avoid conflicts

### Manual Cleanup
- Document manual cleanup procedures for test environments
- Provide scripts for bulk cleanup of test files
- Monitor storage usage in test environments

## 12. Success Criteria

### Functional Requirements
- ✅ All upload endpoints accept valid files
- ✅ All delete endpoints remove files and clear database references
- ✅ File URLs are correctly saved to entity records
- ✅ Uploaded files are accessible via generated URLs
- ✅ File replacement works correctly (old files removed)
- ✅ Validation rules are properly enforced

### Non-Functional Requirements
- ✅ Upload response times under 5 seconds for 5MB files
- ✅ Proper error handling and user-friendly messages
- ✅ Secure file storage with no directory traversal vulnerabilities
- ✅ Consistent API response formats across all endpoints

This comprehensive testing plan ensures robust validation of the image upload functionality across all platforms and use cases in the portal system.
