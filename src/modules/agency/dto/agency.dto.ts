import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsDateString, IsEmail, IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, IsUrl, MaxLength, ValidateNested, ArrayNotEmpty, IsObject, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class CertificationDto {
  
  @IsOptional()
  @IsString()
    @ApiPropertyOptional({ description: 'Name', example: 'Example Name' })
  name?: string;

  
  @IsOptional()
  @IsString()
    @ApiPropertyOptional({ description: 'Number', example: 'example' })
  number?: string;

  
  @IsOptional()
  @IsString()
    @ApiPropertyOptional({ description: 'Issued by', example: 'example' })
  issued_by?: string;

  @ApiPropertyOptional({ description: 'ISO date string (YYYY-MM-DD)' })
  @IsOptional()
  @IsDateString()
  issued_date?: string;

  @ApiPropertyOptional({ description: 'ISO date string (YYYY-MM-DD)' })
  @IsOptional()
  @IsDateString()
  expiry_date?: string;
}

export class SocialMediaDto {
  
  @IsOptional()
  @IsUrl({ require_protocol: true }, { message: 'facebook must be a URL with protocol' })
    @ApiPropertyOptional({ description: 'Facebook', example: 'example' })
  facebook?: string;

  
  @IsOptional()
  @IsUrl({ require_protocol: true })
    @ApiPropertyOptional({ description: 'Instagram', example: 'example' })
  instagram?: string;

  
  @IsOptional()
  @IsUrl({ require_protocol: true })
    @ApiPropertyOptional({ description: 'Linkedin', example: 'https://example.com' })
  linkedin?: string;

  
  @IsOptional()
  @IsUrl({ require_protocol: true })
    @ApiPropertyOptional({ description: 'Twitter', example: 'example' })
  twitter?: string;
}

export class BankDetailsDto {
  
  @IsOptional()
  @IsString()
    @ApiPropertyOptional({ description: 'Bank name', example: 'Example Name' })
  bank_name?: string;

  
  @IsOptional()
  @IsString()
    @ApiPropertyOptional({ description: 'Account name', example: 'Example Name' })
  account_name?: string;

  
  @IsOptional()
  @IsString()
    @ApiPropertyOptional({ description: 'Account number', example: 'example' })
  account_number?: string;

  
  @IsOptional()
  @IsString()
    @ApiPropertyOptional({ description: 'Swift code', example: 'example' })
  swift_code?: string;
}

export class ContactPersonDto {
  
  @IsOptional()
  @IsString()
    @ApiPropertyOptional({ description: 'Name', example: 'Example Name' })
  name?: string;

  
  @IsOptional()
  @IsString()
    @ApiPropertyOptional({ description: 'Position', example: 'example' })
  position?: string;

  
  @IsOptional()
  @IsString()
    @ApiPropertyOptional({ description: 'Phone', example: '+1234567890' })
  phone?: string;

  
  @IsOptional()
  @IsEmail()
    @ApiPropertyOptional({ description: 'Email', example: 'user@example.com' })
  email?: string;
}

export class OperatingHoursDto {
  
  @IsOptional()
  @IsString()
    @ApiPropertyOptional({ description: 'Weekdays', example: 'example' })
  weekdays?: string;

  
  @IsOptional()
  @IsString()
    @ApiPropertyOptional({ description: 'Saturday', example: 'example' })
  saturday?: string;

  
  @IsOptional()
  @IsString()
    @ApiPropertyOptional({ description: 'Sunday', example: 'example' })
  sunday?: string;
}

export class StatisticsDto {
  
  @IsOptional()
  @IsInt()
    @ApiPropertyOptional({ description: 'Total placements', example: 10 })
  total_placements?: number;

  @ApiPropertyOptional({ description: 'ISO date string (YYYY-MM-DD)' })
  @IsOptional()
  @IsDateString()
  active_since?: string;

  
  @IsOptional()
  @IsInt()
    @ApiPropertyOptional({ description: 'Success rate', example: 0 })
  success_rate?: number;

  
  @IsOptional()
  @IsInt()
    @ApiPropertyOptional({ description: 'Countries served', example: 10 })
  countries_served?: number;

  
  @IsOptional()
  @IsInt()
    @ApiPropertyOptional({ description: 'Partner companies', example: 0 })
  partner_companies?: number;

  
  @IsOptional()
  @IsInt()
    @ApiPropertyOptional({ description: 'Active recruiters', example: 0 })
  active_recruiters?: number;
}

