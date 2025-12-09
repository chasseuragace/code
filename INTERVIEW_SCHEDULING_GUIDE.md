# Interview Scheduling Implementation Guide

## Overview

Interview scheduling requires specific fields to be sent to the backend. This guide ensures all interview scheduling implementations across the frontend use the same proper structure.

## Required Fields

When scheduling an interview, the following fields MUST be provided:

### Mandatory Fields
```javascript
{
  date: 'YYYY-MM-DD',        // Interview date in AD format
  time: 'HH:MM',             // Interview time (24-hour format)
  location: 'string',        // Interview location (e.g., "Office", "Online")
}
```

### Optional Fields
```javascript
{
  duration: 60,              // Duration in minutes (default: 60)
  interviewer: 'string',     // Contact person name (defaults to current user)
  requirements: [],          // Array of required document types
  notes: 'string'            // Additional notes
}
```

## Backend API Endpoint

```
POST /applications/:applicationId/schedule-interview
```

### Request Body
```json
{
  "interview_date_ad": "2025-12-15",
  "interview_time": "10:00",
  "duration_minutes": 60,
  "location": "Main Office - Conference Room A",
  "contact_person": "HR Manager",
  "required_documents": ["passport", "certificates", "photos"],
  "notes": "Please bring original documents",
  "updatedBy": "agency"
}
```

### Response
```json
{
  "id": "interview-uuid",
  "status": "scheduled",
  "interview_date_ad": "2025-12-15",
  "interview_time": "10:00:00",
  "location": "Main Office - Conference Room A",
  "contact_person": "HR Manager",
  "required_documents": ["passport", "certificates", "photos"]
}
```

## Using stageTransitionService

### Method 1: With Interview Details

```javascript
import stageTransitionService from '../services/stageTransitionService'

// Schedule interview with details
await stageTransitionService.scheduleInterview(applicationId, {
  date: '2025-12-15',
  time: '10:00',
  location: 'Main Office',
  interviewer: 'HR Manager',
  duration: 60,
  requirements: ['passport', 'certificates'],
  notes: 'Bring original documents'
})
```

### Method 2: Using updateStage

```javascript
// Update stage to interview_scheduled
await stageTransitionService.updateStage(
  applicationId,
  'shortlisted',
  'interview_scheduled',
  {
    interviewDetails: {
      date: '2025-12-15',
      time: '10:00',
      location: 'Main Office',
      interviewer: 'HR Manager'
    }
  }
)
```

### Method 3: Prompt User for Details

```javascript
// Prompt user for interview details
const interviewDetails = await stageTransitionService.promptForInterviewDetails()

if (interviewDetails) {
  await stageTransitionService.scheduleInterview(applicationId, interviewDetails)
}
```

### Method 4: Auto-prompt in updateStage

```javascript
// Automatically prompt user when scheduling
await stageTransitionService.updateStage(
  applicationId,
  'shortlisted',
  'interview_scheduled',
  {
    promptForDetails: true  // Will prompt user if details not provided
  }
)
```

## Implementation Examples

### Example 1: WorkflowV2 Page

```javascript
// In WorkflowV2.jsx
const handleScheduleInterview = async (applicationId) => {
  try {
    // Prompt for interview details
    const interviewDetails = await stageTransitionService.promptForInterviewDetails()
    
    if (!interviewDetails) {
      return // User cancelled
    }
    
    // Schedule interview
    await stageTransitionService.updateStage(
      applicationId,
      'shortlisted',
      'interview_scheduled',
      { interviewDetails }
    )
    
    alert('✓ Interview scheduled successfully')
    loadData() // Reload data
  } catch (error) {
    alert(`✗ Error: ${error.message}`)
  }
}
```

### Example 2: JobDetails Page (with Modal)

```javascript
// In JobDetails.jsx
const [showInterviewModal, setShowInterviewModal] = useState(false)
const [selectedCandidate, setSelectedCandidate] = useState(null)

const handleScheduleInterview = (candidate) => {
  setSelectedCandidate(candidate)
  setShowInterviewModal(true)
}

const handleInterviewSubmit = async (interviewDetails) => {
  try {
    await stageTransitionService.scheduleInterview(
      selectedCandidate.application.id,
      interviewDetails
    )
    
    setShowInterviewModal(false)
    loadData()
  } catch (error) {
    console.error('Failed to schedule interview:', error)
  }
}
```

### Example 3: Bulk Interview Scheduling

```javascript
// Schedule interviews for multiple candidates
const handleBulkSchedule = async (candidateIds, interviewDetails) => {
  const results = []
  
  for (const candidateId of candidateIds) {
    try {
      const result = await stageTransitionService.scheduleInterview(
        candidateId,
        interviewDetails
      )
      results.push({ candidateId, success: true, result })
    } catch (error) {
      results.push({ candidateId, success: false, error: error.message })
    }
  }
  
  return results
}
```

## Interview Modal Component (Recommended)

For better UX, create a reusable interview scheduling modal:

