import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsArray, IsOptional, IsNumber, IsBoolean } from "class-validator";

export class InterviewExpenseDto {
  @ApiProperty({ description: 'Expense type', example: 'example' })
    expense_type!: string;
  @ApiProperty({ description: 'Who pays', example: 'example' })
    who_pays!: string;
  @ApiProperty({ description: 'Is free', example: true })
    is_free!: boolean;
  @ApiPropertyOptional({ description: 'Amount', type: Number })
    amount?: number;
  @ApiPropertyOptional({ description: 'Currency', type: String })
    currency?: string;
  @ApiProperty({ description: 'Refundable', example: true })
    refundable!: boolean;
  @ApiPropertyOptional({ description: 'Notes', type: String })
    notes?: string;
}

export class InterviewScheduleDto {
  @ApiPropertyOptional({ type: String, format: 'date', nullable: true, description: 'AD date (ISO string yyyy-mm-dd)' }) date_ad?: string | null;
  @ApiPropertyOptional({ type: String, nullable: true, description: 'BS date (yyyy-mm-dd in BS)' }) date_bs?: string | null;
  @ApiPropertyOptional({ type: String, nullable: true, description: 'Time (HH:MM[:SS])' }) time?: string | null;
}

export class AgencyLiteDto {
  @ApiProperty({ description: 'Id', type: String })
    id!: string;
  @ApiProperty({ description: 'Name', type: String })
    name!: string;
  @ApiProperty({ description: 'License number', type: String })
    license_number!: string;
  @ApiPropertyOptional({ description: 'Phones', type: [String], nullable: true })
    phones?: string[] | null;
  @ApiPropertyOptional({ description: 'Emails', type: [String], nullable: true })
    emails?: string[] | null;
  @ApiPropertyOptional({ description: 'Website', type: String, nullable: true })
    website?: string | null;
}

export class EmployerLiteDto {
  @ApiProperty({ description: 'Id', type: String })
    id!: string;
  @ApiProperty({ description: 'Company name', type: String })
    company_name!: string;
  @ApiProperty({ description: 'Country', type: String })
    country!: string;
  @ApiPropertyOptional({ description: 'City', type: String, nullable: true, example: 'Dubai' })
    city?: string | null;
}

export class PostingLiteDto {
  @ApiProperty({ description: 'Id', type: String })
    id!: string;
  @ApiProperty({ description: 'Posting title', type: String })
    posting_title!: string;
  @ApiProperty({ description: 'Country', type: String })
    country!: string;
  @ApiPropertyOptional({ description: 'City', type: String, nullable: true, example: 'Kathmandu' })
    city?: string | null;
}

export class ApplicationLiteDto {
  @ApiProperty({ description: 'Id', type: String })
    id!: string;
  @ApiProperty({ description: 'Status', type: String })
    status!: string;
}

export class InterviewEnrichedDto {
  @ApiProperty({ description: 'Id', type: String })
    id!: string;
  @ApiProperty({ description: 'Schedule', type: InterviewScheduleDto })
    schedule!: InterviewScheduleDto;
  @ApiPropertyOptional({ description: 'Location', type: String, nullable: true })
    location?: string | null;
  @ApiPropertyOptional({ description: 'Contact person', type: String, nullable: true })
    contact_person?: string | null;
  @ApiPropertyOptional({ description: 'Required documents', type: [String], nullable: true })
    required_documents?: string[] | null;
  @ApiPropertyOptional({ description: 'Notes', type: String, nullable: true })
    notes?: string | null;
  @ApiPropertyOptional({ description: 'Application', type: ApplicationLiteDto, nullable: true })
    application?: ApplicationLiteDto | null;
  @ApiProperty({ description: 'Posting', type: PostingLiteDto })
    posting!: PostingLiteDto;
  @ApiProperty({ description: 'Agency', type: AgencyLiteDto })
    agency!: AgencyLiteDto;
  @ApiProperty({ description: 'Employer', type: EmployerLiteDto })
    employer!: EmployerLiteDto;
  @ApiProperty({ description: 'Expenses', type: [InterviewExpenseDto] })
    expenses!: InterviewExpenseDto[];
}

export class ListInterviewsQueryDto {
  @ApiProperty({ type: [String], description: 'Candidate UUID(s)' })
    @IsString()
    @IsArray() candidate_ids!: string[];
  @ApiPropertyOptional({ type: Number, description: 'Page number (1-based)' })
    @IsOptional()
    @IsNumber() page?: number;
  @ApiPropertyOptional({ type: Number, description: 'Items per page (max 100)' })
    @IsOptional()
    @IsNumber() limit?: number;
  @ApiPropertyOptional({ type: Boolean, description: 'Only include interviews on/after today' })
    @IsOptional()
    @IsBoolean() only_upcoming?: boolean;
  
    @IsOptional()
    @ApiPropertyOptional({ description: 'Order', enum: ['upcoming', 'recent'] }) order?: 'upcoming' | 'recent';
}

export class PaginatedInterviewsDto {
  @ApiProperty({ description: 'Page', type: Number })
    page!: number;
  @ApiProperty({ description: 'Limit', type: Number })
    limit!: number;
  @ApiProperty({ description: 'Total', type: Number })
    total!: number;
  @ApiProperty({ description: 'Items', type: [InterviewEnrichedDto] })
    items!: InterviewEnrichedDto[];
}
