# Frontend Fitness Score Display Locations

## Summary
The fitness score (match percentage) is displayed in the following locations in the Flutter frontend:

1. **Job Details Page** - Shows match percentage in quick info section (COMMENTED OUT in main page)
2. **Relevant Jobs List** - Shows fitness score on each job card (ACTIVE)
3. **Variant Dashboard Job Details** - Shows match percentage (ACTIVE)
4. **Home Page Job Post Card** - Does NOT display fitness score (not implemented)

---

## 1. Job Details Page - Match Percentage Display

### File Location
**Path**: `portal/agency_research/code/variant_dashboard/lib/app/udaan_saarathi/features/presentation/job_detail/widgets/quick_info_section.dart`

### Display Code
**Lines 43-48**: Match percentage card in quick info section

```dart
Expanded(
  child: _InfoCard(
    icon: Icons.trending_up_outlined,
    title: l10n.labelMatch,
    value: '${job.matchPercentage ?? 0}%',
    color:
        _getMatchColor(int.tryParse(job.matchPercentage ?? '0') ?? 0),
  ),
),
```

### Color Coding Function
**Lines 11-16**: Color coding based on match percentage

```dart
Color _getMatchColor(int percentage) {
  if (percentage >= 90) return const Color(0xFF059669);  // Green
  if (percentage >= 75) return const Color(0xFF0891B2);  // Blue
  if (percentage >= 60) return const Color(0xFFFD9E0B); // Orange
  return const Color(0xFFEF4444);                        // Red
}
```

