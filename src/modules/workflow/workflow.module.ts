import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkflowController } from './workflow.controller';
import { WorkflowService } from './workflow.service';
import { JobApplication } from '../application/job-application.entity';
import { JobPosting, JobPosition, JobContract, InterviewDetail } from '../domain/domain.entity';
import { Candidate } from '../candidate/candidate.entity';
import { CandidateDocument } from '../candidate/candidate-document.entity';
import { Notification } from '../notification/notification.entity';
import { User } from '../user/user.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      JobApplication,
      JobPosting,
      JobPosition,
      JobContract,
      Candidate,
      InterviewDetail,
      CandidateDocument,
      Notification,
      User,
    ]),
    AuthModule,
  ],
  controllers: [WorkflowController],
  providers: [WorkflowService],
  exports: [WorkflowService],
})
export class WorkflowModule {}
