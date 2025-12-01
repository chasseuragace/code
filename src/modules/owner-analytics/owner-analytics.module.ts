import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OwnerAnalyticsService } from './owner-analytics.service';
import { OwnerAnalyticsController } from './owner-analytics.controller';
import { JobPosting, InterviewDetail, JobPosition } from 'src/modules/domain/domain.entity';
import { PostingAgency } from '../domain/PostingAgency';
import { JobApplication } from '../application/job-application.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PostingAgency, JobPosting, InterviewDetail, JobPosition, JobApplication])],
  controllers: [OwnerAnalyticsController],
  providers: [OwnerAnalyticsService],
  exports: [OwnerAnalyticsService],
})
export class OwnerAnalyticsModule {}
