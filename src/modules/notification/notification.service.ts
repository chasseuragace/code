import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification, NotificationType, NotificationPayload } from './notification.entity';
import { JobApplication } from '../application/job-application.entity';
import { JobPosting, InterviewDetail } from '../domain/domain.entity';
import { PostingAgency } from '../domain/PostingAgency';
import { User } from '../user/user.entity';
import * as admin from 'firebase-admin';
import { OnModuleInit } from '@nestjs/common';
import * as crypto from 'crypto';

// Simple in-memory templates used only for test notification APIs
const TEST_NOTIFICATION_TEMPLATES: Array<{
  title: string;
  body: string;
  data?: Record<string, string>;
}> = [
  {
    title: 'Shortlisted for {{job}}',
    body: 'Good news! You have been shortlisted for {{job}} at {{agency}}.',
    data: { templateType: 'shortlisted_test' },
  },
  {
    title: 'Interview Scheduled - {{job}}',
    body: 'Your interview for {{job}} at {{agency}} is scheduled. Please check the app for details.',
    data: { templateType: 'interview_scheduled_test' },
  },
  {
    title: 'Application Update for {{job}}',
    body: 'There is a new update on your application for {{job}} at {{agency}}.',
    data: { templateType: 'generic_update_test' },
  },
];

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
export class NotificationService implements OnModuleInit {
  private firebaseApp: admin.app.App | undefined;
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
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) { }

  onModuleInit() {
    this.initializeFirebase();
  }

  private initializeFirebase() {
    try {
      // Check if already initialized
      if (admin.apps.length > 0) {
        this.firebaseApp = admin.apps[0] || undefined;
        return;
      }

      const encrypted = process.env.FIREBASE_SA_ENC;
      const keyB64 = process.env.FIREBASE_SA_KEY;

      if (!encrypted || !keyB64) {
        console.warn('⚠️ FIREBASE_SA_ENC or FIREBASE_SA_KEY not set; push notifications will not be sent.');
        return;
      }

      const parts = encrypted.split(':');
      if (parts.length !== 3) {
        console.warn('⚠️ FIREBASE_SA_ENC has invalid format; expected iv:ciphertext:authTag (base64).');
        console.warn('Push notifications will not be sent.');
        return;
      }

      const [ivB64, ciphertextB64, authTagB64] = parts;

      const key = Buffer.from(keyB64, 'base64');
      const iv = Buffer.from(ivB64, 'base64');
      const authTag = Buffer.from(authTagB64, 'base64');

      const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
      decipher.setAuthTag(authTag);

      let decrypted = decipher.update(ciphertextB64, 'base64', 'utf8');
      decrypted += decipher.final('utf8');

      const serviceAccount = JSON.parse(decrypted);

      this.firebaseApp = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
      });
      console.log('✅ Firebase Admin initialized successfully from encrypted env');
    } catch (error) {
      console.error('❌ Failed to initialize Firebase Admin:', error);
    }
  }

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
  /**
   * Send push notification
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

      // Find user associated with candidate
      const user = await this.userRepo.findOne({
        where: { candidate_id: notification.candidate_id }
      });

      if (!user || !user.fcm_token) {
        console.log(`No FCM token found for candidate ${notification.candidate_id}`);
        return false;
      }

      if (!this.firebaseApp) {
        console.log('Firebase not initialized, skipping push notification');
        return false;
      }

      const message: admin.messaging.Message = {
        data: this.buildFcmDataFromNotification(notification),
        token: user.fcm_token,
      };

      await admin.messaging().send(message);

      // Mark as sent
      notification.is_sent = true;
      notification.sent_at = new Date();
      await this.notificationRepo.save(notification);

      console.log(`✅ Notification sent to user ${user.id} (${user.phone})`);
      return true;
    } catch (error) {
      console.error(`Failed to send notification ${notificationId}:`, error);
      return false;
    }
  }

  /**
   * Send a test notification to a specific phone number
   */
  async sendTestNotification(phone: string, title: string, body: string, data?: Record<string, string>): Promise<any> {
    if (!this.firebaseApp) {
      throw new Error('Firebase not initialized');
    }

    const user = await this.userRepo.findOne({ where: { phone } });
    if (!user) {
      throw new Error(`User with phone ${phone} not found`);
    }

    if (!user.fcm_token) {
      throw new Error(`User ${phone} has no FCM token`);
    }

    const message: admin.messaging.Message = {
      data: this.buildFcmDataFromRaw({ title, body, extraData: data }),
      token: user.fcm_token,
    };

    const response = await admin.messaging().send(message);
    return { success: true, messageId: response, user: { id: user.id, phone: user.phone } };
  }

  /**
   * Send a test notification directly to a raw FCM token
   */
  async sendTestNotificationToToken(token: string, title: string, body: string, data?: Record<string, string>): Promise<any> {
    if (!this.firebaseApp) {
      throw new Error('Firebase not initialized');
    }

    // Pure test mode: if title/body are not provided, generate them from a random template
    if (!title || !body) {
      const tpl = TEST_NOTIFICATION_TEMPLATES[Math.floor(Math.random() * TEST_NOTIFICATION_TEMPLATES.length)];

      const job = 'Security Guard';
      const agency = 'Madira Maps Agency';

      const replaceTokens = (text: string) =>
        text
          .replace(/{{job}}/g, job)
          .replace(/{{agency}}/g, agency);

      title = title || replaceTokens(tpl.title);
      body = body || replaceTokens(tpl.body);

      data = {
        ...(tpl.data || {}),
        ...(data || {}),
      };
    }

    const message: admin.messaging.Message = {
      data: this.buildFcmDataFromRaw({ title, body, extraData: data }),
      token,
    };

    const response = await admin.messaging().send(message);
    return { success: true, messageId: response };
  }

  private flattenPayload(payload: any): Record<string, string> {
    const flattened: Record<string, string> = {};
    for (const key in payload) {
      if (typeof payload[key] === 'object' && payload[key] !== null) {
        flattened[key] = JSON.stringify(payload[key]);
      } else {
        flattened[key] = String(payload[key]);
      }
    }
    return flattened;
  }

  private buildFcmDataFromNotification(notification: Notification): Record<string, string> {
    return {
      title: notification.title,
      body: notification.message,
      imageUrl: (notification.payload as any)?.image_url || '',
      ...this.flattenPayload(notification.payload),
      notificationId: notification.id,
      type: notification.notification_type,
    };
  }

  private buildFcmDataFromRaw(input: { title: string; body: string; extraData?: Record<string, string> | undefined }): Record<string, string> {
    return {
      title: input.title,
      body: input.body,
      ...(input.extraData || {}),
    };
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
