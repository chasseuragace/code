import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification, NotificationType, NotificationPayload } from './notification.entity';
import { JobApplication } from '../application/job-application.entity';
import { JobPosting, InterviewDetail } from '../domain/domain.entity';
import { PostingAgency } from '../domain/PostingAgency';

export interface CreateNotificationData {
  candidateId: string;
  jobApplicationId: string;
  jobPostingId: string;
  agencyId: string;
  interviewId?: string;
  notificationType: NotificationType;
  jobTitle: string;
  agencyName: string;
  interviewDetails?: {
    date: string;
    time: string;
    location: string;
  };
}

export interface PaginationOptions {
  page?: number;
  limit?: number;
  unreadOnly?: boolean;
}

export interface NotificationListResponse {
  items: Notification[];
  total: number;
  page: number;
  limit: number;
  unreadCount: number;
}

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepo: Repository<Notification>,
    @InjectRepository(JobApplication)
    private readonly jobApplicationRepo: Repository<JobApplication>,
    @InjectRepository(JobPosting)
    private readonly jobPostingRepo: Repository<JobPosting>,
    @InjectRepository(PostingAgency)
    private readonly agencyRepo: Repository<PostingAgency>,
    @InjectRepository(InterviewDetail)
    private readonly interviewRepo: Repository<InterviewDetail>,
  ) {}

  /**
   * Create and persist a notification
   */
  async createNotification(data: CreateNotificationData): Promise<Notification> {
    const { title, message } = this.generateNotificationContent(
      data.notificationType,
      data.jobTitle,
      data.agencyName,
      data.interviewDetails
    );

    const payload: NotificationPayload = {
      job_title: data.jobTitle,
      agency_name: data.agencyName,
      interview_details: data.interviewDetails,
    };

    const notification = this.notificationRepo.create({
      candidate_id: data.candidateId,
      job_application_id: data.jobApplicationId,
      job_posting_id: data.jobPostingId,
      agency_id: data.agencyId,
      interview_id: data.interviewId,
      notification_type: data.notificationType,
      title,
      message,
      payload,
      is_read: false,
      is_sent: false,
    });

    const savedNotification = await this.notificationRepo.save(notification);

    // Attempt to send push notification (stubbed for now)
    await this.sendNotification(savedNotification.id);

    return savedNotification;
  }

  /**
   * Send push notification (stubbed implementation)
   */
  async sendNotification(notificationId: string): Promise<boolean> {
    try {
      const notification = await this.notificationRepo.findOne({
        where: { id: notificationId }
      });

      if (!notification) {
        console.log(`Notification ${notificationId} not found`);
        return false;
      }

      // Stub: Log notification sending
      console.log(`📱 Sending notification to candidate ${notification.candidate_id}:`);
      console.log(`   Title: ${notification.title}`);
      console.log(`   Message: ${notification.message}`);
      console.log(`   Type: ${notification.notification_type}`);
      console.log(`   Job: ${notification.payload.job_title} at ${notification.payload.agency_name}`);

      // Mark as sent
      notification.is_sent = true;
      notification.sent_at = new Date();
      await this.notificationRepo.save(notification);

      return true;
    } catch (error) {
      console.error(`Failed to send notification ${notificationId}:`, error);
      return false;
    }
  }

  /**
   * Get paginated notifications for a candidate
   */
  async getNotifications(
    candidateId: string,
    options: PaginationOptions = {}
  ): Promise<NotificationListResponse> {
    const { page = 1, limit = 20, unreadOnly = false } = options;

    const queryBuilder = this.notificationRepo
      .createQueryBuilder('notification')
      .where('notification.candidate_id = :candidateId', { candidateId })
      .orderBy('notification.created_at', 'DESC');

   

    const [items, total] = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    // Get unread count
    const unreadCount = await this.notificationRepo.count({
      where: {
        candidate_id: candidateId,
        is_read: false,
      },
    });

    return {
      items,
      total,
      page,
      limit,
      unreadCount,
    };
  }

  /**
   * Mark a notification as read
   */
  async markAsRead(notificationId: string): Promise<Notification | null> {
    const notification = await this.notificationRepo.findOne({
      where: { id: notificationId }
    });

    if (!notification) {
      return null;
    }

    if (!notification.is_read) {
      notification.is_read = true;
      notification.read_at = new Date();
      await this.notificationRepo.save(notification);
    }

    return notification;
  }

  /**
   * Mark all notifications as read for a candidate
   */
  async markAllAsRead(candidateId: string): Promise<number> {
    const result = await this.notificationRepo
      .createQueryBuilder()
      .update(Notification)
      .set({
        is_read: true,
        read_at: new Date(),
      })
      .where('candidate_id = :candidateId', { candidateId })
      .andWhere('is_read = false')
      .execute();

    return result.affected || 0;
  }

  /**
   * Create notification from job application context
   */
  async createNotificationFromApplication(
    jobApplication: JobApplication,
    notificationType: NotificationType,
    interviewId?: string
  ): Promise<Notification> {
    // Load related data
    const [posting, interview] = await Promise.all([
      this.jobPostingRepo.findOne({
        where: { id: jobApplication.job_posting_id },
        relations: ['contracts', 'contracts.agency']
      }),
      interviewId ? this.interviewRepo.findOne({ where: { id: interviewId } }) : null
    ]);

    if (!posting) {
      throw new Error('Job posting not found');
    }

    const contract = posting.contracts?.[0];
    const agency = contract?.agency;

    if (!agency) {
      throw new Error('Agency not found');
    }

    let interviewDetails;
    if (interview && ['interview_scheduled', 'interview_rescheduled'].includes(notificationType)) {
      // Handle case where interview_date_ad might be a string or Date
      let formattedDate = '';
      if (interview.interview_date_ad) {
        const date = interview.interview_date_ad instanceof Date 
          ? interview.interview_date_ad 
          : new Date(interview.interview_date_ad);
        formattedDate = !isNaN(date.getTime()) ? date.toISOString().split('T')[0] : '';
      }
      
      interviewDetails = {
        date: formattedDate || interview.interview_date_bs || '',
        time: interview.interview_time || '',
        location: interview.location || '',
      };
    }

    return this.createNotification({
      candidateId: jobApplication.candidate_id,
      jobApplicationId: jobApplication.id,
      jobPostingId: posting.id,
      agencyId: agency.id,
      interviewId,
      notificationType,
      jobTitle: posting.posting_title,
      agencyName: agency.name,
      interviewDetails,
    });
  }

  /**
   * Generate notification title and message based on type
   */
  private generateNotificationContent(
    type: NotificationType,
    jobTitle: string,
    agencyName: string,
    interviewDetails?: { date: string; time: string; location: string }
  ): { title: string; message: string } {
    switch (type) {
      case 'shortlisted':
        return {
          title: 'Congratulations! You\'ve been shortlisted',
          message: `Congratulations! You have been shortlisted for "${jobTitle}" at ${agencyName}.`
        };

      case 'interview_scheduled':
        const scheduleDetails = interviewDetails
          ? ` on ${interviewDetails.date}${interviewDetails.time ? ` at ${interviewDetails.time}` : ''}`
          : '';
        return {
          title: 'Interview Scheduled',
          message: `Interview scheduled for "${jobTitle}" at ${agencyName}${scheduleDetails}.`
        };

      case 'interview_rescheduled':
        const rescheduleDetails = interviewDetails
          ? ` - New date: ${interviewDetails.date}${interviewDetails.time ? ` at ${interviewDetails.time}` : ''}`
          : '';
        return {
          title: 'Interview Rescheduled',
          message: `Interview rescheduled for "${jobTitle}" at ${agencyName}${rescheduleDetails}.`
        };

      case 'interview_passed':
        return {
          title: 'Congratulations! Interview Passed',
          message: `Congratulations! You passed the interview for "${jobTitle}" at ${agencyName}.`
        };

      case 'interview_failed':
        return {
          title: 'Interview Result',
          message: `Thank you for your interest in "${jobTitle}" at ${agencyName}. Unfortunately, you were not selected this time.`
        };

      default:
        return {
          title: 'Application Update',
          message: `Your application for "${jobTitle}" at ${agencyName} has been updated.`
        };
    }
  }
}
