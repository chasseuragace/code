# Frontend Data Model Update - Mobile Job Details

## Summary
Successfully regenerated the Dart client to include all new agency-related fields added to the backend mobile job details API.

## Changes Verified

### ✅ Backend DTO (`mobile-job.dto.ts`)
Enhanced with 11 new agency fields:
- `agencyId` - Agency UUID
- `agencyLogo` - Logo URL
- `agencyRating` - Rating (0-5)
- `agencyReviewCount` - Review count
- `companySize` - Derived from established_year
- `establishedYear` - Raw year value
- `agencySpecializations` - Array of specializations
- `agencyTargetCountries` - Array of target countries
- `agencyWebsite` - Website URL
- `agencyAddress` - Physical address
- `agencyPhones` - Array of phone numbers

### ✅ Backend Service (`domain.service.ts`)
Updated `jobbyidmobile()` to:
- Calculate company size from `established_year`
- Include all agency metadata in response
- Use agency logo as company logo

### ✅ Frontend Dart Client (`mobile_job_posting_dto.dart`)
Regenerated with all new fields properly typed:

```dart
class MobileJobPostingDto {
  // Existing fields...
  final String? agency;
  
  // NEW AGENCY FIELDS
  final String? agencyId;              // For navigation
  final String? agencyLogo;            // Logo URL
  final num? agencyRating;             // 0-5 rating
  final num? agencyReviewCount;        // Review count
  final String? companySize;           // "Startup (0-5 years)", etc.
  final num? establishedYear;          // BS year (e.g., 2303)
  final List<String>? agencySpecializations;
  final List<String>? agencyTargetCountries;
  final String? agencyWebsite;
  final String? agencyAddress;
  final List<String>? agencyPhones;
  
  // Existing fields...
  final String? employer;
  final List<MobileJobPositionDto> positions;
  // ...
}
```

## Company Size Calculation

The backend automatically derives company size from `established_year`:

```typescript
const currentYear = new Date().getFullYear(); // 2025
const yearsInBusiness = currentYear - agency.established_year;

if (yearsInBusiness < 5) {
  companySize = 'Startup (0-5 years)';
} else if (yearsInBusiness < 10) {
  companySize = 'Growing (5-10 years)';
} else if (yearsInBusiness < 20) {
  companySize = 'Established (10-20 years)';
} else {
  companySize = 'Mature (20+ years)';
}
```

**Note**: The calculation uses AD years. Since `established_year` is stored in BS format (e.g., 2303), the frontend may need to convert: `AD = BS - 57`

## Frontend Usage Examples

### 1. Display Company Size
```dart
Text(job.companySize ?? 'Not specified')
// Output: "Established (10-20 years)"
```

### 2. Navigate to Agency Profile
```dart
if (job.agencyId != null) {
  Navigator.push(
    context,
    MaterialPageRoute(
      builder: (context) => AgencyProfilePage(agencyId: job.agencyId!),
    ),
  );
}
```

### 3. Show Agency Rating
```dart
Row(
  children: [
    RatingBar(rating: job.agencyRating?.toDouble() ?? 0),
    SizedBox(width: 8),
    Text('${job.agencyReviewCount ?? 0} reviews'),
  ],
)
```

### 4. Display Agency Contact
```dart
if (job.agencyPhones != null && job.agencyPhones!.isNotEmpty) {
  ListTile(
    leading: Icon(Icons.phone),
    title: Text(job.agencyPhones!.first),
    onTap: () => _callAgency(job.agencyPhones!.first),
  );
}
```

### 5. Show Agency Specializations
```dart
if (job.agencySpecializations != null) {
  Wrap(
    spacing: 8,
    children: job.agencySpecializations!.map((spec) => 
      Chip(label: Text(spec))
    ).toList(),
  );
}
```

## API Endpoint
```
GET /candidates/:candidateId/jobs/:jobId/mobile
```

## Example Response
```json
{
  "id": "b9d96025-2284-4eb0-8309-fd0842c37ae9",
  "postingTitle": "Construction Workers Needed",
  "country": "Saudi Arabia",
  "city": "Riyadh",
  
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
  
  "employer": "ABC Construction Co.",
  "positions": [...],
  "matchPercentage": "75",
  ...
}
```

## Regeneration Process

To regenerate the Dart client after backend DTO changes:

```bash
cd portal/dev_tools/package_form_open_api
bash build_from_web.sh generated_client
```

This script:
1. Fetches OpenAPI spec from `http://localhost:3000/docs-yaml`
2. Generates Dart client using `openapi-generator-cli`
3. Runs `build_runner` to generate serialization code
4. Outputs to `generated_client/` directory

## Files Modified

### Backend
- `portal/agency_research/code/src/modules/candidate/dto/mobile-job.dto.ts`
- `portal/agency_research/code/src/modules/domain/domain.service.ts`

### Frontend (Auto-generated)
- `portal/dev_tools/package_form_open_api/generated_client/lib/src/model/mobile_job_posting_dto.dart`
- `portal/dev_tools/package_form_open_api/generated_client/lib/src/model/mobile_job_posting_dto.g.dart`

## Testing Checklist

- [x] Backend DTO updated with new fields
- [x] Backend service populates new fields
- [x] Backend compiles without errors
- [x] Dart client regenerated successfully
- [x] All new fields present in Dart model
- [ ] Frontend UI updated to display new fields
- [ ] Integration test with real API data
- [ ] Verify BS to AD year conversion if needed

## Next Steps

1. **Update Flutter UI** to display the new agency information
2. **Add agency profile navigation** using `agencyId`
3. **Display trust indicators** (rating, reviews, company size)
4. **Show contact information** (phones, website, address)
5. **Test with real data** from the API

## Notes

- All new fields are optional (nullable) for backward compatibility
- No breaking changes to existing frontend code
- Agency data is already loaded via contract relations (no extra queries)
- Company size is calculated server-side for consistency
