import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID, IsDateString, IsInt, Min, Max, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { AuditCategories } from '../audit.entity';

export class AuditQueryDto {
  @ApiPropertyOptional({ description: 'Filter by user ID' })
  @IsOptional()
  @IsUUID()
  user_id?: string;

  @ApiPropertyOptional({ description: 'Filter by agency ID' })
  @IsOptional()
  @IsUUID()
  agency_id?: string;

  @ApiPropertyOptional({ 
    description: 'Filter by category',
    enum: Object.values(AuditCategories),
  })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ description: 'Filter by action (e.g., apply_job, shortlist_candidate)' })
  @IsOptional()
  @IsString()
  action?: string;

  @ApiPropertyOptional({ description: 'Filter by resource type (job_application, job_posting, etc.)' })
  @IsOptional()
  @IsString()
  resource_type?: string;

  @ApiPropertyOptional({ description: 'Filter by specific resource ID' })
  @IsOptional()
  @IsUUID()
  resource_id?: string;

  @ApiPropertyOptional({ 
    description: 'Filter by outcome',
    enum: ['success', 'failure', 'denied'],
  })
  @IsOptional()
  @IsEnum(['success', 'failure', 'denied'])
  outcome?: string;

  @ApiPropertyOptional({ description: 'Start of time range (ISO 8601)' })
  @IsOptional()
  @IsDateString()
  start_date?: string;

  @ApiPropertyOptional({ description: 'End of time range (ISO 8601)' })
  @IsOptional()
  @IsDateString()
  end_date?: string;

  @ApiPropertyOptional({ description: 'Page number', default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Items per page', default: 50 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 50;
}

export class AuditLogResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  created_at: Date;

  @ApiProperty()
  method: string;

  @ApiProperty()
  path: string;

  @ApiPropertyOptional()
  correlation_id?: string;

  @ApiPropertyOptional()
  user_id?: string;

  @ApiPropertyOptional()
  user_role?: string;

  @ApiPropertyOptional()
  agency_id?: string;

  @ApiProperty()
  action: string;

  @ApiProperty()
  category: string;

  @ApiPropertyOptional()
  resource_type?: string;

  @ApiPropertyOptional()
  resource_id?: string;

  @ApiProperty()
  outcome: string;

  @ApiPropertyOptional()
  status_code?: number;

  @ApiPropertyOptional()
  duration_ms?: number;

  @ApiPropertyOptional()
  error_message?: string;
}

export class AuditQueryResponseDto {
  @ApiProperty({ type: [AuditLogResponseDto] })
  items: AuditLogResponseDto[];

  @ApiProperty()
  total: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;

  @ApiProperty()
  filters: Partial<AuditQueryDto>;
}

export class AuditCategorySummaryDto {
  @ApiProperty({ example: { auth: 45, application: 120, job_posting: 15 } })
  [key: string]: number;
}
