import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AgencyService } from './agency.service';
import { AgencyController } from './agency.controller';
import { DomainModule } from '../domain/domain.module';
import { PostingAgency, JobPosting, JobContract, JobPosition, InterviewDetail } from '../domain/domain.entity';

@Module({
  imports: [
    DomainModule,
    TypeOrmModule.forFeature([
      PostingAgency,
      JobPosting,
      JobContract,
      JobPosition,
      InterviewDetail,
    ]),
  ],
  providers: [AgencyService],
  controllers: [AgencyController],
  exports: [TypeOrmModule, AgencyService],
})
export class AgencyModule {}
