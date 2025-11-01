import { ApiProperty } from '@nestjs/swagger';

export class VacancyDto {
  @ApiProperty({ required: false, nullable: true }) male?: number | null;
  @ApiProperty({ required: false, nullable: true }) female?: number | null;
  @ApiProperty({ required: false, nullable: true }) total?: number | null;
}

export class SalaryConvDto {
  @ApiProperty() amount!: number;
  @ApiProperty() currency!: string;
}

export class PositionSalaryDto {
  @ApiProperty() monthly_amount!: number;
  @ApiProperty() currency!: string;
  @ApiProperty({ type: [SalaryConvDto], required: false }) converted?: SalaryConvDto[];
}

export class PositionOverridesDto {
  @ApiProperty({ required: false, nullable: true }) hours_per_day?: number | null;
  @ApiProperty({ required: false, nullable: true }) days_per_week?: number | null;
  @ApiProperty({ required: false, nullable: true }) overtime_policy?: string | null;
  @ApiProperty({ required: false, nullable: true }) weekly_off_days?: number | null;
  @ApiProperty({ required: false, nullable: true }) food?: string | null;
  @ApiProperty({ required: false, nullable: true }) accommodation?: string | null;
  @ApiProperty({ required: false, nullable: true }) transport?: string | null;
}

export class PositionDto {
  @ApiProperty() title!: string;
  @ApiProperty({ type: VacancyDto }) vacancies!: VacancyDto;
  @ApiProperty({ type: PositionSalaryDto }) salary!: PositionSalaryDto;
  @ApiProperty({ type: PositionOverridesDto }) overrides!: PositionOverridesDto;
}

export class AgencyLiteDto {
  @ApiProperty() id!: string;
  @ApiProperty() name!: string;
  @ApiProperty() license_number!: string;
}

export class EmployerLiteDto {
  @ApiProperty() id!: string;
  @ApiProperty() company_name!: string;
  @ApiProperty() country!: string;
  @ApiProperty({ required: false, nullable: true }) city?: string | null;
}

export class ContractDto {
  @ApiProperty({ required: false, nullable: true }) period_years?: number | null;
  @ApiProperty({ required: false, nullable: true }) renewable?: boolean | null;
  @ApiProperty({ required: false, nullable: true }) hours_per_day?: number | null;
  @ApiProperty({ required: false, nullable: true }) days_per_week?: number | null;
  @ApiProperty({ required: false, nullable: true }) overtime_policy?: string | null;
  @ApiProperty({ required: false, nullable: true }) weekly_off_days?: number | null;
  @ApiProperty({ required: false, nullable: true }) food?: string | null;
  @ApiProperty({ required: false, nullable: true }) accommodation?: string | null;
  @ApiProperty({ required: false, nullable: true }) transport?: string | null;
  @ApiProperty({ required: false, nullable: true }) annual_leave_days?: number | null;
}

export class ExpensesDto {
  @ApiProperty({ type: [Object], required: false }) medical?: any[];
  @ApiProperty({ type: [Object], required: false }) insurance?: any[];
  @ApiProperty({ type: [Object], required: false }) travel?: any[];
  @ApiProperty({ name: 'visa_permit', type: [Object], required: false }) visa_permit?: any[];
  @ApiProperty({ type: [Object], required: false }) training?: any[];
  @ApiProperty({ name: 'welfare_service', type: [Object], required: false }) welfare_service?: any[];
}

export class JobDetailsDto {
  @ApiProperty() id!: string;
  @ApiProperty() posting_title!: string;
  @ApiProperty() country!: string;
  @ApiProperty({ required: false, nullable: true }) city?: string | null;
  @ApiProperty({ required: false, nullable: true }) announcement_type?: string | null;
  @ApiProperty({ required: false, nullable: true }) posting_date_ad?: string | Date | null;
  @ApiProperty({ required: false, nullable: true }) notes?: string | null;
  @ApiProperty({ type: AgencyLiteDto, required: false, nullable: true }) agency?: AgencyLiteDto | null;
  @ApiProperty({ type: EmployerLiteDto, required: false, nullable: true }) employer?: EmployerLiteDto | null;
  @ApiProperty({ type: ContractDto, required: false, nullable: true }) contract?: ContractDto | null;
  @ApiProperty({ type: [PositionDto] }) positions!: PositionDto[];
  @ApiProperty({ type: [String], required: false }) skills?: string[];
  @ApiProperty({ type: [String], required: false }) education_requirements?: string[];
  @ApiProperty({ required: false, nullable: true }) experience_requirements?: any;
  @ApiProperty({ type: [String], required: false }) canonical_titles?: string[];
  @ApiProperty({ type: ExpensesDto, required: false }) expenses?: ExpensesDto;
  @ApiProperty({ required: false, nullable: true }) interview?: any;
  @ApiProperty({ required: false, nullable: true }) cutout_url?: string | null;
}

export class CandidateJobDetailsDto extends JobDetailsDto {
  @ApiProperty({ required: false, description: '0–100' }) fitness_score?: number;
}
