# Enhanced TagsSection: Canonical Job Titles Implementation

## Overview

We've enhanced the `TagsSection` component to include a **Canonical Job Titles selector** that reuses the same pattern from the `PositionsSection` component.

---

## What Changed

### Before
- TagsSection only had: Skills, Education, Experience
- No way to link jobs to canonical job titles in the UI
- Had to use API directly to set `canonical_title_ids`

### After
- TagsSection now includes: **Canonical Job Titles** + Skills + Education + Experience
- Full autocomplete search for job titles
- Visual selection with tags
- Automatically saves `canonical_title_ids` to backend

---

## Implementation Details

### 1. Reused Pattern from PositionsSection

**What we reused:**
- Job title search with debounce (300ms)
- Autocomplete dropdown with suggestions
- Click-outside detection to close dropdown
- Loader indicator while searching
- jobTitleService for API calls

**Code location:**
```javascript
// From PositionsSection.jsx
const handleTitleChange = (value) => {
  // ... debounce logic
  const results = await jobTitleService.searchJobTitles(value, 8);
  setTitleSuggestions(results);
}
```

### 2. New State Variables

```javascript
// Job title autocomplete state
const [titleSuggestions, setTitleSuggestions] = useState([]);
const [showTitleSuggestions, setShowTitleSuggestions] = useState(false);
const [isSearchingTitles, setIsSearchingTitles] = useState(false);
const [selectedTitles, setSelectedTitles] = useState([]);
const titleInputRef = useRef(null);
const suggestionsRef = useRef(null);
const searchTimeoutRef = useRef(null);
```

### 3. New Functions

#### handleTitleSearch(value)
- Debounced search for job titles
- Calls `jobTitleService.searchJobTitles()`
- Updates suggestions dropdown

#### selectJobTitle(title)
- Adds selected title to `selectedTitles` array
- Updates `formData.canonical_title_ids`
- Clears input and suggestions
- Marks form as dirty

#### removeJobTitle(titleId)
- Removes title from `selectedTitles` array
- Updates `formData.canonical_title_ids`
- Marks form as dirty

### 4. Updated handleSave()

Now includes `canonical_title_ids` in the update:

```javascript
const updates = {
  skills: formData.skills,
  education_requirements: formData.education_requirements,
  experience_requirements: { ... },
  canonical_title_ids: formData.canonical_title_ids  // ← NEW
};
```

### 5. New UI Section

Added before Skills section:

```jsx
{/* Canonical Job Titles */}
<div>
  <label>Canonical Job Titles</label>
  <input
    ref={titleInputRef}
    onChange={(e) => handleTitleSearch(e.target.value)}
    placeholder="Search and add job titles..."
  />
  {/* Autocomplete dropdown */}
  {showTitleSuggestions && titleSuggestions.length > 0 && (
    <div ref={suggestionsRef} className="...">
      {titleSuggestions.map(suggestion => (
        <button onClick={() => selectJobTitle(suggestion)}>
          {suggestion.title}
        </button>
      ))}
    </div>
  )}
  {/* Selected titles as tags */}
  <div className="flex flex-wrap gap-2">
    {selectedTitles.map(title => (
      <span className="...">
        {title.title}
        <button onClick={() => removeJobTitle(title.id)}>✕</button>
      </span>
    ))}
  </div>
</div>
```

---

## How It Works

### Step 1: User Types in Search Box
```
User types: "Electr"
↓
handleTitleSearch() is called
↓
Debounce 300ms
↓
jobTitleService.searchJobTitles("Electr", 8)
↓
API call: GET /job-titles?q=Electr&limit=8&is_active=true
```

### Step 2: Suggestions Appear
```
Backend returns:
[
  { id: "uuid-1", title: "Electrician" },
  { id: "uuid-2", title: "Electrical Engineer" },
  ...
]
↓
Dropdown shows suggestions
↓
User clicks "Electrician"
```

### Step 3: Title is Selected
```
selectJobTitle({ id: "uuid-1", title: "Electrician" })
↓
selectedTitles = [{ id: "uuid-1", title: "Electrician" }]
formData.canonical_title_ids = ["uuid-1"]
↓
Purple tag appears: [Electrician ✕]
↓
Form marked as dirty
```

### Step 4: User Clicks Save
```
handleSave()
↓
updates = {
  skills: [...],
  education_requirements: [...],
  experience_requirements: {...},
  canonical_title_ids: ["uuid-1"]  ← Sent to backend
}
↓
PATCH /agencies/:license/job-management/:jobId/tags
↓
Backend updates job_posting_titles junction table
↓
✅ Success!
```

---

## Visual Flow

