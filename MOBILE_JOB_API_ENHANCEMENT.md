# Mobile Job Details API Enhancement

## Summary
Enhanced the mobile job details endpoint (`GET /candidates/:id/jobs/:jobId/mobile`) to include comprehensive agency information, including company size derived from `established_year`.

## Changes Made

### 1. Enhanced DTO (`mobile-job.dto.ts`)
Added agency-related fields to `MobileJobPostingDto`:

```typescript
// New fields added:
agencyId?: string;              // Agency UUID for navigation
agencyLogo?: string;            // Agency logo URL
agencyRating?: number;          // Average rating (0-5)
agencyReviewCount?: number;     // Number of reviews
companySize?: string;           // Derived from established_year
establishedYear?: number;       // Raw established year
agencySpecializations?: string[]; // Agency specializations
agencyTargetCountries?: string[]; // Target countries
agencyWebsite?: string;         // Agency website
agencyAddress?: string;         // Agency address
agencyPhones?: string[];        // Contact phones
```

### 2. Enhanced Service (`domain.service.ts`)
Updated `jobbyidmobile()` method to:

- **Derive company size** from `established_year`:
  - `Startup (0-5 years)` - Less than 5 years
  - `Growing (5-10 years)` - 5-10 years
  - `Established (10-20 years)` - 10-20 years
  - `Mature (20+ years)` - 20+ years

- **Include agency metadata**:
  - Rating and review count
  - Logo, website, address
  - Specializations and target countries
  - Contact information

### 3. Controller (`candidate.controller.ts`)
No changes needed - controller already:
- Computes match percentage (fitness score)
- Adds `hasApplied` flag to positions
- Returns enriched mobile DTO

## API Response Structure

### Example Response
```json
{
  "id": "b9d96025-2284-4eb0-8309-fd0842c37ae9",
  "postingTitle": "Construction Workers Needed",
  "country": "Saudi Arabia",
  "city": "Riyadh",
  
  // Agency Information (NEW/ENHANCED)
  "agency": "Ram's Recruitment Services",
  "agencyId": "948dfe32-b4c0-48a4-ace0-9c58594872c6",
  "agencyLogo": "https://example.com/logo.png",
  "agencyRating": 4.5,
  "agencyReviewCount": 120,
  "companySize": "Mature (20+ years)",
  "establishedYear": 2303,
  "agencySpecializations": ["Construction", "Hospitality", "Manufacturing"],
  "agencyTargetCountries": ["Saudi Arabia"],
  "agencyWebsite": null,
  "agencyAddress": "Kathmandu, Nepal",
  "agencyPhones": ["+9779810000000"],
  
  // Job Information
  "employer": "ABC Construction Co.",
  "positions": [
    {
      "id": "pos-uuid",
      "title": "Mason",
      "baseSalary": "SAR 1500",
      "convertedSalary": "NPR 54000",
      "currency": "SAR",
      "hasApplied": false
    }
  ],
  "description": "Looking for skilled construction workers...",
  "contractTerms": {
    "type": "Full-time",
    "duration": "2 years",
    "isRenewable": true
  },
  "isActive": true,
  "postedDate": "2024-12-01T00:00:00.000Z",
  "location": "Riyadh, Saudi Arabia",
  "experience": "2-5 years",
  "salary": "SAR 1500 - SAR 2000",
  "type": "Full-time",
  "isRemote": false,
  "isFeatured": false,
  "companyLogo": "https://example.com/logo.png",
  "matchPercentage": "75"
}
```

## Frontend Benefits

### 1. Company Size Display
Frontend can now display company maturity without additional API calls:
```typescript
// Display: "Established (10-20 years)"
<Text>{job.companySize}</Text>
```

### 2. Agency Profile Navigation
Direct navigation to agency profile:
```typescript
// Navigate to agency details
navigation.navigate('AgencyProfile', { id: job.agencyId });
```

### 3. Trust Indicators
Show agency credibility:
```typescript
<Rating value={job.agencyRating} />
<Text>{job.agencyReviewCount} reviews</Text>
```

### 4. Contact Information
Direct access to agency contact:
```typescript
<Button onPress={() => call(job.agencyPhones[0])}>
  Call Agency
</Button>
```

## Data Source Mapping

| Field | Source | Notes |
|-------|--------|-------|
| `companySize` | Derived from `established_year` | Calculated in service |
| `establishedYear` | `posting_agencies.established_year` | BS year (e.g., 2303) |
| `agencyRating` | `posting_agencies.average_rating` | 0-5 scale |
| `agencyReviewCount` | `posting_agencies.review_count` | Integer count |
| `agencyLogo` | `posting_agencies.logo_url` | URL string |
| `agencySpecializations` | `posting_agencies.specializations` | String array |
| `agencyTargetCountries` | `posting_agencies.target_countries` | String array |

## Testing

### Test the endpoint:
```bash
curl http://localhost:3000/candidates/5142bca1-1431-4086-9018-9ad503c7a605/jobs/b9d96025-2284-4eb0-8309-fd0842c37ae9/mobile
```

### Expected fields in response:
- ✅ `agencyId` - for navigation
- ✅ `companySize` - derived from established_year
- ✅ `establishedYear` - raw year value
- ✅ `agencyRating` - trust indicator
- ✅ `agencyReviewCount` - social proof
- ✅ `agencyLogo` - visual branding
- ✅ `agencySpecializations` - expertise areas
- ✅ `agencyTargetCountries` - service regions
- ✅ `agencyPhones` - contact info
- ✅ `matchPercentage` - candidate fit score
- ✅ `hasApplied` - per-position application status

## Notes

1. **BS Year Handling**: The `established_year` is stored in Bikram Sambat (BS) format (e.g., 2303). Frontend should convert to AD if needed: `AD = BS - 57`

2. **Company Size Logic**: Based on current year (2025 AD = 2082 BS), the calculation uses AD years for consistency.

3. **Backward Compatibility**: All new fields are optional, so existing frontend code won't break.

4. **Performance**: No additional queries needed - agency data is already loaded via contract relations.

## Related Files
- `src/modules/candidate/dto/mobile-job.dto.ts` - DTO definition
- `src/modules/domain/domain.service.ts` - Service logic
- `src/modules/candidate/candidate.controller.ts` - Endpoint handler
- `src/modules/domain/PostingAgency.ts` - Agency entity
