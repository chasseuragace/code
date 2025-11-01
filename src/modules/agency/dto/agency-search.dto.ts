import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsIn, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class AgencySearchDto {
  @ApiPropertyOptional({ 
    description: 'Search term to look up agencies by name, description, location, or specializations',
    example: 'tech' 
  })
  @IsOptional()
  @IsString()
  keyword?: string;

  @ApiPropertyOptional({ 
    description: 'Page number for pagination',
    minimum: 1,
    default: 1
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @ApiPropertyOptional({
    description: 'Number of items per page',
    minimum: 1,
    maximum: 100,
    default: 10
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit: number = 10;

  @ApiPropertyOptional({
    enum: ['name', 'country', 'city', 'created_at'],
    description: 'Field to sort by',
    default: 'name'
  })
  @IsOptional()
  @IsIn(['name', 'country', 'city', 'created_at'])
  sortBy: string = 'name';

  @ApiPropertyOptional({
    enum: ['asc', 'desc'],
    description: 'Sort order',
    default: 'asc'
  })
  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortOrder: 'asc' | 'desc' = 'asc';
}

export class AgencyCardDto {
  @ApiProperty({ description: 'Unique identifier of the agency' })
  id: string;

  @ApiProperty({ description: 'Name of the agency' })
  name: string;

  @ApiProperty({ description: 'License number of the agency' })
  license_number: string;

  @ApiPropertyOptional({ description: 'URL to the agency logo' })
  logo_url?: string;

  @ApiPropertyOptional({ description: 'Brief description of the agency' })
  description?: string;

  @ApiPropertyOptional({ description: 'City where the agency is located' })
  city?: string | null;

  @ApiPropertyOptional({ description: 'Country where the agency is located' })
  country?: string | null;

  @ApiPropertyOptional({ description: 'Agency website URL' })
  website?: string;

  @ApiProperty({ 
    description: 'Whether the agency is active',
    default: true 
  })
  is_active: boolean;

  @ApiProperty({
    description: 'Date and time when the agency was created',
    example: '2023-10-31T12:00:00.000Z'
  })
  created_at: string;

  @ApiProperty({
    description: 'Number of job postings associated with this agency',
    type: 'integer',
    example: 0
  })
  job_posting_count: number;

  @ApiPropertyOptional({
    description: 'List of specializations',
    type: [String]
  })
  specializations?: string[];
}

export class PaginatedAgencyResponseDto {
  @ApiProperty({ 
    type: [AgencyCardDto], 
    description: 'List of agencies matching the search criteria' 
  })
  data: AgencyCardDto[];

  @ApiProperty({ 
    type: 'object',
    description: 'Pagination metadata',
    properties: {
      total: { type: 'number', description: 'Total number of items' },
      page: { type: 'number', description: 'Current page number' },
      limit: { type: 'number', description: 'Number of items per page' },
      totalPages: { type: 'number', description: 'Total number of pages' }
    }
  })
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
