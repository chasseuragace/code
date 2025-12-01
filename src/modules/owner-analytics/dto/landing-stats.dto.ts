import { ApiProperty } from '@nestjs/swagger';

export class LandingStatsDto {
  @ApiProperty({
    description: 'Total number of registered agencies',
    example: 234,
  })
  registered_agencies: number;

  @ApiProperty({
    description: 'Number of active job openings',
    example: 1892,
  })
  active_job_openings: number;

  @ApiProperty({
    description: 'Number of cities/countries covered',
    example: 50,
  })
  cities_covered: number;

  @ApiProperty({
    description: 'Total number of interviews scheduled',
    example: 456,
  })
  total_interviews: number;

  @ApiProperty({
    description: 'New job postings in the last 7 days',
    example: 23,
  })
  new_jobs_this_week: number;

  @ApiProperty({
    description: 'Total successful placements (candidates who passed interviews)',
    example: 156,
  })
  successful_placements: number;

  @ApiProperty({
    description: 'Timestamp when statistics were generated',
    example: '2024-12-01T10:30:00.000Z',
  })
  generated_at: string;
}
