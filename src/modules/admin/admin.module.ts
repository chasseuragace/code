import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminJobsController } from './admin-jobs.controller';
import { AdminJobsService } from './admin-jobs.service';
import { JobPosting } from '../domain/domain.entity';
import { JobApplication } from '../application/job-application.entity';
import { DomainModule } from '../domain/domain.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([JobPosting, JobApplication]),
    DomainModule,
  ],
  controllers: [AdminJobsController],
  providers: [AdminJobsService],
  exports: [AdminJobsService],
})
export class AdminModule {}
