import { ApiProperty } from '@nestjs/swagger';

export class CardAgencyLiteDto {
  @ApiProperty({ type: String }) name!: string;
  @ApiProperty({ type: String }) license_number!: string;
}

export class CardEmployerLiteDto {
  @ApiProperty({ type: String }) company_name!: string;
  @ApiProperty({ type: String }) country!: string;
  @ApiProperty({ type: String, required: false, nullable: true }) city?: string | null;
}

export class SalaryConvertedDto {
  @ApiProperty({ type: Number }) amount!: number;
  @ApiProperty({ type: String }) currency!: string;
}

export class SalarySummaryDto {
  @ApiProperty({ type: Number, required: false, nullable: true }) monthly_min?: number | null;
  @ApiProperty({ type: Number, required: false, nullable: true }) monthly_max?: number | null;
  @ApiProperty({ type: String, required: false, nullable: true }) currency?: string | null;
  @ApiProperty({ type: [SalaryConvertedDto], required: false }) converted?: SalaryConvertedDto[];
}

export class CandidateJobCardDto {
  @ApiProperty({ type: String }) id!: string;
  @ApiProperty({ type: String }) posting_title!: string;
  @ApiProperty({ type: String }) country!: string;
  @ApiProperty({ type: String, required: false, nullable: true }) city?: string | null;
  @ApiProperty({ type: [String], required: false }) primary_titles?: string[];
  @ApiProperty({ type: SalarySummaryDto, required: false }) salary?: SalarySummaryDto;
  @ApiProperty({ type: CardAgencyLiteDto, required: false }) agency?: CardAgencyLiteDto;
  @ApiProperty({ type: CardEmployerLiteDto, required: false }) employer?: CardEmployerLiteDto;
  @ApiProperty({ type: String, required: false, nullable: true }) posting_date_ad?: string | Date | null;
  @ApiProperty({ type: String, required: false, nullable: true }) cutout_url?: string | null;
  @ApiProperty({ type: Number, required: false, description: '0–100' }) fitness_score?: number;
}

export class PaginatedJobsResponseDto {
  @ApiProperty({ type: Number }) page!: number;
  @ApiProperty({ type: Number }) limit!: number;
  @ApiProperty({ type: Number }) total!: number;
  @ApiProperty({ type: [CandidateJobCardDto] }) data!: CandidateJobCardDto[];
}
