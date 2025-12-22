import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID, IsDateString, IsInt, Min, Max, IsEnum, IsNumber, IsArray, ValidateNested } from 'class-validator';
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
    @IsString()
  start_date?: string;

  @ApiPropertyOptional({ description: 'End of time range (ISO 8601)' })
  @IsOptional()
  @IsDateString()
    @IsString()
  end_date?: string;

  @ApiPropertyOptional({ description: 'Page number', default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
    @IsNumber()
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Items per page', default: 50 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
    @IsNumber()
  limit?: number = 50;
}

export class AuditLogResponseDto {
  
  @ApiProperty({ description: 'Id', example: 'example' })
    id: string;

  
  @ApiProperty({ description: 'Created at', example: new Date('2024-01-01') })
    created_at: Date;

  
  @ApiProperty({ description: 'Method', example: 'example' })
    method: string;

  
  @ApiProperty({ description: 'Path', example: 'example' })
    path: string;

  
  @ApiPropertyOptional({ description: 'Correlation id', example: 'example' })
    correlation_id?: string;

  
  @ApiPropertyOptional({ description: 'User id', example: 'example' })
    user_id?: string;

  
  @ApiPropertyOptional({ description: 'User role', example: 'example' })
    user_role?: string;

  
  @ApiPropertyOptional({ description: 'Agency id', example: 'example' })
    agency_id?: string;

  
  @ApiProperty({ description: 'Action', example: 'example' })
    action: string;

  
  @ApiProperty({ description: 'Category', example: 'example' })
    category: string;

  
  @ApiPropertyOptional({ description: 'Resource type', example: 'example' })
    resource_type?: string;

  
  @ApiPropertyOptional({ description: 'Resource id', example: 'example' })
    resource_id?: string;

  
  @ApiProperty({ description: 'Outcome', example: 'example' })
    outcome: string;

  
  @ApiPropertyOptional({ description: 'Status code', example: 0 })
    status_code?: number;

  
  @ApiPropertyOptional({ description: 'Duration ms', example: 0 })
    duration_ms?: number;

  
  @ApiPropertyOptional({ description: 'Error message', example: 'example' })
    error_message?: string;
}

export class AuditQueryResponseDto {
  
  @ApiProperty({ description: 'Items', type: [AuditLogResponseDto] })
    @IsArray()
    @IsArray()
    items: AuditLogResponseDto[];

  
  @ApiProperty({ description: 'Total', example: 10 })
    @IsNumber()
    total: number;

  
  @ApiProperty({ description: 'Page', example: 25 })
    @IsNumber()
    page: number;

  
  @ApiProperty({ description: 'Limit', example: 0 })
    @IsNumber()
    limit: number;

  
  @ApiPropertyOptional({ description: 'Filters', example: null })
    @IsOptional()
    @ValidateNested()
    @Type(() => AuditQueryDto)
    filters?: Partial<AuditQueryDto>;
}

export class AuditCategorySummaryDto {
  [key: string]: number;
}
