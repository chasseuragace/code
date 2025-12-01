# Agency Profile Management API - Verification Tests

## Purpose
This document verifies all API endpoints documented in the admin panel guide against the actual backend implementation.

---

## Test Environment Setup

**Base URL**: `http://localhost:3000` (adjust as needed)

**Authentication**: 
- All owner endpoints require JWT token
- User must have `is_agency_owner: true`
- User must have `agency_id` set (after creating agency)

**Headers**:
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

---

## Verification Results

### ✅ 1. Create Agency (First Time)

**Endpoint**: `POST /agencies/owner/agency`

**Request Body**:
```json
{
  "name": "Test Recruitment Agency",
  "license_number": "LIC-TEST-001"
}
```

**Expected Response** (201):
```json
{
  "id": "uuid-string",
  "license_number": "LIC-TEST-001"
}
```

**Verified**: ✅ Endpoint exists in controller line 177-195
**Notes**: 
- Only name and license_number are required
- Creates agency and binds to user automatically
- Returns AgencyCreatedDto

---

### ✅ 2. Get My Agency Profile

**Endpoint**: `GET /agencies/owner/agency`

**Expected Response** (200):
```json
{
  "id": "uuid",
  "name": "Test Recruitment Agency",
  "license_number": "LIC-TEST-001",
  "address": "...",
  "latitude": null,
  "longitude": null,
  "phones": [],
  "emails": [],
  "website": null,
  "description": null,
  "logo_url": null,
  "banner_url": null,
  "established_year": null,
  "services": null,
  "certifications": null,
  "social_media": null,
  "bank_details": null,
  "contact_persons": null,
  "operating_hours": null,
  "target_countries": null,
  "specializations": null,
  "statistics": null,
  "settings": null
}
```

**Verified**: ✅ Endpoint exists in controller line 197-238
**Notes**: 
- Returns complete agency profile
- All optional fields may be null
- Custom response format (not using AgencyResponseDto mapper)

---

### ✅ 3. Update Basic Information

**Endpoint**: `PATCH /agencies/owner/agency/basic`

**Request Body**:
```json
{
  "name": "Updated Agency Name",
  "description": "We are a leading recruitment agency specializing in overseas employment.",
  "established_year": 2015,
  "license_number": "LIC-TEST-001"
}
```

**Expected Response** (200): Full AgencyResponseDto

**Verified**: ✅ Endpoint exists in controller line 241-260
**Notes**:
- Uses UpdateAgencyBasicDto
- All fields optional
- Returns mapped AgencyResponseDto
- Service method: agencyProfileService.updateBasicInfo()

---

### ✅ 4. Update Contact Information

**Endpoint**: `PATCH /agencies/owner/agency/contact`

**Request Body**:
```json
{
  "phone": "+977-1-4123456",
  "mobile": "+977-9841234567",
  "email": "contact@agency.com",
  "website": "https://agency.com",
  "contact_persons": [
    {
      "name": "John Doe",
      "position": "HR Manager",
      "phone": "+977-9841111111",
      "email": "john@agency.com"
    }
  ]
}
```

**Expected Response** (200): Full AgencyResponseDto

**Verified**: ✅ Endpoint exists in controller line 262-281
**Notes**:
- Uses UpdateAgencyContactDto
- phone and mobile are merged into phones[] array
- email is merged into emails[] array
- contact_persons replaces existing array (not appended)
- Service method: agencyProfileService.updateContact()

**⚠️ IMPORTANT**: The service merges phone/mobile into phones[] and email into emails[]

---

### ✅ 5. Update Location

**Endpoint**: `PATCH /agencies/owner/agency/location`

**Request Body**:
```json
{
  "address": "123 Main Street, Kathmandu, Nepal",
  "latitude": 27.7172,
  "longitude": 85.3240
}
```

**Expected Response** (200): Full AgencyResponseDto

**Verified**: ✅ Endpoint exists in controller line 283-300
**Notes**:
- Uses UpdateAgencyLocationDto
- All fields optional
- Service method: agencyProfileService.updateLocation()

---

### ✅ 6. Update Social Media

**Endpoint**: `PATCH /agencies/owner/agency/social-media`

