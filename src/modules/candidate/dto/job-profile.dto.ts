import { Type } from 'class-transformer';
import { IsArray, IsBoolean, IsDateString, IsInt, IsNumber, IsOptional, IsString, Min, ValidateNested } from 'class-validator';

export class SkillDto {
  @IsString()
  title!: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  years?: number;
}

export class EducationDto {
  @IsString()
  degree!: string;

  @IsOptional()
  @IsString()
  institution?: string;

  @IsOptional()
  @IsInt()
  year_completed?: number;
}

export class TrainingDto {
  @IsString()
  title!: string;

  @IsOptional()
  @IsString()
  provider?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  hours?: number;

  @IsOptional()
  @IsBoolean()
  certificate?: boolean;
}

export class ExperienceDto {
  @IsString()
  title!: string;

  @IsOptional()
  @IsString()
  employer?: string;

  @IsOptional()
  @IsDateString()
  start_date_ad?: string;

  @IsOptional()
  @IsDateString()
  end_date_ad?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  months?: number;

  @IsOptional()
  @IsString()
  description?: string;
}

export class JobProfileBlobDto {
  @IsOptional()
  @IsString()
  summary?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SkillDto)
  skills?: SkillDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EducationDto)
  education?: EducationDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TrainingDto)
  trainings?: TrainingDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ExperienceDto)
  experience?: ExperienceDto[];

  // Leave room for future fields like projects, languages, etc.
}

export class AddJobProfileDto {
  @ValidateNested()
  @Type(() => JobProfileBlobDto)
  profile_blob!: JobProfileBlobDto;

  @IsOptional()
  @IsString()
  label?: string;
}

export class UpdateJobProfileDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => JobProfileBlobDto)
  profile_blob?: JobProfileBlobDto;

  @IsOptional()
  @IsString()
  label?: string;
}
