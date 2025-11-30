import { IsOptional, IsArray, IsString, ArrayMaxSize, IsUUID, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ExperienceRequirementsDto } from './experience-requirements.dto';
import { CreateJobPostingDto } from '../domain.service';
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CreateJobPostingWithTagsDto implements CreateJobPostingDto {
  @ApiProperty({ description: 'Posting title', example: 'example' })
    @IsString()
    posting_title: string;
  @ApiProperty({ description: 'Country', example: 'example' })
    @IsString()
    country: string;
  @ApiPropertyOptional({ description: 'City', example: 'example' })
    @IsOptional()
    @IsString()
    city?: string;
  @ApiPropertyOptional({ description: 'Lt number', example: 'example' })
    @IsOptional()
    @IsString()
    lt_number?: string;
  @ApiPropertyOptional({ description: 'Chalani number', example: 'example' })
    @IsOptional()
    @IsString()
    chalani_number?: string;
  @ApiPropertyOptional({ description: 'Approval date bs', example: 'example' })
    @IsOptional()
    @IsString()
    approval_date_bs?: string;
  @ApiPropertyOptional({ description: 'Approval date ad', example: 'example' })
    @IsOptional()
    @IsString()
    approval_date_ad?: string;
  @ApiPropertyOptional({ description: 'Posting date ad', example: 'example' })
    @IsOptional()
    @IsString()
    posting_date_ad?: string;
  @ApiPropertyOptional({ description: 'Posting date bs', example: 'example' })
    @IsOptional()
    @IsString()
    posting_date_bs?: string;
  @ApiPropertyOptional({ description: 'Announcement type', example: null })
    @IsOptional()
    announcement_type?: any;
  @ApiPropertyOptional({ description: 'Notes', example: 'example' })
    @IsOptional()
    @IsString()
    notes?: string;
  @ApiProperty({ description: 'Posting agency', example: null })
    @IsObject()
    posting_agency: any;
  @ApiProperty({ description: 'Employer', example: null })
    @IsObject()
    employer: any;
  @ApiProperty({ description: 'Contract', example: null })
    @IsObject()
    contract: any;
  @ApiProperty({ description: 'Positions', example: [] })
    @IsArray()
    @IsArray()
    positions: any[];

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

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ArrayMaxSize(10)
    @ApiPropertyOptional({ description: 'Canonical title names', example: 'Example Name' })
  canonical_title_names?: string[];
}
