import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber, IsEnum, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { JobDetailsDto, PositionDto, AgencyLiteDto, EmployerLiteDto } from './job-details.dto';

export class JobSearchQueryDto {
  @ApiProperty({ 
    required: false, 
    description: 'Search keyword across job title, position title, employer name, agency name',
    example: 'electrician'
  })
  @IsOptional()
  @IsString()
  keyword?: string;

  @ApiProperty({ 
    required: false, 
    description: 'Filter by country (case-insensitive)',
    example: 'UAE'
  })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiProperty({ 
    required: false, 
    type: Number,
    description: 'Minimum salary amount',
    example: 2000
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  min_salary?: number;

  @ApiProperty({ 
    required: false, 
    type: Number,
    description: 'Maximum salary amount',
    example: 5000
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  max_salary?: number;

  @ApiProperty({ 
    required: false, 
    description: 'Currency for salary filtering',
    example: 'AED',
    enum: ['AED', 'USD', 'NPR', 'QAR', 'SAR', 'KWD', 'BHD', 'OMR']
  })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiProperty({ 
    required: false, 
    type: Number,
    description: 'Page number for pagination',
    example: 1,
    default: 1
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number;

  @ApiProperty({ 
    required: false, 
    type: Number,
    description: 'Number of items per page',
    example: 10,
    default: 10
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number;

  @ApiProperty({ 
    required: false, 
    enum: ['posted_at', 'salary', 'relevance'],
    description: 'Sort by field',
    example: 'posted_at',
    default: 'posted_at'
  })
  @IsOptional()
  @IsEnum(['posted_at', 'salary', 'relevance'])
  sort_by?: 'posted_at' | 'salary' | 'relevance';

  @ApiProperty({ 
    required: false, 
    enum: ['asc', 'desc'],
    description: 'Sort order',
    example: 'desc',
    default: 'desc'
  })
  @IsOptional()
  @IsEnum(['asc', 'desc'])
  order?: 'asc' | 'desc';
}

export class JobSearchItemDto {
  @ApiProperty({ description: 'Job posting ID', example: 'uuid-v4-string' })
  id!: string;

  @ApiProperty({ description: 'Job posting title', example: 'Senior Electrical Technician - Dubai Project' })
  posting_title!: string;

  @ApiProperty({ description: 'Country', example: 'UAE' })
  country!: string;

  @ApiProperty({ description: 'City', example: 'Dubai', required: false, nullable: true })
  city?: string | null;

  @ApiProperty({ description: 'Posting date', example: '2024-01-15T10:30:00Z', required: false, nullable: true })
  posting_date_ad?: string | Date | null;

  @ApiProperty({ type: EmployerLiteDto, required: false, nullable: true })
  employer?: EmployerLiteDto | null;

  @ApiProperty({ type: AgencyLiteDto, required: false, nullable: true })
  agency?: AgencyLiteDto | null;

  @ApiProperty({ 
    type: [PositionDto], 
    description: 'Available positions with salary and vacancy information'
  })
  positions!: PositionDto[];
}

export class JobSearchFiltersDto {
  @ApiProperty({ required: false, nullable: true, description: 'Country filter applied' })
  country?: string | null;

  @ApiProperty({ required: false, nullable: true, description: 'Minimum salary filter applied' })
  min_salary?: number | null;

  @ApiProperty({ required: false, nullable: true, description: 'Maximum salary filter applied' })
  max_salary?: number | null;

  @ApiProperty({ required: false, nullable: true, description: 'Currency filter applied' })
  currency?: string | null;
}

export class JobSearchMetaDto {
  @ApiProperty({ required: false, nullable: true, description: 'Search keyword used' })
  keyword?: string | null;

  @ApiProperty({ type: JobSearchFiltersDto, description: 'Filters applied to the search' })
  filters!: JobSearchFiltersDto;
}

export class JobSearchResponseDto {
  @ApiProperty({ 
    type: [JobSearchItemDto], 
    description: 'Array of job search results'
  })
  data!: JobSearchItemDto[];

  @ApiProperty({ 
    type: Number, 
    description: 'Total number of jobs matching the search criteria',
    example: 42
  })
  total!: number;

  @ApiProperty({ 
    type: Number, 
    description: 'Current page number',
    example: 1
  })
  page!: number;

  @ApiProperty({ 
    type: Number, 
    description: 'Number of items per page',
    example: 10
  })
  limit!: number;

  @ApiProperty({ 
    type: JobSearchMetaDto, 
    description: 'Search metadata including keyword and filters applied'
  })
  search!: JobSearchMetaDto;
}