```javascript
// InterviewScheduleModal.jsx
import { useState } from 'react'

const InterviewScheduleModal = ({ isOpen, onClose, onSubmit, candidateName }) => {
  const [formData, setFormData] = useState({
    date: '',
    time: '10:00',
    location: 'Office',
    interviewer: '',
    duration: 60,
    requirements: [],
    notes: ''
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(formData)
  }

  if (!isOpen) return null

  return (
    <div className="modal">
      <div className="modal-content">
        <h2>Schedule Interview - {candidateName}</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Date *</label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({...formData, date: e.target.value})}
              required
            />
          </div>
          
          <div className="form-group">
            <label>Time *</label>
            <input
              type="time"
              value={formData.time}
              onChange={(e) => setFormData({...formData, time: e.target.value})}
              required
            />
          </div>
          
          <div className="form-group">
            <label>Location *</label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({...formData, location: e.target.value})}
              required
            />
          </div>
          
          <div className="form-group">
            <label>Interviewer</label>
            <input
              type="text"
              value={formData.interviewer}
              onChange={(e) => setFormData({...formData, interviewer: e.target.value})}
            />
          </div>
          
          <div className="form-group">
            <label>Duration (minutes)</label>
            <input
              type="number"
              value={formData.duration}
              onChange={(e) => setFormData({...formData, duration: parseInt(e.target.value)})}
            />
          </div>
          
          <div className="form-group">
            <label>Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
            />
          </div>
          
          <div className="form-actions">
            <button type="button" onClick={onClose}>Cancel</button>
            <button type="submit">Schedule Interview</button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default InterviewScheduleModal
```

## Validation Rules

### Frontend Validation
```javascript
const validateInterviewDetails = (details) => {
  const errors = []
  
  if (!details.date) {
    errors.push('Interview date is required')
  }
  
  if (!details.time) {
    errors.push('Interview time is required')
  }
  
  if (!details.location) {
    errors.push('Interview location is required')
  }
  
  // Validate date is in future
  const interviewDate = new Date(`${details.date}T${details.time}`)
  if (interviewDate < new Date()) {
    errors.push('Interview date must be in the future')
  }
  
  return errors
}
```

### Backend Validation
The backend validates:
- ✅ Date format (YYYY-MM-DD)
- ✅ Time format (HH:MM)
- ✅ Required fields present
- ✅ Application exists and is in correct stage
- ✅ Agency has permission to schedule

## Error Handling

```javascript
try {
  await stageTransitionService.scheduleInterview(applicationId, interviewDetails)
} catch (error) {
  if (error.message.includes('required')) {
    alert('Please fill in all required fields')
  } else if (error.message.includes('Invalid stage')) {
    alert('Cannot schedule interview at this stage')
  } else if (error.message.includes('permission')) {
    alert('You do not have permission to schedule this interview')
  } else {
    alert(`Error: ${error.message}`)
  }
}
```

## Testing

### Unit Test
```javascript
describe('stageTransitionService.scheduleInterview', () => {
  it('should schedule interview with valid details', async () => {
    const result = await stageTransitionService.scheduleInterview('app-123', {
      date: '2025-12-15',
      time: '10:00',
      location: 'Office'
    })
    
    expect(result.status).toBe('scheduled')
    expect(result.interview_date_ad).toBe('2025-12-15')
  })
  
  it('should throw error if date is missing', async () => {
    await expect(
      stageTransitionService.scheduleInterview('app-123', {
        time: '10:00',
        location: 'Office'
      })
    ).rejects.toThrow('Interview date is required')
  })
})
```

### Integration Test
```javascript
describe('Interview Scheduling Flow', () => {
  it('should schedule interview from shortlisted stage', async () => {
    // 1. Shortlist candidate
    await stageTransitionService.shortlistApplication('app-123')
    
    // 2. Schedule interview
    const result = await stageTransitionService.scheduleInterview('app-123', {
      date: '2025-12-15',
      time: '10:00',
      location: 'Office'
    })
    
    // 3. Verify interview was created
    expect(result.status).toBe('scheduled')
    
    // 4. Verify application stage updated
    const app = await getApplication('app-123')
    expect(app.stage).toBe('interview_scheduled')
  })
})
```

## Migration Checklist

- [x] Create `stageTransitionService.scheduleInterview()`
- [x] Add interview details validation
- [x] Add `promptForInterviewDetails()` helper
- [x] Update WorkflowV2 to use proper interview scheduling
- [ ] Update Workflow (original) to use proper interview scheduling
- [ ] Update JobDetails to use proper interview scheduling
- [ ] Update Applications page to use proper interview scheduling
- [ ] Create InterviewScheduleModal component
- [ ] Add frontend validation
- [ ] Add error handling
- [ ] Write unit tests
- [ ] Write integration tests
- [ ] Update documentation

## Best Practices

1. **Always validate interview details** before sending to backend
2. **Use a modal/dialog** for better UX instead of window.prompt()
3. **Show confirmation** before scheduling
4. **Handle errors gracefully** with user-friendly messages
5. **Reload data** after successful scheduling
6. **Log audit trail** for compliance
7. **Send notifications** to candidates after scheduling
8. **Allow rescheduling** with proper validation

## Common Issues

### Issue 1: Missing Required Fields
**Error:** "Interview date is required"
**Solution:** Ensure all mandatory fields (date, time, location) are provided

### Issue 2: Invalid Stage Transition
**Error:** "Cannot schedule interview at this stage"
**Solution:** Candidate must be in 'shortlisted' stage before scheduling

### Issue 3: Date in Past
**Error:** "Interview date must be in the future"
**Solution:** Validate date on frontend before submitting

### Issue 4: Permission Denied
**Error:** "You do not have permission"
**Solution:** Ensure user has agency permissions for this candidate

## Summary

✅ **Use `stageTransitionService` for ALL interview scheduling**
✅ **Always provide required fields: date, time, location**
✅ **Use proper modal/dialog for better UX**
✅ **Validate before submitting**
✅ **Handle errors gracefully**
✅ **Test thoroughly**
