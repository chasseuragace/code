# Workflow API - Quick Start Guide

## Overview
The Workflow API manages candidates through post-interview stages with agency-scoped data.

## Endpoints

### 1. Get Workflow Candidates
```http
GET /workflow/candidates
```

**Query Parameters:**
- `stage` - Filter by stage (applied, shortlisted, interview_scheduled, interview_passed, all)
- `job_posting_id` - Filter by job
- `search` - Search by name, phone, passport, email
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 15, max: 100)
- `sort` - Sort order (newest, oldest, name)

**Example:**
```bash
curl "http://localhost:3000/workflow/candidates?stage=shortlisted&page=1&limit=15" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 2. Update Candidate Stage
```http
PUT /workflow/candidates/:candidateId/stage
```

**Body:**
```json
{
  "application_id": "uuid",
  "new_stage": "shortlisted",
  "notes": "Optional notes",
  "interview_details": {  // Required for interview_scheduled
    "interview_date_ad": "2024-12-20",
    "interview_time": "10:00",
    "location": "Agency Office",
    "duration_minutes": 60,
    "contact_person": "HR Manager",
    "type": "In-person"
  }
}
```

**Example:**
```bash
curl -X PUT "http://localhost:3000/workflow/candidates/CANDIDATE_ID/stage" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "application_id": "APP_ID",
    "new_stage": "shortlisted",
    "notes": "Qualified candidate"
  }'
```

### 3. Get Analytics
```http
GET /workflow/analytics
```

**Query Parameters:**
- `date_from` - Start date (YYYY-MM-DD)
- `date_to` - End date (YYYY-MM-DD)
- `job_posting_id` - Filter by job

**Example:**
```bash
curl "http://localhost:3000/workflow/analytics" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 4. Get Workflow Stages
```http
GET /workflow/stages
```

**Example:**
```bash
curl "http://localhost:3000/workflow/stages" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Workflow Stages

1. **applied** - Initial application received
2. **shortlisted** - Selected for interview
3. **interview_scheduled** - Interview appointment set
4. **interview_passed** - Successfully passed interview

**Rules:**
- Stages must be updated sequentially
- Cannot skip stages
- Cannot move backwards

## Response Format

### Success Response
```json
{
  "success": true,
  "data": { ... }
}
```

### Error Response
```json
{
  "statusCode": 400,
  "message": "Error description",
  "error": "Bad Request"
}
```

## Common Errors

### 400 Bad Request
- Invalid stage transition
- Missing interview details for interview_scheduled
- Invalid query parameters

### 401 Unauthorized
- Missing or invalid auth token

### 404 Not Found
- Candidate not found
- Application not found
- Agency doesn't have access to candidate

## Testing

### Run Unit Tests
```bash
docker exec nest_server npm run test -- workflow.service.spec.ts
```

### Run Integration Tests
```bash
docker exec nest_server npm run test:e2e -- e2e.workflow.spec.ts
```

### Run API Test Script
```bash
./test-workflow-api.sh
```

## Frontend Integration

### 1. Fetch Candidates
```javascript
const response = await fetch('/workflow/candidates?page=1&limit=15', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
const { data } = await response.json();
console.log(data.candidates, data.pagination, data.analytics);
```

### 2. Update Stage
```javascript
const response = await fetch(`/workflow/candidates/${candidateId}/stage`, {
  method: 'PUT',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    application_id: applicationId,
    new_stage: 'shortlisted',
    notes: 'Qualified candidate'
  })
});
const result = await response.json();
```

### 3. Schedule Interview
```javascript
const response = await fetch(`/workflow/candidates/${candidateId}/stage`, {
  method: 'PUT',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    application_id: applicationId,
    new_stage: 'interview_scheduled',
    interview_details: {
      interview_date_ad: '2024-12-20',
      interview_time: '10:00',
      location: 'Agency Office',
      duration_minutes: 60,
      type: 'In-person'
    }
  })
});
```

## Performance Tips

1. **Use pagination** - Don't fetch all candidates at once
2. **Filter by stage** - Reduces result set size
3. **Cache analytics** - Analytics don't change frequently
4. **Debounce search** - Wait for user to stop typing

## Security Notes

1. All endpoints require authentication
2. Data is automatically scoped by agency
3. Agencies can only access their own candidates
4. Stage transitions are validated server-side

## Swagger Documentation

Access interactive API docs at:
```
http://localhost:3000/api-docs
```

## Support

For issues or questions:
1. Check the logs: `docker logs nest_server`
2. Review test files for examples
3. Check WORKFLOW_API_DESIGN.md for detailed specs
