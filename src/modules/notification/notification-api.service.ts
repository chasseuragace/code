import { Injectable } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { 
  GetNotificationsQueryDto, 
  NotificationListResponseDto, 
  MarkAsReadResponseDto, 
  MarkAllAsReadResponseDto 
} from './dto/notification.dto';

/**
 * API service layer for notifications - handles request/response transformation
 * This service acts as a bridge between controllers and the core notification service
 */
@Injectable()
export class NotificationApiService {
  constructor(private readonly notificationService: NotificationService) {}

  /**
   * Get paginated notifications for a candidate
   */
  async getNotifications(
    candidateId: string,
    query: GetNotificationsQueryDto
  ): Promise<NotificationListResponseDto> {
    const result = await this.notificationService.getNotifications(candidateId, {
      page: query.page,
      limit: query.limit,
      unreadOnly: query.unreadOnly,
    });

    return new NotificationListResponseDto(result);
  }

  /**
   * Mark a notification as read
   */
  async markAsRead(notificationId: string): Promise<MarkAsReadResponseDto> {
    const notification = await this.notificationService.markAsRead(notificationId);
    return new MarkAsReadResponseDto(notification);
  }

  /**
   * Mark all notifications as read for a candidate
   */
  async markAllAsRead(candidateId: string): Promise<MarkAllAsReadResponseDto> {
    const markedCount = await this.notificationService.markAllAsRead(candidateId);
    return new MarkAllAsReadResponseDto(markedCount);
  }

  /**
   * Get unread notification count for a candidate
   */
  async getUnreadCount(candidateId: string): Promise<{ count: number }> {
    const result = await this.notificationService.getNotifications(candidateId, {
      page: 1,
      limit: 1,
      unreadOnly: true,
    });

    return { count: result.unreadCount };
  }
}
