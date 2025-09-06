import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AgencyService } from './agency.service';
import { PostingAgency, JobPosting, JobContract, JobPosition, InterviewDetail } from '../domain/domain.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PostingAgency,
      JobPosting,
      JobContract,
      JobPosition,
      InterviewDetail,
    ]),
  ],
  providers: [AgencyService],
  exports: [TypeOrmModule, AgencyService],
})
export class AgencyModule {}
