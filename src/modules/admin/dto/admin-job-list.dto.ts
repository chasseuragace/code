import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AdminJobFiltersDto } from './admin-job-filters.dto';

export class AdminJobAgencyDto {
  @ApiProperty({ description: 'Agency ID' })
  id!: string;

  @ApiProperty({ description: 'Agency name' })
  name!: string;

  @ApiProperty({ description: 'Agency license number' })
  license_number!: string;
}

export class AdminJobItemDto {
  @ApiProperty({ description: 'Job posting ID' })
  id!: string;

  @ApiProperty({ description: 'Job title' })
  title!: string;

  @ApiProperty({ description: 'Company/Employer name' })
  company!: string;

  @ApiProperty({ description: 'Country' })
  country!: string;

  
  @ApiPropertyOptional({ description: 'City', required: false })
    city?: string;

  @ApiProperty({ description: 'Created date' })
  created_at!: Date;

  
  @ApiPropertyOptional({ description: 'Published date', required: false })
    published_at?: Date;

  @ApiProperty({ description: 'Formatted salary string', example: '1200 AED' })
  salary!: string;

  @ApiProperty({ description: 'Currency code' })
  currency!: string;

  @ApiProperty({ description: 'Salary amount' })
  salary_amount!: number;

  @ApiProperty({ description: 'Total applications count' })
  applications_count!: number;

  @ApiProperty({ description: 'Shortlisted candidates count' })
  shortlisted_count!: number;

  @ApiProperty({ description: 'Interviews scheduled for today' })
  interviews_today!: number;

  @ApiProperty({ description: 'Total interviews count' })
  total_interviews!: number;

  @ApiProperty({ description: 'View count', default: 0 })
  view_count!: number;

  @ApiProperty({ description: 'Job category/position title' })
  category!: string;

  @ApiProperty({ description: 'Skills tags', type: [String] })
  tags!: string[];

  @ApiProperty({ description: 'Education requirements', type: [String] })
  requirements!: string[];

  
  @ApiPropertyOptional({ description: 'Job description', required: false })
    description?: string;

  
  @ApiPropertyOptional({ description: 'Working hours', required: false })
    working_hours?: string;

  
  @ApiPropertyOptional({ description: 'Accommodation provision', required: false })
    accommodation?: string;

  
  @ApiPropertyOptional({ description: 'Food provision', required: false })
    food?: string;

  
  @ApiPropertyOptional({ description: 'Visa status', required: false })
    visa_status?: string;

  
  @ApiPropertyOptional({ description: 'Contract duration', required: false })
    contract_duration?: string;

  
  
    @ApiPropertyOptional({ description: 'Agency', type: AdminJobAgencyDto, required: false })
    agency?: AdminJobAgencyDto;
}

export class AdminJobListResponseDto {
  @ApiProperty({ type: [AdminJobItemDto], description: 'Array of jobs' })
  data!: AdminJobItemDto[];

  @ApiProperty({ description: 'Total number of jobs matching filters' })
  total!: number;

  @ApiProperty({ description: 'Current page number' })
  page!: number;

  @ApiProperty({ description: 'Items per page' })
  limit!: number;

  @ApiProperty({ description: 'Applied filters' })
  filters!: {
    search?: string;
    country?: string;
    agency_id?: string;
  };
}

// Re-export for convenience
export { AdminJobFiltersDto };
