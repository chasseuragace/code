# Notification System Implementation Plan

## Overview
Design and implement a notification system for job application status updates to candidates.

## Entity Relationships Analysis
- **PostingAgency** → creates → **JobPosting** (via JobContract)
- **JobPosting** → has → **JobContract** → has → **JobPosition**
- **JobApplication** → applies to → **JobPosting** + **JobPosition**
- **JobApplication** → has → **InterviewDetail** (one-to-many)

## Application Status Workflow
```
applied → shortlisted → interview_scheduled → interview_passed/failed
       ↘ interview_scheduled → interview_rescheduled → interview_passed/failed
       ↘ withdrawn (from any non-terminal status)
```

## Notification Requirements

### Status Updates Requiring Notifications:
1. **shortlisted**: "Congratulations! You have been shortlisted for '{job_title}' at {agency_name}"
2. **interview_scheduled**: "Interview scheduled for '{job_title}' at {agency_name} on {date} at {time}"
3. **interview_rescheduled**: "Interview rescheduled for '{job_title}' at {agency_name} - New date: {date} at {time}"
4. **interview_passed**: "Congratulations! You passed the interview for '{job_title}' at {agency_name}"
5. **interview_failed**: "Thank you for your interest in '{job_title}' at {agency_name}. Unfortunately, you were not selected this time"

### Navigation Data Required:
- `job_posting_id` - Navigate to job details
- `agency_id` - Navigate to agency details  
- `interview_id` - Navigate to interview details (when applicable)

## Implementation Priority Order
1. ✅ Design notification table schema
2. 🔄 Create notification entity and service
3. ⏳ Create notification API endpoints with pagination
4. ⏳ Integrate notification triggers into application workflow
5. ⏳ Create notification controllers (last priority)

## Database Schema

### Notification Entity
```typescript
@Entity('notifications')
export class Notification extends BaseEntity {
  @Column('uuid') candidate_id: string;
  @Column('uuid') job_application_id: string;
  @Column('uuid') job_posting_id: string;
  @Column('uuid') agency_id: string;
  @Column('uuid', { nullable: true }) interview_id?: string;
  
  @Column({ type: 'enum', enum: ['shortlisted', 'interview_scheduled', 'interview_rescheduled', 'interview_passed', 'interview_failed'] })
  notification_type: string;
  
  @Column({ type: 'varchar', length: 500 }) title: string;
  @Column({ type: 'text' }) message: string;
  
  @Column({ type: 'jsonb' })
  payload: {
    job_title: string;
    agency_name: string;
    interview_details?: {
      date: string;
      time: string;
      location: string;
    };
  };
  
  @Column({ type: 'boolean', default: false }) is_read: boolean;
  @Column({ type: 'boolean', default: false }) is_sent: boolean;
  @Column({ type: 'timestamp with time zone', nullable: true }) sent_at?: Date;
  @Column({ type: 'timestamp with time zone', nullable: true }) read_at?: Date;
}
```

## Service Methods

### NotificationService
- `createNotification(data)` - Create and persist notification
- `sendNotification(notificationId)` - Stub for push notification (console.log for now)
- `getNotifications(candidateId, pagination)` - Get paginated notifications
- `markAsRead(notificationId)` - Mark notification as read
- `markAllAsRead(candidateId)` - Mark all notifications as read

### Integration Points in ApplicationService
- `updateStatus()` - Trigger notification for shortlisted
- `scheduleInterview()` - Trigger notification for interview_scheduled
- `rescheduleInterview()` - Trigger notification for interview_rescheduled
- `completeInterview()` - Trigger notification for interview_passed/failed

## API Endpoints (Final Priority)
- `GET /notifications` - Get paginated notifications for candidate
- `PATCH /notifications/:id/read` - Mark notification as read
- `PATCH /notifications/mark-all-read` - Mark all notifications as read

## Technical Notes
- Notifications are persisted regardless of send success
- Push notification service is stubbed (console.log)
- Pagination support for notification listing
- Rich payload data for mobile app navigation
