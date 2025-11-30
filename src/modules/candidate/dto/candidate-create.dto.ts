import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsArray, ValidateNested } from "class-validator";
import { Type } from 'class-transformer';

class CoordinatesDto {
  @ApiProperty({ description: 'Lat', required: true })
    lat!: number;
  @ApiProperty({ description: 'Lng', required: true })
    lng!: number;
}

class AddressDto {
  
    @ApiPropertyOptional({ description: 'Name', required: false, nullable: true })
    name?: string;
  
    @ApiPropertyOptional({ description: 'Coordinates', type: CoordinatesDto, required: false })
    coordinates?: CoordinatesDto;
  
    @ApiPropertyOptional({ description: 'Province', required: false, nullable: true })
    province?: string;
  
    @ApiPropertyOptional({ description: 'District', required: false, nullable: true })
    district?: string;
  
    @ApiPropertyOptional({ description: 'Municipality', required: false, nullable: true })
    municipality?: string;
  
    @ApiPropertyOptional({ description: 'Ward', required: false, nullable: true })
    ward?: string;
}

class SkillDto {
  @ApiProperty({ description: 'Title', example: 'example' })
    title!: string;
  
    @ApiPropertyOptional({ description: 'Duration months', required: false, nullable: true })
    duration_months?: number;
  
    @ApiPropertyOptional({ description: 'Years', required: false, nullable: true })
    years?: number;
  
    @ApiPropertyOptional({ description: 'Documents', type: [String], required: false })
    documents?: string[];
}

class EducationDto {
  @ApiProperty({ description: 'Title', example: 'example' })
    title!: string;
  
    @ApiPropertyOptional({ description: 'Institute', required: false, nullable: true })
    institute?: string;
  
    @ApiPropertyOptional({ description: 'Degree', required: false, nullable: true })
    degree?: string;
  
    @ApiPropertyOptional({ description: 'Document', required: false, nullable: true })
    document?: string;
}

export class CandidateCreateDto {
  
    @IsString()
    @ApiProperty({ description: 'Full name', example: 'Example Name' }) full_name!: string;
  @ApiProperty({ description: 'E.164 preferred' })
    @IsString() phone!: string;
  
    @IsOptional()
    @ValidateNested()
    @Type(() => AddressDto)
    @ApiPropertyOptional({ description: 'Address', type: AddressDto, required: false })
    address?: AddressDto;
  
    @IsOptional()
    @IsString()
    @ApiPropertyOptional({ description: 'Passport number', required: false, nullable: true })
    passport_number?: string;
  
    @IsOptional()
    @IsArray()
    @IsArray()
    @ApiPropertyOptional({ description: 'Skills', type: [SkillDto], required: false })
    skills?: SkillDto[];
  
    @IsOptional()
    @IsArray()
    @IsArray()
    @ApiPropertyOptional({ description: 'Education', type: [EducationDto], required: false })
    education?: EducationDto[];
}
