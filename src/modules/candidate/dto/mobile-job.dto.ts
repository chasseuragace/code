import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

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
  @ApiPropertyOptional({ description: 'Requirements', type: [String] })
    requirements?: string[];
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
  @ApiPropertyOptional({ description: 'Agency', type: String })
    agency?: string;
  @ApiPropertyOptional({ description: 'Employer', type: String })
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
}
