# Application Notes API

## Overview
Application notes allow agency users to add, view, edit, and delete notes for job applications at any stage of the candidate journey. Notes can be marked as private (default) or general.

## Database Schema

### Table: `application_notes`
```sql
- id: UUID (PK)
- job_application_id: UUID (FK -> job_applications)
- agency_id: UUID (FK -> posting_agencies)
- added_by_user_id: UUID (FK -> agency_users)
- added_by_name: VARCHAR(150)
- note_text: TEXT
- is_private: BOOLEAN (default: true)
- created_at: TIMESTAMPTZ
- updated_at: TIMESTAMPTZ
```

## API Endpoints

### 1. Create Note
**POST** `/application-notes`

**Request Body:**
```json
{
  "job_application_id": "uuid",
  "note_text": "Candidate showed great enthusiasm during initial screening",
  "is_private": true  // Optional, defaults to true
}
```

**Response:**
```json
{
  "success": true,
  "message": "Note created successfully",
  "data": {
    "id": "uuid",
    "job_application_id": "uuid",
    "agency_id": "uuid",
    "added_by_user_id": "uuid",
    "added_by_name": "John Doe",
    "note_text": "Candidate showed great enthusiasm during initial screening",
    "is_private": true,
    "created_at": "2025-12-03T10:30:00Z",
    "updated_at": "2025-12-03T10:30:00Z"
  }
}
```

### 2. Get Notes by Application
**GET** `/application-notes/application/:applicationId`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "job_application_id": "uuid",
      "agency_id": "uuid",
      "added_by_user_id": "uuid",
      "added_by_name": "John Doe",
      "note_text": "Follow up needed on passport verification",
      "is_private": true,
      "created_at": "2025-12-03T10:30:00Z",
      "updated_at": "2025-12-03T10:30:00Z"
    }
  ]
}
```

### 3. Update Note
**PUT** `/application-notes/:noteId`

**Request Body:**
```json
{
  "note_text": "Updated note text",  // Optional
  "is_private": false  // Optional
}
```

**Response:**
```json
{
  "success": true,
  "message": "Note updated successfully",
  "data": {
    "id": "uuid",
    "job_application_id": "uuid",
    "agency_id": "uuid",
    "added_by_user_id": "uuid",
    "added_by_name": "John Doe",
    "note_text": "Updated note text",
    "is_private": false,
    "created_at": "2025-12-03T10:30:00Z",
    "updated_at": "2025-12-03T10:35:00Z"
  }
}
```

### 4. Delete Note
**DELETE** `/application-notes/:noteId`

**Response:**
```json
{
  "success": true,
  "message": "Note deleted successfully"
}
```

## Security
- All endpoints require JWT authentication
- Only agency role users can access
- Agency can only access notes for their own applications
- Automatic verification of agency access to application

## Features
✅ Add notes at any application stage (applied, shortlisted, interview_scheduled, etc.)
✅ Private/General flag for note visibility control
✅ Tracks who added the note and when
✅ Full CRUD operations
✅ Automatic cascade delete when application is deleted
✅ Ordered by creation date (newest first)

## Migration
Run the SQL migration:
```bash
psql -U postgres -d your_database -f database/migrations/create_application_notes_table.sql
```

Or since you're in dev with sync enabled, the table will be auto-created on server restart.

## Next Steps
1. Run the migration SQL
2. Restart the backend server
3. Test the API endpoints
4. Integrate with CandidateSummaryS2 component in frontend
