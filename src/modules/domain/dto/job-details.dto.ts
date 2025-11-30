import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class VacancyDto {
  
    @ApiPropertyOptional({ description: 'Male', required: false, nullable: true })
    male?: number | null;
  
    @ApiPropertyOptional({ description: 'Female', required: false, nullable: true })
    female?: number | null;
  
    @ApiPropertyOptional({ description: 'Total', required: false, nullable: true })
    total?: number | null;
}

export class SalaryConvDto {
  @ApiProperty({ description: 'Amount', example: 0 })
    amount!: number;
  @ApiProperty({ description: 'Currency', example: 'example' })
    currency!: string;
}

export class PositionSalaryDto {
  @ApiProperty({ description: 'Monthly amount', example: 0 })
    monthly_amount!: number;
  @ApiProperty({ description: 'Currency', example: 'example' })
    currency!: string;
  
    @ApiPropertyOptional({ description: 'Converted', type: [SalaryConvDto], required: false })
    converted?: SalaryConvDto[];
}

export class PositionOverridesDto {
  
    @ApiPropertyOptional({ description: 'Hours per day', required: false, nullable: true })
    hours_per_day?: number | null;
  
    @ApiPropertyOptional({ description: 'Days per week', required: false, nullable: true })
    days_per_week?: number | null;
  
    @ApiPropertyOptional({ description: 'Overtime policy', required: false, nullable: true })
    overtime_policy?: string | null;
  
    @ApiPropertyOptional({ description: 'Weekly off days', required: false, nullable: true })
    weekly_off_days?: number | null;
  
    @ApiPropertyOptional({ description: 'Food', required: false, nullable: true })
    food?: string | null;
  
    @ApiPropertyOptional({ description: 'Accommodation', required: false, nullable: true })
    accommodation?: string | null;
  
    @ApiPropertyOptional({ description: 'Transport', required: false, nullable: true })
    transport?: string | null;
}

export class PositionDto {
  @ApiProperty({ description: 'Title', example: 'example' })
    title!: string;
  @ApiProperty({ description: 'Vacancies', type: VacancyDto })
    vacancies!: VacancyDto;
  @ApiProperty({ description: 'Salary', type: PositionSalaryDto })
    salary!: PositionSalaryDto;
  @ApiProperty({ description: 'Overrides', type: PositionOverridesDto })
    overrides!: PositionOverridesDto;
}

export class AgencyLiteDto {
  @ApiProperty({ description: 'Id', example: 'example' })
    id!: string;
  @ApiProperty({ description: 'Name', example: 'Example Name' })
    name!: string;
  @ApiProperty({ description: 'License number', example: 'example' })
    license_number!: string;
}

export class EmployerLiteDto {
  @ApiProperty({ description: 'Id', example: 'example' })
    id!: string;
  @ApiProperty({ description: 'Company name', example: 'Example Name' })
    company_name!: string;
  @ApiProperty({ description: 'Country', example: 'example' })
    country!: string;
  
    @ApiPropertyOptional({ description: 'City', required: false, nullable: true })
    city?: string | null;
}

export class ContractDto {
  
    @ApiPropertyOptional({ description: 'Period years', required: false, nullable: true })
    period_years?: number | null;
  
    @ApiPropertyOptional({ description: 'Renewable', required: false, nullable: true })
    renewable?: boolean | null;
  
    @ApiPropertyOptional({ description: 'Hours per day', required: false, nullable: true })
    hours_per_day?: number | null;
  
    @ApiPropertyOptional({ description: 'Days per week', required: false, nullable: true })
    days_per_week?: number | null;
  
    @ApiPropertyOptional({ description: 'Overtime policy', required: false, nullable: true })
    overtime_policy?: string | null;
  
    @ApiPropertyOptional({ description: 'Weekly off days', required: false, nullable: true })
    weekly_off_days?: number | null;
  
    @ApiPropertyOptional({ description: 'Food', required: false, nullable: true })
    food?: string | null;
  
    @ApiPropertyOptional({ description: 'Accommodation', required: false, nullable: true })
    accommodation?: string | null;
  
    @ApiPropertyOptional({ description: 'Transport', required: false, nullable: true })
    transport?: string | null;
  
    @ApiPropertyOptional({ description: 'Annual leave days', required: false, nullable: true })
    annual_leave_days?: number | null;
}

export class ExpensesDto {
  
    @ApiPropertyOptional({ description: 'Medical', type: [Object], required: false })
    medical?: any[];
  
    @ApiPropertyOptional({ description: 'Insurance', type: [Object], required: false })
    insurance?: any[];
  
    @ApiPropertyOptional({ description: 'Travel', type: [Object], required: false })
    travel?: any[];
  
    @ApiPropertyOptional({ description: 'Visa permit', name: 'visa_permit', type: [Object], required: false })
    visa_permit?: any[];
  
    @ApiPropertyOptional({ description: 'Training', type: [Object], required: false })
    training?: any[];
  
    @ApiPropertyOptional({ description: 'Welfare service', name: 'welfare_service', type: [Object], required: false })
    welfare_service?: any[];
}

export class JobDetailsDto {
  @ApiProperty({ description: 'Id', example: 'example' })
    id!: string;
  @ApiProperty({ description: 'Posting title', example: 'example' })
    posting_title!: string;
  @ApiProperty({ description: 'Country', example: 'example' })
    country!: string;
  
    @ApiPropertyOptional({ description: 'City', required: false, nullable: true })
    city?: string | null;
  
    @ApiPropertyOptional({ description: 'Announcement type', required: false, nullable: true })
    announcement_type?: string | null;
  
    @ApiPropertyOptional({ description: 'Posting date ad', required: false, nullable: true })
    posting_date_ad?: string | Date | null;
  
    @ApiPropertyOptional({ description: 'Notes', required: false, nullable: true })
    notes?: string | null;
  
    @ApiPropertyOptional({ description: 'Agency', type: AgencyLiteDto, required: false, nullable: true })
    agency?: AgencyLiteDto | null;
  
    @ApiPropertyOptional({ description: 'Employer', type: EmployerLiteDto, required: false, nullable: true })
    employer?: EmployerLiteDto | null;
  
    @ApiPropertyOptional({ description: 'Contract', type: ContractDto, required: false, nullable: true })
    contract?: ContractDto | null;
  @ApiProperty({ description: 'Positions', type: [PositionDto] })
    positions!: PositionDto[];
  
    @ApiPropertyOptional({ description: 'Skills', type: [String], required: false })
    skills?: string[];
  
    @ApiPropertyOptional({ description: 'Education requirements', type: [String], required: false })
    education_requirements?: string[];
  
    @ApiPropertyOptional({ description: 'Experience requirements', required: false, nullable: true })
    experience_requirements?: any;
  
    @ApiPropertyOptional({ description: 'Canonical titles', type: [String], required: false })
    canonical_titles?: string[];
  
    @ApiPropertyOptional({ description: 'Expenses', type: ExpensesDto, required: false })
    expenses?: ExpensesDto;
  
    @ApiPropertyOptional({ description: 'Interview', required: false, nullable: true })
    interview?: any;
  
    @ApiPropertyOptional({ description: 'Cutout url', required: false, nullable: true })
    cutout_url?: string | null;
}

export class CandidateJobDetailsDto extends JobDetailsDto {
  @ApiPropertyOptional({ required: false, description: '0–100' })
    fitness_score?: number;
}
