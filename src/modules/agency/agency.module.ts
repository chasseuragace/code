import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AgencyService } from './agency.service';
import { AgencyController } from './agency.controller';
import { DomainModule } from '../domain/domain.module';
import { PostingAgency, JobPosting, JobContract, JobPosition, InterviewDetail } from '../domain/domain.entity';
import { JobApplication } from '../application/job-application.entity';
import { User } from '../user/user.entity';
import { AgencyUser } from './agency-user.entity';
import { AuthModule } from '../auth/auth.module';
import { DevSmsService } from './dev-sms.service';

@Module({
  imports: [
    DomainModule,
    AuthModule,
    TypeOrmModule.forFeature([
      PostingAgency,
      JobPosting,
      JobContract,
      JobPosition,
      InterviewDetail,
      JobApplication,
      User,
      AgencyUser,
    ]),
  ],
  providers: [AgencyService, DevSmsService],
  controllers: [AgencyController],
  exports: [TypeOrmModule, AgencyService],
})
export class AgencyModule {}
