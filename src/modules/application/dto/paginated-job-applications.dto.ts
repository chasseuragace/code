import { ApiProperty } from '@nestjs/swagger';
import { JobApplicationStatus } from '../job-application.entity';

export class JobApplicationListItemDto {
  @ApiProperty({ description: 'Job application UUID', example: '075ce7d9-fcdb-4f7e-b794-4190f49d729f' })
  id!: string;

  @ApiProperty({ description: 'Candidate UUID the application belongs to', example: '7103d484-19b0-4c62-ae96-256da67a49a4' })
  candidate_id!: string;

  @ApiProperty({ description: 'Job posting UUID the application targets', example: '1e8c9c1a-352c-485d-ac9a-767cbbca4a4c' })
  job_posting_id!: string;

  @ApiProperty({
    description: 'Current status within the application workflow',
    example: 'shortlisted',
    enum: ['applied', 'shortlisted', 'interview_scheduled', 'interview_rescheduled', 'interview_passed', 'interview_failed', 'withdrawn'],
  })
  status!: JobApplicationStatus;

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
