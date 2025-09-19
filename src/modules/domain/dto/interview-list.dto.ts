import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class InterviewExpenseDto {
  @ApiProperty() expense_type!: string;
  @ApiProperty() who_pays!: string;
  @ApiProperty() is_free!: boolean;
  @ApiPropertyOptional() amount?: number;
  @ApiPropertyOptional() currency?: string;
  @ApiProperty() refundable!: boolean;
  @ApiPropertyOptional() notes?: string;
}

export class InterviewScheduleDto {
  @ApiPropertyOptional({ description: 'AD date (ISO string yyyy-mm-dd)' }) date_ad?: string | null;
  @ApiPropertyOptional({ description: 'BS date (yyyy-mm-dd in BS)' }) date_bs?: string | null;
  @ApiPropertyOptional({ description: 'Time (HH:MM[:SS])' }) time?: string | null;
}

export class AgencyLiteDto {
  @ApiProperty() id!: string;
  @ApiProperty() name!: string;
  @ApiProperty() license_number!: string;
  @ApiPropertyOptional({ type: [String] }) phones?: string[] | null;
  @ApiPropertyOptional({ type: [String] }) emails?: string[] | null;
  @ApiPropertyOptional() website?: string | null;
}

export class EmployerLiteDto {
  @ApiProperty() id!: string;
  @ApiProperty() company_name!: string;
  @ApiProperty() country!: string;
  @ApiPropertyOptional() city?: string | null;
}

export class PostingLiteDto {
  @ApiProperty() id!: string;
  @ApiProperty() posting_title!: string;
  @ApiProperty() country!: string;
  @ApiPropertyOptional() city?: string | null;
}

export class ApplicationLiteDto {
  @ApiProperty() id!: string;
  @ApiProperty() status!: string;
}

export class InterviewEnrichedDto {
  @ApiProperty() id!: string;
  @ApiProperty({ type: InterviewScheduleDto }) schedule!: InterviewScheduleDto;
  @ApiPropertyOptional() location?: string | null;
  @ApiPropertyOptional() contact_person?: string | null;
  @ApiPropertyOptional({ type: [String] }) required_documents?: string[] | null;
  @ApiPropertyOptional() notes?: string | null;
  @ApiPropertyOptional({ type: ApplicationLiteDto }) application?: ApplicationLiteDto | null;
  @ApiProperty({ type: PostingLiteDto }) posting!: PostingLiteDto;
  @ApiProperty({ type: AgencyLiteDto }) agency!: AgencyLiteDto;
  @ApiProperty({ type: EmployerLiteDto }) employer!: EmployerLiteDto;
  @ApiProperty({ type: [InterviewExpenseDto] }) expenses!: InterviewExpenseDto[];
}

export class ListInterviewsQueryDto {
  @ApiProperty({ type: [String], description: 'Candidate UUID(s)' }) candidate_ids!: string[];
  @ApiPropertyOptional({ description: 'Page number (1-based)' }) page?: number;
  @ApiPropertyOptional({ description: 'Items per page (max 100)' }) limit?: number;
  @ApiPropertyOptional({ description: 'Only include interviews on/after today' }) only_upcoming?: boolean;
  @ApiPropertyOptional({ enum: ['upcoming', 'recent'] }) order?: 'upcoming' | 'recent';
}

export class PaginatedInterviewsDto {
  @ApiProperty() page!: number;
  @ApiProperty() limit!: number;
  @ApiProperty() total!: number;
  @ApiProperty({ type: [InterviewEnrichedDto] }) items!: InterviewEnrichedDto[];
}
