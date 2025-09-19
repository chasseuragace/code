import { ApiProperty } from '@nestjs/swagger';
import { JobApplicationStatus } from '../job-application.entity';

export class ApplicationAnalyticsDto {
  @ApiProperty({ description: 'Total number of applications created by the candidate' })
  total!: number;

  @ApiProperty({ description: 'Number of active applications (non-terminal statuses)' })
  active!: number;

  @ApiProperty({
    description: 'Counts per status for all workflow stages',
    additionalProperties: { type: 'number' },
    example: {
      applied: 1,
      shortlisted: 0,
      interview_scheduled: 0,
      interview_rescheduled: 0,
      interview_passed: 0,
      interview_failed: 0,
      withdrawn: 0,
    },
  })
  by_status!: Record<JobApplicationStatus, number>;
}
