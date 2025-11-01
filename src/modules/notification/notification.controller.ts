import { Controller, Get, Patch, Param, Query, HttpStatus, HttpException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiParam } from '@nestjs/swagger';
import { NotificationApiService } from './notification-api.service';
import { 
  GetNotificationsQueryDto, 
  NotificationListResponseDto, 
  MarkAsReadResponseDto, 
  MarkAllAsReadResponseDto 
} from './dto/notification.dto';

@ApiTags('notifications')
@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationApiService: NotificationApiService) {}

  /**
   * Get paginated notifications for a candidate
   * GET /notifications?candidateId=uuid&page=1&limit=20&unreadOnly=false
   */
  @Get()
  @ApiOperation({ 
    summary: 'Get paginated notifications for a candidate',
    description: 'Retrieve notifications for a specific candidate with pagination and filtering options'
  })
  @ApiQuery({ 
    name: 'candidateId', 
    description: 'UUID of the candidate to get notifications for',
    required: true,
    type: String
  })
  @ApiQuery({ 
    name: 'page', 
    description: 'Page number (default: 1)',
    required: false,
    type: Number
  })
  @ApiQuery({ 
    name: 'limit', 
    description: 'Number of items per page (default: 20, max: 100)',
    required: false,
    type: Number
  })
  @ApiQuery({ 
    name: 'unreadOnly', 
    description: 'Filter to show only unread notifications (default: false)',
    required: false,
    type: Boolean
  })
  @ApiResponse({
    status: 200,
    description: 'Paginated list of notifications',
    type: NotificationListResponseDto
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - candidateId is required'
  })
  async getNotifications(
    @Query('candidateId') candidateId: string,
    @Query() query: GetNotificationsQueryDto
  ): Promise<NotificationListResponseDto> {
    if (!candidateId) {
      throw new HttpException('candidateId is required', HttpStatus.BAD_REQUEST);
    }

    return this.notificationApiService.getNotifications(candidateId, query);
  }

  /**
   * Get unread notification count for a candidate
   * GET /notifications/unread-count?candidateId=uuid
   */
  @Get('unread-count')
  @ApiOperation({ 
    summary: 'Get unread notification count',
    description: 'Get the count of unread notifications for a specific candidate'
  })
  @ApiQuery({ 
    name: 'candidateId', 
    description: 'UUID of the candidate to get unread count for',
    required: true,
    type: String
  })
  @ApiResponse({
    status: 200,
    description: 'Unread notification count',
    schema: {
      type: 'object',
      properties: {
        count: {
          type: 'number',
          description: 'Number of unread notifications'
        }
      }
    }
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - candidateId is required'
  })
  async getUnreadCount(
    @Query('candidateId') candidateId: string
  ): Promise<{ count: number }> {
    if (!candidateId) {
      throw new HttpException('candidateId is required', HttpStatus.BAD_REQUEST);
    }

    return this.notificationApiService.getUnreadCount(candidateId);
  }

  /**
   * Mark a notification as read
   * PATCH /notifications/:id/read
   */
  @Patch(':id/read')
  @ApiOperation({ 
    summary: 'Mark notification as read',
    description: 'Mark a specific notification as read by its ID'
  })
  @ApiParam({ 
    name: 'id', 
    description: 'UUID of the notification to mark as read',
    type: String
  })
  @ApiResponse({
    status: 200,
    description: 'Notification marked as read successfully',
    type: MarkAsReadResponseDto
  })
  @ApiResponse({
    status: 404,
    description: 'Notification not found'
  })
  async markAsRead(
    @Param('id') notificationId: string
  ): Promise<MarkAsReadResponseDto> {
    return this.notificationApiService.markAsRead(notificationId);
  }

  /**
   * Mark all notifications as read for a candidate
   * PATCH /notifications/mark-all-read?candidateId=uuid
   */
  @Patch('mark-all-read')
  @ApiOperation({ 
    summary: 'Mark all notifications as read',
    description: 'Mark all notifications as read for a specific candidate'
  })
  @ApiQuery({ 
    name: 'candidateId', 
    description: 'UUID of the candidate to mark all notifications as read',
    required: true,
    type: String
  })
  @ApiResponse({
    status: 200,
    description: 'All notifications marked as read successfully',
    type: MarkAllAsReadResponseDto
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - candidateId is required'
  })
  async markAllAsRead(
    @Query('candidateId') candidateId: string
  ): Promise<MarkAllAsReadResponseDto> {
    if (!candidateId) {
      throw new HttpException('candidateId is required', HttpStatus.BAD_REQUEST);
    }

    return this.notificationApiService.markAllAsRead(candidateId);
  }
}
