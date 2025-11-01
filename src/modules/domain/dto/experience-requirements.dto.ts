import { IsOptional, IsNumber, Min, Max, IsIn } from 'class-validator';

export class ExperienceRequirementsDto {
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(30)
  min_years?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(30)
  max_years?: number;

  @IsOptional()
  @IsIn(['fresher', 'experienced', 'skilled', 'expert'])
  level?: 'fresher' | 'experienced' | 'skilled' | 'expert';
}
