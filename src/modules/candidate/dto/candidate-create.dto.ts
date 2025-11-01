import { ApiProperty } from '@nestjs/swagger';

class CoordinatesDto {
  @ApiProperty({ required: true }) lat!: number;
  @ApiProperty({ required: true }) lng!: number;
}

class AddressDto {
  @ApiProperty({ required: false, nullable: true }) name?: string;
  @ApiProperty({ type: CoordinatesDto, required: false }) coordinates?: CoordinatesDto;
  @ApiProperty({ required: false, nullable: true }) province?: string;
  @ApiProperty({ required: false, nullable: true }) district?: string;
  @ApiProperty({ required: false, nullable: true }) municipality?: string;
  @ApiProperty({ required: false, nullable: true }) ward?: string;
}

class SkillDto {
  @ApiProperty() title!: string;
  @ApiProperty({ required: false, nullable: true }) duration_months?: number;
  @ApiProperty({ required: false, nullable: true }) years?: number;
  @ApiProperty({ type: [String], required: false }) documents?: string[];
}

class EducationDto {
  @ApiProperty() title!: string;
  @ApiProperty({ required: false, nullable: true }) institute?: string;
  @ApiProperty({ required: false, nullable: true }) degree?: string;
  @ApiProperty({ required: false, nullable: true }) document?: string;
}

export class CandidateCreateDto {
  @ApiProperty() full_name!: string;
  @ApiProperty({ description: 'E.164 preferred' }) phone!: string;
  @ApiProperty({ type: AddressDto, required: false }) address?: AddressDto;
  @ApiProperty({ required: false, nullable: true }) passport_number?: string;
  @ApiProperty({ type: [SkillDto], required: false }) skills?: SkillDto[];
  @ApiProperty({ type: [EducationDto], required: false }) education?: EducationDto[];
}
