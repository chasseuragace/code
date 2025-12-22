import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsDateString, IsUUID } from 'class-validator';

export class AgencyDashboardQueryDto {
  @ApiPropertyOptional({
    description: 'Start date for filtering (ISO 8601)',
    example: '2024-11-01T00:00:00.000Z',
  })
  @IsOptional()
  @IsDateString()
    @IsString()
  startDate?: string;

  @ApiPropertyOptional({
    description: 'End date for filtering (ISO 8601)',
    example: '2024-12-01T23:59:59.999Z',
  })
  @IsOptional()
  @IsDateString()
    @IsString()
  endDate?: string;

  @ApiPropertyOptional({
    description: 'Filter by specific country',
    example: 'Saudi Arabia',
  })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiPropertyOptional({
    description: 'Filter by specific job posting ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsUUID()
  jobId?: string;
}

export class JobsAnalytics {
  @ApiProperty({ description: 'Total jobs posted by agency (all time)', example: 45 })
  total: number;

  @ApiProperty({ description: 'Active jobs', example: 38 })
  active: number;

  @ApiProperty({ description: 'Inactive jobs', example: 7 })
  inactive: number;

  @ApiProperty({ description: 'Jobs in draft status', example: 0 })
  drafts: number;

  @ApiProperty({ description: 'Jobs created in date range', example: 3 })
  recentInRange: number;

  @ApiProperty({ description: 'Open jobs created or updated in timeframe', example: 5 })
  openInTimeframe: number;

  @ApiProperty({ description: 'Jobs created in timeframe', example: 3 })
  createdInTimeframe: number;

  @ApiProperty({ description: 'Draft jobs created or updated in timeframe', example: 2 })
  draftInTimeframe: number;
}

export class ApplicationsAnalytics {
  @ApiProperty({ description: 'Total applications', example: 268 })
  total: number;

  @ApiProperty({ description: 'Applications by current status', example: { applied: 145, shortlisted: 67 } })
  byStatus: Record<string, number>;

  @ApiProperty({ description: 'Applications by status change in timeframe', example: { applied: 34, shortlisted: 12 } })
  byStatusInTimeframe: Record<string, number>;

  @ApiProperty({ description: 'Unique jobs with applications', example: 23 })
  uniqueJobs: number;

  @ApiProperty({ description: 'Applications in date range', example: 34 })
  recentInRange: number;
}

export class TodayInterviewStatus {
  @ApiProperty({ description: 'Interviews passed today', example: 2 })
  pass: number;

  @ApiProperty({ description: 'Interviews failed today', example: 0 })
  fail: number;
}

export class InterviewsAnalytics {
  @ApiProperty({ description: 'Total interviews scheduled', example: 54 })
  total: number;

  @ApiProperty({ description: 'Pending interviews', example: 8 })
  pending: number;

  @ApiProperty({ description: 'Completed interviews', example: 44 })
  completed: number;

  @ApiProperty({ description: 'Passed interviews', example: 25 })
  passed: number;

  @ApiProperty({ description: 'Failed interviews', example: 19 })
  failed: number;

  @ApiProperty({ description: 'Pass rate percentage', example: 56.8 })
  passRate: number;

  @ApiProperty({ description: 'Interviews in date range', example: 8 })
  recentInRange: number;

  @ApiProperty({ description: 'Today\'s interview status', type: TodayInterviewStatus })
  todayStatus: TodayInterviewStatus;
}

export class AgencyDashboardAnalyticsDto {
  @ApiProperty({ description: 'Jobs analytics', type: JobsAnalytics })
  jobs: JobsAnalytics;

  @ApiProperty({ description: 'Applications analytics', type: ApplicationsAnalytics })
  applications: ApplicationsAnalytics;

  @ApiProperty({ description: 'Interviews analytics', type: InterviewsAnalytics })
  interviews: InterviewsAnalytics;

  @ApiProperty({ description: 'Available countries for filtering', type: [String] })
  availableCountries: string[];

  @ApiProperty({ description: 'Available jobs for filtering', type: [Object] })
  availableJobs: Array<{ id: string; title: string; country: string }>;

  @ApiProperty({ description: 'Timestamp when data was generated', example: '2024-12-01T14:26:18.000Z' })
  generatedAt: string;
}
