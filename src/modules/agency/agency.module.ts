import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AgencyService } from './agency.service';
import { AgencyController } from './agency.controller';
import { AgencyReviewService } from './agency-review.service';
import { AgencyReviewController } from './agency-review.controller';
import { AgencyProfileService } from './agency-profile.service';
import { DomainModule } from '../domain/domain.module';
import { JobPosting, JobContract, JobPosition, InterviewDetail } from '../domain/domain.entity';
import { PostingAgency } from '../domain/PostingAgency';
import { JobApplication } from '../application/job-application.entity';
import { User } from '../user/user.entity';
import { AgencyUser } from './agency-user.entity';
import { AgencyReview } from './agency-review.entity';
import { AuthModule } from '../auth/auth.module';
import { DevSmsService } from './dev-sms.service';
import { ImageUploadModule } from '../shared/image-upload.module';

@Module({
  imports: [
    DomainModule,
    AuthModule,
    ImageUploadModule,
    TypeOrmModule.forFeature([
      PostingAgency,
      JobPosting,
      JobContract,
      JobPosition,
      InterviewDetail,
      JobApplication,
      User,
      AgencyUser,
      AgencyReview,
    ]),
  ],
  providers: [AgencyService, AgencyReviewService, DevSmsService, AgencyProfileService],
  controllers: [AgencyController, AgencyReviewController],
  exports: [TypeOrmModule, AgencyService, AgencyReviewService, AgencyProfileService],
})
export class AgencyModule {}
