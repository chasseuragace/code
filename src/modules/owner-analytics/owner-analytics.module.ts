import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OwnerAnalyticsService } from './owner-analytics.service';
import { PostingAgency, JobPosting, InterviewDetail, JobPosition } from 'src/modules/domain/domain.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PostingAgency, JobPosting, InterviewDetail, JobPosition])],
  providers: [OwnerAnalyticsService],
  exports: [OwnerAnalyticsService],
})
export class OwnerAnalyticsModule {}
