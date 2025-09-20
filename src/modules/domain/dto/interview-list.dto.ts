import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class InterviewExpenseDto {
  @ApiProperty() expense_type!: string;
  @ApiProperty() who_pays!: string;
  @ApiProperty() is_free!: boolean;
  @ApiPropertyOptional({ type: Number }) amount?: number;
  @ApiPropertyOptional({ type: String }) currency?: string;
  @ApiProperty() refundable!: boolean;
  @ApiPropertyOptional({ type: String }) notes?: string;
}

export class InterviewScheduleDto {
  @ApiPropertyOptional({ type: String, format: 'date', nullable: true, description: 'AD date (ISO string yyyy-mm-dd)' }) date_ad?: string | null;
  @ApiPropertyOptional({ type: String, nullable: true, description: 'BS date (yyyy-mm-dd in BS)' }) date_bs?: string | null;
  @ApiPropertyOptional({ type: String, nullable: true, description: 'Time (HH:MM[:SS])' }) time?: string | null;
}

export class AgencyLiteDto {
  @ApiProperty({ type: String }) id!: string;
  @ApiProperty({ type: String }) name!: string;
  @ApiProperty({ type: String }) license_number!: string;
  @ApiPropertyOptional({ type: [String], nullable: true }) phones?: string[] | null;
  @ApiPropertyOptional({ type: [String], nullable: true }) emails?: string[] | null;
  @ApiPropertyOptional({ type: String, nullable: true }) website?: string | null;
}

export class EmployerLiteDto {
  @ApiProperty({ type: String }) id!: string;
  @ApiProperty({ type: String }) company_name!: string;
  @ApiProperty({ type: String }) country!: string;
  @ApiPropertyOptional({ type: String, nullable: true, example: 'Dubai' }) city?: string | null;
}

export class PostingLiteDto {
  @ApiProperty({ type: String }) id!: string;
  @ApiProperty({ type: String }) posting_title!: string;
  @ApiProperty({ type: String }) country!: string;
  @ApiPropertyOptional({ type: String, nullable: true, example: 'Kathmandu' }) city?: string | null;
}

export class ApplicationLiteDto {
  @ApiProperty({ type: String }) id!: string;
  @ApiProperty({ type: String }) status!: string;
}

export class InterviewEnrichedDto {
  @ApiProperty({ type: String }) id!: string;
  @ApiProperty({ type: InterviewScheduleDto }) schedule!: InterviewScheduleDto;
  @ApiPropertyOptional({ type: String, nullable: true }) location?: string | null;
  @ApiPropertyOptional({ type: String, nullable: true }) contact_person?: string | null;
  @ApiPropertyOptional({ type: [String], nullable: true }) required_documents?: string[] | null;
  @ApiPropertyOptional({ type: String, nullable: true }) notes?: string | null;
  @ApiPropertyOptional({ type: ApplicationLiteDto, nullable: true }) application?: ApplicationLiteDto | null;
  @ApiProperty({ type: PostingLiteDto }) posting!: PostingLiteDto;
  @ApiProperty({ type: AgencyLiteDto }) agency!: AgencyLiteDto;
  @ApiProperty({ type: EmployerLiteDto }) employer!: EmployerLiteDto;
  @ApiProperty({ type: [InterviewExpenseDto] }) expenses!: InterviewExpenseDto[];
}

export class ListInterviewsQueryDto {
  @ApiProperty({ type: [String], description: 'Candidate UUID(s)' }) candidate_ids!: string[];
  @ApiPropertyOptional({ type: Number, description: 'Page number (1-based)' }) page?: number;
  @ApiPropertyOptional({ type: Number, description: 'Items per page (max 100)' }) limit?: number;
  @ApiPropertyOptional({ type: Boolean, description: 'Only include interviews on/after today' }) only_upcoming?: boolean;
  @ApiPropertyOptional({ enum: ['upcoming', 'recent'] }) order?: 'upcoming' | 'recent';
}

export class PaginatedInterviewsDto {
  @ApiProperty({ type: Number }) page!: number;
  @ApiProperty({ type: Number }) limit!: number;
  @ApiProperty({ type: Number }) total!: number;
  @ApiProperty({ type: [InterviewEnrichedDto] }) items!: InterviewEnrichedDto[];
}
