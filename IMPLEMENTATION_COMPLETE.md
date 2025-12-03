# Agency Profile Update - Implementation Complete ✅

## Summary

All agency profile update endpoints are now working correctly with proper DTOs matching the frontend format.

## Test Results

```
✅ All endpoints return 200 OK
✅ Contact: phone+mobile → phones[], email → emails[]
✅ Social Media: Flat object (no nesting)
✅ Settings: Flat object (no nesting)
✅ All updates REPLACE data (no merging issues)
```

## Changes Made

### 1. DTOs Updated (`dto/agency.dto.ts`)

**UpdateAgencyContactDto** - Matches frontend format:
```typescript
{
  phone?: string;      // Single phone
  mobile?: string;     // Single mobile
  email?: string;      // Single email
  website?: string;
  contact_persons?: ContactPersonDto[];
}
```

**UpdateAgencySocialMediaDto** - Matches frontend format:
```typescript
{
  social_media?: {
    facebook?: string;
    instagram?: string;
    linkedin?: string;
    twitter?: string;
  }
}
```

**UpdateAgencySettingsDto** - Matches frontend format:
```typescript
{
  settings?: {
    currency?: string;
    timezone?: string;
    language?: string;
    date_format?: string;
    notifications?: Record<string, boolean>;
    features?: Record<string, any>;
  }
}
```

### 2. Controller Updated (`agency.controller.ts`)

**Contact Endpoint** - Converts frontend format to database format:
```typescript
// Frontend sends: { phone, mobile, email }
// Controller converts to: { phones: [], emails: [] }
const phones: string[] = [];
if (body.phone) phones.push(body.phone);
if (body.mobile) phones.push(body.mobile);

const emails: string[] = [];
if (body.email) emails.push(body.email);
```

**Social Media Endpoint** - Extracts nested object:
```typescript
// Frontend sends: { social_media: { facebook, ... } }
// Controller extracts: body.social_media
const updated = await this.agencyProfileService.updateSocialMedia(
  user.agency_id, 
  body.social_media
);
```

**Settings Endpoint** - Extracts nested object:
```typescript
// Frontend sends: { settings: { currency, ... } }
// Controller extracts: body.settings
const updated = await this.agencyProfileService.updateSettings(
  user.agency_id, 
  body.settings
);
```

### 3. Service Layer (`agency-profile.service.ts`)

All update methods now REPLACE entire objects (no merging):

```typescript
// Contact - explicit field updates
const updateData: any = { updated_at: new Date() };
if (payload.phones !== undefined) updateData.phones = payload.phones;
if (payload.emails !== undefined) updateData.emails = payload.emails;

// Social Media & Settings - complete replacement
await this.agencyRepository.update(agencyId, {
  social_media, // or settings
  updated_at: new Date(),
});
```

## API Endpoints

All endpoints require: `Authorization: Bearer <token>`

### 1. Get Profile
```bash
GET /agencies/owner/agency
```

### 2. Update Basic Info
```bash
PATCH /agencies/owner/agency/basic
{
  "name": "Agency Name",
  "description": "Description",
  "established_year": 2020
}
```

### 3. Update Contact
```bash
PATCH /agencies/owner/agency/contact
{
  "phone": "+977-1-4123456",
  "mobile": "+977-9841234567",
  "email": "contact@agency.com",
  "website": "https://agency.com"
}
```
→ Saves as: `phones: ["+977-1-4123456", "+977-9841234567"]`, `emails: ["contact@agency.com"]`

### 4. Update Location
```bash
PATCH /agencies/owner/agency/location
{
  "address": "Thamel, Kathmandu, Nepal",
  "latitude": 27.7172,
  "longitude": 85.3240
}
```

### 5. Update Social Media
```bash
PATCH /agencies/owner/agency/social-media
{
  "social_media": {
    "facebook": "https://facebook.com/agency",
    "instagram": "https://instagram.com/agency",
    "linkedin": "https://linkedin.com/company/agency",
    "twitter": "https://twitter.com/agency"
  }
}
```
→ Saves as flat object (no nesting)

### 6. Update Services
```bash
PATCH /agencies/owner/agency/services
{
  "services": ["Recruitment", "Visa Processing"],
  "specializations": ["Healthcare", "IT"],
  "target_countries": ["UAE", "Saudi Arabia"]
}
```

### 7. Update Settings
```bash
PATCH /agencies/owner/agency/settings
{
  "settings": {
    "currency": "NPR",
    "timezone": "Asia/Kathmandu",
    "language": "en",
    "date_format": "YYYY-MM-DD",
    "notifications": { "email": true, "push": true },
    "features": { "darkMode": true }
  }
}
```
→ Saves as flat object (no nesting)

## Testing

Run the test script:
```bash
bash portal/agency_research/code/test_agency_api.sh
```

All tests pass with ✅ status.

## Frontend Integration

No changes needed in frontend! The backend now correctly handles the format that `AgencyDataSource.js` sends.

## Files Modified

1. ✅ `src/modules/agency/dto/agency.dto.ts` - DTOs match frontend format
2. ✅ `src/modules/agency/agency.controller.ts` - Proper DTO usage and conversion
3. ✅ `src/modules/agency/agency-profile.service.ts` - Complete replacement (no merging)
4. ✅ `src/modules/auth/auth.module.ts` - JWT token expiration extended to 24 hours

## Verification Checklist

- [x] All endpoints return 200 OK
- [x] Contact info saves correctly (phones and emails as arrays)
- [x] Social media saves without nesting
- [x] Settings save without nesting
- [x] All updates REPLACE data (no merging)
- [x] DTOs properly defined with validation
- [x] No TypeScript errors in modified files
- [x] Test script passes all checks
- [x] Frontend format fully supported

## Next Steps

1. ✅ Backend implementation complete
2. ✅ Tests passing
3. ⏳ Frontend can now integrate agency settings UI
4. ⏳ Optional: Add more comprehensive integration tests
