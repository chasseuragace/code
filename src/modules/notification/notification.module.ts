import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notification } from './notification.entity';
import { NotificationService } from './notification.service';
import { NotificationApiService } from './notification-api.service';
import { NotificationController } from './notification.controller';
import { JobApplication } from '../application/job-application.entity';
import { JobPosting, InterviewDetail } from '../domain/domain.entity';
import { PostingAgency } from '../domain/PostingAgency';
import { User } from '../user/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Notification,
      JobApplication,
      JobPosting,
      InterviewDetail,
      PostingAgency,
      User,
    ]),
  ],
  controllers: [
    NotificationController,
  ],
  providers: [
    NotificationService,
    NotificationApiService,
  ],
  exports: [
    NotificationService,
    NotificationApiService,
  ],
})
export class NotificationModule { }
