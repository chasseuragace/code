import { Module } from '@nestjs/common';
import { ApplicationController } from './application.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JobApplication } from './job-application.entity';
import { ApplicationService } from './application.service';
import { Candidate } from '../candidate/candidate.entity';
import { DomainModule } from '../domain/domain.module';
import { JobPosting } from '../domain/domain.entity';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([JobApplication, Candidate, JobPosting]),
    DomainModule,
    NotificationModule,
  ],
  providers: [ApplicationService],
  controllers: [ApplicationController],
  exports: [ApplicationService],
})
export class ApplicationModule {}
