import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsBoolean, IsNumber } from "class-validator";

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

export class CandidateUpdateDto {
  
    @IsOptional()
    @IsString()
    @ApiPropertyOptional({ description: 'Full name', required: false })
    full_name?: string;
  
    @IsOptional()
    @IsBoolean()
    @ApiPropertyOptional({ description: 'Is active', required: false })
    is_active?: boolean;
  
    @IsOptional()
    @ApiPropertyOptional({ description: 'Address', type: AddressDto, required: false, nullable: true })
    address?: AddressDto | null;
  
    @IsOptional()
    @IsString()
    @ApiPropertyOptional({ description: 'Passport number', required: false, nullable: true, type: String  })
    passport_number?: string | null;

  
    @IsOptional()
    @IsString()
    @ApiPropertyOptional({ description: 'Email', required: false, nullable: true, type: String })
    email?: string | null;
  @ApiPropertyOptional({ required: false, nullable: true, enum: ['Male', 'Female'], description: 'Gender of the candidate' })
    @IsOptional()
    @IsString()
    gender?: string | null;
  @ApiPropertyOptional({ required: false, nullable: true, type: Number, description: 'Age of the candidate' })
    @IsOptional()
    @IsNumber()
    age?: number | null;
}
