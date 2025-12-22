import { IsOptional, IsNumber, Min, Max } from 'class-validator';
import { ApiPropertyOptional } from "@nestjs/swagger";

export class ExperienceRequirementsDto {
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(30)
    @ApiPropertyOptional({ description: 'Min years', example: 2 })
  min_years?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(30)
    @ApiPropertyOptional({ description: 'Max years', example: 5 })
  max_years?: number;
}
