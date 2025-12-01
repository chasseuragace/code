import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, IsArray, IsEnum, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class GetJobCandidatesQueryDto {
  @ApiProperty({ 
    description: 'Application stage filter',
    enum: ['applied', 'shortlisted', 'interview_scheduled', 'interview_rescheduled', 'interview_passed', 'interview_failed'],
    example: 'applied'
  })
  @IsEnum(['applied', 'shortlisted', 'interview_scheduled', 'interview_rescheduled', 'interview_passed', 'interview_failed'])
  stage: string;

  @ApiPropertyOptional({ 
    description: 'Number of candidates to return (default: 10, max: 100)',
    example: 10,
    minimum: 1,
    maximum: 100
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @ApiPropertyOptional({ 
    description: 'Pagination offset (default: 0)',
    example: 0,
    minimum: 0
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  offset?: number = 0;

  @ApiPropertyOptional({ 
    description: 'Comma-separated list of skills for filtering (AND logic)',
    example: 'Cooking,English,Fast Food'
  })
  @IsOptional()
  @IsString()
  skills?: string;

  @ApiPropertyOptional({ 
    description: 'Sort field (default: priority_score)',
    enum: ['priority_score', 'applied_at', 'name'],
    example: 'priority_score'
  })
  @IsOptional()
  @IsEnum(['priority_score', 'applied_at', 'name'])
  sort_by?: string = 'priority_score';

  @ApiPropertyOptional({ 
    description: 'Sort order (default: desc)',
    enum: ['asc', 'desc'],
    example: 'desc'
  })
  @IsOptional()
  @IsEnum(['asc', 'desc'])
  sort_order?: string = 'desc';

  @ApiPropertyOptional({ 
    description: 'Interview date filter (only for interview_scheduled stage)',
    enum: ['today', 'tomorrow', 'unattended', 'all'],
    example: 'today'
  })
  @IsOptional()
  @IsEnum(['today', 'tomorrow', 'unattended', 'all'])
  interview_filter?: string;

  @ApiPropertyOptional({ 
    description: 'Date alias for quick filtering (takes precedence over date_from/date_to)',
    enum: ['today', 'tomorrow', 'this_week', 'next_week', 'this_month'],
    example: 'this_week'
  })
  @IsOptional()
  @IsEnum(['today', 'tomorrow', 'this_week', 'next_week', 'this_month'])
  date_alias?: string;

  @ApiPropertyOptional({ 
    description: 'Start date for date range filter (YYYY-MM-DD)',
    example: '2024-01-01'
  })
  @IsOptional()
  @IsString()
  date_from?: string;

  @ApiPropertyOptional({ 
    description: 'End date for date range filter (YYYY-MM-DD)',
    example: '2024-01-31'
  })
  @IsOptional()
  @IsString()
  date_to?: string;

  @ApiPropertyOptional({ 
    description: 'Search query for candidate name, phone, or interviewer',
    example: 'John Doe'
  })
  @IsOptional()
  @IsString()
  search?: string;
}

export class CandidateDocumentDto {
  @ApiProperty({ description: 'Document ID', example: 'doc-uuid' })
  id: string;

  @ApiProperty({ description: 'Document name', example: 'Resume.pdf' })
  name: string;

  @ApiProperty({ description: 'Document type', example: 'resume' })
  type: string;

  @ApiProperty({ description: 'Document URL', example: '/uploads/documents/resume.pdf' })
  url: string;
}

export class JobCandidateDto {
  @ApiProperty({ description: 'Candidate ID', example: 'candidate-uuid' })
  id: string;

  @ApiProperty({ description: 'Candidate full name', example: 'Ram Bahadur Thapa' })
  name: string;

  @ApiProperty({ description: 'Priority/fitness score (0-100)', example: 85, minimum: 0, maximum: 100 })
  priority_score: number;

  @ApiProperty({ description: 'Location', example: { city: 'Kathmandu', country: 'Nepal' } })
  location: {
    city: string;
    country: string;
  };

  @ApiProperty({ description: 'Phone number', example: '+977-9841234567' })
  phone: string;

  @ApiProperty({ description: 'Email address', example: 'ram.thapa@example.com' })
  email: string;

  @ApiProperty({ description: 'Years of experience', example: '5 years' })
  experience: string;

  @ApiProperty({ description: 'Skills array', example: ['Cooking', 'English', 'Fast Food'], type: [String] })
  skills: string[];

  @ApiProperty({ description: 'Application date', example: '2025-08-25T10:30:00.000Z' })
  applied_at: string;

  @ApiProperty({ description: 'Application ID', example: 'application-uuid' })
  application_id: string;

  @ApiPropertyOptional({ description: 'Attached documents', type: [CandidateDocumentDto] })
  documents?: CandidateDocumentDto[];

  @ApiPropertyOptional({ 
    description: 'Interview details (if scheduled)',
    example: {
      id: 'interview-uuid',
      scheduled_at: '2025-12-01T00:00:00.000Z',
      time: '10:00:00',
      duration: 60,
      location: 'Office',
      interviewer: 'HR Manager',
      notes: 'Bring original documents',
      required_documents: ['passport', 'cv']
    }
  })
  interview?: {
    id: string;
    scheduled_at: string | null;
    time: string | null;
    duration: number;
    location: string | null;
    interviewer: string | null;
    notes: string | null;
    required_documents: string[];
  } | null;
}

export class PaginationDto {
  @ApiProperty({ description: 'Total number of candidates', example: 45 })
  total: number;

  @ApiProperty({ description: 'Current limit', example: 10 })
  limit: number;

  @ApiProperty({ description: 'Current offset', example: 0 })
  offset: number;

  @ApiProperty({ description: 'Has more results', example: true })
  has_more: boolean;
}

export class GetJobCandidatesResponseDto {
  @ApiProperty({ description: 'Array of candidates', type: [JobCandidateDto] })
  candidates: JobCandidateDto[];

  @ApiProperty({ description: 'Pagination metadata', type: PaginationDto })
  pagination: PaginationDto;
}

export class BulkShortlistDto {
  @ApiProperty({ 
    description: 'Array of candidate IDs to shortlist',
    example: ['candidate-uuid-1', 'candidate-uuid-2'],
    type: [String]
  })
  @IsArray()
  @IsString({ each: true })
  candidate_ids: string[];
}

export class BulkRejectDto {
  @ApiProperty({ 
    description: 'Array of candidate IDs to reject',
    example: ['candidate-uuid-1', 'candidate-uuid-2'],
    type: [String]
  })
  @IsArray()
  @IsString({ each: true })
  candidate_ids: string[];

  @ApiPropertyOptional({ 
    description: 'Reason for rejection',
    example: 'Does not meet minimum requirements'
  })
  @IsOptional()
  @IsString()
  reason?: string;
}

export class BulkActionResponseDto {
  @ApiProperty({ description: 'Operation success status', example: true })
  success: boolean;

  @ApiProperty({ description: 'Number of candidates updated', example: 5 })
  updated_count: number;

  @ApiPropertyOptional({ 
    description: 'Array of candidate IDs that failed to update',
    example: ['candidate-uuid-3'],
    type: [String]
  })
  failed?: string[];

  @ApiPropertyOptional({ 
    description: 'Error details for failed operations',
    example: { 'candidate-uuid-3': 'Candidate not found' }
  })
  errors?: Record<string, string>;
}

export class JobDetailsWithAnalyticsDto {
  @ApiProperty({ description: 'Job posting ID', example: 'job-uuid' })
  id: string;

  @ApiProperty({ description: 'Job title', example: 'Cook' })
  title: string;

  @ApiProperty({ description: 'Company name', example: 'Al Manara Restaurant' })
  company: string;

  @ApiProperty({ description: 'Location', example: { city: 'Dubai', country: 'UAE' } })
  location: {
    city: string;
    country: string;
  };

  @ApiProperty({ description: 'Posted date', example: '2025-08-01T00:00:00.000Z' })
  posted_date: string;

  @ApiProperty({ description: 'Job description', example: 'Looking for experienced cook...' })
  description: string;

  @ApiProperty({ description: 'Job requirements', example: ['5 years experience', 'English speaking'], type: [String] })
  requirements: string[];

  @ApiProperty({ description: 'Skills/tags', example: ['Cooking', 'Restaurant', 'Arabic Cuisine'], type: [String] })
  tags: string[];

  @ApiProperty({ description: 'Job posting status - true if accepting applications, false if closed', example: true })
  is_active: boolean;

  @ApiProperty({ description: 'Analytics summary' })
  analytics: {
    view_count: number;
    total_applicants: number;
    shortlisted_count: number;
    scheduled_count: number;
    passed_count: number;
  };
}

export class BulkScheduleInterviewDto {
  @ApiProperty({ 
    description: 'Array of candidate IDs to schedule interviews for',
    example: ['candidate-uuid-1', 'candidate-uuid-2'],
    type: [String]
  })
  @IsArray()
  @IsString({ each: true })
  candidate_ids: string[];

  @ApiProperty({ description: 'Interview date in AD format', example: '2025-12-01' })
  @IsString()
  interview_date_ad: string;

  @ApiPropertyOptional({ description: 'Interview date in BS format', example: '2082-08-15' })
  @IsOptional()
  @IsString()
  interview_date_bs?: string;

  @ApiProperty({ description: 'Interview time', example: '10:00 AM' })
  @IsString()
  interview_time: string;

  @ApiPropertyOptional({ 
    description: 'Interview duration in minutes', 
    example: 60,
    default: 60,
    minimum: 15,
    maximum: 480
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(15)
  @Max(480)
  duration_minutes?: number;

  @ApiProperty({ description: 'Interview location', example: 'Office' })
  @IsString()
  location: string;

  @ApiProperty({ description: 'Contact person name', example: 'HR Manager' })
  @IsString()
  contact_person: string;

  @ApiPropertyOptional({ 
    description: 'Required documents', 
    example: ['passport', 'cv'],
    type: [String]
  })
  @IsOptional()
  @IsArray()
  required_documents?: string[];

  @ApiPropertyOptional({ description: 'Additional notes' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ description: 'User ID who is scheduling' })
  @IsOptional()
  @IsString()
  updatedBy?: string;
}


// Interview Statistics DTO
export class InterviewStatsDto {
  @ApiProperty({ description: 'Total scheduled interviews', example: 45 })
  total_scheduled: number;

  @ApiProperty({ description: 'Interviews scheduled for today', example: 5 })
  today: number;

  @ApiProperty({ description: 'Interviews scheduled for tomorrow', example: 3 })
  tomorrow: number;

  @ApiProperty({ description: 'Unattended interviews (no-show)', example: 2 })
  unattended: number;

  @ApiProperty({ description: 'Completed interviews', example: 30 })
  completed: number;

  @ApiProperty({ description: 'Passed interviews', example: 22 })
  passed: number;

  @ApiProperty({ description: 'Failed interviews', example: 8 })
  failed: number;

  @ApiProperty({ description: 'Cancelled interviews', example: 3 })
  cancelled: number;
}
