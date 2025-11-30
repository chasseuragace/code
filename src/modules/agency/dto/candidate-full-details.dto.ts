import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// Candidate basic info
class CandidateBasicDto {
  @ApiProperty({ description: 'Id', example: 'example' })
    id!: string;
  @ApiProperty({ description: 'Name', example: 'Example Name' })
    name!: string;
  @ApiProperty({ description: 'Phone', example: '+1234567890' })
    phone!: string;
  @ApiPropertyOptional({ description: 'Email', example: 'user@example.com' })
    email?: string | null;
  @ApiPropertyOptional({ description: 'Gender', example: 'example' })
    gender?: string | null;
  @ApiPropertyOptional({ description: 'Age', example: 25 })
    age?: number | null;
  @ApiPropertyOptional({ description: 'Address', example: 'example' })
    address?: {
    formatted?: string;
    name?: string;
    province?: string;
    district?: string;
    municipality?: string;
    ward?: string;
  } | null;
  @ApiPropertyOptional({ description: 'Passport number', example: 'example' })
    passport_number?: string | null;
  @ApiPropertyOptional({ description: 'Profile image', example: 'example' })
    profile_image?: string | null;
  @ApiProperty({ description: 'Is active', example: true })
    is_active!: boolean;
}

// Education
class EducationItemDto {
  @ApiProperty({ description: 'Degree', example: 'example' })
    degree!: string;
  @ApiPropertyOptional({ description: 'Institution', example: 'example' })
    institution?: string;
  @ApiPropertyOptional({ description: 'Year completed', example: 2024 })
    year_completed?: number;
}

// Training
class TrainingItemDto {
  @ApiProperty({ description: 'Title', example: 'example' })
    title!: string;
  @ApiPropertyOptional({ description: 'Provider', example: 'example' })
    provider?: string;
  @ApiPropertyOptional({ description: 'Hours', example: 0 })
    hours?: number;
  @ApiPropertyOptional({ description: 'Certificate', example: true })
    certificate?: boolean;
}

// Experience
class ExperienceItemDto {
  @ApiProperty({ description: 'Title', example: 'example' })
    title!: string;
  @ApiPropertyOptional({ description: 'Employer', example: 'example' })
    employer?: string;
  @ApiPropertyOptional({ description: 'Start date ad', example: 'example' })
    start_date_ad?: string;
  @ApiPropertyOptional({ description: 'End date ad', example: 'example' })
    end_date_ad?: string;
  @ApiPropertyOptional({ description: 'Months', example: 0 })
    months?: number;
  @ApiPropertyOptional({ description: 'Description', example: 'example' })
    description?: string;
}

// Job Profile
class JobProfileDto {
  @ApiPropertyOptional({ description: 'Summary', example: 'example' })
    summary?: string | null;
  @ApiProperty({ description: 'Skills', type: [String] })
    skills!: string[];
  @ApiProperty({ description: 'Education', type: [EducationItemDto] })
    education!: EducationItemDto[];
  @ApiProperty({ description: 'Trainings', type: [TrainingItemDto] })
    trainings!: TrainingItemDto[];
  @ApiProperty({ description: 'Experience', type: [ExperienceItemDto] })
    experience!: ExperienceItemDto[];
}

// Job Context
class JobContextDto {
  @ApiProperty({ description: 'Job id', example: 'example' })
    job_id!: string;
  @ApiProperty({ description: 'Job title', example: 'example' })
    job_title!: string;
  @ApiPropertyOptional({ description: 'Job company', example: 'example' })
    job_company?: string | null;
  @ApiProperty({ description: 'Job location', example: 'example' })
    job_location!: {
    city: string | null;
    country: string;
  };
}

// Application History Entry
class ApplicationHistoryEntryDto {
  @ApiPropertyOptional({ description: 'Prev status', example: 'example' })
    prev_status?: string | null;
  @ApiProperty({ description: 'Next status', example: 'example' })
    next_status!: string;
  @ApiProperty({ description: 'Updated at', example: 'example' })
    updated_at!: string;
  @ApiPropertyOptional({ description: 'Updated by', example: 'example' })
    updated_by?: string | null;
  @ApiPropertyOptional({ description: 'Note', example: 'example' })
    note?: string | null;
  @ApiPropertyOptional({ description: 'Corrected', example: true })
    corrected?: boolean;
}

// Application
class ApplicationDto {
  @ApiProperty({ description: 'Id', example: 'example' })
    id!: string;
  @ApiProperty({ description: 'Position id', example: 'example' })
    position_id!: string;
  @ApiPropertyOptional({ description: 'Position title', example: 'example' })
    position_title?: string | null;
  @ApiProperty({ description: 'Status', example: 'example' })
    status!: string;
  @ApiProperty({ description: 'Created at', example: 'example' })
    created_at!: string;
  @ApiProperty({ description: 'Updated at', example: 'example' })
    updated_at!: string;
  @ApiProperty({ description: 'History blob', type: [ApplicationHistoryEntryDto] })
    history_blob!: ApplicationHistoryEntryDto[];
}

// Interview Expense
class InterviewExpenseDto {
  @ApiProperty({ description: 'Expense type', example: 'example' })
    expense_type!: string;
  @ApiProperty({ description: 'Who pays', example: 'example' })
    who_pays!: string;
  @ApiProperty({ description: 'Is free', example: true })
    is_free!: boolean;
  @ApiPropertyOptional({ description: 'Amount', example: 0 })
    amount?: number | null;
  @ApiPropertyOptional({ description: 'Currency', example: 'example' })
    currency?: string | null;
  @ApiPropertyOptional({ description: 'Refundable', example: true })
    refundable?: boolean;
  @ApiPropertyOptional({ description: 'Notes', example: 'example' })
    notes?: string | null;
}

// Interview
class InterviewDto {
  @ApiProperty({ description: 'Id', example: 'example' })
    id!: string;
  @ApiPropertyOptional({ description: 'Interview date ad', example: 'example' })
    interview_date_ad?: string | null;
  @ApiPropertyOptional({ description: 'Interview date bs', example: 'example' })
    interview_date_bs?: string | null;
  @ApiPropertyOptional({ description: 'Interview time', example: 'example' })
    interview_time?: string | null;
  @ApiPropertyOptional({ description: 'Location', example: 'example' })
    location?: string | null;
  @ApiPropertyOptional({ description: 'Contact person', example: 'example' })
    contact_person?: string | null;
  @ApiPropertyOptional({ description: 'Required documents', type: [String] })
    required_documents?: string[] | null;
  @ApiPropertyOptional({ description: 'Notes', example: 'example' })
    notes?: string | null;
  @ApiProperty({ description: 'Expenses', type: [InterviewExpenseDto] })
    expenses!: InterviewExpenseDto[];
}

// Main Response DTO
export class CandidateFullDetailsDto {
  @ApiProperty({ description: 'Candidate', type: CandidateBasicDto })
    candidate!: CandidateBasicDto;
  @ApiProperty({ description: 'Job profile', type: JobProfileDto })
    job_profile!: JobProfileDto;
  @ApiProperty({ description: 'Job context', type: JobContextDto })
    job_context!: JobContextDto;
  @ApiProperty({ description: 'Application', type: ApplicationDto })
    application!: ApplicationDto;
  @ApiPropertyOptional({ description: 'Interview', type: InterviewDto })
    interview?: InterviewDto | null;
}
