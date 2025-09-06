import { IsOptional, IsNumber, Min, Max, IsIn } from 'class-validator';

export class ExperienceRequirementsDto {
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(50)
  min_years?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(50)
  max_years?: number;

  @IsOptional()
  @IsIn(['entry', 'mid', 'senior', 'lead'])
  level?: 'entry' | 'mid' | 'senior' | 'lead';
}
