import { Type } from 'class-transformer';
import { IsArray, IsBoolean, IsDateString, IsInt, IsNumber, IsOptional, IsString, Min, ValidateNested } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SkillDto {
  @ApiProperty({ description: 'Title of the skill' })
  @IsString()
  title!: string;

  @ApiPropertyOptional({ description: 'Years of experience in this skill', minimum: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  years?: number;
}

export class EducationDto {
  @ApiProperty({ description: 'Degree or qualification obtained' })
  @IsString()
  degree!: string;

  @ApiPropertyOptional({ description: 'Institution where the degree was obtained' })
  @IsOptional()
  @IsString()
  institution?: string;

  @ApiPropertyOptional({ description: 'Year the degree was completed' })
  @IsOptional()
  @IsInt()
  year_completed?: number;
}

export class TrainingDto {
  @ApiProperty({ description: 'Title of the training' })
  @IsString()
  title!: string;

  @ApiPropertyOptional({ description: 'Provider of the training' })
  @IsOptional()
  @IsString()
  provider?: string;

  @ApiPropertyOptional({ description: 'Duration of the training in hours', minimum: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  hours?: number;

  @ApiPropertyOptional({ description: 'Indicates if a certificate was obtained' })
  @IsOptional()
  @IsBoolean()
  certificate?: boolean;
}

export class ExperienceDto {
  @ApiProperty({ description: 'Job title' })
  @IsString()
  title!: string;

  @ApiPropertyOptional({ description: 'Employer name' })
  @IsOptional()
  @IsString()
  employer?: string;

  @ApiPropertyOptional({ description: 'Start date in ISO format (YYYY-MM-DD)' })
  @IsOptional()
  @IsDateString()
  start_date_ad?: string;

  @ApiPropertyOptional({ description: 'End date in ISO format (YYYY-MM-DD); if null, currently working' })
  @IsOptional()
  @IsDateString()
  end_date_ad?: string;

  @ApiPropertyOptional({ description: 'Duration in months', minimum: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  months?: number;

  @ApiPropertyOptional({ description: 'Description of responsibilities and achievements' })
  @IsOptional()
  @IsString()
  description?: string;
}

export class JobProfileBlobDto {
  @ApiPropertyOptional({ description: 'Summary of the job profile' })
  @IsOptional()
  @IsString()
  summary?: string;

  @ApiPropertyOptional({ type: [SkillDto], description: 'List of skills' })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SkillDto)
  skills?: SkillDto[];

  @ApiPropertyOptional({ type: [EducationDto], description: 'List of education qualifications' })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EducationDto)
  education?: EducationDto[];

  @ApiPropertyOptional({ type: [TrainingDto], description: 'List of trainings' })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TrainingDto)
  trainings?: TrainingDto[];

  @ApiPropertyOptional({ type: [ExperienceDto], description: 'List of work experiences' })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ExperienceDto)
  experience?: ExperienceDto[];

  // Leave room for future fields like projects, languages, etc.
}

export class AddJobProfileDto {
  @ApiProperty({ type: JobProfileBlobDto, description: 'Profile blob holds skills, education, trainings, experience' })
  @ValidateNested()
  @Type(() => JobProfileBlobDto)
  profile_blob!: JobProfileBlobDto;

  @ApiPropertyOptional({ description: 'Label for the job profile (e.g., "Software Engineer Profile")' })
  @IsOptional()
  @IsString()
  label?: string;
}

export class UpdateJobProfileDto {
  @ApiPropertyOptional({ type: JobProfileBlobDto, description: 'Profile blob holds skills, education, trainings, experience' })
  @IsOptional()
  @ValidateNested()
  @Type(() => JobProfileBlobDto)
  profile_blob?: JobProfileBlobDto;

  @ApiPropertyOptional({ description: 'Label for the job profile (e.g., "Software Engineer Profile")' })
  @IsOptional()
  @IsString()
  label?: string;
}

export class CandidateJobProfileDto {
  
  @ApiProperty({ description: 'Id', format: 'uuid' })
    id!: string;

  
  @ApiProperty({ description: 'Candidate id', format: 'uuid' })
    candidate_id!: string;

  
  @ApiProperty({ description: 'Profile blob', type: JobProfileBlobDto })
    profile_blob!: JobProfileBlobDto;

  @ApiPropertyOptional({ description: 'Optional label for this profile' })
  @IsOptional()
  @IsString()
  label?: string | null;

  @ApiProperty({ type: String, description: 'Creation timestamp (ISO string)' })
  created_at!: Date | string;

  @ApiProperty({ type: String, description: 'Last update timestamp (ISO string)' })
  updated_at!: Date | string;
}
