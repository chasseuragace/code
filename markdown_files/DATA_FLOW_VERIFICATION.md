# Data Flow Verification - Mobile Job Details

## Summary
✅ **All data mappings are correctly configured** from Backend API → API Client → Internal Models → UI

## Data Flow Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         BACKEND (NestJS)                            │
├─────────────────────────────────────────────────────────────────────┤
│ MobileJobPostingDto (TypeScript)                                    │
│ - agencyId, agencyLogo, agencyRating, agencyReviewCount           │
│ - companySize, establishedYear, agencySpecializations, etc.        │
└────────────────────────┬────────────────────────────────────────────┘
                         │ HTTP Response (JSON)
                         ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    API CLIENT (Dart - OpenAPI)                      │
├─────────────────────────────────────────────────────────────────────┤
│ MobileJobPostingDto (Dart)                                          │
│ - Generated from OpenAPI spec                                       │
│ - All 11 new agency fields present                                 │
└────────────────────────┬────────────────────────────────────────────┘
                         │ data.data!.toJson()
                         ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    REPOSITORY LAYER                                 │
├─────────────────────────────────────────────────────────────────────┤
│ JobsRepositoryFake.getItemById()                                    │
│ ```dart                                                             │
│ final data = await _api.candidateControllerGetJobMobile(           │
│     id: candidateId, jobId: id);                                   │
│ return right(MobileJobModel.fromJson(data.data!.toJson()));       │
│ ```                                                                 │
└────────────────────────┬────────────────────────────────────────────┘
                         │ MobileJobModel.fromJson()
                         ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    INTERNAL DATA MODEL                              │
├─────────────────────────────────────────────────────────────────────┤
│ MobileJobModel extends MobileJobEntity                              │
│ File: mobile_job_model.dart                                         │
│                                                                     │
│ fromJson() mapping:                                                 │
│ - agencyId: json['agencyId']                                       │
│ - agencyLogo: json['agencyLogo']                                   │
│ - agencyRating: json['agencyRating']                               │
│ - agencyReviewCount: json['agencyReviewCount'] ✅                  │
│ - companySize: json['companySize']                                 │
│ - establishedYear: json['establishedYear']                         │
│ - agencySpecializations: json['agencySpecializations']             │
│ - agencyTargetCountries: json['agencyTargetCountries']             │
│ - agencyWebsite: json['agencyWebsite']                             │
│ - agencyAddress: json['agencyAddress']                             │
│ - agencyPhones: json['agencyPhones']                               │
└────────────────────────┬────────────────────────────────────────────┘
                         │ extends
                         ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    DOMAIN ENTITY                                    │
├─────────────────────────────────────────────────────────────────────┤
│ MobileJobEntity                                                     │
│ File: job_posting.dart                                              │
│                                                                     │
│ All fields declared:                                                │
│ - final String? agencyId;                                          │
│ - final String? agencyLogo;                                        │
│ - final double? agencyRating;                                      │
│ - final int? agencyReviewCount; ✅                                 │
│ - final String? companySize;                                       │
│ - final int? establishedYear;                                      │
│ - final List<String>? agencySpecializations;                       │
│ - final List<String>? agencyTargetCountries;                       │
│ - final String? agencyWebsite;                                     │
│ - final String? agencyAddress;                                     │
│ - final List<String>? agencyPhones;                                │
└────────────────────────┬────────────────────────────────────────────┘
                         │ Used by
                         ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                               │
├─────────────────────────────────────────────────────────────────────┤
│ Provider: getJobsByIdProvider                                       │
│ → GetJobsByIdNotifier.getJobsById(id)                             │
│ → JobsRepositoryFake.getItemById(id)                               │
│ → Returns: MobileJobEntity                                         │
└────────────────────────┬────────────────────────────────────────────┘
                         │ Consumed by
                         ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         UI LAYER                                    │
├─────────────────────────────────────────────────────────────────────┤
│ JobDetailPage                                                       │
│ File: job_details_page.dart                                         │
│                                                                     │
│ ```dart                                                             │
│ final jobdataprovider = ref.watch(getJobsByIdProvider);           │
│ jobdataprovider.when(                                              │
│   data: (MobileJobEntity? data) {                                 │
│     // Use data.agencyId, data.agencyRating, etc.                │
│     return body(data, allPositionsApplied);                       │
│   },                                                               │
│ )                                                                  │
│ ```                                                                 │
│                                                                     │
│ UI Components:                                                      │
│ - CompanyDetailsSection(job: job)                                  │
│ - AgencySection(job: job)                                          │
│ - ContractDetailsSection(job: job)                                 │
│ - FacilitiesSection(job: job)                                      │
└─────────────────────────────────────────────────────────────────────┘
```

## Verification Checklist

### ✅ Backend (NestJS)
- [x] `MobileJobPostingDto` has all 11 new agency fields
- [x] `jobbyidmobile()` service populates all fields
- [x] Company size calculated from `established_year`
- [x] Backend compiles without errors

### ✅ API Client (Dart - OpenAPI Generated)
- [x] Regenerated from `http://localhost:3000/docs-yaml`
- [x] `MobileJobPostingDto` includes all new fields
- [x] Proper JSON serialization annotations
- [x] Type-safe field definitions

### ✅ Internal Data Model
- [x] `MobileJobModel.fromJson()` maps all new fields
- [x] `MobileJobModel.toJson()` includes all new fields
- [x] Extends `MobileJobEntity` with all fields

### ✅ Domain Entity
- [x] `MobileJobEntity` declares all new fields
- [x] Constructor accepts all new fields
- [x] All fields are optional (nullable) for backward compatibility

