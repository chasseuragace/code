import { ApiProperty } from '@nestjs/swagger';

export class AgencyLiteDto {
  @ApiProperty() name!: string;
  @ApiProperty() license_number!: string;
}

export class EmployerLiteDto {
  @ApiProperty() company_name!: string;
  @ApiProperty() country!: string;
  @ApiProperty({ required: false, nullable: true }) city?: string | null;
}

export class SalaryConvertedDto {
  @ApiProperty() amount!: number;
  @ApiProperty() currency!: string;
}

export class SalarySummaryDto {
  @ApiProperty({ required: false, nullable: true }) monthly_min?: number | null;
  @ApiProperty({ required: false, nullable: true }) monthly_max?: number | null;
  @ApiProperty({ required: false, nullable: true }) currency?: string | null;
  @ApiProperty({ type: [SalaryConvertedDto], required: false }) converted?: SalaryConvertedDto[];
}

export class CandidateJobCardDto {
  @ApiProperty() id!: string;
  @ApiProperty() posting_title!: string;
  @ApiProperty() country!: string;
  @ApiProperty({ required: false, nullable: true }) city?: string | null;
  @ApiProperty({ type: [String], required: false }) primary_titles?: string[];
  @ApiProperty({ type: SalarySummaryDto, required: false }) salary?: SalarySummaryDto;
  @ApiProperty({ type: AgencyLiteDto, required: false }) agency?: AgencyLiteDto;
  @ApiProperty({ type: EmployerLiteDto, required: false }) employer?: EmployerLiteDto;
  @ApiProperty({ required: false, nullable: true }) posting_date_ad?: string | Date | null;
  @ApiProperty({ required: false, nullable: true }) cutout_url?: string | null;
  @ApiProperty({ required: false, description: '0–100' }) fitness_score?: number;
}

export class PaginatedJobsResponseDto {
  @ApiProperty() page!: number;
  @ApiProperty() limit!: number;
  @ApiProperty() total!: number;
  @ApiProperty({ type: [CandidateJobCardDto] }) data!: CandidateJobCardDto[];
}
