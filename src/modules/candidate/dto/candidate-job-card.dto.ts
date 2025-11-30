import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PositionSummaryDto } from './position-summary.dto';

export class CardAgencyLiteDto {
  @ApiProperty({ description: 'Name', type: String })
    name!: string;
  @ApiProperty({ description: 'License number', type: String })
    license_number!: string;
}

export class CardEmployerLiteDto {
  @ApiProperty({ description: 'Company name', type: String })
    company_name!: string;
  @ApiProperty({ description: 'Country', type: String })
    country!: string;
  
    @ApiPropertyOptional({ description: 'City', type: String, required: false, nullable: true })
    city?: string | null;
}

export class SalaryConvertedDto {
  @ApiProperty({ description: 'Amount', type: Number })
    amount!: number;
  @ApiProperty({ description: 'Currency', type: String })
    currency!: string;
}

export class SalarySummaryDto {
  
    @ApiPropertyOptional({ description: 'Monthly min', type: Number, required: false, nullable: true })
    monthly_min?: number | null;
  
    @ApiPropertyOptional({ description: 'Monthly max', type: Number, required: false, nullable: true })
    monthly_max?: number | null;
  
    @ApiPropertyOptional({ description: 'Currency', type: String, required: false, nullable: true })
    currency?: string | null;
  
    @ApiPropertyOptional({ description: 'Converted', type: [SalaryConvertedDto], required: false })
    converted?: SalaryConvertedDto[];
}

export class CandidateJobCardDto {
  @ApiProperty({ description: 'Id', type: String })
    id!: string;
  @ApiProperty({ description: 'Posting title', type: String })
    posting_title!: string;
  @ApiProperty({ description: 'Country', type: String })
    country!: string;
  
    @ApiPropertyOptional({ description: 'City', type: String, required: false, nullable: true })
    city?: string | null;
  
    @ApiPropertyOptional({ description: 'Primary titles', type: [String], required: false })
    primary_titles?: string[];
  
    @ApiPropertyOptional({ description: 'Salary', type: SalarySummaryDto, required: false })
    salary?: SalarySummaryDto;
  
    @ApiPropertyOptional({ description: 'Agency', type: CardAgencyLiteDto, required: false })
    agency?: CardAgencyLiteDto;
  
    @ApiPropertyOptional({ description: 'Employer', type: CardEmployerLiteDto, required: false })
    employer?: CardEmployerLiteDto;
  
    @ApiPropertyOptional({ description: 'Posting date ad', type: String, required: false, nullable: true })
    posting_date_ad?: string | Date | null;
  
    @ApiPropertyOptional({ description: 'Cutout url', type: String, required: false, nullable: true })
    cutout_url?: string | null;
  @ApiPropertyOptional({ type: Number, required: false, description: '0–100' })
    fitness_score?: number;

  
  @ApiPropertyOptional({ 
        type: [PositionSummaryDto], 
        description: 'List of available positions for this job',
        required: false 
      })
    positions?: PositionSummaryDto[];
}

export class PaginatedJobsResponseDto {
  @ApiProperty({ description: 'Page', type: Number })
    page!: number;
  @ApiProperty({ description: 'Limit', type: Number })
    limit!: number;
  @ApiProperty({ description: 'Total', type: Number })
    total!: number;
  @ApiProperty({ description: 'Data', type: [CandidateJobCardDto] })
    data!: CandidateJobCardDto[];
}
