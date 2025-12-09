import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// ============================================
// Mobile Expense DTOs
// ============================================

export class MobileMedicalExpenseDto {
  @ApiPropertyOptional({ description: 'Domestic - who pays' })
  domestic_who_pays?: string;
  @ApiPropertyOptional({ description: 'Domestic - is free' })
  domestic_is_free?: boolean;
  @ApiPropertyOptional({ description: 'Domestic - amount' })
  domestic_amount?: number;
  @ApiPropertyOptional({ description: 'Domestic - currency' })
  domestic_currency?: string;
  @ApiPropertyOptional({ description: 'Foreign - who pays' })
  foreign_who_pays?: string;
  @ApiPropertyOptional({ description: 'Foreign - is free' })
  foreign_is_free?: boolean;
  @ApiPropertyOptional({ description: 'Foreign - amount' })
  foreign_amount?: number;
  @ApiPropertyOptional({ description: 'Foreign - currency' })
  foreign_currency?: string;
}

export class MobileInsuranceExpenseDto {
  @ApiPropertyOptional({ description: 'Who pays' })
  who_pays?: string;
  @ApiPropertyOptional({ description: 'Is free' })
  is_free?: boolean;
  @ApiPropertyOptional({ description: 'Amount' })
  amount?: number;
  @ApiPropertyOptional({ description: 'Currency' })
  currency?: string;
  @ApiPropertyOptional({ description: 'Coverage amount' })
  coverage_amount?: number;
  @ApiPropertyOptional({ description: 'Coverage currency' })
  coverage_currency?: string;
}

export class MobileTravelExpenseDto {
  @ApiPropertyOptional({ description: 'Who provides' })
  who_provides?: string;
  @ApiPropertyOptional({ description: 'Ticket type' })
  ticket_type?: string;
  @ApiPropertyOptional({ description: 'Is free' })
  is_free?: boolean;
  @ApiPropertyOptional({ description: 'Amount' })
  amount?: number;
  @ApiPropertyOptional({ description: 'Currency' })
  currency?: string;
}

export class MobileVisaPermitExpenseDto {
  @ApiPropertyOptional({ description: 'Who pays' })
  who_pays?: string;
  @ApiPropertyOptional({ description: 'Is free' })
  is_free?: boolean;
  @ApiPropertyOptional({ description: 'Amount' })
  amount?: number;
  @ApiPropertyOptional({ description: 'Currency' })
  currency?: string;
  @ApiPropertyOptional({ description: 'Is refundable' })
  refundable?: boolean;
}

export class MobileTrainingExpenseDto {
  @ApiPropertyOptional({ description: 'Who pays' })
  who_pays?: string;
  @ApiPropertyOptional({ description: 'Is free' })
  is_free?: boolean;
  @ApiPropertyOptional({ description: 'Amount' })
  amount?: number;
  @ApiPropertyOptional({ description: 'Currency' })
  currency?: string;
  @ApiPropertyOptional({ description: 'Duration in days' })
  duration_days?: number;
  @ApiPropertyOptional({ description: 'Is mandatory' })
  mandatory?: boolean;
}

export class MobileWelfareServiceExpenseDto {
  @ApiPropertyOptional({ description: 'Welfare - who pays' })
  welfare_who_pays?: string;
  @ApiPropertyOptional({ description: 'Welfare - is free' })
  welfare_is_free?: boolean;
  @ApiPropertyOptional({ description: 'Welfare - amount' })
  welfare_amount?: number;
  @ApiPropertyOptional({ description: 'Welfare - currency' })
  welfare_currency?: string;
  @ApiPropertyOptional({ description: 'Service - who pays' })
  service_who_pays?: string;
  @ApiPropertyOptional({ description: 'Service - is free' })
  service_is_free?: boolean;
  @ApiPropertyOptional({ description: 'Service - amount' })
  service_amount?: number;
  @ApiPropertyOptional({ description: 'Service - currency' })
  service_currency?: string;
}

