import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsEnum, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class AdminJobFiltersDto {
  
  @IsOptional()
  @IsString()
    @ApiPropertyOptional({ 
        required: false, 
        description: 'Search across job title, company name, job ID',
        example: 'cook'
      })
  search?: string;

  
  @IsOptional()
  @IsString()
    @ApiPropertyOptional({ 
        required: false, 
        description: 'Filter by country',
        example: 'UAE'
      })
  country?: string;

  
  @IsOptional()
  @IsString()
    @ApiPropertyOptional({ 
        required: false, 
        description: 'Filter by agency ID',
        example: 'uuid-v4-string'
      })
  agency_id?: string;

  
  @IsOptional()
  @IsEnum(['published_date', 'applications', 'shortlisted', 'interviews'])
    @ApiPropertyOptional({ 
        required: false, 
        enum: ['published_date', 'applications', 'shortlisted', 'interviews'],
        description: 'Sort by field',
        example: 'published_date',
        default: 'published_date'
      })
  sort_by?: string;

  
  @IsOptional()
  @IsEnum(['asc', 'desc'])
    @ApiPropertyOptional({ 
        required: false, 
        enum: ['asc', 'desc'],
        description: 'Sort order',
        example: 'desc',
        default: 'desc'
      })
  order?: 'asc' | 'desc';

  
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
    @ApiPropertyOptional({ 
        required: false, 
        default: 1,
        description: 'Page number',
        example: 1
      })
  page?: number;

  
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
    @ApiPropertyOptional({ 
        required: false, 
        default: 10,
        description: 'Items per page',
        example: 10
      })
  limit?: number;
}