```
┌─────────────────────────────────────────────────────────────┐
│ Tags & Requirements                                    [Save]│
├─────────────────────────────────────────────────────────────┤
│                                                              │
│ Canonical Job Titles                                        │
│ ┌──────────────────────────────────────────────────────┐   │
│ │ Search and add job titles...                    [⟳] │   │
│ └──────────────────────────────────────────────────────┘   │
│                                                              │
│ ┌──────────────────────────────────────────────────────┐   │
│ │ ▼ Electrician                                        │   │
│ │   Electrical Engineer                                │   │
│ │   Electrical Technician                              │   │
│ └──────────────────────────────────────────────────────┘   │
│                                                              │
│ [Electrician ✕]                                            │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│ Skills                                                      │
│ ┌──────────────────────────────────────────────────────┐   │
│ │ Add a skill...                                  [+]  │   │
│ └──────────────────────────────────────────────────────┘   │
│ [Welding ✕]  [Safety ✕]                                   │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│ Education Requirements                                      │
│ ┌──────────────────────────────────────────────────────┐   │
│ │ Add education requirement...                   [+]  │   │
│ └──────────────────────────────────────────────────────┘   │
│ [High School Diploma ✕]                                    │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│ Experience Requirements                                     │
│ Min Years: [2]  Max Years: [5]  Level: [experienced]      │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Code Changes Summary

### File: TagsSection.jsx

**Imports Added:**
```javascript
import { useRef } from 'react';
import jobTitleService from '../../services/jobTitleService.js';
```

**State Added:**
```javascript
const [selectedTitles, setSelectedTitles] = useState([]);
const [titleSuggestions, setTitleSuggestions] = useState([]);
const [showTitleSuggestions, setShowTitleSuggestions] = useState(false);
const [isSearchingTitles, setIsSearchingTitles] = useState(false);
const titleInputRef = useRef(null);
const suggestionsRef = useRef(null);
const searchTimeoutRef = useRef(null);
```

**Functions Added:**
- `handleTitleSearch(value)` - Search with debounce
- `selectJobTitle(title)` - Add title to selection
- `removeJobTitle(titleId)` - Remove title from selection

**Effects Added:**
- Click-outside detection for dropdown

**UI Added:**
- Canonical Job Titles section with search and autocomplete
- Selected titles displayed as purple tags

**handleSave() Updated:**
- Now includes `canonical_title_ids` in updates

---

## Benefits

✅ **Reuses existing pattern** - Same as PositionsSection
✅ **Consistent UX** - Users already familiar with this pattern
✅ **Full autocomplete** - Search and select from all job titles
✅ **Visual feedback** - Selected titles shown as tags
✅ **Easy to remove** - Click ✕ to remove a title
✅ **Debounced search** - Efficient API calls (300ms debounce)
✅ **Automatic save** - Included in form submission
✅ **No breaking changes** - Backward compatible

---

## Testing

### Test 1: Search and Select
1. Navigate to Job Edit → Tags section
2. Type "Electrician" in Canonical Job Titles field
3. Wait for suggestions to appear
4. Click "Electrician" from dropdown
5. Verify purple tag appears
6. Click Save
7. Verify job is tagged with canonical title

### Test 2: Multiple Selections
1. Add "Electrician"
2. Add "Technician"
3. Add "Engineer"
4. Verify all three appear as tags
5. Click Save
6. Verify all three are saved

### Test 3: Remove Title
1. Add "Electrician"
2. Click ✕ on the tag
3. Verify tag disappears
4. Click Save
5. Verify title is removed

### Test 4: Verify Recommendation
1. Tag job with "Electrician" canonical title
2. Create candidate with "Electrician" preference
3. Call GET /candidates/:id/relevant-jobs
4. Verify job appears in recommendations

---

## API Integration

### What Gets Sent to Backend

```javascript
PATCH /agencies/:license/job-management/:jobId/tags
{
  "skills": ["Welding", "Safety"],
  "education_requirements": ["High School Diploma"],
  "experience_requirements": {
    "min_years": 2,
    "max_years": 5,
    "level": "experienced"
  },
  "canonical_title_ids": ["uuid-1", "uuid-2"]  // ← NEW
}
```

### What Backend Does

1. Validates canonical_title_ids exist in job_titles table
2. Clears existing job_posting_titles entries
3. Creates new job_posting_titles entries for each ID
4. Returns updated job with canonical_titles populated

---

## Performance Considerations

### Debounce
- 300ms debounce on search (same as PositionsSection)
- Prevents excessive API calls while typing

### Caching
- jobTitleService uses performanceService for caching
- Popular titles cached for 1 hour

### Dropdown
- Max 8 suggestions shown
- Scrollable if more results
- Click-outside closes dropdown

---

## Future Enhancements

### 1. Bulk Selection
```javascript
// Add "Select All" button
// Add "Clear All" button
```

### 2. Favorites
```javascript
// Show recently used titles
// Show favorite titles
```

### 3. Keyboard Navigation
```javascript
// Arrow keys to navigate suggestions
// Enter to select
// Escape to close
```

### 4. Skill Suggestions
```javascript
// Similar pattern for skills
// Autocomplete from common skills
```

### 5. Education Suggestions
```javascript
// Similar pattern for education
// Autocomplete from common education levels
```

---

## Troubleshooting

### Suggestions Not Appearing
- Check if query length >= 2 characters
- Check browser console for API errors
- Verify jobTitleService is imported correctly

### Selected Titles Not Saving
- Check if form is marked as dirty
- Check if Save button is enabled
- Check browser console for API errors
- Verify canonical_title_ids are in the request

### Dropdown Not Closing
- Check if click-outside listener is attached
- Try clicking outside the dropdown
- Check browser console for errors

---

## Files Modified

- `admin_panel/UdaanSarathi2/src/components/job-management/TagsSection.jsx`

## Files Not Modified

- `admin_panel/UdaanSarathi2/src/services/jobTitleService.js` (reused as-is)
- `admin_panel/UdaanSarathi2/src/api/datasources/JobDataSource.js` (reused as-is)
- Backend files (no changes needed)

---

## Summary

We've successfully enhanced the TagsSection component to include canonical job title selection by:

1. **Reusing the pattern** from PositionsSection
2. **Adding job title search** with autocomplete
3. **Storing selected titles** in formData.canonical_title_ids
4. **Sending to backend** in the PATCH request
5. **Maintaining consistency** with existing UI patterns

The implementation is clean, efficient, and follows the existing codebase patterns.

---

## Next Steps

1. ✅ Test the enhanced TagsSection
2. ✅ Verify job recommendations work with canonical titles
3. ✅ Consider adding similar autocomplete for skills and education
4. ✅ Add keyboard navigation for better UX
5. ✅ Add bulk selection features
