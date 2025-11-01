import { ApiProperty } from '@nestjs/swagger';
import { JobApplicationStatus } from '../job-application.entity';
import { PositionDetailsDto } from './position-details.dto';

class EmployerDto {
  @ApiProperty({ description: 'Company name', example: 'ABC Corporation' })
  company_name: string;

  @ApiProperty({ description: 'Country of the employer', example: 'United Arab Emirates' })
  country: string;

  @ApiProperty({ description: 'City of the employer', example: 'Dubai', required: false })
  city?: string;
}

class JobPostingDto {
  @ApiProperty({ description: 'Job title', example: 'Senior Electrician' })
  title: string;

  @ApiProperty({ 
    description: 'Employer details',
    type: EmployerDto
  })
  employer: EmployerDto;

  @ApiProperty({ description: 'Country of the job', example: 'United Arab Emirates' })
  country: string;

  @ApiProperty({ description: 'City of the job', example: 'Dubai', required: false })
  city?: string;
}

class InterviewExpenseDto {
  @ApiProperty({ description: 'Expense ID', example: '123e4567-e89b-12d3-a456-426614174000' })
  id: string;

  @ApiProperty({ description: 'Type of expense', example: 'travel' })
  expense_type: string;

  @ApiProperty({ description: 'Who pays for this expense', example: 'company' })
  who_pays: string;

  @ApiProperty({ description: 'Whether the expense is free', example: false })
  is_free: boolean;

  @ApiProperty({ description: 'Amount of the expense', example: 100, required: false })
  amount?: number;

  @ApiProperty({ description: 'Currency code', example: 'USD', required: false })
  currency?: string;

  @ApiProperty({ description: 'Whether the expense is refundable', example: true })
  refundable: boolean;

  @ApiProperty({ description: 'Additional notes about the expense', required: false })
  notes?: string;
}

class InterviewDetailsDto {
  @ApiProperty({ description: 'Interview ID', example: '123e4567-e89b-12d3-a456-426614174000' })
  id: string;

  @ApiProperty({ description: 'Interview date (AD)', example: '2025-10-30T00:00:00.000Z', required: false })
  interview_date_ad?: Date;

  @ApiProperty({ description: 'Interview date (BS)', example: '2082-07-13', required: false })
  interview_date_bs?: string;

  @ApiProperty({ description: 'Interview time', example: '14:30', required: false })
  interview_time?: string;

  @ApiProperty({ description: 'Interview location', required: false })
  location?: string;

  @ApiProperty({ description: 'Contact person for the interview', required: false })
  contact_person?: string;

  @ApiProperty({ description: 'List of required documents', type: [String], required: false })
  required_documents?: string[];

  @ApiProperty({ description: 'Additional notes', required: false })
  notes?: string;

  @ApiProperty({ description: 'List of interview expenses', type: [InterviewExpenseDto], required: false })
  expenses?: InterviewExpenseDto[];
}

export class JobApplicationListItemDto {
  @ApiProperty({ description: 'Job application UUID', example: '075ce7d9-fcdb-4f7e-b794-4190f49d729f' })
  id!: string;

  @ApiProperty({ description: 'Candidate UUID the application belongs to', example: '7103d484-19b0-4c62-ae96-256da67a49a4' })
  candidate_id!: string;

  @ApiProperty({ description: 'Job posting UUID the application targets', example: '1e8c9c1a-352c-485d-ac9a-767cbbca4a4c' })
  job_posting_id!: string;

  @ApiProperty({ 
    description: 'Job posting details',
    type: JobPostingDto,
    required: false
  })
  job_posting?: JobPostingDto | null;

  @ApiProperty({ 
    description: 'Details about the specific position applied for',
    type: PositionDetailsDto,
    required: false
  })
  position?: PositionDetailsDto;

  @ApiProperty({
    description: 'Current status within the application workflow',
    example: 'shortlisted',
    enum: ['applied', 'shortlisted', 'interview_scheduled', 'interview_rescheduled', 'interview_passed', 'interview_failed', 'withdrawn'],
  })
  status!: JobApplicationStatus;

  @ApiProperty({ description: 'Name of the agency handling the job posting', example: 'ABC Recruitment', required: false })
  agency_name?: string | null;

  @ApiProperty({ 
    description: 'Interview details (only included if status is interview_scheduled or interview_rescheduled)',
    type: InterviewDetailsDto,
    required: false 
  })
  interview?: InterviewDetailsDto | null;

  @ApiProperty({ description: 'Date the application was created', example: '2025-09-21T10:30:00.000Z' })
  created_at!: Date;

  @ApiProperty({ description: 'Date the application was last updated', example: '2025-09-22T08:10:00.000Z' })
  updated_at!: Date;
}

export class PaginatedJobApplicationsDto {
  @ApiProperty({ type: [JobApplicationListItemDto], description: 'Current page of job applications' })
  items!: JobApplicationListItemDto[];

  @ApiProperty({ description: 'Total number of applications matching the filter', example: 5 })
  total!: number;

  @ApiProperty({ description: 'Current page number (1-based)', example: 1 })
  page!: number;

  @ApiProperty({ description: 'Number of items per page', example: 20 })
  limit!: number;
}
