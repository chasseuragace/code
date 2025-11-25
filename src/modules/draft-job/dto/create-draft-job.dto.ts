import { IsOptional, IsString, IsObject, IsArray, IsEnum, IsDate, IsNumber, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateDraftJobDto {
  @IsOptional()
  @IsString()
  posting_title?: string;

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  lt_number?: string;

  @IsOptional()
  @IsString()
  chalani_number?: string;

  @IsOptional()
  @IsString()
  approval_date_bs?: string;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  approval_date_ad?: Date;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  posting_date_ad?: Date;

  @IsOptional()
  @IsString()
  posting_date_bs?: string;

  @IsOptional()
  @IsString()
  announcement_type?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsObject()
  employer?: {
    company_name?: string;
    country?: string;
    city?: string;
  };

  @IsOptional()
  @IsObject()
  contract?: {
    period_years?: number;
    renewable?: boolean;
    hours_per_day?: number;
    days_per_week?: number;
    overtime_policy?: string;
    weekly_off_days?: number;
    food?: string;
    accommodation?: string;
    transport?: string;
    annual_leave_days?: number;
  };

  @IsOptional()
  @IsArray()
  positions?: Array<{
    title?: string;
    vacancies?: { male?: number; female?: number };
    salary?: {
      monthly_amount?: number;
      currency?: string;
      converted?: Array<{ amount: number; currency: string }>;
    };
    hours_per_day_override?: number;
    days_per_week_override?: number;
    overtime_policy_override?: string;
    weekly_off_days_override?: number;
    food_override?: string;
    accommodation_override?: string;
    transport_override?: string;
    position_notes?: string;
  }>;

  @IsOptional()
  @IsObject()
  expenses?: any;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  skills?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  education_requirements?: string[];

  @IsOptional()
  @IsObject()
  experience_requirements?: {
    min_years?: number;
    max_years?: number;
    level?: string;
  };

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  canonical_title_names?: string[];

  @IsOptional()
  @IsObject()
  cutout?: {
    file_name?: string;
    file_url?: string;
    file_size?: number;
    file_type?: string;
    has_file?: boolean;
    is_uploaded?: boolean;
    preview_url?: string;
    uploaded_url?: string;
  };

  @IsOptional()
  @IsObject()
  interview?: {
    date_ad?: string;
    date_bs?: string;
    date_format?: string;
    time?: string;
    location?: string;
    contact_person?: string;
    required_documents?: string[];
    notes?: string;
    expenses?: Array<any>;
  };

  @IsOptional()
  @IsBoolean()
  is_partial?: boolean;

  @IsOptional()
  @IsNumber()
  last_completed_step?: number;

  @IsOptional()
  @IsBoolean()
  is_complete?: boolean;

  @IsOptional()
  @IsBoolean()
  ready_to_publish?: boolean;

  @IsOptional()
  @IsBoolean()
  reviewed?: boolean;

  @IsOptional()
  @IsBoolean()
  is_bulk_draft?: boolean;

  @IsOptional()
  @IsArray()
  bulk_entries?: Array<{
    position?: string;
    job_count?: number;
    country?: string;
    salary?: string;
    currency?: string;
  }>;

  @IsOptional()
  @IsNumber()
  total_jobs?: number;
}
