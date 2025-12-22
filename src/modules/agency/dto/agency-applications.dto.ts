import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsInt, Min, Max, IsEnum, IsUUID, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class GetAgencyApplicationsQueryDto {
  @ApiPropertyOptional({
    description: 'Filter by application status',
    enum: ['applied', 'shortlisted', 'interview_scheduled', 'interview_rescheduled', 'interview_passed', 'interview_failed', 'withdrawn'],
    example: 'applied',
  })
  @IsOptional()
  @IsString()
  stage?: string;

  @ApiPropertyOptional({
    description: 'Filter by job country',
    example: 'UAE',
  })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiPropertyOptional({
    description: 'Filter by specific job posting ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsOptional()
  @IsUUID()
  job_posting_id?: string;

  @ApiPropertyOptional({
    description: 'Filter by specific position ID',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  @IsOptional()
  @IsUUID()
  position_id?: string;

  @ApiPropertyOptional({
    description: 'Search across candidate names, phones, emails, job titles, and skills',
    example: 'cook',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Page number (1-based)',
    example: 1,
    default: 1,
    minimum: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
    @IsNumber()
  page?: number;

  @ApiPropertyOptional({
    description: 'Number of items per page',
    example: 20,
    default: 20,
    minimum: 1,
    maximum: 100,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
    @IsNumber()
  limit?: number;

  @ApiPropertyOptional({
    description: 'Field to sort by',
    enum: ['created_at', 'updated_at', 'status', 'applied_at'],
    example: 'created_at',
    default: 'created_at',
  })
  @IsOptional()
  @IsString()
  sort_by?: string;

  @ApiPropertyOptional({
    description: 'Sort order',
    enum: ['asc', 'desc'],
    example: 'desc',
    default: 'desc',
  })
  @IsOptional()
  @IsEnum(['asc', 'desc'])
  sort_order?: 'asc' | 'desc';
}

export class ApplicationItemDto {
  @ApiProperty({
    description: 'Application ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  id: string;

  @ApiProperty({
    description: 'Candidate ID',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  candidate_id: string;

  @ApiProperty({
    description: 'Job posting ID',
    example: '550e8400-e29b-41d4-a716-446655440002',
  })
  job_posting_id: string;

  @ApiProperty({
    description: 'Position ID',
    example: '550e8400-e29b-41d4-a716-446655440003',
  })
  position_id: string;

  @ApiProperty({
    description: 'Application status',
    enum: ['applied', 'shortlisted', 'interview_scheduled', 'interview_rescheduled', 'interview_passed', 'interview_failed', 'withdrawn'],
    example: 'applied',
  })
  status: string;

  @ApiProperty({
    description: 'Priority score based on candidate match (0-100)',
    example: 85,
    minimum: 0,
    maximum: 100,
  })
  priority_score: number;

  @ApiProperty({
    description: 'Application creation date',
    example: '2025-11-29T10:30:00.000Z',
  })
  created_at: Date;

  @ApiProperty({
    description: 'Last update date',
    example: '2025-11-29T12:45:00.000Z',
  })
  updated_at: Date;

  @ApiProperty({
    description: 'Withdrawal date (null if not withdrawn)',
    example: null,
    nullable: true,
  })
  withdrawn_at: Date | null;
}

export class CandidateInfoDto {
  @ApiProperty({
    description: 'Candidate ID',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  id: string;

  @ApiProperty({
    description: 'Candidate full name',
    example: 'John Doe',
  })
  full_name: string;

  @ApiProperty({
    description: 'Candidate phone number',
    example: '+977-9812345678',
  })
  phone: string;

  @ApiProperty({
    description: 'Candidate email',
    example: 'john.doe@example.com',
    nullable: true,
  })
  email: string | null;

  @ApiProperty({
    description: 'Candidate skills',
    example: ['Cooking', 'Arabic Cuisine', 'Food Safety'],
    type: [String],
  })
  skills: string[];

  @ApiPropertyOptional({
    description: 'Candidate age',
    example: 28,
    nullable: true,
  })
  age?: number | null;

  @ApiProperty({
    description: 'Candidate gender',
    example: 'male',
    nullable: true,
  })
  gender: string | null;
}

export class JobInfoDto {
  @ApiProperty({
    description: 'Job posting ID',
    example: '550e8400-e29b-41d4-a716-446655440002',
  })
  id: string;

  @ApiProperty({
    description: 'Job posting title',
    example: 'Cook - UAE Project',
  })
  posting_title: string;

  @ApiProperty({
    description: 'Company name',
    example: 'Al Manara Restaurant',
  })
  company_name: string;

  @ApiProperty({
    description: 'Job country',
    example: 'UAE',
  })
  country: string;

  @ApiProperty({
    description: 'Job city',
    example: 'Dubai',
    nullable: true,
  })
  city: string | null;
}

export class PositionInfoDto {
  @ApiProperty({
    description: 'Position ID',
    example: '550e8400-e29b-41d4-a716-446655440003',
  })
  id: string;

  @ApiProperty({
    description: 'Position title',
    example: 'Cook',
  })
  title: string;

  @ApiProperty({
    description: 'Monthly salary amount',
    example: 1200,
  })
  monthly_salary_amount: number;

  @ApiProperty({
    description: 'Salary currency',
    example: 'AED',
  })
  salary_currency: string;

  @ApiProperty({
    description: 'Total vacancies',
    example: 5,
  })
  total_vacancies: number;
}

export class PaginationDto {
  @ApiProperty({
    description: 'Current page number',
    example: 1,
  })
  page: number;

  @ApiProperty({
    description: 'Items per page',
    example: 20,
  })
  limit: number;

  @ApiProperty({
    description: 'Total number of items',
    example: 45,
  })
  total: number;

  @ApiProperty({
    description: 'Total number of pages',
    example: 3,
  })
  totalPages: number;

  @ApiProperty({
    description: 'Whether there is a next page',
    example: true,
  })
  hasNext: boolean;

  @ApiProperty({
    description: 'Whether there is a previous page',
    example: false,
  })
  hasPrev: boolean;
}

export class PerformanceDto {
  @ApiProperty({
    description: 'Total load time in milliseconds',
    example: 120,
  })
  loadTime: number;

  @ApiProperty({
    description: 'Database query time in milliseconds',
    example: 85,
  })
  queryTime: number;
}

export class GetAgencyApplicationsResponseDto {
  @ApiProperty({
    description: 'Array of applications (without duplicated candidate/job/position data)',
    type: [ApplicationItemDto],
  })
  applications: ApplicationItemDto[];

  @ApiProperty({
    description: 'Candidate lookup map (key: candidate_id)',
    example: {
      '550e8400-e29b-41d4-a716-446655440001': {
        id: '550e8400-e29b-41d4-a716-446655440001',
        full_name: 'John Doe',
        phone: '+977-9812345678',
        email: 'john.doe@example.com',
        skills: ['Cooking', 'Arabic Cuisine'],
        age: 28,
        gender: 'male',
      },
    },
  })
  candidates: Record<string, CandidateInfoDto>;

  @ApiProperty({
    description: 'Job posting lookup map (key: job_posting_id)',
    example: {
      '550e8400-e29b-41d4-a716-446655440002': {
        id: '550e8400-e29b-41d4-a716-446655440002',
        posting_title: 'Cook - UAE Project',
        company_name: 'Al Manara Restaurant',
        country: 'UAE',
        city: 'Dubai',
      },
    },
  })
  jobs: Record<string, JobInfoDto>;

  @ApiProperty({
    description: 'Position lookup map (key: position_id)',
    example: {
      '550e8400-e29b-41d4-a716-446655440003': {
        id: '550e8400-e29b-41d4-a716-446655440003',
        title: 'Cook',
        monthly_salary_amount: 1200,
        salary_currency: 'AED',
        total_vacancies: 5,
      },
    },
  })
  positions: Record<string, PositionInfoDto>;

  @ApiProperty({
    description: 'Pagination metadata',
    type: PaginationDto,
  })
  pagination: PaginationDto;

  @ApiProperty({
    description: 'Performance metrics',
    type: PerformanceDto,
  })
  performance: PerformanceDto;
}

export class AgencyApplicationStatisticsDto {
  @ApiProperty({
    description: 'Total number of applications',
    example: 45,
  })
  total: number;

  @ApiProperty({
    description: 'Application counts by status',
    example: {
      applied: 20,
      shortlisted: 15,
      interview_scheduled: 10,
    },
  })
  by_status: Record<string, number>;

  @ApiProperty({
    description: 'Application counts by country',
    example: {
      UAE: 25,
      Qatar: 20,
    },
  })
  by_country: Record<string, number>;
}

export class AgencyJobCountriesResponseDto {
  @ApiProperty({
    description: 'List of unique countries from agency job postings',
    example: ['UAE', 'Qatar', 'Saudi Arabia'],
    type: [String],
  })
  countries: string[];
}