export class SettingsDto {
  
  @IsOptional()
  @IsString()
    @ApiPropertyOptional({ description: 'Currency', example: 'example' })
  currency?: string;

  
  @IsOptional()
  @IsString()
    @ApiPropertyOptional({ description: 'Timezone', example: 'example' })
  timezone?: string;

  
  @IsOptional()
  @IsString()
    @ApiPropertyOptional({ description: 'Language', example: 'example' })
  language?: string;

  
  @IsOptional()
  @IsString()
    @ApiPropertyOptional({ description: 'Date format', example: 'example' })
  date_format?: string;

  
  @IsOptional()
  @IsObject()
    @ApiPropertyOptional({ description: 'Notifications', type: Object })
  notifications?: Record<string, any>;

  
  @IsOptional()
  @IsObject()
    @ApiPropertyOptional({ description: 'Features', type: Object })
  features?: Record<string, any>;
}

export class CreateAgencyDto {
  
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
    @ApiProperty({ description: 'Name', example: 'Example Name' })
  name!: string;

  @ApiProperty({ description: 'Unique license number for the agency' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  license_number!: string;

  
  @IsOptional()
  @IsString()
    @ApiPropertyOptional({ description: 'Country', example: 'example' })
  country?: string;

  
  @IsOptional()
  @IsString()
    @ApiPropertyOptional({ description: 'City', example: 'example' })
  city?: string;

  
  @IsOptional()
  @IsString()
    @ApiPropertyOptional({ description: 'Address', example: 'example' })
  address?: string;

  
  @IsOptional()
  @IsInt()
    @IsNumber()
    @ApiPropertyOptional({ description: 'Latitude', example: 0 })
  latitude?: number;

  
  @IsOptional()
  @IsInt()
    @IsNumber()
    @ApiPropertyOptional({ description: 'Longitude', example: 0 })
  longitude?: number;

  
  @IsOptional()
  @IsArray()
    @ApiPropertyOptional({ description: 'Phones', type: [String] })
  phones?: string[];

  
  @IsOptional()
  @IsArray()
    @ApiPropertyOptional({ description: 'Emails', type: [String] })
  emails?: string[];

  
  @IsOptional()
  @IsEmail()
    @ApiPropertyOptional({ description: 'Contact email', example: 'user@example.com' })
  contact_email?: string;

  
  @IsOptional()
  @IsString()
    @ApiPropertyOptional({ description: 'Contact phone', example: '+1234567890' })
  contact_phone?: string;

  
  @IsOptional()
  @IsString()
    @ApiPropertyOptional({ description: 'Website', example: 'example' })
  website?: string;

  
  @IsOptional()
  @IsString()
    @ApiPropertyOptional({ description: 'Description', example: 'example' })
  description?: string;

  
  @IsOptional()
  @IsString()
    @ApiPropertyOptional({ description: 'Logo url', example: 'https://example.com' })
  logo_url?: string;

  
  @IsOptional()
  @IsString()
    @ApiPropertyOptional({ description: 'Banner url', example: 'https://example.com' })
  banner_url?: string;

  
  @IsOptional()
  @IsInt()
    @IsNumber()
    @ApiPropertyOptional({ description: 'Established year', example: 2024 })
  established_year?: number;

  @ApiPropertyOptional({ description: 'ISO date string (YYYY-MM-DD)' })
  @IsOptional()
  @IsDateString()
    @IsString()
  license_valid_till?: string;

  
  @IsOptional()
  @IsArray()
    @ApiPropertyOptional({ description: 'Services', type: [String] })
  services?: string[];

  
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CertificationDto)
    @ApiPropertyOptional({ description: 'Certifications', type: [CertificationDto] })
  certifications?: CertificationDto[];

  
  @IsOptional()
  @ValidateNested()
  @Type(() => SocialMediaDto)
    @ApiPropertyOptional({ description: 'Social media', type: SocialMediaDto })
  social_media?: SocialMediaDto;

  
  @IsOptional()
  @ValidateNested()
  @Type(() => BankDetailsDto)
    @ApiPropertyOptional({ description: 'Bank details', type: BankDetailsDto })
  bank_details?: BankDetailsDto;

  
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ContactPersonDto)
    @ApiPropertyOptional({ description: 'Contact persons', type: [ContactPersonDto] })
  contact_persons?: ContactPersonDto[];

  
  @IsOptional()
  @ValidateNested()
  @Type(() => OperatingHoursDto)
    @ApiPropertyOptional({ description: 'Operating hours', type: OperatingHoursDto })
  operating_hours?: OperatingHoursDto;

  
  @IsOptional()
  @IsArray()
    @ApiPropertyOptional({ description: 'Target countries', type: [String] })
  target_countries?: string[];

  
  @IsOptional()
  @IsArray()
    @ApiPropertyOptional({ description: 'Specializations', type: [String] })
  specializations?: string[];

  
  @IsOptional()
  @ValidateNested()
  @Type(() => StatisticsDto)
    @ApiPropertyOptional({ description: 'Statistics', type: StatisticsDto })
  statistics?: StatisticsDto;

  
  @IsOptional()
  @ValidateNested()
  @Type(() => SettingsDto)
    @ApiPropertyOptional({ description: 'Settings', type: SettingsDto })
  settings?: SettingsDto;

