import { IsOptional, IsArray, IsString, ArrayMaxSize, IsUUID, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ExperienceRequirementsDto } from './experience-requirements.dto';
import { CreateJobPostingDto } from '../domain.service';

export class CreateJobPostingWithTagsDto implements CreateJobPostingDto {
  posting_title: string;
  country: string;
  city?: string;
  lt_number?: string;
  chalani_number?: string;
  approval_date_bs?: string;
  approval_date_ad?: string;
  posting_date_ad?: string;
  posting_date_bs?: string;
  announcement_type?: any;
  notes?: string;
  posting_agency: any;
  employer: any;
  contract: any;
  positions: any[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ArrayMaxSize(20)
  skills?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ArrayMaxSize(10)
  education_requirements?: string[];

  @IsOptional()
  @ValidateNested()
  @Type(() => ExperienceRequirementsDto)
  experience_requirements?: ExperienceRequirementsDto;

  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  @ArrayMaxSize(10)
  canonical_title_ids?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ArrayMaxSize(10)
  canonical_title_names?: string[];
}
