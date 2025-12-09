import { IsString, IsOptional, IsInt, Min, Max, IsEnum, IsDateString, ValidateNested, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum WorkflowStageEnum {
  APPLIED = 'applied',
  SHORTLISTED = 'shortlisted',
  INTERVIEW_SCHEDULED = 'interview_scheduled',
  INTERVIEW_RESCHEDULED = 'interview_rescheduled',
  INTERVIEW_PASSED = 'interview_passed',
  INTERVIEW_FAILED = 'interview_failed',
  ALL = 'all',
}

export enum InterviewTypeEnum {
  IN_PERSON = 'In-person',
  ONLINE = 'Online',
  PHONE = 'Phone',
}

export class GetWorkflowCandidatesDto {
  @ApiPropertyOptional({ enum: WorkflowStageEnum, default: 'all' })
  @IsOptional()
  @IsEnum(WorkflowStageEnum)
  stage?: WorkflowStageEnum;

  @ApiPropertyOptional({ description: 'Filter by job posting ID' })
  @IsOptional()
  @IsString()
  job_posting_id?: string;

  @ApiPropertyOptional({ description: 'Search by name, phone, passport, email' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ default: 1, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ default: 15, minimum: 1, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;

  @ApiPropertyOptional({ enum: ['newest', 'oldest', 'name'], default: 'newest' })
  @IsOptional()
  @IsString()
  sort?: 'newest' | 'oldest' | 'name';
}

export class InterviewDetailsDto {
  @ApiProperty({ description: 'Interview date in AD format (YYYY-MM-DD)' })
  @IsDateString()
  interview_date_ad: string;

  @ApiProperty({ description: 'Interview time (HH:MM)' })
  @IsString()
  interview_time: string;

  @ApiProperty({ description: 'Interview location' })
  @IsString()
  location: string;

  @ApiPropertyOptional({ description: 'Interview duration in minutes', default: 60 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(15)
  @Max(480)
  duration_minutes?: number;

  @ApiPropertyOptional({ description: 'Contact person name' })
  @IsOptional()
  @IsString()
  contact_person?: string;

  @ApiPropertyOptional({ enum: InterviewTypeEnum, default: InterviewTypeEnum.IN_PERSON })
  @IsOptional()
  @IsEnum(InterviewTypeEnum)
  type?: InterviewTypeEnum;
}

export class UpdateCandidateStageDto {
  @ApiProperty({ description: 'Application ID' })
  @IsString()
  application_id: string;

  @ApiProperty({ 
    enum: [
      WorkflowStageEnum.SHORTLISTED,
      WorkflowStageEnum.INTERVIEW_SCHEDULED,
      WorkflowStageEnum.INTERVIEW_PASSED,
    ],
    description: 'New workflow stage'
  })
  @IsEnum([
    WorkflowStageEnum.SHORTLISTED,
    WorkflowStageEnum.INTERVIEW_SCHEDULED,
    WorkflowStageEnum.INTERVIEW_PASSED,
  ])
  new_stage: WorkflowStageEnum;

  @ApiPropertyOptional({ description: 'Notes about the stage change' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ 
    description: 'Interview details (required when moving to interview-scheduled)',
    type: InterviewDetailsDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => InterviewDetailsDto)
  interview_details?: InterviewDetailsDto;
}

export class WorkflowAnalyticsDto {
  @ApiPropertyOptional({ description: 'Start date for analytics (YYYY-MM-DD)' })
  @IsOptional()
  @IsDateString()
  date_from?: string;

  @ApiPropertyOptional({ description: 'End date for analytics (YYYY-MM-DD)' })
  @IsOptional()
  @IsDateString()
  date_to?: string;

  @ApiPropertyOptional({ description: 'Filter by job posting ID' })
  @IsOptional()
  @IsString()
  job_posting_id?: string;
}

export class RescheduleInterviewDto {
  @ApiProperty({ description: 'New interview date in AD format (YYYY-MM-DD)' })
  @IsDateString()
  interview_date_ad: string;

  @ApiProperty({ description: 'New interview time (HH:MM)' })
  @IsString()
  interview_time: string;

  @ApiPropertyOptional({ description: 'New interview location' })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional({ description: 'Notes about rescheduling' })
  @IsOptional()
  @IsString()
  notes?: string;
}
