import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

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

export class CandidateProfileDto {
  @ApiProperty({ description: 'Id', example: 'example' })
    id!: string;
  @ApiProperty({ description: 'Full name', example: 'Example Name' })
    full_name!: string;
  @ApiProperty({ description: 'E.164 normalized' }) phone!: string;
  
    @ApiPropertyOptional({ description: 'Address', type: AddressDto, required: false, nullable: true })
    address?: AddressDto | null;
  
    @ApiPropertyOptional({ description: 'Passport number', required: false, nullable: true })
    passport_number?: string | null;
  
    @ApiPropertyOptional({ description: 'Email', required: false, nullable: true, type: String })
    email?: string | null;
  @ApiPropertyOptional({ required: false, nullable: true, enum: ['Male', 'Female'], description: 'Gender of the candidate' })
    gender?: string | null;
  @ApiPropertyOptional({ required: false, nullable: true, type: Number, description: 'Age of the candidate' })
    age?: number | null;
  @ApiProperty({ description: 'Is active', example: true })
    is_active!: boolean;
  @ApiProperty({ description: 'Created at', example: new Date('2024-01-01') })
    created_at!: Date;
  @ApiProperty({ description: 'Updated at', example: new Date('2024-01-01') })
    updated_at!: Date;
}
