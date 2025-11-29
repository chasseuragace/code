import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AgencyService } from './agency.service';
import { AgencyController } from './agency.controller';
import { AgencyReviewService } from './agency-review.service';
import { AgencyReviewController } from './agency-review.controller';
import { AgencyProfileService } from './agency-profile.service';
import { JobCandidatesController } from './job-candidates.controller';
import { DomainModule } from '../domain/domain.module';
import { ApplicationModule } from '../application/application.module';
import { CandidateModule } from '../candidate/candidate.module';
import { JobPosting, JobContract, JobPosition, InterviewDetail } from '../domain/domain.entity';
import { PostingAgency } from '../domain/PostingAgency';
import { JobApplication } from '../application/job-application.entity';
import { Candidate } from '../candidate/candidate.entity';
import { CandidateJobProfile } from '../candidate/candidate-job-profile.entity';
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
    ApplicationModule,
    CandidateModule,
    TypeOrmModule.forFeature([
      PostingAgency,
      JobPosting,
      JobContract,
      JobPosition,
      InterviewDetail,
      JobApplication,
      Candidate,
      CandidateJobProfile,
      User,
      AgencyUser,
      AgencyReview,
    ]),
  ],
  providers: [AgencyService, AgencyReviewService, DevSmsService, AgencyProfileService],
  controllers: [AgencyController, AgencyReviewController, JobCandidatesController],
  exports: [TypeOrmModule, AgencyService, AgencyReviewService, AgencyProfileService],
})
export class AgencyModule {}
