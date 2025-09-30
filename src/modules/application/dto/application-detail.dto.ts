import { ApiProperty } from '@nestjs/swagger';
import { JobApplicationStatus, JobApplicationHistoryEntry } from '../job-application.entity';

export class ApplicationDetailDto {
  @ApiProperty({
    description: 'UUID of the application',
    example: '075ce7d9-fcdb-4f7e-b794-4190f49d729f',
    format: 'uuid',
  })
  id: string;

  @ApiProperty({
    description: 'UUID of the candidate',
    example: '7103d484-19b0-4c62-ae96-256da67a49a4',
    format: 'uuid',
  })
  candidate_id: string;

  @ApiProperty({
    description: 'UUID of the job posting',
    example: '1e8c9c1a-352c-485d-ac9a-767cbbca4a4c',
    format: 'uuid',
  })
  job_posting_id: string;

  @ApiProperty({
    description: 'Current status of the application',
    example: 'interview_scheduled',
    enum: ['applied', 'shortlisted', 'interview_scheduled', 'interview_rescheduled', 'interview_passed', 'interview_failed', 'withdrawn'],
  })
  status: JobApplicationStatus;

  @ApiProperty({
    description: 'Complete history of status changes in chronological order',
    example: [
      {
        prev_status: null,
        next_status: 'applied',
        updated_at: '2025-09-20T10:00:00Z',
        updated_by: 'candidate-mobile-app',
        note: 'Initial application',
      },
      {
        prev_status: 'applied',
        next_status: 'shortlisted',
        updated_at: '2025-09-22T14:30:00Z',
        updated_by: 'agency-staff-123',
        note: 'Good qualifications',
      },
    ],
    type: 'array',
    items: {
      type: 'object',
      properties: {
        prev_status: { type: 'string', nullable: true },
        next_status: { type: 'string' },
        updated_at: { type: 'string', format: 'date-time' },
        updated_by: { type: 'string', nullable: true },
        note: { type: 'string', nullable: true },
        corrected: { type: 'boolean', nullable: true },
      },
    },
  })
  history_blob: JobApplicationHistoryEntry[];

  @ApiProperty({
    description: 'Timestamp when application was withdrawn (null if not withdrawn)',
    example: null,
    nullable: true,
    type: 'string',
    format: 'date-time',
  })
  withdrawn_at: Date | null;

  @ApiProperty({
    description: 'Timestamp when application was created',
    example: '2025-09-20T10:00:00Z',
    type: 'string',
    format: 'date-time',
  })
  created_at: Date;

  @ApiProperty({
    description: 'Timestamp when application was last updated',
    example: '2025-09-22T14:30:00Z',
    type: 'string',
    format: 'date-time',
  })
  updated_at: Date;
}
