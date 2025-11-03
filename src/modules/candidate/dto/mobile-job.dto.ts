import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class MobileJobPositionDto {
  @ApiProperty({ type: String }) id!: string;
  @ApiProperty({ type: String }) title!: string;
  @ApiPropertyOptional({ type: String }) baseSalary?: string;
  @ApiPropertyOptional({ type: String }) convertedSalary?: string;
  @ApiPropertyOptional({ type: String }) currency?: string;
  @ApiPropertyOptional({ type: [String] }) requirements?: string[];
  @ApiPropertyOptional({ 
    type: Boolean,
    description: 'Whether the candidate has applied to this position'
  })
  hasApplied?: boolean;
}

export class MobileContractTermsDto {
  @ApiProperty({ type: String }) type!: string;
  @ApiProperty({ type: String }) duration!: string;
  @ApiPropertyOptional({ type: String }) salary?: string; 
  @ApiPropertyOptional({ type: Boolean }) isRenewable?: boolean;
  @ApiPropertyOptional({ type: String }) noticePeriod?: string;
  @ApiPropertyOptional({ type: String }) workingHours?: string;
  @ApiPropertyOptional({ type: String }) probationPeriod?: string;
  @ApiPropertyOptional({ type: String }) benefits?: string;
}

export class MobileJobPostingDto {
  @ApiProperty({ type: String }) id!: string;
  @ApiProperty({ type: String }) postingTitle!: string;
  @ApiProperty({ type: String }) country!: string;
  @ApiPropertyOptional({ type: String, nullable: true }) city?: string | null;
  @ApiPropertyOptional({ type: String }) agency?: string;
  @ApiPropertyOptional({ type: String }) employer?: string;

  @ApiProperty({ type: [MobileJobPositionDto] }) 
  positions!: MobileJobPositionDto[];

  @ApiPropertyOptional({ type: String }) description?: string;

  @ApiPropertyOptional({ 
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

  @ApiProperty({ type: Boolean }) isActive!: boolean;
  @ApiPropertyOptional({ type: String, format: 'date-time' }) postedDate?: string;
  @ApiPropertyOptional({ type: String }) preferencePriority?: string;
  @ApiPropertyOptional({ type: String }) preferenceText?: string;
  @ApiPropertyOptional({ type: String }) location?: string;
  @ApiPropertyOptional({ type: String }) experience?: string;
  @ApiPropertyOptional({ type: String }) salary?: string;
  @ApiPropertyOptional({ type: String }) type?: string;
  @ApiProperty({ type: Boolean }) isRemote!: boolean;
  @ApiProperty({ type: Boolean }) isFeatured!: boolean;
  @ApiPropertyOptional({ type: String }) companyLogo?: string;
  @ApiPropertyOptional({ type: String }) matchPercentage?: string;
  @ApiPropertyOptional({ type: String }) convertedSalary?: string;
  @ApiPropertyOptional({ type: Number }) applications?: number;
  @ApiPropertyOptional({ type: String }) policy?: string;
}