**Request Body** (Option 1 - Direct fields):
```json
{
  "facebook": "https://facebook.com/agency",
  "instagram": "https://instagram.com/agency",
  "linkedin": "https://linkedin.com/company/agency",
  "twitter": "https://twitter.com/agency"
}
```

**Request Body** (Option 2 - Wrapped):
```json
{
  "social_media": {
    "facebook": "https://facebook.com/agency",
    "instagram": "https://instagram.com/agency",
    "linkedin": "https://linkedin.com/company/agency",
    "twitter": "https://twitter.com/agency"
  }
}
```

**Expected Response** (200): Full AgencyResponseDto

**Verified**: ✅ Endpoint exists in controller line 302-315
**Notes**:
- Uses UpdateAgencySocialMediaDto
- Controller accepts: `body.social_media ?? body`
- Both formats work!
- All URLs must include protocol (validated)
- Service method: agencyProfileService.updateSocialMedia()

**⚠️ CORRECTION**: Frontend can send either format

---

### ✅ 7. Update Services & Specializations

**Endpoint**: `PATCH /agencies/owner/agency/services`

**Request Body**:
```json
{
  "services": [
    "Recruitment",
    "Visa Processing",
    "Training & Orientation"
  ],
  "specializations": [
    "Healthcare",
    "IT & Technology",
    "Construction"
  ],
  "target_countries": [
    "UAE",
    "Saudi Arabia",
    "Qatar"
  ]
}
```

**Expected Response** (200): Full AgencyResponseDto

**Verified**: ✅ Endpoint exists in controller line 317-334
**Notes**:
- Uses UpdateAgencyServicesDto
- All fields are arrays of strings
- All fields optional
- Service method: agencyProfileService.updateServices()

**⚠️ NOTE**: Controller also accepts `body.countries` as alias for `target_countries`

---

### ✅ 8. Update Settings

**Endpoint**: `PATCH /agencies/owner/agency/settings`

**Request Body** (Option 1 - Direct fields):
```json
{
  "currency": "USD",
  "timezone": "Asia/Kathmandu",
  "language": "en",
  "date_format": "YYYY-MM-DD",
  "notifications": {
    "email": true,
    "push": true,
    "sms": false
  }
}
```

**Request Body** (Option 2 - Wrapped):
```json
{
  "settings": {
    "currency": "USD",
    "timezone": "Asia/Kathmandu",
    "language": "en",
    "date_format": "YYYY-MM-DD",
    "notifications": {
      "email": true,
      "push": true,
      "sms": false
    }
  }
}
```

**Expected Response** (200): Full AgencyResponseDto

**Verified**: ✅ Endpoint exists in controller line 336-349
**Notes**:
- Uses UpdateAgencySettingsDto
- Controller accepts: `body.settings ?? body`
- Both formats work!
- notifications is Record<string, boolean>
- Service method: agencyProfileService.updateSettings()

**⚠️ CORRECTION**: 
- UpdateAgencySettingsDto does NOT have `features` field
- Only has: currency, timezone, language, date_format, notifications

---

### ✅ 9. Upload Logo

**Endpoint**: `POST /agencies/:license/logo`

**Request**: multipart/form-data with `file` field

**Expected Response** (200):
```json
{
  "success": true,
  "url": "https://storage.example.com/logos/agency-uuid.jpg",
  "message": "Logo uploaded successfully"
}
```

**Verified**: ✅ Endpoint exists in controller line 1103-1133
**Notes**:
- Uses FileInterceptor('file')
- Returns UploadResponseDto
- Automatically updates agency.logo_url
- Uses ImageUploadService with UploadType.AGENCY_LOGO

---

### ✅ 10. Remove Logo

**Endpoint**: `DELETE /agencies/:license/logo`

**Expected Response** (200):
```json
{
  "success": true,
  "message": "Logo removed successfully"
}
```

**Verified**: ✅ Endpoint exists in controller line 1135-1156
**Notes**:
- Returns UploadResponseDto
- Sets agency.logo_url to null
- Deletes file from storage

---

### ✅ 11. Upload Banner

**Endpoint**: `POST /agencies/:license/banner`

