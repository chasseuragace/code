import { Module, forwardRef } from '@nestjs/common';
import { ApplicationController } from './application.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JobApplication } from './job-application.entity';
import { ApplicationService } from './application.service';
import { Candidate } from '../candidate/candidate.entity';
import { DomainModule } from '../domain/domain.module';
import { JobPosting } from '../domain/domain.entity';
import { NotificationModule } from '../notification/notification.module';
import { AuthModule } from '../auth/auth.module';
import { User } from '../user/user.entity';
import { AgencyAuthGuard } from '../auth/agency-auth.guard';
import { CandidateModule } from '../candidate/candidate.module';
import { ImageUploadModule } from '../shared/image-upload.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([JobApplication, Candidate, JobPosting, User]),
    forwardRef(() => DomainModule),
    NotificationModule,
    forwardRef(() => AuthModule),
    forwardRef(() => CandidateModule),
    ImageUploadModule,
  ],
  providers: [ApplicationService, AgencyAuthGuard],
  controllers: [ApplicationController],
  exports: [ApplicationService],
})
export class ApplicationModule {}
