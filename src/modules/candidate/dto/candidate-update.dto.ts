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

export class CandidateUpdateDto {
  @ApiProperty({ required: false }) full_name?: string;
  @ApiProperty({ required: false }) is_active?: boolean;
  @ApiProperty({ type: AddressDto, required: false, nullable: true }) address?: AddressDto | null;
  @ApiProperty({ required: false, nullable: true, type: String  }) passport_number?: string | null;

  @ApiProperty({ required: false, nullable: true, type: String }) email?: string | null;
  @ApiProperty({ required: false, nullable: true, enum: ['Male', 'Female'], description: 'Gender of the candidate' }) gender?: string | null;
}
