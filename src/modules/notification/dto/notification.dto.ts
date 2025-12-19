import { IsOptional, IsBoolean, IsNumber, Min, Max, IsString, IsNotEmpty } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Notification, NotificationPayload } from '../notification.entity';

export class GetNotificationsQueryDto {
  @ApiPropertyOptional({
    description: 'Page number',
    default: 1,
    minimum: 1,
    example: 1
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Number of items per page',
    default: 20,
    minimum: 1,
    maximum: 100,
    example: 20
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @ApiPropertyOptional({
    description: 'Filter to show only unread notifications',
    default: false,
    example: false
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  unreadOnly?: boolean = false;
}

export class NotificationResponseDto {
  @ApiProperty({
    description: 'Unique identifier of the notification',
    example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479'
  })
  id: string;

  @ApiProperty({
    description: 'UUID of the candidate who received the notification',
    example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479'
  })
  candidate_id: string;

  @ApiProperty({
    description: 'UUID of the related job application',
    example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479'
  })
  job_application_id: string;

  @ApiProperty({
    description: 'UUID of the related job posting',
    example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479'
  })
  job_posting_id: string;

  @ApiProperty({
    description: 'UUID of the related agency',
    example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479'
  })
  agency_id: string;

  @ApiPropertyOptional({
    description: 'UUID of the related interview (if applicable)',
    example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479'
  })
  interview_id?: string;

  @ApiProperty({
    description: 'Type of notification',
    enum: ['shortlisted', 'interview_scheduled', 'interview_rescheduled', 'interview_passed', 'interview_failed'],
    example: 'shortlisted'
  })
  notification_type: string;

  @ApiProperty({
    description: 'Notification title',
    example: 'Congratulations! You\'ve been shortlisted'
  })
  title: string;

  @ApiProperty({
    description: 'Notification message content',
    example: 'Congratulations! You have been shortlisted for "Software Engineer" at Tech Company Ltd.'
  })
  message: string;

  @ApiProperty({
    description: 'Additional notification data',
    example: {
      job_title: 'Software Engineer',
      agency_name: 'Tech Company Ltd.',
      interview_details: {
        date: '2025-01-15',
        time: '10:00',
        location: 'Company Office'
      }
    }
  })
  payload: NotificationPayload;

  @ApiProperty({
    description: 'Whether the notification has been read',
    example: false
  })
  is_read: boolean;

  @ApiProperty({
    description: 'Whether the notification has been sent via push',
    example: true
  })
  is_sent: boolean;

  @ApiPropertyOptional({
    description: 'Timestamp when the notification was sent',
    example: '2025-01-01T10:00:00.000Z'
  })
  sent_at?: Date;

  @ApiPropertyOptional({
    description: 'Timestamp when the notification was read',
    example: '2025-01-01T10:30:00.000Z'
  })
  read_at?: Date;

  @ApiProperty({
    description: 'Timestamp when the notification was created',
    example: '2025-01-01T10:00:00.000Z'
  })
  created_at: Date;

  @ApiProperty({
    description: 'Timestamp when the notification was last updated',
    example: '2025-01-01T10:00:00.000Z'
  })
  updated_at: Date;

  constructor(notification: Notification) {
    this.id = notification.id;
    this.candidate_id = notification.candidate_id;
    this.job_application_id = notification.job_application_id;
    this.job_posting_id = notification.job_posting_id;
    this.agency_id = notification.agency_id;
    this.interview_id = notification.interview_id;
    this.notification_type = notification.notification_type;
    this.title = notification.title;
    this.message = notification.message;
    this.payload = notification.payload;
    this.is_read = notification.is_read;
    this.is_sent = notification.is_sent;
    this.sent_at = notification.sent_at;
    this.read_at = notification.read_at;
    this.created_at = notification.created_at;
    this.updated_at = notification.updated_at;
  }
}

export class NotificationListResponseDto {
  @ApiProperty({
    description: 'Array of notification items',
    type: [NotificationResponseDto]
  })
  items: NotificationResponseDto[];

  @ApiProperty({
    description: 'Total number of notifications',
    example: 25
  })
  total: number;

  @ApiProperty({
    description: 'Current page number',
    example: 1
  })
  page: number;

  @ApiProperty({
    description: 'Number of items per page',
    example: 20
  })
  limit: number;

  @ApiProperty({
    description: 'Number of unread notifications',
    example: 5
  })
  unreadCount: number;

  constructor(data: {
    items: Notification[];
    total: number;
    page: number | string;
    limit: number | string;
    unreadCount: number;
  }) {
    this.items = data.items.map(item => new NotificationResponseDto(item));
    this.total = Number(data.total);
    this.page = Number(data.page);
    this.limit = Number(data.limit);
    this.unreadCount = Number(data.unreadCount);
  }
}

export class MarkAsReadResponseDto {
  @ApiProperty({
    description: 'Whether the operation was successful',
    example: true
  })
  success: boolean;

  @ApiPropertyOptional({
    description: 'The updated notification (if found)',
    type: NotificationResponseDto
  })
  notification?: NotificationResponseDto;

  @ApiProperty({
    description: 'Response message',
    example: 'Notification marked as read'
  })
  message: string;

  constructor(notification: Notification | null) {
    this.success = !!notification;
    this.notification = notification ? new NotificationResponseDto(notification) : undefined;
    this.message = notification ? 'Notification marked as read' : 'Notification not found';
  }
}

export class MarkAllAsReadResponseDto {
  @ApiProperty({
    description: 'Whether the operation was successful',
    example: true
  })
  success: boolean;

  @ApiProperty({
    description: 'Number of notifications marked as read',
    example: 5
  })
  markedCount: number;

  @ApiProperty({
    description: 'Response message',
    example: '5 notifications marked as read'
  })
  message: string;

  constructor(markedCount: number) {
    this.success = true;
    this.markedCount = markedCount;
    this.message = `${markedCount} notifications marked as read`;
  }
}

export class SendTestNotificationDto {
  @ApiProperty({ description: 'Phone number of the user (E.164 format)', example: '+9779812345678' })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiProperty({ description: 'Notification title', example: 'Test Notification' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ description: 'Notification body', example: 'This is a test message' })
  @IsString()
  @IsNotEmpty()
  body: string;

  @ApiProperty({ description: 'Additional data payload', required: false })
  @IsOptional()
  data?: Record<string, string>;
}

export class SendTestNotificationToTokenDto {
  @ApiProperty({ description: 'FCM device token to send the notification to' })
  @IsString()
  @IsNotEmpty()
  token: string;

  @ApiProperty({ description: 'Notification title', example: 'Test Notification' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ description: 'Notification body', example: 'This is a test message' })
  @IsString()
  @IsNotEmpty()
  body: string;

  @ApiProperty({ description: 'Additional data payload', required: false })
  @IsOptional()
  data?: Record<string, string>;
}
