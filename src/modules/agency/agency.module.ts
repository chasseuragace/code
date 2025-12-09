import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AgencyService } from './agency.service';
import { AgencyController } from './agency.controller';
import { AgencyReviewService } from './agency-review.service';
import { AgencyReviewController } from './agency-review.controller';
import { AgencyProfileService } from './agency-profile.service';
import { AgencyApplicationsService } from './agency-applications.service';
import { AgencyApplicationsController } from './agency-applications.controller';
import { AgencyDashboardService } from './agency-dashboard.service';
import { AgencyJobManagementService } from './agency-job-management.service';
import { AgencyJobManagementController } from './agency-job-management.controller';
import { JobCandidatesController } from './job-candidates.controller';
import { AgencyInterviewsController } from './agency-interviews.controller';
import { DomainModule } from '../domain/domain.module';
import { ApplicationModule } from '../application/application.module';
import { CandidateModule } from '../candidate/candidate.module';
import { CountryModule } from '../country/country.module';
import { JobTitleModule } from '../job-title/job-title.module';
import { FitnessScoreModule } from '../shared/fitness-score.module';
import {
  JobPosting,
  JobContract,
  JobPosition,
  InterviewDetail,
  Employer,
  MedicalExpense,
  InsuranceExpense,
  TravelExpense,
  VisaPermitExpense,
  TrainingExpense,
  WelfareServiceExpense,
} from '../domain/domain.entity';
import { PostingAgency } from '../domain/PostingAgency';
import { JobApplication } from '../application/job-application.entity';
import { Candidate } from '../candidate/candidate.entity';
import { CandidateJobProfile } from '../candidate/candidate-job-profile.entity';
import { User } from '../user/user.entity';
import { AgencyUser } from './agency-user.entity';
import { AgencyReview } from './agency-review.entity';
import { Country } from '../country/country.entity';
import { JobTitle } from '../job-title/job-title.entity';
import { AuthModule } from '../auth/auth.module';
import { DevSmsService } from './dev-sms.service';
import { ImageUploadModule } from '../shared/image-upload.module';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [
    DomainModule,
    AuthModule,
    ImageUploadModule,
    ApplicationModule,
    CandidateModule,
    CountryModule,
    JobTitleModule,
    FitnessScoreModule,
    AuditModule,
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
      Employer,
      Country,
      JobTitle,
      MedicalExpense,
      InsuranceExpense,
      TravelExpense,
      VisaPermitExpense,
      TrainingExpense,
      WelfareServiceExpense,
    ]),
  ],
  providers: [
    AgencyService,
    AgencyReviewService,
    DevSmsService,
    AgencyProfileService,
    AgencyApplicationsService,
    AgencyDashboardService,
    AgencyJobManagementService,
  ],
  controllers: [
    AgencyController,
    AgencyReviewController,
    JobCandidatesController,
    AgencyApplicationsController,
    AgencyInterviewsController,
    AgencyJobManagementController,
  ],
  exports: [
    TypeOrmModule,
    AgencyService,
    AgencyReviewService,
    AgencyProfileService,
    AgencyApplicationsService,
    AgencyDashboardService,
    AgencyJobManagementService,
  ],
})
export class AgencyModule {}