  // Single-value inputs that we will normalize into arrays in the service
  @ApiPropertyOptional({ description: 'Single phone value; will be merged into phones[]' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ description: 'Single mobile value; will be merged into phones[]' })
  @IsOptional()
  @IsString()
  mobile?: string;

  @ApiPropertyOptional({ description: 'Single email value; will be merged into emails[]' })
  @IsOptional()
  @IsEmail()
  email?: string;
}

export class UpdateAgencyDto {
  
  @IsOptional()
  @IsString()
    @ApiPropertyOptional({ description: 'Name', example: 'Example Name' })
  name?: string;

  
  @IsOptional()
  @IsString()
    @ApiPropertyOptional({ description: 'Country', example: 'example' })
  country?: string;

  
  @IsOptional()
  @IsString()
    @ApiPropertyOptional({ description: 'City', example: 'example' })
  city?: string;

  
  @IsOptional()
  @IsString()
    @ApiPropertyOptional({ description: 'Address', example: 'example' })
  address?: string;

  
  @IsOptional()
  @IsArray()
    @ApiPropertyOptional({ description: 'Phones', type: [String] })
  phones?: string[];

  
  @IsOptional()
  @IsArray()
    @ApiPropertyOptional({ description: 'Emails', type: [String] })
  emails?: string[];

  
  @IsOptional()
  @IsEmail()
    @ApiPropertyOptional({ description: 'Contact email', example: 'user@example.com' })
  contact_email?: string;

  
  @IsOptional()
  @IsString()
    @ApiPropertyOptional({ description: 'Contact phone', example: '+1234567890' })
  contact_phone?: string;

  
  @IsOptional()
  @IsString()
    @ApiPropertyOptional({ description: 'Website', example: 'example' })
  website?: string;

  
  @IsOptional()
  @IsString()
    @ApiPropertyOptional({ description: 'Description', example: 'example' })
  description?: string;

  
  @IsOptional()
  @IsString()
    @ApiPropertyOptional({ description: 'Logo url', example: 'https://example.com' })
  logo_url?: string;

  
  @IsOptional()
  @IsString()
    @ApiPropertyOptional({ description: 'Banner url', example: 'https://example.com' })
  banner_url?: string;

  
  @IsOptional()
  @IsInt()
    @IsNumber()
    @ApiPropertyOptional({ description: 'Established year', example: 2024 })
  established_year?: number;