export class MobileExpensesDto {
  @ApiPropertyOptional({ description: 'Medical expenses', type: MobileMedicalExpenseDto })
  medical?: MobileMedicalExpenseDto | null;
  @ApiPropertyOptional({ description: 'Insurance expenses', type: MobileInsuranceExpenseDto })
  insurance?: MobileInsuranceExpenseDto | null;
  @ApiPropertyOptional({ description: 'Travel expenses', type: MobileTravelExpenseDto })
  travel?: MobileTravelExpenseDto | null;
  @ApiPropertyOptional({ description: 'Visa/permit expenses', type: MobileVisaPermitExpenseDto })
  visa_permit?: MobileVisaPermitExpenseDto | null;
  @ApiPropertyOptional({ description: 'Training expenses', type: MobileTrainingExpenseDto })
  training?: MobileTrainingExpenseDto | null;
  @ApiPropertyOptional({ description: 'Welfare/service expenses', type: MobileWelfareServiceExpenseDto })
  welfare_service?: MobileWelfareServiceExpenseDto | null;
}

// ============================================
// Mobile Contract DTO
// ============================================

export class MobileContractDto {
  @ApiPropertyOptional({ description: 'Contract period in years' })
  period_years?: number;
  @ApiPropertyOptional({ description: 'Is renewable' })
  renewable?: boolean;
  @ApiPropertyOptional({ description: 'Hours per day' })
  hours_per_day?: number;
  @ApiPropertyOptional({ description: 'Days per week' })
  days_per_week?: number;
  @ApiPropertyOptional({ description: 'Overtime policy' })
  overtime_policy?: string;
  @ApiPropertyOptional({ description: 'Weekly off days' })
  weekly_off_days?: number;
  @ApiPropertyOptional({ description: 'Food provision' })
  food?: string;
  @ApiPropertyOptional({ description: 'Accommodation provision' })
  accommodation?: string;
  @ApiPropertyOptional({ description: 'Transport provision' })
  transport?: string;
  @ApiPropertyOptional({ description: 'Annual leave days' })
  annual_leave_days?: number;
}

export class MobileJobPositionDto {
  @ApiProperty({ description: 'Id', type: String })
    id!: string;
  @ApiProperty({ description: 'Title', type: String })
    title!: string;
  @ApiPropertyOptional({ description: 'Base salary', type: String })
    baseSalary?: string;
  @ApiPropertyOptional({ description: 'Converted salary', type: String })
    convertedSalary?: string;
  @ApiPropertyOptional({ description: 'Currency', type: String })
    currency?: string;
  @ApiPropertyOptional({ description: 'Male vacancies', type: Number })
    maleVacancies?: number;
  @ApiPropertyOptional({ description: 'Female vacancies', type: Number })
    femaleVacancies?: number;
  @ApiPropertyOptional({ description: 'Total vacancies', type: Number })
    totalVacancies?: number;
  @ApiPropertyOptional({ description: 'Position notes', type: String })
    notes?: string;
  @ApiPropertyOptional({ 
    type: Boolean,
    description: 'Whether the candidate has applied to this position'
  })
  hasApplied?: boolean;
}

export class MobileContractTermsDto {
  @ApiProperty({ description: 'Type', type: String })
    type!: string;
  @ApiProperty({ description: 'Duration', type: String })
    duration!: string;
  @ApiPropertyOptional({ description: 'Salary', type: String })
    salary?: string; 
  @ApiPropertyOptional({ description: 'Is renewable', type: Boolean })
    isRenewable?: boolean;
  @ApiPropertyOptional({ description: 'Notice period', type: String })
    noticePeriod?: string;
  @ApiPropertyOptional({ description: 'Working hours', type: String })
    workingHours?: string;
  @ApiPropertyOptional({ description: 'Probation period', type: String })
    probationPeriod?: string;
  @ApiPropertyOptional({ description: 'Benefits', type: String })
    benefits?: string;
}