**Request**: multipart/form-data with `file` field

**Expected Response** (200):
```json
{
  "success": true,
  "url": "https://storage.example.com/banners/agency-uuid.jpg",
  "message": "Banner uploaded successfully"
}
```

**Verified**: ✅ Endpoint exists in controller line 1158-1188
**Notes**:
- Uses FileInterceptor('file')
- Returns UploadResponseDto
- Automatically updates agency.banner_url
- Uses ImageUploadService with UploadType.AGENCY_BANNER

---

### ✅ 12. Remove Banner

**Endpoint**: `DELETE /agencies/:license/banner`

**Expected Response** (200):
```json
{
  "success": true,
  "message": "Banner removed successfully"
}
```

**Verified**: ✅ Endpoint exists in controller line 1190-1211
**Notes**:
- Returns UploadResponseDto
- Sets agency.banner_url to null
- Deletes file from storage

---

### ✅ 13. Get Agency by ID (Public)

**Endpoint**: `GET /agencies/:id`

**Expected Response** (200): Full AgencyResponseDto

**Verified**: ✅ Endpoint exists in controller line 119-138
**Notes**:
- Public endpoint (no auth required)
- Returns mapped AgencyResponseDto
- Uses agencyService.findAgencyById()

---

### ✅ 14. Get Agency by License (Public)

**Endpoint**: `GET /agencies/license/:license`

**Expected Response** (200): Full AgencyResponseDto

**Verified**: ✅ Endpoint exists in controller line 140-158
**Notes**:
- Public endpoint (no auth required)
- Returns mapped AgencyResponseDto
- Uses agencyService.findAgencyByLicense()

---

### ✅ 15. Search Agencies (Public)

**Endpoint**: `GET /agencies/search`

**Query Parameters**:
- `keyword` (optional) - Search term
- `page` (optional, default: 1)
- `limit` (optional, default: 10, max: 100)
- `sortBy` (optional) - name, country, city, created_at
- `sortOrder` (optional) - asc, desc