  @ApiPropertyOptional({ description: 'ISO date string (YYYY-MM-DD)' })
  @IsOptional()
  @IsDateString()
    @IsString()
  license_valid_till?: string;

  
  @IsOptional()
  @IsArray()
    @ApiPropertyOptional({ description: 'Services', type: [String] })
  services?: string[];

  
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CertificationDto)
    @ApiPropertyOptional({ description: 'Certifications', type: [CertificationDto] })
  certifications?: CertificationDto[];

  
  @IsOptional()
  @ValidateNested()
  @Type(() => SocialMediaDto)
    @ApiPropertyOptional({ description: 'Social media', type: SocialMediaDto })
  social_media?: SocialMediaDto;

  
  @IsOptional()
  @ValidateNested()
  @Type(() => BankDetailsDto)
    @ApiPropertyOptional({ description: 'Bank details', type: BankDetailsDto })
  bank_details?: BankDetailsDto;

  
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ContactPersonDto)
    @ApiPropertyOptional({ description: 'Contact persons', type: [ContactPersonDto] })
  contact_persons?: ContactPersonDto[];

  
  @IsOptional()
  @ValidateNested()
  @Type(() => OperatingHoursDto)
    @ApiPropertyOptional({ description: 'Operating hours', type: OperatingHoursDto })
  operating_hours?: OperatingHoursDto;

  
  @IsOptional()
  @IsArray()
    @ApiPropertyOptional({ description: 'Target countries', type: [String] })
  target_countries?: string[];

  
  @IsOptional()
  @IsArray()
    @ApiPropertyOptional({ description: 'Specializations', type: [String] })
  specializations?: string[];

  
  @IsOptional()
  @ValidateNested()
  @Type(() => StatisticsDto)
    @ApiPropertyOptional({ description: 'Statistics', type: StatisticsDto })
  statistics?: StatisticsDto;

  
  @IsOptional()
  @ValidateNested()
  @Type(() => SettingsDto)
    @ApiPropertyOptional({ description: 'Settings', type: SettingsDto })
  settings?: SettingsDto;

  
  @IsOptional()
  @IsBoolean()
    @ApiPropertyOptional({ description: 'Is active', example: true })
  is_active?: boolean;
}

export class AgencyResponseDto {
  
  @ApiProperty({ description: 'Id', example: 'example' })
    id!: string;

  
  @ApiProperty({ description: 'Name', example: 'Example Name' })
    name!: string;

  
  @ApiProperty({ description: 'License number', example: 'example' })
    license_number!: string;

  
  @ApiPropertyOptional({ description: 'Address', example: 'example' })
    address?: string;

  
  @ApiPropertyOptional({ description: 'Latitude', type: Number, nullable: true })
    latitude?: number | null;

  
  @ApiPropertyOptional({ description: 'Longitude', type: Number, nullable: true })
    longitude?: number | null;

  
  @ApiPropertyOptional({ description: 'Phones', type: [String] })
    phones?: string[];

  
  @ApiPropertyOptional({ description: 'Emails', type: [String] })
    emails?: string[];

  
  @ApiPropertyOptional({ description: 'Website', example: 'example' })
    website?: string;

  
  @ApiPropertyOptional({ description: 'Description', example: 'example' })
    description?: string;

  
  @ApiPropertyOptional({ description: 'Logo url', example: 'https://example.com' })
    logo_url?: string;

  
  @ApiPropertyOptional({ description: 'Banner url', type: String, nullable: true })
    banner_url?: string | null;

  
  @ApiPropertyOptional({ description: 'Established year', type: Number, nullable: true })
    established_year?: number | null;

  
  @ApiPropertyOptional({ description: 'Services', type: [String] })
    services?: string[] | null;

  
  @ApiPropertyOptional({ description: 'Certifications', type: [CertificationDto] })
    certifications?: CertificationDto[] | null;

  
  @ApiPropertyOptional({ description: 'Social media', type: SocialMediaDto })
    social_media?: SocialMediaDto | null;

  
  @ApiPropertyOptional({ description: 'Bank details', type: BankDetailsDto })
    bank_details?: BankDetailsDto | null;

  
  @ApiPropertyOptional({ description: 'Contact persons', type: [ContactPersonDto] })
    contact_persons?: ContactPersonDto[] | null;

  
  @ApiPropertyOptional({ description: 'Operating hours', type: OperatingHoursDto })
    operating_hours?: OperatingHoursDto | null;

  
  @ApiPropertyOptional({ description: 'Target countries', type: [String] })
    target_countries?: string[] | null;

  
  @ApiPropertyOptional({ description: 'Specializations', type: [String] })
    specializations?: string[] | null;

  
  @ApiPropertyOptional({ description: 'Statistics', type: StatisticsDto })
    statistics?: StatisticsDto | null;

  
  @ApiPropertyOptional({ description: 'Settings', 
        type: SettingsDto,
        example: {
          currency: 'USD',
          timezone: 'UTC',
          language: 'en',
          date_format: 'YYYY-MM-DD',
          notifications: { email: true, push: true },
          features: { darkMode: true, notifications: true }
        },
        nullable: true 
      })
    settings?: SettingsDto | null;
}

