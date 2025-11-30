import { IsOptional, IsArray, IsString, ArrayMaxSize, IsUUID, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ExperienceRequirementsDto } from './experience-requirements.dto';
import { ApiPropertyOptional } from "@nestjs/swagger";

export class UpdateJobTagsDto {
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ArrayMaxSize(20)
    @ApiPropertyOptional({ description: 'Skills', example: 'example' })
  skills?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ArrayMaxSize(10)
    @ApiPropertyOptional({ description: 'Education requirements', example: 'example' })
  education_requirements?: string[];

  @IsOptional()
  @ValidateNested()
  @Type(() => ExperienceRequirementsDto)
    @ApiPropertyOptional({ description: 'Experience requirements', example: null })
  experience_requirements?: ExperienceRequirementsDto;

  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  @ArrayMaxSize(10)
    @ApiPropertyOptional({ description: 'Canonical title ids', example: 'example' })
  canonical_title_ids?: string[];
}
