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

// Skill Item
class SkillItemDto {
  @ApiProperty({ description: 'Skill name', example: 'English' })
    title!: string;
  @ApiPropertyOptional({ description: 'Years of experience', example: 1 })
    years?: number;
  @ApiPropertyOptional({ description: 'Duration in months', example: 3 })
    duration_months?: number;
  @ApiPropertyOptional({ description: 'Formatted display text', example: 'English (1 year, 3 months)' })
    formatted?: string;
}

// Education
class EducationItemDto {
  @ApiProperty({ description: 'Degree/qualification', example: 'SLC' })
    degree!: string;
  @ApiPropertyOptional({ description: 'Institution name', example: 'Nepal School' })
    institution?: string;
  @ApiPropertyOptional({ description: 'Year completed', example: 2024 })
    year_completed?: number;
  @ApiPropertyOptional({ description: 'Formatted display text', example: 'SLC from Nepal School' })
    formatted?: string;
}

// Training
class TrainingItemDto {
  @ApiProperty({ description: 'Training title', example: 'Cook' })
    title!: string;
  @ApiPropertyOptional({ description: 'Training provider', example: 'Kathmandu Kitchen' })
    provider?: string;
  @ApiPropertyOptional({ description: 'Training hours', example: 40 })
    hours?: number;
  @ApiPropertyOptional({ description: 'Has certificate', example: true })
    certificate?: boolean;
  @ApiPropertyOptional({ description: 'Formatted display text', example: 'Cook - Kathmandu Kitchen (40 hours)' })
    formatted?: string;
}

// Experience
class ExperienceItemDto {
  @ApiProperty({ description: 'Job title', example: 'Mason' })
    title!: string;
  @ApiPropertyOptional({ description: 'Employer name', example: 'Local Construction' })
    employer?: string;
  @ApiPropertyOptional({ description: 'Start date (AD)', example: '2025-12-01' })
    start_date_ad?: string;
  @ApiPropertyOptional({ description: 'End date (AD)', example: '2025-12-18' })
    end_date_ad?: string;
  @ApiPropertyOptional({ description: 'Duration in months', example: 1 })
    months?: number;
  @ApiPropertyOptional({ description: 'Job description', example: 'Sarai Kam Ramro Theo' })
    description?: string;
  @ApiPropertyOptional({ description: 'Formatted display text', example: 'Mason at Local Construction (1 month, Dec 2025)' })
    formatted?: string;
}

// Job Profile
class JobProfileDto {
  @ApiPropertyOptional({ description: 'Professional summary', example: 'Experienced cook with 5+ years in international cuisine' })
    summary?: string | null;
  @ApiProperty({ description: 'Skills with experience details', type: [SkillItemDto] })
    skills!: SkillItemDto[];
  @ApiProperty({ description: 'Education qualifications', type: [EducationItemDto] })
    education!: EducationItemDto[];
  @ApiProperty({ description: 'Professional trainings completed', type: [TrainingItemDto] })
    trainings!: TrainingItemDto[];
  @ApiProperty({ description: 'Work experience', type: [ExperienceItemDto] })
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
