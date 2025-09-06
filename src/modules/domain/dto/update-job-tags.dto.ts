import { IsOptional, IsArray, IsString, ArrayMaxSize, IsUUID, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ExperienceRequirementsDto } from './experience-requirements.dto';

export class UpdateJobTagsDto {
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
}