export class AgencyCreatedDto {
  
    @IsString()
    @ApiProperty({ description: 'Id', format: 'uuid' })
  id!: string;

  
    @IsString()
    @ApiProperty({ description: 'License number', example: 'example' })
  license_number!: string;
}

// ============================================
// Update DTOs for specific agency sections
// ============================================

export class UpdateAgencyBasicDto {
  @ApiPropertyOptional({ description: 'Agency name', example: 'Example Agency' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  name?: string;

  @ApiPropertyOptional({ description: 'Agency description', example: 'Leading recruitment agency' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Year the agency was established', example: 2020 })
  @IsOptional()
  @IsInt()
  established_year?: number;

  @ApiPropertyOptional({ description: 'License number', example: 'LIC-12345' })
  @IsOptional()
  @IsString()
  license_number?: string;
}

export class UpdateAgencyContactDto {
  @ApiPropertyOptional({ description: 'Phone number', example: '+977-1-4123456' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ description: 'Mobile number', example: '+977-9841234567' })
  @IsOptional()
  @IsString()
  mobile?: string;

  @ApiPropertyOptional({ description: 'Email address', example: 'contact@agency.com' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ description: 'Website URL', example: 'https://agency.com' })
  @IsOptional()
  @IsString()
  website?: string;

  @ApiPropertyOptional({ 
    description: 'Contact persons', 
    type: [ContactPersonDto],
    example: [{ name: 'John Doe', position: 'Manager', phone: '+977-9841234567', email: 'john@agency.com' }]
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ContactPersonDto)
  contact_persons?: ContactPersonDto[];
}

export class UpdateAgencyLocationDto {
  @ApiPropertyOptional({ description: 'Street address', example: '123 Main St, Kathmandu' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({ description: 'Latitude coordinate', example: 27.7172 })
  @IsOptional()
  @IsNumber()
  latitude?: number;

  @ApiPropertyOptional({ description: 'Longitude coordinate', example: 85.3240 })
  @IsOptional()
  @IsNumber()
  longitude?: number;
}

export class UpdateAgencySocialMediaDto {
  @ApiPropertyOptional({ 
    description: 'Social media links',
    type: SocialMediaDto,
    example: {
      facebook: 'https://facebook.com/agency',
      instagram: 'https://instagram.com/agency',
      linkedin: 'https://linkedin.com/company/agency',
      twitter: 'https://twitter.com/agency'
    }
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => SocialMediaDto)
  social_media?: SocialMediaDto;
}

export class UpdateAgencyServicesDto {
  @ApiPropertyOptional({ 
    description: 'Services offered', 
    type: [String],
    example: ['Recruitment', 'Visa Processing', 'Training']
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  services?: string[];

  @ApiPropertyOptional({ 
    description: 'Specializations', 
    type: [String],
    example: ['Healthcare', 'IT', 'Construction']
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  specializations?: string[];

  @ApiPropertyOptional({ 
    description: 'Target countries', 
    type: [String],
    example: ['UAE', 'Saudi Arabia', 'Qatar']
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  target_countries?: string[];
}

export class UpdateAgencySettingsDto {
  @ApiPropertyOptional({ 
    description: 'Agency settings',
    type: SettingsDto,
    example: {
      currency: 'USD',
      timezone: 'Asia/Kathmandu',
      language: 'en',
      date_format: 'YYYY-MM-DD',
      notifications: { email: true, push: true },
      features: { darkMode: true }
    }
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => SettingsDto)
  settings?: SettingsDto;
}
