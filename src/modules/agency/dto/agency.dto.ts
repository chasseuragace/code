import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsDateString, IsEmail, IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, IsUrl, MaxLength, ValidateNested, ArrayNotEmpty, IsObject } from 'class-validator';
import { Type } from 'class-transformer';

export class CertificationDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  number?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
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
  @ApiPropertyOptional()
  @IsOptional()
  @IsUrl({ require_protocol: true }, { message: 'facebook must be a URL with protocol' })
  facebook?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUrl({ require_protocol: true })
  instagram?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUrl({ require_protocol: true })
  linkedin?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUrl({ require_protocol: true })
  twitter?: string;
}

export class BankDetailsDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  bank_name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  account_name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  account_number?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  swift_code?: string;
}

export class ContactPersonDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  position?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEmail()
  email?: string;
}

export class OperatingHoursDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  weekdays?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  saturday?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  sunday?: string;
}

export class StatisticsDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  total_placements?: number;

  @ApiPropertyOptional({ description: 'ISO date string (YYYY-MM-DD)' })
  @IsOptional()
  @IsDateString()
  active_since?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  success_rate?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  countries_served?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  partner_companies?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  active_recruiters?: number;
}

export class SettingsDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  timezone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  language?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  date_format?: string;

  @ApiPropertyOptional({ type: Object })
  @IsOptional()
  @IsObject()
  notifications?: Record<string, any>;

  @ApiPropertyOptional({ type: Object })
  @IsOptional()
  @IsObject()
  features?: Record<string, any>;
}

export class CreateAgencyDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name!: string;

  @ApiProperty({ description: 'Unique license number for the agency' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  license_number!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  country?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  phones?: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  emails?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsEmail()
  contact_email?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  contact_phone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  website?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  logo_url?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  banner_url?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  established_year?: number;

  @ApiPropertyOptional({ description: 'ISO date string (YYYY-MM-DD)' })
  @IsOptional()
  @IsDateString()
  license_valid_till?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  services?: string[];

  @ApiPropertyOptional({ type: [CertificationDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CertificationDto)
  certifications?: CertificationDto[];

  @ApiPropertyOptional({ type: SocialMediaDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => SocialMediaDto)
  social_media?: SocialMediaDto;

  @ApiPropertyOptional({ type: BankDetailsDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => BankDetailsDto)
  bank_details?: BankDetailsDto;

  @ApiPropertyOptional({ type: [ContactPersonDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ContactPersonDto)
  contact_persons?: ContactPersonDto[];

  @ApiPropertyOptional({ type: OperatingHoursDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => OperatingHoursDto)
  operating_hours?: OperatingHoursDto;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  target_countries?: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  specializations?: string[];

  @ApiPropertyOptional({ type: StatisticsDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => StatisticsDto)
  statistics?: StatisticsDto;

  @ApiPropertyOptional({ type: SettingsDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => SettingsDto)
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
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  country?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  phones?: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  emails?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsEmail()
  contact_email?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  contact_phone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  website?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  logo_url?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  banner_url?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  established_year?: number;

  @ApiPropertyOptional({ description: 'ISO date string (YYYY-MM-DD)' })
  @IsOptional()
  @IsDateString()
  license_valid_till?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  services?: string[];

  @ApiPropertyOptional({ type: [CertificationDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CertificationDto)
  certifications?: CertificationDto[];

  @ApiPropertyOptional({ type: SocialMediaDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => SocialMediaDto)
  social_media?: SocialMediaDto;

  @ApiPropertyOptional({ type: BankDetailsDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => BankDetailsDto)
  bank_details?: BankDetailsDto;

  @ApiPropertyOptional({ type: [ContactPersonDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ContactPersonDto)
  contact_persons?: ContactPersonDto[];

  @ApiPropertyOptional({ type: OperatingHoursDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => OperatingHoursDto)
  operating_hours?: OperatingHoursDto;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  target_countries?: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  specializations?: string[];

  @ApiPropertyOptional({ type: StatisticsDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => StatisticsDto)
  statistics?: StatisticsDto;

  @ApiPropertyOptional({ type: SettingsDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => SettingsDto)
  settings?: SettingsDto;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}

export class AgencyResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  license_number!: string;

  @ApiPropertyOptional()
  address?: string;

  @ApiPropertyOptional({ type: [String] })
  phones?: string[];

  @ApiPropertyOptional({ type: [String] })
  emails?: string[];

  @ApiPropertyOptional()
  website?: string;

  @ApiPropertyOptional()
  description?: string;

  @ApiPropertyOptional()
  logo_url?: string;

  @ApiPropertyOptional()
  banner_url?: string | null;

  @ApiPropertyOptional()
  established_year?: number | null;

  @ApiPropertyOptional({ type: [String] })
  services?: string[] | null;

  @ApiPropertyOptional({ type: [CertificationDto] })
  certifications?: CertificationDto[] | null;

  @ApiPropertyOptional({ type: SocialMediaDto })
  social_media?: SocialMediaDto | null;

  @ApiPropertyOptional({ type: BankDetailsDto })
  bank_details?: BankDetailsDto | null;

  @ApiPropertyOptional({ type: [ContactPersonDto] })
  contact_persons?: ContactPersonDto[] | null;

  @ApiPropertyOptional({ type: OperatingHoursDto })
  operating_hours?: OperatingHoursDto | null;

  @ApiPropertyOptional({ type: [String] })
  target_countries?: string[] | null;

  @ApiPropertyOptional({ type: [String] })
  specializations?: string[] | null;

  @ApiPropertyOptional({ type: StatisticsDto })
  statistics?: StatisticsDto | null;

  @ApiPropertyOptional({ type: SettingsDto })
  settings?: SettingsDto | null;
}

export class AgencyCreatedDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty()
  license_number!: string;
}
