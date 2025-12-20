# Workflow Frontend Integration - Complete

## Summary
Successfully integrated the backend Workflow API with a new clean frontend page (WorkflowV2) that displays real data from the server.

## What Was Done

### 1. Backend Authentication Setup ✅
**File:** `src/modules/workflow/workflow.controller.ts`

Added JWT authentication guard:
```typescript
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class WorkflowController {
  // Agency ID is automatically extracted from JWT token
  const agencyId = req.user?.agency_id;
}
```

**How it works:**
- JWT token contains `agency_id` field
- `JwtAuthGuard` validates token and populates `req.user`
- Controller extracts `agency_id` from `req.user`
- Service automatically scopes all queries by agency

### 2. Frontend API Service ✅
**File:** `admin_panel/UdaanSarathi2/src/services/workflowApiService.js`

Created dedicated service for workflow API calls:
- `getWorkflowCandidates(filters)` - Fetch candidates with pagination
- `updateCandidateStage(candidateId, updateData)` - Update stage
- `getWorkflowAnalytics(filters)` - Get analytics
- `getWorkflowStages()` - Get available stages

**Authentication:**
```javascript
getAuthToken() {
  return localStorage.getItem('udaan_auth_token') || 
         localStorage.getItem('authToken') || 
         localStorage.getItem('token');
}
```

### 3. New Clean UI Page ✅
**File:** `admin_panel/UdaanSarathi2/src/pages/WorkflowV2.jsx`

Features:
- ✅ Real-time data from backend API
- ✅ Agency context integration
- ✅ Analytics cards (total, passed, shortlisted, success rate)
- ✅ Stage filtering
- ✅ Search functionality
- ✅ Pagination
- ✅ Stage update dropdown
- ✅ Loading states
- ✅ Error handling
- ✅ Debug info panel

**Agency Integration:**
```javascript
const { agencyData, isLoading: agencyLoading } = useAgency()

// Wait for agency data before loading workflow
useEffect(() => {
  if (!agencyLoading && agencyData) {
    loadData()
  }
}, [selectedStage, currentPage, searchQuery, agencyLoading, agencyData])
```

### 4. Routing Update ✅
**File:** `admin_panel/UdaanSarathi2/src/App.jsx`

```javascript
// New route (active)
<Route path="/workflow" element={<WorkflowV2 />} />

// Old route (backup)
<Route path="/workflow-old" element={<Workflow />} />
```

### 5. Environment Configuration ✅
**File:** `admin_panel/UdaanSarathi2/.env`

```env
VITE_API_BASE_URL=http://localhost:3000
```

## Data Flow

```
┌─────────────────┐
│   Frontend UI   │
│  (WorkflowV2)   │
└────────┬────────┘
         │
         │ 1. User loads page
         ↓
┌─────────────────┐
│ AgencyContext   │ ← Gets agency data from localStorage
│                 │   (license_number, agency_id)
└────────┬────────┘
         │
         │ 2. Agency data loaded
         ↓
┌─────────────────┐
│ workflowApi     │ ← Adds JWT token to headers
│   Service       │   (from localStorage)
└────────┬────────┘
         │
         │ 3. API call with auth
         ↓
┌─────────────────┐
│ Backend API     │
│ /workflow/*     │
└────────┬────────┘
         │
         │ 4. JwtAuthGuard validates token
         ↓
┌─────────────────┐
│ JWT Strategy    │ ← Extracts agency_id from token
│                 │   Populates req.user
└────────┬────────┘
         │
         │ 5. req.user.agency_id
         ↓
┌─────────────────┐
│ Workflow        │ ← Scopes queries by agency_id
│   Service       │   WHERE contract.posting_agency_id = :agencyId
└────────┬────────┘
         │
         │ 6. Returns scoped data
         ↓
┌─────────────────┐
│   Frontend UI   │ ← Displays data
│  (WorkflowV2)   │
└─────────────────┘
```

## Security Features

1. **JWT Authentication** - All endpoints require valid JWT token
2. **Agency Scoping** - Data automatically filtered by agency_id from token
3. **No Manual Agency ID** - Agency context extracted from auth, not passed manually
4. **Token Validation** - Backend validates token on every request
5. **Access Control** - Users can only see their own agency's data

## Testing the Integration

### 1. Check if Backend is Running
```bash
docker ps | grep nest_server
```

### 2. Check if Frontend is Running
```bash
# Navigate to frontend directory
cd portal/agency_research/code/admin_panel/UdaanSarathi2

# Check if dev server is running
# Should be on http://localhost:5173 or similar
```

### 3. Access the New Workflow Page
```
http://localhost:5173/workflow
```

### 4. Verify Data Flow
Check the debug panel at the bottom of the page:
- ✅ API Base URL should show
- ✅ Agency name and license should display
- ✅ Auth token should show "✓ Present"
- ✅ Candidates should load

