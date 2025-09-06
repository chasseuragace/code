import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  JobPosting,
  PostingAgency,
  Employer,
  JobContract,
  SalaryConversion,
  MedicalExpense,
  InsuranceExpense,
  TravelExpense,
  VisaPermitExpense,
  TrainingExpense,
  WelfareServiceExpense,
  InterviewDetail,
  InterviewExpense,
  JobPosition,
} from './domain.entity';
import { ExpenseService, InterviewService, JobPostingService } from './domain.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      JobPosting,
      PostingAgency,
      Employer,
      JobContract,
      JobPosition,
      SalaryConversion,
      MedicalExpense,
      InsuranceExpense,
      TravelExpense,
      VisaPermitExpense,
      TrainingExpense,
      WelfareServiceExpense,
      InterviewDetail,
      InterviewExpense,
    ]),
  ],
  providers: [JobPostingService, ExpenseService, InterviewService],
  exports: [TypeOrmModule, JobPostingService, ExpenseService, InterviewService],
})
export class DomainModule {}
