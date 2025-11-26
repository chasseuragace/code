import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsEnum, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class AdminJobFiltersDto {
  @ApiProperty({ 
    required: false, 
    description: 'Search across job title, company name, job ID',
    example: 'cook'
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({ 
    required: false, 
    description: 'Filter by country',
    example: 'UAE'
  })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiProperty({ 
    required: false, 
    description: 'Filter by agency ID',
    example: 'uuid-v4-string'
  })
  @IsOptional()
  @IsString()
  agency_id?: string;

  @ApiProperty({ 
    required: false, 
    enum: ['published_date', 'applications', 'shortlisted', 'interviews'],
    description: 'Sort by field',
    example: 'published_date',
    default: 'published_date'
  })
  @IsOptional()
  @IsEnum(['published_date', 'applications', 'shortlisted', 'interviews'])
  sort_by?: string;

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

  @ApiProperty({ 
    required: false, 
    default: 1,
    description: 'Page number',
    example: 1
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number;

  @ApiProperty({ 
    required: false, 
    default: 10,
    description: 'Items per page',
    example: 10
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number;
}