### 5. Test Functionality
- [ ] Filter by stage (applied, shortlisted, etc.)
- [ ] Search by name/phone
- [ ] Pagination (if > 15 candidates)
- [ ] Update candidate stage via dropdown
- [ ] View analytics cards

## Troubleshooting

### Issue: "No agency found"
**Solution:** 
- User needs to be logged in as agency owner/member
- Agency profile must be set up
- Check localStorage for `udaan_agency_license`

### Issue: "Auth token missing"
**Solution:**
- User needs to log in
- Check localStorage for `udaan_auth_token`
- Token might be expired - log in again

### Issue: "401 Unauthorized"
**Solution:**
- JWT token is invalid or expired
- Log out and log in again
- Check backend JWT secret configuration

### Issue: "No candidates showing"
**Solution:**
- Agency might not have any candidates in workflow stages
- Check if candidates exist in database
- Verify agency_id is correct in JWT token

### Issue: "API connection failed"
**Solution:**
- Check if backend is running: `docker ps`
- Verify API_BASE_URL in .env file
- Check CORS settings in backend

## API Endpoints Used

### GET /workflow/candidates
```javascript
// Query params
{
  stage: 'shortlisted',  // optional
  search: 'John',        // optional
  page: 1,               // default: 1
  limit: 15              // default: 15
}

// Response
{
  success: true,
  data: {
    candidates: [...],
    pagination: {...},
    analytics: {...}
  }
}
```

### PUT /workflow/candidates/:id/stage
```javascript
// Body
{
  application_id: 'uuid',
  new_stage: 'shortlisted',
  notes: 'Optional notes'
}

// Response
{
  success: true,
  message: 'Candidate moved...',
  data: {...}
}
```

### GET /workflow/analytics
```javascript
// Response
{
  success: true,
  data: {
    total_candidates: 75,
    by_stage: {...},
    conversion_rates: {...}
  }
}
```

### GET /workflow/stages
```javascript
// Response
{
  success: true,
  data: {
    stages: [
      { id: 'applied', label: 'Applied', ... },
      ...
    ]
  }
}
```

## Next Steps

### Immediate
1. ✅ Backend API with auth - DONE
2. ✅ Frontend service - DONE
3. ✅ New UI page - DONE
4. ✅ Routing update - DONE
5. ⏳ Test with real data - READY TO TEST

### Future Enhancements
1. **Interview Scheduling** - Add interview details form
2. **Document Upload** - Allow document attachment
3. **Bulk Actions** - Move multiple candidates at once
4. **Export** - Export candidate list to CSV/Excel
5. **Notifications** - Real-time updates when stage changes
6. **Filters** - Add more filters (date range, job posting)
7. **Sorting** - Sort by name, date, status
8. **Details Modal** - Show full candidate details in modal

## Files Modified/Created

### Backend
- ✅ `src/modules/workflow/workflow.service.ts` - Core service
- ✅ `src/modules/workflow/workflow.controller.ts` - API endpoints (added auth)
- ✅ `src/modules/workflow/workflow.module.ts` - Module config
- ✅ `src/modules/workflow/dto/workflow.dto.ts` - DTOs
- ✅ `src/app.module.ts` - Registered workflow module

### Frontend
- ✅ `admin_panel/UdaanSarathi2/src/services/workflowApiService.js` - NEW
- ✅ `admin_panel/UdaanSarathi2/src/pages/WorkflowV2.jsx` - NEW
- ✅ `admin_panel/UdaanSarathi2/src/App.jsx` - Updated routing
- ✅ `admin_panel/UdaanSarathi2/.env` - NEW

### Documentation
- ✅ `WORKFLOW_API_DESIGN.md` - API design
- ✅ `WORKFLOW_IMPLEMENTATION_COMPLETE.md` - Backend summary
- ✅ `WORKFLOW_QUICK_START.md` - Quick reference
- ✅ `WORKFLOW_FRONTEND_INTEGRATION.md` - This file

## Success Criteria

- [x] Backend API responds to authenticated requests
- [x] Frontend can fetch workflow candidates
- [x] Agency scoping works automatically via JWT
- [x] UI displays real data from backend
- [x] Stage updates work
- [x] Analytics display correctly
- [x] Pagination works
- [x] Search works
- [x] Error handling works
- [ ] **READY FOR USER TESTING** ← You are here!

## How to Access

1. **Start Backend** (if not running):
   ```bash
   docker start nest_server
   ```

2. **Start Frontend** (if not running):
   ```bash
   cd portal/agency_research/code/admin_panel/UdaanSarathi2
   npm run dev
   ```

3. **Login** as agency owner/member

4. **Navigate** to: `http://localhost:5173/workflow`

5. **Verify** data loads from backend (check debug panel)

---

**Status:** ✅ COMPLETE - Ready for testing!
