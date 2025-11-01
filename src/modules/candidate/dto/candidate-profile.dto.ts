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

export class CandidateProfileDto {
  @ApiProperty() id!: string;
  @ApiProperty() full_name!: string;
  @ApiProperty({ description: 'E.164 normalized' }) phone!: string;
  @ApiProperty({ type: AddressDto, required: false, nullable: true }) address?: AddressDto | null;
  @ApiProperty({ required: false, nullable: true }) passport_number?: string | null;
  @ApiProperty({ required: false, nullable: true, type: String }) email?: string | null;
  @ApiProperty({ required: false, nullable: true, enum: ['Male', 'Female'], description: 'Gender of the candidate' }) gender?: string | null;
  @ApiProperty() is_active!: boolean;
  @ApiProperty() created_at!: Date;
  @ApiProperty() updated_at!: Date;
}
