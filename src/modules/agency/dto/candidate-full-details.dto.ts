import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// Candidate basic info
class CandidateBasicDto {
  @ApiProperty() id!: string;
  @ApiProperty() name!: string;
  @ApiProperty() phone!: string;
  @ApiPropertyOptional() email?: string | null;
  @ApiPropertyOptional() gender?: string | null;
  @ApiPropertyOptional() age?: number | null;
  @ApiPropertyOptional() address?: {
    formatted?: string;
    name?: string;
    province?: string;
    district?: string;
    municipality?: string;
    ward?: string;
  } | null;
  @ApiPropertyOptional() passport_number?: string | null;
  @ApiPropertyOptional() profile_image?: string | null;
  @ApiProperty() is_active!: boolean;
}

// Education
class EducationItemDto {
  @ApiProperty() degree!: string;
  @ApiPropertyOptional() institution?: string;
  @ApiPropertyOptional() year_completed?: number;
}

// Training
class TrainingItemDto {
  @ApiProperty() title!: string;
  @ApiPropertyOptional() provider?: string;
  @ApiPropertyOptional() hours?: number;
  @ApiPropertyOptional() certificate?: boolean;
}

// Experience
class ExperienceItemDto {
  @ApiProperty() title!: string;
  @ApiPropertyOptional() employer?: string;
  @ApiPropertyOptional() start_date_ad?: string;
  @ApiPropertyOptional() end_date_ad?: string;
  @ApiPropertyOptional() months?: number;
  @ApiPropertyOptional() description?: string;
}

// Job Profile
class JobProfileDto {
  @ApiPropertyOptional() summary?: string | null;
  @ApiProperty({ type: [String] }) skills!: string[];
  @ApiProperty({ type: [EducationItemDto] }) education!: EducationItemDto[];
  @ApiProperty({ type: [TrainingItemDto] }) trainings!: TrainingItemDto[];
  @ApiProperty({ type: [ExperienceItemDto] }) experience!: ExperienceItemDto[];
}

// Job Context
class JobContextDto {
  @ApiProperty() job_id!: string;
  @ApiProperty() job_title!: string;
  @ApiPropertyOptional() job_company?: string | null;
  @ApiProperty() job_location!: {
    city: string | null;
    country: string;
  };
}

// Application History Entry
class ApplicationHistoryEntryDto {
  @ApiPropertyOptional() prev_status?: string | null;
  @ApiProperty() next_status!: string;
  @ApiProperty() updated_at!: string;
  @ApiPropertyOptional() updated_by?: string | null;
  @ApiPropertyOptional() note?: string | null;
  @ApiPropertyOptional() corrected?: boolean;
}

// Application
class ApplicationDto {
  @ApiProperty() id!: string;
  @ApiProperty() position_id!: string;
  @ApiPropertyOptional() position_title?: string | null;
  @ApiProperty() status!: string;
  @ApiProperty() created_at!: string;
  @ApiProperty() updated_at!: string;
  @ApiProperty({ type: [ApplicationHistoryEntryDto] }) history_blob!: ApplicationHistoryEntryDto[];
}

// Interview Expense
class InterviewExpenseDto {
  @ApiProperty() expense_type!: string;
  @ApiProperty() who_pays!: string;
  @ApiProperty() is_free!: boolean;
  @ApiPropertyOptional() amount?: number | null;
  @ApiPropertyOptional() currency?: string | null;
  @ApiPropertyOptional() refundable?: boolean;
  @ApiPropertyOptional() notes?: string | null;
}

// Interview
class InterviewDto {
  @ApiProperty() id!: string;
  @ApiPropertyOptional() interview_date_ad?: string | null;
  @ApiPropertyOptional() interview_date_bs?: string | null;
  @ApiPropertyOptional() interview_time?: string | null;
  @ApiPropertyOptional() location?: string | null;
  @ApiPropertyOptional() contact_person?: string | null;
  @ApiPropertyOptional({ type: [String] }) required_documents?: string[] | null;
  @ApiPropertyOptional() notes?: string | null;
  @ApiProperty({ type: [InterviewExpenseDto] }) expenses!: InterviewExpenseDto[];
}

// Main Response DTO
export class CandidateFullDetailsDto {
  @ApiProperty({ type: CandidateBasicDto }) candidate!: CandidateBasicDto;
  @ApiProperty({ type: JobProfileDto }) job_profile!: JobProfileDto;
  @ApiProperty({ type: JobContextDto }) job_context!: JobContextDto;
  @ApiProperty({ type: ApplicationDto }) application!: ApplicationDto;
  @ApiPropertyOptional({ type: InterviewDto }) interview?: InterviewDto | null;
}