### ✅ Repository Layer
- [x] `getItemById()` converts API DTO to internal model
- [x] Uses `MobileJobModel.fromJson(data.data!.toJson())`
- [x] Returns `Either<Failure, MobileJobEntity>`

### ✅ Presentation Layer
- [x] `getJobsByIdProvider` returns `MobileJobEntity`
- [x] Provider properly typed
- [x] Error handling in place

### ⚠️ UI Layer (Needs Implementation)
- [ ] Display company size in UI
- [ ] Show agency rating and review count
- [ ] Add agency profile navigation
- [ ] Display agency contact information
- [ ] Show agency specializations

## Field Mapping Reference

| Backend Field | API Client Field | Internal Model Field | Entity Field | Type |
|--------------|------------------|---------------------|--------------|------|
| `agencyId` | `agencyId` | `agencyId` | `agencyId` | `String?` |
| `agencyLogo` | `agencyLogo` | `agencyLogo` | `agencyLogo` | `String?` |
| `agencyRating` | `agencyRating` | `agencyRating` | `agencyRating` | `double?` |
| `agencyReviewCount` | `agencyReviewCount` | `agencyReviewCount` | `agencyReviewCount` | `int?` |
| `companySize` | `companySize` | `companySize` | `companySize` | `String?` |
| `establishedYear` | `establishedYear` | `establishedYear` | `establishedYear` | `int?` |
| `agencySpecializations` | `agencySpecializations` | `agencySpecializations` | `agencySpecializations` | `List<String>?` |
| `agencyTargetCountries` | `agencyTargetCountries` | `agencyTargetCountries` | `agencyTargetCountries` | `List<String>?` |
| `agencyWebsite` | `agencyWebsite` | `agencyWebsite` | `agencyWebsite` | `String?` |
| `agencyAddress` | `agencyAddress` | `agencyAddress` | `agencyAddress` | `String?` |
| `agencyPhones` | `agencyPhones` | `agencyPhones` | `agencyPhones` | `List<String>?` |

## Example API Response

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
  "agencySpecializations": ["Construction", "Hospitality"],
  "agencyTargetCountries": ["Saudi Arabia"],
  "agencyWebsite": null,
  "agencyAddress": "Kathmandu, Nepal",
  "agencyPhones": ["+9779810000000"],
  "employer": "ABC Construction Co.",
  "positions": [...],
  "matchPercentage": "75"
}
```

## UI Implementation Examples

### 1. Display Company Size
```dart
// In CompanyDetailsSection widget
if (job.companySize != null)
  ListTile(
    leading: Icon(Icons.business),
    title: Text('Company Size'),
    subtitle: Text(job.companySize!),
  ),
```

### 2. Show Agency Rating
```dart
// In AgencySection widget
Row(
  children: [
    RatingBarIndicator(
      rating: job.agencyRating ?? 0,
      itemBuilder: (context, _) => Icon(Icons.star, color: Colors.amber),
      itemCount: 5,
      itemSize: 20,
    ),
    SizedBox(width: 8),
    Text('${job.agencyReviewCount ?? 0} reviews'),
  ],
)
```

### 3. Agency Profile Navigation
```dart
// In AgencySection widget
GestureDetector(
  onTap: () {
    if (job.agencyId != null) {
      Navigator.push(
        context,
        MaterialPageRoute(
          builder: (context) => AgencyProfilePage(agencyId: job.agencyId!),
        ),
      );
    }
  },
  child: Text(job.agency ?? 'Unknown Agency'),
)
```

### 4. Display Contact Information
```dart
// In AgencySection widget
if (job.agencyPhones != null && job.agencyPhones!.isNotEmpty)
  ListTile(
    leading: Icon(Icons.phone),
    title: Text('Contact Agency'),
    subtitle: Text(job.agencyPhones!.first),
    onTap: () => _makePhoneCall(job.agencyPhones!.first),
  ),
```

## Testing

### Manual Test
```bash
# 1. Start backend
cd portal/agency_research/code
npm run start:dev

# 2. Test API endpoint
curl http://localhost:3000/candidates/5142bca1-1431-4086-9018-9ad503c7a605/jobs/b9d96025-2284-4eb0-8309-fd0842c37ae9/mobile | jq

# 3. Run Flutter app
cd portal/agency_research/code/variant_dashboard
flutter run
```

### Verify in App
1. Navigate to job details page
2. Check that agency information displays
3. Verify company size shows correctly
4. Confirm rating and review count appear
5. Test agency profile navigation (if implemented)

## Files Modified

### Backend
- ✅ `src/modules/candidate/dto/mobile-job.dto.ts`
- ✅ `src/modules/domain/domain.service.ts`

### API Client (Auto-generated)
- ✅ `portal/dev_tools/package_form_open_api/generated_client/lib/src/model/mobile_job_posting_dto.dart`

### Flutter App
- ✅ `lib/app/variant_dashboard/features/variants/presentation/variants/pages/home/job_posting.dart` (Entity)
- ✅ `lib/app/udaan_saarathi/features/data/models/jobs/mobile_job_model.dart` (Model)
- ⚠️ `lib/app/udaan_saarathi/features/presentation/job_detail/page/job_details_page.dart` (UI - needs updates)
- ⚠️ `lib/app/udaan_saarathi/features/presentation/job_detail/widgets/company_details_section.dart` (UI - needs updates)
- ⚠️ `lib/app/udaan_saarathi/features/presentation/job_detail/widgets/agency_section.dart` (UI - needs updates)

## Conclusion

✅ **Data flow is correctly configured** from backend to frontend. All new agency fields are:
1. Defined in backend DTO
2. Populated by backend service
3. Included in API client
4. Mapped in internal model
5. Available in domain entity
6. Accessible in UI layer

The only remaining work is to **update the UI components** to display the new agency information to users.
