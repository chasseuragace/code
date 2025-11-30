import { IsOptional, IsNumber, Min, Max, IsIn } from 'class-validator';
import { ApiPropertyOptional } from "@nestjs/swagger";

export class ExperienceRequirementsDto {
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(30)
    @ApiPropertyOptional({ description: 'Min years', example: 2024 })
  min_years?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(30)
    @ApiPropertyOptional({ description: 'Max years', example: 2024 })
  max_years?: number;

  @IsOptional()
  @IsIn(['fresher', 'experienced', 'skilled', 'expert'])
    @ApiPropertyOptional({ description: 'Level', example: null })
  level?: 'fresher' | 'experienced' | 'skilled' | 'expert';
}