### Color Legend
- **90-100%**: Green (#059669) - Excellent match
- **75-89%**: Blue (#0891B2) - Good match
- **60-74%**: Orange (#F59E0B) - Fair match
- **0-59%**: Red (#EF4444) - Poor match

### UI Component
**Lines 54-80**: _InfoCard widget that displays the match percentage

```dart
class _InfoCard extends StatelessWidget {
  final IconData icon;
  final String title;
  final String value;
  final Color color;
  
  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: AppColors.blackColor,
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      // ... displays icon, title, and value
    );
  }
}
```

### Data Source
- **Backend Endpoint**: `GET /candidates/:id/jobs/:jobId/mobile`
- **Response Field**: `matchPercentage` (string)
- **Frontend Model**: `MobileJobEntity`
- **Model Field**: `matchPercentage` (string)

### What User Sees
```
┌─────────────────────────────────────────┐
│  📍 Location  │  📅 Posted  │  📈 Match │
│  Dubai, UAE   │  2 days ago │  89%      │
│               │             │  (Green)  │
└─────────────────────────────────────────┘
```

---

## 2. Relevant Jobs List - Fitness Score Display

### File Location
**Path**: `portal/agency_research/code/variant_dashboard/lib/app/udaan_saarathi/features/presentation/jobs/widgets/job_card.dart`

### Display Code
**Lines 268-285**: Fitness score badge on job card

```dart
Container(
  padding: const EdgeInsets.symmetric(
    horizontal: 8,
    vertical: 4,
  ),
  decoration: BoxDecoration(
    color: _getMatchColor(
      job.fitnessScore,
    ).withOpacity(0.1),
    borderRadius: BorderRadius.circular(6),
  ),
  child: Text(
    l10n.matchPercentage(job.fitnessScore),
    style: TextStyle(
      fontSize: 10,
      fontWeight: FontWeight.w600,
      color: _getMatchColor(job.fitnessScore),
    ),
  ),
),
```

### Color Coding Function
Similar to job details page, uses `_getMatchColor()` function

### Data Source
- **Backend Endpoint**: `GET /candidates/:id/relevant-jobs`
- **Response Field**: `fitness_score` (integer)
- **Frontend Model**: `JobEntity`
- **Model Field**: `fitnessScore` (integer)

### What User Sees
```
┌─────────────────────────────────────┐
│  Senior Electrician - Dubai, UAE    │
│  Elite Construction                 │
│  AED 2,500/month                    │
│                                     │
│  [89% Match]  [Apply]              │
│   (Green)                           │
└─────────────────────────────────────┘
```

---

## 3. Grouped Relevant Jobs - Fitness Score Display

### File Location
**Path**: `portal/agency_research/code/variant_dashboard/lib/app/udaan_saarathi/features/presentation/jobs/widgets/job_card.dart`

### Display Code
Same as relevant jobs list (lines 268-285)

### Data Source
- **Backend Endpoint**: `GET /candidates/:id/relevant-jobs/grouped`
- **Response Field**: `fitness_score` (integer)
- **Frontend Model**: `GroupedJobEntity`
- **Model Field**: `fitnessScore` (integer)

### What User Sees
Jobs grouped by title, each showing fitness score:
```
┌─────────────────────────────────────┐
│  Electrician                        │
├─────────────────────────────────────┤
│  Senior Electrician - Dubai         │
│  [89% Match]  [Apply]              │
│                                     │
│  Electrician - Abu Dhabi            │
│  [75% Match]  [Apply]              │
│                                     │
│  Junior Electrician - Sharjah       │
│  [62% Match]  [Apply]              │
└─────────────────────────────────────┘
```

---

## 4. Localization

### English Display
**File**: `portal/agency_research/code/variant_dashboard/lib/l10n/app_localizations_en.dart`
**Line 240-242**:

```dart
@override
String matchPercentage(int score) {
  return '$score% Match';
}
```

**Display**: "89% Match"

### Nepali Display
**File**: `portal/agency_research/code/variant_dashboard/lib/l10n/app_localizations_ne.dart`
**Line 240-242**:

```dart
@override
String matchPercentage(int score) {
  return '$score% मेल';
}
```

**Display**: "89% मेल"

---

## 5. Data Flow Diagram

### Job Details Page Flow
```
Backend API
  ↓
GET /candidates/:id/jobs/:jobId/mobile
  ↓
Response: { matchPercentage: "89", ... }
  ↓
MobileJobModel.fromJson()
  ↓
MobileJobEntity (matchPercentage: "89")
  ↓
QuickInfoSection Widget
  ↓
_InfoCard Widget
  ↓
Display: "89% Match" (Green)
```

### Relevant Jobs List Flow
```
Backend API
  ↓
GET /candidates/:id/relevant-jobs
  ↓
Response: [{ fitness_score: 89, ... }, ...]
  ↓
JobModel.fromJson()
  ↓
JobEntity (fitnessScore: 89)
  ↓
JobCard Widget
  ↓
Display: "89% Match" (Green)
```

---

## 6. Complete File References

### Display Components
| Component | File | Lines | Purpose |
|-----------|------|-------|---------|
| Quick Info Section | `quick_info_section.dart` | 43-48 | Job details match display |
| Info Card | `quick_info_section.dart` | 54-80 | Card widget for match info |
| Job Card | `job_card.dart` | 268-285 | Relevant jobs match display |
| Color Function | `quick_info_section.dart` | 11-16 | Color coding logic |
| Color Function | `job_card.dart` | Similar | Color coding logic |

### Data Models
| Model | File | Field | Type |
|-------|------|-------|------|
| MobileJobEntity | `mobile_job_model.dart` | matchPercentage | String |
| JobEntity | `model.dart` | fitnessScore | Integer |
| GroupedJobEntity | `grouped_jobs_model.dart` | fitnessScore | Integer |

### Localization
| Language | File | Lines |
|----------|------|-------|
| English | `app_localizations_en.dart` | 240-242 |
| Nepali | `app_localizations_ne.dart` | 240-242 |

---

## 7. Testing the Display

### To See Match Percentage on Job Details Page
1. Open Flutter app
2. Navigate to job details page
3. Look for the "Match" card in the quick info section
4. Should show percentage with color coding

### To See Fitness Score on Relevant Jobs List
1. Open Flutter app
2. Navigate to home page / relevant jobs
3. Look at each job card
4. Should show "XX% Match" badge with color coding

### Test Data
Use Ramesh profile from integration tests:
- Skills: Electrical Wiring (5y), Industrial Maintenance (3y), Circuit Installation (4y)
- Education: Diploma in Electrical Engineering
- Experience: 8 years total
- Expected Score: 89% (Green)

---

## 8. Troubleshooting

### Match Percentage Shows 0%
- Check if backend is returning `matchPercentage` field
- Verify candidate has job profile with skills/education
- Check backend logs for fitness score calculation

### Match Percentage Not Displaying
- Verify `MobileJobEntity` has `matchPercentage` field
- Check if `quick_info_section.dart` is being used
- Verify localization strings are loaded

### Fitness Score Not Displaying on Job Card
- Verify `JobEntity` has `fitnessScore` field
- Check if `job_card.dart` is being used
- Verify backend returns `fitness_score` field

### Color Not Showing Correctly
- Check `_getMatchColor()` function logic
- Verify color values are correct
- Check if opacity is being applied correctly

---

## Summary

**Job Details Page**:
- File: `quick_info_section.dart`
- Lines: 43-48 (display), 11-16 (colors)
- Shows: Match percentage with icon and color coding
- Data: `matchPercentage` from mobile endpoint

**Relevant Jobs List**:
- File: `job_card.dart`
- Lines: 268-285 (display)
- Shows: Fitness score badge on each card
- Data: `fitnessScore` from relevant jobs endpoint

**Both use color coding**:
- 90-100%: Green (Excellent)
- 75-89%: Blue (Good)
- 60-74%: Orange (Fair)
- 0-59%: Red (Poor)

**Localization**:
- English: "89% Match"
- Nepali: "89% मेल"
