import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

// ============================================
// Enums
// ============================================

export enum AnnouncementTypeEnum {
  FULL_AD = 'full_ad',
  SHORT_AD = 'short_ad',
  UPDATE = 'update',
}

export enum OvertimePolicyEnum {
  AS_PER_COMPANY_POLICY = 'as_per_company_policy',
  PAID = 'paid',
  UNPAID = 'unpaid',
  NOT_APPLICABLE = 'not_applicable',
}

export enum ProvisionTypeEnum {
  FREE = 'free',
  PAID = 'paid',
  NOT_PROVIDED = 'not_provided',
}

export enum ExperienceLevelEnum {
  FRESHER = 'fresher',
  EXPERIENCED = 'experienced',
  SKILLED = 'skilled',
  EXPERT = 'expert',
}

// ============================================
// Input DTOs
// ============================================

/**
 * DTO for creating a template job posting with minimal required fields.
 * All other fields will be auto-populated with sensible defaults.
 */
export class CreateTemplateDto {
  @ApiProperty({
    description: 'Job posting title',
    example: 'Electrician - Dubai Project',
    maxLength: 500,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  posting_title!: string;

  @ApiProperty({
    description: 'Destination country (code or name)',
    example: 'UAE',
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  country!: string;

  @ApiPropertyOptional({
    description: 'Destination city',
    example: 'Dubai',
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  city?: string;
}

/**
 * DTO for updating basic job posting information.
 * Uses PATCH semantics - only provided fields are updated.
 */
export class UpdateBasicInfoDto {
  @ApiPropertyOptional({
    description: 'Job posting title',
    example: 'Senior Electrician - Dubai Project',
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  posting_title?: string;

  @ApiPropertyOptional({
    description: 'Destination country (code or name)',
    example: 'UAE',
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  country?: string;

  @ApiPropertyOptional({
    description: 'Destination city',
    example: 'Dubai',
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  city?: string;

  @ApiPropertyOptional({
    description: 'LT number (labor permit reference)',
    example: 'LT-2025-12345',
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  lt_number?: string;

  @ApiPropertyOptional({
    description: 'Chalani number (dispatch reference)',
    example: 'CH-2025-98765',
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  chalani_number?: string;

  @ApiPropertyOptional({
    description: 'Approval date (ISO 8601 format)',
    example: '2025-01-15',
  })
  @IsOptional()
  @IsDateString()
  approval_date_ad?: string;

  @ApiPropertyOptional({
    description: 'Posting date (ISO 8601 format)',
    example: '2025-01-20',
  })
  @IsOptional()
  @IsDateString()
  posting_date_ad?: string;

  @ApiPropertyOptional({
    description: 'Announcement type',
    enum: AnnouncementTypeEnum,
    example: 'full_ad',
  })
  @IsOptional()
  @IsEnum(AnnouncementTypeEnum)
  announcement_type?: AnnouncementTypeEnum;

  @ApiPropertyOptional({
    description: 'Additional notes or description',
    example: 'Urgent requirement for skilled workers',
  })
  @IsOptional()
  @IsString()
  notes?: string;
}

/**
 * DTO for updating employer information.
 */
export class UpdateEmployerDto {
  @ApiPropertyOptional({
    description: 'Employer company name',
    example: 'Gulf Construction LLC',
    maxLength: 255,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  company_name?: string;

  @ApiPropertyOptional({
    description: 'Employer country',
    example: 'UAE',
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  country?: string;

  @ApiPropertyOptional({
    description: 'Employer city',
    example: 'Dubai',
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  city?: string;
}

/**
 * DTO for updating contract terms.
 */
export class UpdateContractDto {
  @ApiPropertyOptional({
    description: 'Contract period in years',
    example: 2,
    minimum: 1,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  period_years?: number;

  @ApiPropertyOptional({
    description: 'Whether contract is renewable',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  renewable?: boolean;

  @ApiPropertyOptional({
    description: 'Working hours per day',
    example: 8,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  hours_per_day?: number;

  @ApiPropertyOptional({
    description: 'Working days per week',
    example: 6,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  days_per_week?: number;

  @ApiPropertyOptional({
    description: 'Overtime policy',
    enum: OvertimePolicyEnum,
    example: 'paid',
  })
  @IsOptional()
  @IsEnum(OvertimePolicyEnum)
  overtime_policy?: OvertimePolicyEnum;

  @ApiPropertyOptional({
    description: 'Weekly off days',
    example: 1,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  weekly_off_days?: number;

  @ApiPropertyOptional({
    description: 'Food provision',
    enum: ProvisionTypeEnum,
    example: 'free',
  })
  @IsOptional()
  @IsEnum(ProvisionTypeEnum)
  food?: ProvisionTypeEnum;

  @ApiPropertyOptional({
    description: 'Accommodation provision',
    enum: ProvisionTypeEnum,
    example: 'free',
  })
  @IsOptional()
  @IsEnum(ProvisionTypeEnum)
  accommodation?: ProvisionTypeEnum;

  @ApiPropertyOptional({
    description: 'Transport provision',
    enum: ProvisionTypeEnum,
    example: 'free',
  })
  @IsOptional()
  @IsEnum(ProvisionTypeEnum)
  transport?: ProvisionTypeEnum;

  @ApiPropertyOptional({
    description: 'Annual leave days',
    example: 30,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  annual_leave_days?: number;
}


// ============================================
// Position DTOs
// ============================================

/**
 * Nested DTO for position vacancies.
 */
export class VacanciesDto {
  @ApiProperty({
    description: 'Number of male vacancies',
    example: 5,
    minimum: 0,
  })
  @IsInt()
  @Min(0)
  male!: number;

  @ApiProperty({
    description: 'Number of female vacancies',
    example: 2,
    minimum: 0,
  })
  @IsInt()
  @Min(0)
  female!: number;
}

/**
 * Nested DTO for position salary.
 */
export class SalaryDto {
  @ApiProperty({
    description: 'Monthly salary amount',
    example: 2500,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  monthly_amount!: number;

  @ApiProperty({
    description: 'Salary currency code',
    example: 'AED',
    maxLength: 10,
  })
  @IsString()
  @MaxLength(10)
  currency!: string;
}

/**
 * DTO for creating a new position.
 */
export class CreatePositionDto {
  @ApiProperty({
    description: 'Position title',
    example: 'Electrician',
    maxLength: 255,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title!: string;

  @ApiProperty({
    description: 'Vacancy counts by gender',
    type: VacanciesDto,
  })
  @ValidateNested()
  @Type(() => VacanciesDto)
  vacancies!: VacanciesDto;

  @ApiProperty({
    description: 'Salary information',
    type: SalaryDto,
  })
  @ValidateNested()
  @Type(() => SalaryDto)
  salary!: SalaryDto;

  @ApiPropertyOptional({
    description: 'Override: hours per day for this position',
    example: 9,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  hours_per_day_override?: number;

  @ApiPropertyOptional({
    description: 'Override: days per week for this position',
    example: 5,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  days_per_week_override?: number;

  @ApiPropertyOptional({
    description: 'Override: overtime policy for this position',
    enum: OvertimePolicyEnum,
  })
  @IsOptional()
  @IsEnum(OvertimePolicyEnum)
  overtime_policy_override?: OvertimePolicyEnum;

  @ApiPropertyOptional({
    description: 'Override: weekly off days for this position',
    example: 2,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  weekly_off_days_override?: number;

  @ApiPropertyOptional({
    description: 'Override: food provision for this position',
    enum: ProvisionTypeEnum,
  })
  @IsOptional()
  @IsEnum(ProvisionTypeEnum)
  food_override?: ProvisionTypeEnum;

  @ApiPropertyOptional({
    description: 'Override: accommodation provision for this position',
    enum: ProvisionTypeEnum,
  })
  @IsOptional()
  @IsEnum(ProvisionTypeEnum)
  accommodation_override?: ProvisionTypeEnum;

  @ApiPropertyOptional({
    description: 'Override: transport provision for this position',
    enum: ProvisionTypeEnum,
  })
  @IsOptional()
  @IsEnum(ProvisionTypeEnum)
  transport_override?: ProvisionTypeEnum;

  @ApiPropertyOptional({
    description: 'Additional notes for this position',
    example: 'Must have 3+ years experience',
  })
  @IsOptional()
  @IsString()
  position_notes?: string;
}

/**
 * DTO for updating an existing position.
 * All fields are optional (PATCH semantics).
 */
export class UpdatePositionDto {
  @ApiPropertyOptional({
    description: 'Position title',
    example: 'Senior Electrician',
    maxLength: 255,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  title?: string;

  @ApiPropertyOptional({
    description: 'Vacancy counts by gender',
    type: VacanciesDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => VacanciesDto)
  vacancies?: VacanciesDto;

  @ApiPropertyOptional({
    description: 'Salary information',
    type: SalaryDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => SalaryDto)
  salary?: SalaryDto;

  @ApiPropertyOptional({
    description: 'Override: hours per day for this position',
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  hours_per_day_override?: number;

  @ApiPropertyOptional({
    description: 'Override: days per week for this position',
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  days_per_week_override?: number;

  @ApiPropertyOptional({
    description: 'Override: overtime policy for this position',
    enum: OvertimePolicyEnum,
  })
  @IsOptional()
  @IsEnum(OvertimePolicyEnum)
  overtime_policy_override?: OvertimePolicyEnum;

  @ApiPropertyOptional({
    description: 'Override: weekly off days for this position',
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  weekly_off_days_override?: number;

  @ApiPropertyOptional({
    description: 'Override: food provision for this position',
    enum: ProvisionTypeEnum,
  })
  @IsOptional()
  @IsEnum(ProvisionTypeEnum)
  food_override?: ProvisionTypeEnum;

  @ApiPropertyOptional({
    description: 'Override: accommodation provision for this position',
    enum: ProvisionTypeEnum,
  })
  @IsOptional()
  @IsEnum(ProvisionTypeEnum)
  accommodation_override?: ProvisionTypeEnum;

  @ApiPropertyOptional({
    description: 'Override: transport provision for this position',
    enum: ProvisionTypeEnum,
  })
  @IsOptional()
  @IsEnum(ProvisionTypeEnum)
  transport_override?: ProvisionTypeEnum;

  @ApiPropertyOptional({
    description: 'Additional notes for this position',
  })
  @IsOptional()
  @IsString()
  position_notes?: string;
}

// ============================================
// Tags DTOs
// ============================================

/**
 * Nested DTO for experience requirements.
 */
export class ExperienceRequirementsDto {
  @ApiPropertyOptional({
    description: 'Minimum years of experience',
    example: 2,
    minimum: 0,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  min_years?: number;

  @ApiPropertyOptional({
    description: 'Maximum years of experience',
    example: 10,
    minimum: 0,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  max_years?: number;

  @ApiPropertyOptional({
    description: 'Experience level',
    enum: ExperienceLevelEnum,
    example: 'experienced',
  })
  @IsOptional()
  @IsEnum(ExperienceLevelEnum)
  level?: ExperienceLevelEnum;
}

// ============================================
// Expense DTOs
// ============================================

/**
 * Nested DTO for medical expense update.
 */
export class UpdateMedicalExpenseDto {
  @ApiPropertyOptional({ description: 'Who pays for domestic medical', enum: ['company', 'worker', 'shared', 'not_applicable', 'agency'] })
  @IsOptional()
  @IsString()
  domestic_who_pays?: string;

  @ApiPropertyOptional({ description: 'Is domestic medical free' })
  @IsOptional()
  @IsBoolean()
  domestic_is_free?: boolean;

  @ApiPropertyOptional({ description: 'Domestic medical amount' })
  @IsOptional()
  @IsNumber()
  domestic_amount?: number;

  @ApiPropertyOptional({ description: 'Domestic medical currency' })
  @IsOptional()
  @IsString()
  domestic_currency?: string;

  @ApiPropertyOptional({ description: 'Domestic medical notes' })
  @IsOptional()
  @IsString()
  domestic_notes?: string;

  @ApiPropertyOptional({ description: 'Who pays for foreign medical', enum: ['company', 'worker', 'shared', 'not_applicable', 'agency'] })
  @IsOptional()
  @IsString()
  foreign_who_pays?: string;

  @ApiPropertyOptional({ description: 'Is foreign medical free' })
  @IsOptional()
  @IsBoolean()
  foreign_is_free?: boolean;

  @ApiPropertyOptional({ description: 'Foreign medical amount' })
  @IsOptional()
  @IsNumber()
  foreign_amount?: number;

  @ApiPropertyOptional({ description: 'Foreign medical currency' })
  @IsOptional()
  @IsString()
  foreign_currency?: string;

  @ApiPropertyOptional({ description: 'Foreign medical notes' })
  @IsOptional()
  @IsString()
  foreign_notes?: string;
}

/**
 * Nested DTO for insurance expense update.
 */
export class UpdateInsuranceExpenseDto {
  @ApiPropertyOptional({ description: 'Who pays', enum: ['company', 'worker', 'shared', 'not_applicable', 'agency'] })
  @IsOptional()
  @IsString()
  who_pays?: string;

  @ApiPropertyOptional({ description: 'Is free' })
  @IsOptional()
  @IsBoolean()
  is_free?: boolean;

  @ApiPropertyOptional({ description: 'Amount' })
  @IsOptional()
  @IsNumber()
  amount?: number;

  @ApiPropertyOptional({ description: 'Currency' })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiPropertyOptional({ description: 'Coverage amount' })
  @IsOptional()
  @IsNumber()
  coverage_amount?: number;

  @ApiPropertyOptional({ description: 'Coverage currency' })
  @IsOptional()
  @IsString()
  coverage_currency?: string;

  @ApiPropertyOptional({ description: 'Notes' })
  @IsOptional()
  @IsString()
  notes?: string;
}

/**
 * Nested DTO for travel expense update.
 */
export class UpdateTravelExpenseDto {
  @ApiPropertyOptional({ description: 'Who provides', enum: ['company', 'worker', 'shared', 'not_applicable', 'agency'] })
  @IsOptional()
  @IsString()
  who_provides?: string;

  @ApiPropertyOptional({ description: 'Ticket type', enum: ['one_way', 'round_trip', 'return_only'] })
  @IsOptional()
  @IsString()
  ticket_type?: string;

  @ApiPropertyOptional({ description: 'Is free' })
  @IsOptional()
  @IsBoolean()
  is_free?: boolean;

  @ApiPropertyOptional({ description: 'Amount' })
  @IsOptional()
  @IsNumber()
  amount?: number;

  @ApiPropertyOptional({ description: 'Currency' })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiPropertyOptional({ description: 'Notes' })
  @IsOptional()
  @IsString()
  notes?: string;
}

/**
 * Nested DTO for visa/permit expense update.
 */
export class UpdateVisaPermitExpenseDto {
  @ApiPropertyOptional({ description: 'Who pays', enum: ['company', 'worker', 'shared', 'not_applicable', 'agency'] })
  @IsOptional()
  @IsString()
  who_pays?: string;

  @ApiPropertyOptional({ description: 'Is free' })
  @IsOptional()
  @IsBoolean()
  is_free?: boolean;

  @ApiPropertyOptional({ description: 'Amount' })
  @IsOptional()
  @IsNumber()
  amount?: number;

  @ApiPropertyOptional({ description: 'Currency' })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiPropertyOptional({ description: 'Is refundable' })
  @IsOptional()
  @IsBoolean()
  refundable?: boolean;

  @ApiPropertyOptional({ description: 'Notes' })
  @IsOptional()
  @IsString()
  notes?: string;
}

/**
 * Nested DTO for training expense update.
 */
export class UpdateTrainingExpenseDto {
  @ApiPropertyOptional({ description: 'Who pays', enum: ['company', 'worker', 'shared', 'not_applicable', 'agency'] })
  @IsOptional()
  @IsString()
  who_pays?: string;

  @ApiPropertyOptional({ description: 'Is free' })
  @IsOptional()
  @IsBoolean()
  is_free?: boolean;

  @ApiPropertyOptional({ description: 'Amount' })
  @IsOptional()
  @IsNumber()
  amount?: number;

  @ApiPropertyOptional({ description: 'Currency' })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiPropertyOptional({ description: 'Duration in days' })
  @IsOptional()
  @IsInt()
  duration_days?: number;

  @ApiPropertyOptional({ description: 'Is mandatory' })
  @IsOptional()
  @IsBoolean()
  mandatory?: boolean;

  @ApiPropertyOptional({ description: 'Notes' })
  @IsOptional()
  @IsString()
  notes?: string;
}

/**
 * Nested DTO for welfare/service expense update.
 */
export class UpdateWelfareServiceExpenseDto {
  // Welfare fund fields
  @ApiPropertyOptional({ description: 'Welfare - who pays', enum: ['company', 'worker', 'shared', 'not_applicable', 'agency'] })
  @IsOptional()
  @IsString()
  welfare_who_pays?: string;

  @ApiPropertyOptional({ description: 'Welfare - is free' })
  @IsOptional()
  @IsBoolean()
  welfare_is_free?: boolean;

  @ApiPropertyOptional({ description: 'Welfare - amount' })
  @IsOptional()
  @IsNumber()
  welfare_amount?: number;

  @ApiPropertyOptional({ description: 'Welfare - currency' })
  @IsOptional()
  @IsString()
  welfare_currency?: string;

  @ApiPropertyOptional({ description: 'Welfare fund purpose' })
  @IsOptional()
  @IsString()
  welfare_fund_purpose?: string;

  @ApiPropertyOptional({ description: 'Welfare - is refundable' })
  @IsOptional()
  @IsBoolean()
  welfare_refundable?: boolean;

  @ApiPropertyOptional({ description: 'Welfare - notes' })
  @IsOptional()
  @IsString()
  welfare_notes?: string;

  // Service charge fields
  @ApiPropertyOptional({ description: 'Service - who pays', enum: ['company', 'worker', 'shared', 'not_applicable', 'agency'] })
  @IsOptional()
  @IsString()
  service_who_pays?: string;

  @ApiPropertyOptional({ description: 'Service - is free' })
  @IsOptional()
  @IsBoolean()
  service_is_free?: boolean;

  @ApiPropertyOptional({ description: 'Service - amount' })
  @IsOptional()
  @IsNumber()
  service_amount?: number;

  @ApiPropertyOptional({ description: 'Service - currency' })
  @IsOptional()
  @IsString()
  service_currency?: string;

  @ApiPropertyOptional({ description: 'Service type' })
  @IsOptional()
  @IsString()
  service_type?: string;

  @ApiPropertyOptional({ description: 'Service - is refundable' })
  @IsOptional()
  @IsBoolean()
  service_refundable?: boolean;

  @ApiPropertyOptional({ description: 'Service - notes' })
  @IsOptional()
  @IsString()
  service_notes?: string;
}

/**
 * DTO for updating job posting expenses.
 * Uses PATCH semantics - only provided expense categories are updated.
 */
export class UpdateExpensesDto {
  @ApiPropertyOptional({ description: 'Medical expense', type: UpdateMedicalExpenseDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateMedicalExpenseDto)
  medical?: UpdateMedicalExpenseDto;

  @ApiPropertyOptional({ description: 'Insurance expense', type: UpdateInsuranceExpenseDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateInsuranceExpenseDto)
  insurance?: UpdateInsuranceExpenseDto;

  @ApiPropertyOptional({ description: 'Travel expense', type: UpdateTravelExpenseDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateTravelExpenseDto)
  travel?: UpdateTravelExpenseDto;

  @ApiPropertyOptional({ description: 'Visa/permit expense', type: UpdateVisaPermitExpenseDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateVisaPermitExpenseDto)
  visa_permit?: UpdateVisaPermitExpenseDto;

  @ApiPropertyOptional({ description: 'Training expense', type: UpdateTrainingExpenseDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateTrainingExpenseDto)
  training?: UpdateTrainingExpenseDto;

  @ApiPropertyOptional({ description: 'Welfare/service expense', type: UpdateWelfareServiceExpenseDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateWelfareServiceExpenseDto)
  welfare_service?: UpdateWelfareServiceExpenseDto;
}

/**
 * DTO for updating job posting tags.
 */
export class UpdateTagsDto {
  @ApiPropertyOptional({
    description: 'Required skills',
    type: [String],
    example: ['electrical-work', 'safety-protocols', 'teamwork'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  skills?: string[];

  @ApiPropertyOptional({
    description: 'Education requirements',
    type: [String],
    example: ['high-school', 'diploma'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  education_requirements?: string[];

  @ApiPropertyOptional({
    description: 'Experience requirements',
    type: ExperienceRequirementsDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => ExperienceRequirementsDto)
  experience_requirements?: ExperienceRequirementsDto;

  @ApiPropertyOptional({
    description: 'Canonical job title IDs (UUIDs)',
    type: [String],
    example: ['uuid-1', 'uuid-2'],
  })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  canonical_title_ids?: string[];

  @ApiPropertyOptional({
    description: 'Canonical job title names (alternative to IDs)',
    type: [String],
    example: ['Electrician', 'Electrical Technician'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  canonical_title_names?: string[];
}


// ============================================
// Output DTOs
// ============================================

/**
 * Response DTO for template job posting creation.
 */
export class TemplateCreatedDto {
  @ApiProperty({
    description: 'Created job posting ID',
    example: 'd841e933-1a14-4602-97e2-c51c9e5d8cf2',
  })
  id!: string;

  @ApiProperty({
    description: 'Job posting title',
    example: 'Electrician - Dubai Project',
  })
  posting_title!: string;

  @ApiProperty({
    description: 'Destination country',
    example: 'UAE',
  })
  country!: string;

  @ApiPropertyOptional({
    description: 'Destination city',
    example: 'Dubai',
    nullable: true,
  })
  city!: string | null;

  @ApiProperty({
    description: 'Creation timestamp',
    example: '2025-01-20T10:30:00.000Z',
  })
  created_at!: string;
}

/**
 * Nested DTO for employer in editable response.
 */
export class EditableEmployerDto {
  @ApiProperty({ description: 'Employer ID' })
  id!: string;

  @ApiProperty({ description: 'Company name' })
  company_name!: string;

  @ApiProperty({ description: 'Country' })
  country!: string;

  @ApiPropertyOptional({ description: 'City', nullable: true })
  city!: string | null;
}

/**
 * Nested DTO for contract in editable response.
 */
export class EditableContractDto {
  @ApiProperty({ description: 'Contract ID' })
  id!: string;

  @ApiPropertyOptional({ description: 'Contract period in years', nullable: true })
  period_years!: number | null;

  @ApiProperty({ description: 'Whether contract is renewable' })
  renewable!: boolean;

  @ApiPropertyOptional({ description: 'Working hours per day', nullable: true })
  hours_per_day!: number | null;

  @ApiPropertyOptional({ description: 'Working days per week', nullable: true })
  days_per_week!: number | null;

  @ApiPropertyOptional({ description: 'Overtime policy', nullable: true })
  overtime_policy!: string | null;

  @ApiPropertyOptional({ description: 'Weekly off days', nullable: true })
  weekly_off_days!: number | null;

  @ApiPropertyOptional({ description: 'Food provision', nullable: true })
  food!: string | null;

  @ApiPropertyOptional({ description: 'Accommodation provision', nullable: true })
  accommodation!: string | null;

  @ApiPropertyOptional({ description: 'Transport provision', nullable: true })
  transport!: string | null;

  @ApiPropertyOptional({ description: 'Annual leave days', nullable: true })
  annual_leave_days!: number | null;
}

/**
 * Nested DTO for position in editable response.
 */
export class EditablePositionDto {
  @ApiProperty({ description: 'Position ID' })
  id!: string;

  @ApiProperty({ description: 'Position title' })
  title!: string;

  @ApiProperty({ description: 'Male vacancies' })
  male_vacancies!: number;

  @ApiProperty({ description: 'Female vacancies' })
  female_vacancies!: number;

  @ApiProperty({ description: 'Total vacancies (computed)' })
  total_vacancies!: number;

  @ApiProperty({ description: 'Monthly salary amount' })
  monthly_salary_amount!: number;

  @ApiProperty({ description: 'Salary currency' })
  salary_currency!: string;

  @ApiPropertyOptional({ description: 'Override: hours per day', nullable: true })
  hours_per_day_override!: number | null;

  @ApiPropertyOptional({ description: 'Override: days per week', nullable: true })
  days_per_week_override!: number | null;

  @ApiPropertyOptional({ description: 'Override: overtime policy', nullable: true })
  overtime_policy_override!: string | null;

  @ApiPropertyOptional({ description: 'Override: weekly off days', nullable: true })
  weekly_off_days_override!: number | null;

  @ApiPropertyOptional({ description: 'Override: food provision', nullable: true })
  food_override!: string | null;

  @ApiPropertyOptional({ description: 'Override: accommodation provision', nullable: true })
  accommodation_override!: string | null;

  @ApiPropertyOptional({ description: 'Override: transport provision', nullable: true })
  transport_override!: string | null;

  @ApiPropertyOptional({ description: 'Position notes', nullable: true })
  position_notes!: string | null;
}

/**
 * Nested DTO for canonical title in editable response.
 */
export class EditableCanonicalTitleDto {
  @ApiProperty({ description: 'Job title ID' })
  id!: string;

  @ApiProperty({ description: 'Job title name' })
  title!: string;
}

/**
 * Nested DTO for experience requirements in editable response.
 */
export class EditableExperienceRequirementsDto {
  @ApiPropertyOptional({ description: 'Minimum years', nullable: true })
  min_years!: number | null;

  @ApiPropertyOptional({ description: 'Maximum years', nullable: true })
  max_years!: number | null;

  @ApiPropertyOptional({ description: 'Experience level', nullable: true })
  level!: string | null;
}

/**
 * Nested DTO for tags in editable response.
 */
export class EditableTagsDto {
  @ApiProperty({ description: 'Skills array', type: [String] })
  skills!: string[];

  @ApiProperty({ description: 'Education requirements array', type: [String] })
  education_requirements!: string[];

  @ApiPropertyOptional({
    description: 'Experience requirements',
    type: EditableExperienceRequirementsDto,
    nullable: true,
  })
  experience_requirements!: EditableExperienceRequirementsDto | null;

  @ApiProperty({
    description: 'Canonical job titles',
    type: [EditableCanonicalTitleDto],
  })
  canonical_titles!: EditableCanonicalTitleDto[];
}

/**
 * Nested DTO for expenses in editable response.
 */
export class EditableExpensesDto {
  @ApiPropertyOptional({ description: 'Medical expense', nullable: true })
  medical!: any | null;

  @ApiPropertyOptional({ description: 'Insurance expense', nullable: true })
  insurance!: any | null;

  @ApiPropertyOptional({ description: 'Travel expense', nullable: true })
  travel!: any | null;

  @ApiPropertyOptional({ description: 'Visa/permit expense', nullable: true })
  visa_permit!: any | null;

  @ApiPropertyOptional({ description: 'Training expense', nullable: true })
  training!: any | null;

  @ApiPropertyOptional({ description: 'Welfare/service expense', nullable: true })
  welfare_service!: any | null;
}

/**
 * Complete editable job details response DTO.
 * Includes all fields (even if null) to support frontend form binding.
 */
export class EditableJobDetailsDto {
  @ApiProperty({ description: 'Job posting ID' })
  id!: string;

  @ApiProperty({ description: 'Job posting title' })
  posting_title!: string;

  @ApiProperty({ description: 'Destination country' })
  country!: string;

  @ApiPropertyOptional({ description: 'Destination city', nullable: true })
  city!: string | null;

  @ApiPropertyOptional({ description: 'LT number', nullable: true })
  lt_number!: string | null;

  @ApiPropertyOptional({ description: 'Chalani number', nullable: true })
  chalani_number!: string | null;

  @ApiPropertyOptional({ description: 'Approval date (BS)', nullable: true })
  approval_date_bs!: string | null;

  @ApiPropertyOptional({ description: 'Approval date (AD)', nullable: true })
  approval_date_ad!: string | null;

  @ApiPropertyOptional({ description: 'Posting date (AD)', nullable: true })
  posting_date_ad!: string | null;

  @ApiPropertyOptional({ description: 'Posting date (BS)', nullable: true })
  posting_date_bs!: string | null;

  @ApiPropertyOptional({ description: 'Announcement type', nullable: true })
  announcement_type!: string | null;

  @ApiPropertyOptional({ description: 'Notes/description', nullable: true })
  notes!: string | null;

  @ApiProperty({ description: 'Whether job posting is active' })
  is_active!: boolean;

  @ApiProperty({ description: 'Whether job posting is in draft status' })
  is_draft!: boolean;

  @ApiPropertyOptional({ description: 'Cutout image URL', nullable: true })
  cutout_url!: string | null;

  @ApiPropertyOptional({
    description: 'Employer information',
    type: EditableEmployerDto,
    nullable: true,
  })
  employer!: EditableEmployerDto | null;

  @ApiPropertyOptional({
    description: 'Contract information',
    type: EditableContractDto,
    nullable: true,
  })
  contract!: EditableContractDto | null;

  @ApiProperty({
    description: 'Positions array',
    type: [EditablePositionDto],
  })
  positions!: EditablePositionDto[];

  @ApiProperty({
    description: 'Tags (skills, education, experience, canonical titles)',
    type: EditableTagsDto,
  })
  tags!: EditableTagsDto;

  @ApiProperty({
    description: 'Expenses',
    type: EditableExpensesDto,
  })
  expenses!: EditableExpensesDto;

  @ApiProperty({ description: 'Creation timestamp' })
  created_at!: string;

  @ApiProperty({ description: 'Last update timestamp' })
  updated_at!: string;
}

/**
 * Simple response DTO for update operations.
 */
export class JobPostingUpdatedDto {
  @ApiProperty({ description: 'Job posting ID' })
  id!: string;

  @ApiProperty({ description: 'Update timestamp' })
  updated_at!: string;
}

/**
 * Response DTO for position operations.
 */
export class PositionResponseDto {
  @ApiProperty({ description: 'Position ID' })
  id!: string;

  @ApiProperty({ description: 'Position title' })
  title!: string;

  @ApiProperty({ description: 'Male vacancies' })
  male_vacancies!: number;

  @ApiProperty({ description: 'Female vacancies' })
  female_vacancies!: number;

  @ApiProperty({ description: 'Total vacancies' })
  total_vacancies!: number;

  @ApiProperty({ description: 'Monthly salary amount' })
  monthly_salary_amount!: number;

  @ApiProperty({ description: 'Salary currency' })
  salary_currency!: string;
}

// ============================================
// Default Values Constants
// ============================================

/**
 * Default values used when creating a template job posting.
 */
export const TEMPLATE_DEFAULTS = {
  employer: {
    company_name: 'TBD - Employer Name',
    // country will be set from job posting country
    city: null as string | null,
  },
  contract: {
    period_years: 2,
    renewable: false,
    hours_per_day: 8,
    days_per_week: 6,
    overtime_policy: 'as_per_company_policy',
    weekly_off_days: 1,
    food: 'free',
    accommodation: 'free',
    transport: 'free',
    annual_leave_days: 30,
  },
  position: {
    title: 'TBD - Position Title',
    male_vacancies: 0,
    female_vacancies: 0,
    monthly_salary_amount: 0,
    salary_currency: 'USD',
  },
};