export class MobileJobPostingDto {
  @ApiProperty({ description: 'Id', type: String })
    id!: string;
  @ApiProperty({ description: 'Posting title', type: String })
    postingTitle!: string;
  @ApiProperty({ description: 'Country', type: String })
    country!: string;
  @ApiPropertyOptional({ description: 'City', type: String, nullable: true })
    city?: string | null;
  @ApiPropertyOptional({ description: 'LLT number (labor license reference)', type: String })
    ltNumber?: string;
  @ApiPropertyOptional({ description: 'Chalani number (dispatch reference)', type: String })
    chalaniNumber?: string;
  @ApiPropertyOptional({ description: 'Agency name', type: String })
    agency?: string;
  @ApiPropertyOptional({ description: 'Agency ID', type: String })
    agencyId?: string;
  @ApiPropertyOptional({ description: 'Agency logo URL', type: String })
    agencyLogo?: string;
  @ApiPropertyOptional({ description: 'Agency rating (0-5)', type: Number })
    agencyRating?: number;
  @ApiPropertyOptional({ description: 'Agency review count', type: Number })
    agencyReviewCount?: number;
  @ApiPropertyOptional({ description: 'Company size category derived from established year', type: String, example: 'Established (10-20 years)' })
    companySize?: string;
  @ApiPropertyOptional({ description: 'Agency established year', type: Number })
    establishedYear?: number;
  @ApiPropertyOptional({ description: 'Employer company name', type: String })
    employer?: string;

  
  @ApiProperty({ description: 'Positions', type: [MobileJobPositionDto] })
    positions!: MobileJobPositionDto[];

  @ApiPropertyOptional({ description: 'Description', type: String })
    description?: string;

  
  @ApiPropertyOptional({ description: 'Contract terms', 
        type: MobileContractTermsDto, 
        nullable: true, 
        example: { 
          type: 'Full-time', 
          duration: '2 years', 
          salary: '50000-70000',
          isRenewable: true,
          noticePeriod: '1 month',
          workingHours: '40 hours/week',
          probationPeriod: '3 months',
          benefits: 'Health insurance, Paid leave'
        } 
      })
    contractTerms?: MobileContractTermsDto | null;

  @ApiProperty({ description: 'Is active', type: Boolean })
    isActive!: boolean;
  @ApiPropertyOptional({ description: 'Posted date', type: String, format: 'date-time' })
    postedDate?: string;
  @ApiPropertyOptional({ description: 'Preference priority', type: String })
    preferencePriority?: string;
  @ApiPropertyOptional({ description: 'Preference text', type: String })
    preferenceText?: string;
  @ApiPropertyOptional({ description: 'Location', type: String })
    location?: string;
  @ApiPropertyOptional({ description: 'Experience', type: String })
    experience?: string;
  @ApiPropertyOptional({ description: 'Salary', type: String })
    salary?: string;
  @ApiPropertyOptional({ description: 'Type', type: String })
    type?: string;
  @ApiProperty({ description: 'Is remote', type: Boolean })
    isRemote!: boolean;
  @ApiProperty({ description: 'Is featured', type: Boolean })
    isFeatured!: boolean;
  @ApiPropertyOptional({ description: 'Company logo', type: String })
    companyLogo?: string;
  @ApiPropertyOptional({ description: 'Match percentage', type: String })
    matchPercentage?: string;
  @ApiPropertyOptional({ description: 'Converted salary', type: String })
    convertedSalary?: string;
  @ApiPropertyOptional({ description: 'Applications', type: Number })
    applications?: number;
  @ApiPropertyOptional({ description: 'Policy', type: String })
    policy?: string;
  @ApiPropertyOptional({ description: 'Agency specializations', type: [String] })
    agencySpecializations?: string[];
  @ApiPropertyOptional({ description: 'Agency target countries', type: [String] })
    agencyTargetCountries?: string[];
  @ApiPropertyOptional({ description: 'Agency website', type: String })
    agencyWebsite?: string;
  @ApiPropertyOptional({ description: 'Agency address', type: String })
    agencyAddress?: string;
  @ApiPropertyOptional({ description: 'Agency phones', type: [String] })
    agencyPhones?: string[];
  @ApiPropertyOptional({ description: 'Job cutout image URL', type: String })
    cutoutImageUrl?: string;
  @ApiPropertyOptional({ description: 'Contract details', type: MobileContractDto })
    contract?: MobileContractDto | null;
  @ApiPropertyOptional({ description: 'Job expenses', type: MobileExpensesDto })
    expenses?: MobileExpensesDto | null;
}
