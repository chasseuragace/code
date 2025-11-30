import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsInt, IsOptional, IsString, Max, Min, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class ListAgencyJobPostingsQueryDto {
  @ApiPropertyOptional({ description: 'Free-text search across title, ref ids, employer, agency, position title', example: 'Welder' })
  @IsOptional()
  @IsString()
  q?: string;

  @ApiPropertyOptional({ description: 'Filter by posting title (ILIKE)', example: 'Skilled Workers' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({ description: 'Filter by reference id (lt_number or chalani_number) (ILIKE)', example: 'LT-0123' })
  @IsOptional()
  @IsString()
  refid?: string;

  @ApiPropertyOptional({ description: 'Filter by employer company name (ILIKE)', example: 'ACME' })
  @IsOptional()
  @IsString()
  employer_name?: string;

  @ApiPropertyOptional({ description: 'Filter by agency name (ILIKE). Redundant when filtering by a single license', example: 'Global Recruiters' })
  @IsOptional()
  @IsString()
  agency_name?: string;

  @ApiPropertyOptional({ description: 'Filter by country (ILIKE). Uses job posting country (not agency address). Accepts code or name.', example: 'UAE' })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiPropertyOptional({ description: 'Filter by position title within posting positions (ILIKE)', example: 'Welder' })
  @IsOptional()
  @IsString()
  position_title?: string;

  
  @IsOptional()
  @IsEnum(['interviews_today', 'shortlisted', 'applicants', 'posted_at'])
    @ApiPropertyOptional({ description: 'Sort by', enum: ['interviews_today', 'shortlisted', 'applicants', 'posted_at'], default: 'posted_at', example: 'posted_at' })
  sort_by?: 'interviews_today' | 'shortlisted' | 'applicants' | 'posted_at';

  
  @IsOptional()
  @IsEnum(['asc', 'desc'])
    @ApiPropertyOptional({ description: 'Order', enum: ['asc', 'desc'], default: 'desc', example: 'desc' })
  order?: 'asc' | 'desc';

  
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
    @IsNumber()
    @ApiPropertyOptional({ description: 'Page', default: 1, minimum: 1, example: 1 })
  page?: number = 1;

  
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
    @IsNumber()
    @ApiPropertyOptional({ description: 'Limit', default: 10, minimum: 1, maximum: 100, example: 10 })
  limit?: number = 10;
}

export class AgencyJobPostingListItemDto {
  
  @ApiProperty({ description: 'Id', format: 'uuid', example: 'd841e933-1a14-4602-97e2-c51c9e5d8cf2' })
    id!: string;

  
  @ApiProperty({ description: 'Posting title', example: 'Skilled Workers for ACME Co.' })
    posting_title!: string;

  
  @ApiProperty({ description: 'City', nullable: true, example: 'Dubai' })
    city!: string | null;

  
  @ApiProperty({ description: 'Country', example: 'UAE' })
    country!: string;

  @ApiProperty({ description: 'Employer company name', example: 'ACME Co.' })
  employer_name!: string | null;

  @ApiProperty({ description: 'Posting agency name', example: 'Global Recruiters' })
  agency_name!: string | null;

  @ApiProperty({ description: 'Total application count', example: 156 })
  applicants_count!: number;

  @ApiProperty({ description: 'Shortlisted application count', example: 45 })
  shortlisted_count!: number;

  @ApiProperty({ description: 'Total interviews count for this posting', example: 32 })
  interviews_count!: number;

  @ApiProperty({ description: "Interviews scheduled for today (date in server's timezone)", example: 5 })
  interviews_today_count!: number;

  @ApiProperty({ description: 'Posting date (AD) in ISO format', nullable: true, example: '2025-09-01T00:00:00.000Z' })
  posted_at!: string | null;
}

export class PaginatedAgencyJobPostingsDto {
  
  @ApiProperty({ description: 'Data', type: [AgencyJobPostingListItemDto] })
    data!: AgencyJobPostingListItemDto[];

  
  @ApiProperty({ description: 'Total', example: 10 })
    total!: number;

  
  @ApiProperty({ description: 'Page', example: 25 })
    page!: number;

  
  @ApiProperty({ description: 'Limit', example: 0 })
    limit!: number;
}