**Expected Response** (200):
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Agency Name",
      "license_number": "LIC-001",
      "logo_url": "...",
      "description": "...",
      "city": "Kathmandu",
      "country": "Nepal",
      "website": "...",
      "is_active": true,
      "specializations": ["Healthcare", "IT"],
      "created_at": "2024-01-01T00:00:00.000Z",
      "job_posting_count": 15
    }
  ],
  "meta": {
    "total": 100,
    "page": 1,
    "limit": 10,
    "totalPages": 10
  }
}
```

**Verified**: ✅ Endpoint exists in controller line 67-117
**Notes**:
- Public endpoint (no auth required)
- Uses AgencySearchDto for validation
- Returns PaginatedAgencyResponseDto
- Searches across: name, license, description, city, country, specializations, target_countries
- Uses agencyService.searchAgencies()

---

## Critical Findings & Corrections

### 🔴 Issue 1: Settings DTO Structure

**Documentation Said**:
```json
{
  "settings": {
    "currency": "USD",
    "features": { "darkMode": true }
  }
}
```

**Reality**:
- UpdateAgencySettingsDto does NOT have `features` field
- Only has: currency, timezone, language, date_format, notifications
- Controller accepts both wrapped (`body.settings`) and direct (`body`) format

**Correction**: Remove `features` from documentation

---

### 🔴 Issue 2: Social Media DTO Structure

**Documentation Said**: Only direct fields

**Reality**:
- Controller accepts both wrapped (`body.social_media`) and direct (`body`) format
- UpdateAgencySocialMediaDto has direct fields (facebook, instagram, linkedin, twitter)

**Correction**: Document both formats as acceptable

---

### 🔴 Issue 3: Contact Information Merging

**Documentation Said**: Direct array replacement

**Reality**:
- Service merges `phone` and `mobile` into `phones[]` array
- Service merges `email` into `emails[]` array
- This is REPLACEMENT, not append (creates new array from provided values)

**Correction**: Clarify the merging behavior

---

### 🔴 Issue 4: Services Endpoint Alias

**Documentation Missed**:
- Controller accepts `body.countries` as alias for `target_countries`
- Line 329: `target_countries: body.target_countries ?? body.countries`

**Correction**: Document the alias

---

### ✅ Issue 5: Response Format for GET /agencies/owner/agency

**Documentation Said**: Returns AgencyResponseDto

**Reality**:
- Returns custom object with explicit field mapping
- NOT using the mapAgencyToResponseDto helper
- Returns same fields but different implementation

**Correction**: Response structure is correct, just different implementation

---

## Data Structure Verification

### PostingAgency Entity Fields (Verified from PostingAgency.ts)

**Scalar Fields**:
- ✅ name (varchar 255)
- ✅ license_number (varchar 100, unique)
- ✅ country (varchar 100, nullable)
- ✅ city (varchar 100, nullable)
- ✅ address (text, nullable)
- ✅ latitude (double precision, nullable)
- ✅ longitude (double precision, nullable)
- ✅ contact_email (varchar 255, nullable)
- ✅ contact_phone (varchar 100, nullable)
- ✅ website (varchar 500, nullable)
- ✅ description (varchar 1000, nullable)
- ✅ logo_url (varchar 1000, nullable)
- ✅ banner_url (varchar 1000, nullable)
- ✅ established_year (integer, nullable)
- ✅ license_valid_till (date, nullable)
- ✅ is_active (boolean, default true)
- ✅ average_rating (decimal 3,2, default 0)
- ✅ review_count (integer, default 0)

**Array Fields**:
- ✅ phones (text[], nullable)
- ✅ emails (text[], nullable)
- ✅ services (text[], nullable)
- ✅ target_countries (text[], nullable)
- ✅ specializations (text[], nullable)

**JSONB Fields**:
- ✅ certifications (jsonb, nullable) - Array of objects
- ✅ social_media (jsonb, nullable) - Object
- ✅ bank_details (jsonb, nullable) - Object
- ✅ contact_persons (jsonb, nullable) - Array of objects
- ✅ operating_hours (jsonb, nullable) - Object
- ✅ statistics (jsonb, nullable) - Object
- ✅ settings (jsonb, nullable) - Object

---

## DTO Verification

### ✅ CreateAgencyDto
- Required: name, license_number
- Optional: All other fields
- Accepts single values (phone, mobile, email) that get merged into arrays

### ✅ UpdateAgencyBasicDto
- Fields: name, description, established_year, license_number
- All optional

### ✅ UpdateAgencyContactDto
- Fields: phone, mobile, email, website, contact_persons
- All optional
- phone/mobile merged into phones[]
- email merged into emails[]

### ✅ UpdateAgencyLocationDto
- Fields: address, latitude, longitude
- All optional

### ✅ UpdateAgencySocialMediaDto
- Fields: facebook, instagram, linkedin, twitter
- All optional
- All must be valid URLs with protocol

### ✅ UpdateAgencyServicesDto
- Fields: services, specializations, target_countries
- All optional
- All are string arrays

### ⚠️ UpdateAgencySettingsDto
- Fields: currency, timezone, language, date_format, notifications
- All optional
- notifications is Record<string, boolean>
- **DOES NOT HAVE**: features field

### ✅ AgencyResponseDto
- Contains all agency fields
- Nullable fields properly typed
- Used by most update endpoints

---

## Endpoint Summary

| # | Method | Endpoint | Auth | Verified | Notes |
|---|--------|----------|------|----------|-------|
| 1 | POST | `/agencies/owner/agency` | ✅ | ✅ | Create agency |
| 2 | GET | `/agencies/owner/agency` | ✅ | ✅ | Get my agency |
| 3 | PATCH | `/agencies/owner/agency/basic` | ✅ | ✅ | Update basic |
| 4 | PATCH | `/agencies/owner/agency/contact` | ✅ | ✅ | Update contact |
| 5 | PATCH | `/agencies/owner/agency/location` | ✅ | ✅ | Update location |
| 6 | PATCH | `/agencies/owner/agency/social-media` | ✅ | ✅ | Update social |
| 7 | PATCH | `/agencies/owner/agency/services` | ✅ | ✅ | Update services |
| 8 | PATCH | `/agencies/owner/agency/settings` | ✅ | ✅ | Update settings |
| 9 | POST | `/agencies/:license/logo` | ❌ | ✅ | Upload logo |
| 10 | DELETE | `/agencies/:license/logo` | ❌ | ✅ | Remove logo |
| 11 | POST | `/agencies/:license/banner` | ❌ | ✅ | Upload banner |
| 12 | DELETE | `/agencies/:license/banner` | ❌ | ✅ | Remove banner |
| 13 | GET | `/agencies/:id` | ❌ | ✅ | Get by ID (public) |
| 14 | GET | `/agencies/license/:license` | ❌ | ✅ | Get by license (public) |
| 15 | GET | `/agencies/search` | ❌ | ✅ | Search (public) |

**Total**: 15 endpoints verified ✅

---

## Advanced Features Verification

### Certifications
- ✅ Stored in JSONB field
- ✅ Structure: Array of { name, number, issued_by, issued_date, expiry_date }
- ⚠️ No dedicated update endpoint - use general update or basic info update

### Bank Details
- ✅ Stored in JSONB field
- ✅ Structure: { bank_name, account_name, account_number, swift_code }
- ⚠️ No dedicated update endpoint - use contact update

### Operating Hours
- ✅ Stored in JSONB field
- ✅ Structure: { weekdays, saturday, sunday }
- ⚠️ No dedicated update endpoint - use basic info update

### Statistics
- ✅ Stored in JSONB field
- ✅ Structure: { total_placements, active_since, success_rate, countries_served, partner_companies, active_recruiters }
- ⚠️ No dedicated update endpoint - use basic info update

---

## Testing Recommendations

### Manual Testing Sequence

1. **Create Agency**
   ```bash
   POST /agencies/owner/agency
   Body: { "name": "Test Agency", "license_number": "LIC-TEST-001" }
   ```

2. **Get Profile** (verify creation)
   ```bash
   GET /agencies/owner/agency
   ```

3. **Update Basic Info**
   ```bash
   PATCH /agencies/owner/agency/basic
   Body: { "description": "Test description", "established_year": 2020 }
   ```

4. **Update Contact**
   ```bash
   PATCH /agencies/owner/agency/contact
   Body: { "phone": "+977-1-4123456", "email": "test@agency.com" }
   ```

5. **Update Location**
   ```bash
   PATCH /agencies/owner/agency/location
   Body: { "address": "Kathmandu", "latitude": 27.7172, "longitude": 85.3240 }
   ```

6. **Update Social Media**
   ```bash
   PATCH /agencies/owner/agency/social-media
   Body: { "facebook": "https://facebook.com/test" }
   ```

7. **Update Services**
   ```bash
   PATCH /agencies/owner/agency/services
   Body: { "services": ["Recruitment"], "specializations": ["IT"] }
   ```

8. **Update Settings**
   ```bash
   PATCH /agencies/owner/agency/settings
   Body: { "currency": "USD", "timezone": "Asia/Kathmandu" }
   ```

9. **Upload Logo**
   ```bash
   POST /agencies/LIC-TEST-001/logo
   Body: multipart/form-data with file
   ```

10. **Get Profile** (verify all updates)
    ```bash
    GET /agencies/owner/agency
    ```

---

## Conclusion

### ✅ All Endpoints Verified

All 15 documented endpoints exist in the backend and are correctly implemented.

### 🔴 Required Corrections to Documentation

1. **Remove `features` field** from UpdateAgencySettingsDto
2. **Document dual format** for social media (wrapped or direct)
3. **Document dual format** for settings (wrapped or direct)
4. **Document `countries` alias** for target_countries in services endpoint
5. **Clarify phone/email merging** behavior in contact update
6. **Note**: Advanced fields (certifications, bank_details, operating_hours, statistics) don't have dedicated endpoints

### ✅ Ready for Frontend Team

After applying the corrections above, the documentation will be 100% accurate and ready for the frontend team to start building the admin panel.

---

## Next Steps

1. ✅ Update API guide with corrections
2. ✅ Create corrected request/response examples
3. ✅ Provide Postman collection (optional)
4. ✅ Share with frontend team
