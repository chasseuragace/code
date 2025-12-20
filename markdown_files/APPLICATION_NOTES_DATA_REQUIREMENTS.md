# Application Notes - Data Requirements

## To Create a Note

### Frontend Sends:
```json
{
  "job_application_id": "uuid",  // ✅ Required - from candidateData.application.id
  "note_text": "string",         // ✅ Required - user input
  "is_private": true             // ✅ Optional - defaults to true
}
```

### Backend Automatically Adds (from JWT):
```json
{
  "agency_id": "uuid",           // From req.user.agency_id
  "added_by_user_id": "uuid",    // From req.user.id
  "added_by_name": "string"      // From req.user.full_name
}
```

### Complete Note Object (Response):
```json
{
  "id": "uuid",
  "job_application_id": "uuid",
  "agency_id": "uuid",
  "added_by_user_id": "uuid",
  "added_by_name": "John Doe",
  "note_text": "Candidate showed great enthusiasm",
  "is_private": true,
  "created_at": "2025-12-03T10:30:00Z",
  "updated_at": "2025-12-03T10:30:00Z"
}
```

## Data Flow

1. **User opens CandidateSummaryS2**
   - Component receives `candidate` prop
   - Extracts `candidateData.application.id`
   - Passes to `<ApplicationNotes applicationId={...} />`

2. **ApplicationNotes component loads**
   - Calls `ApplicationNotesDataSource.getNotesByApplication(applicationId)`
   - Displays existing notes

3. **User adds a note**
   - Enters text in textarea
   - Toggles Private/General flag
   - Clicks "Save Note"
   - Calls `ApplicationNotesDataSource.createNote(applicationId, noteText, isPrivate)`

4. **Backend processes**
   - Validates JWT token
   - Extracts agency_id, user_id, user_name from token
   - Verifies agency has access to this application
   - Creates note with all data
   - Returns created note

## Debug Mode

In development, the summary card now shows:
- Application ID
- Candidate ID  
- Current Stage

This helps verify the correct IDs are being passed.

## Error Handling

If `candidateData.application.id` is missing:
- Shows error message: "No application ID found - cannot load notes"
- Notes section won't render

## Testing Checklist

- [ ] Application ID displays in debug section
- [ ] Notes section loads without errors
- [ ] Can create a new note
- [ ] Note shows correct "added_by_name"
- [ ] Private/General flag works
- [ ] Can edit existing notes
- [ ] Can delete notes
- [ ] Notes persist after page refresh
