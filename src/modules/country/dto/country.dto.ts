import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsNumberString, IsOptional } from 'class-validator';

export class CountryResponseDto {
  @ApiProperty({ description: 'Unique identifier of the country', example: 1 })
  id: number;

  @ApiProperty({ description: 'ISO 3166-1 alpha-2 country code', example: 'US' })
  @IsString()
  @IsNotEmpty()
  country_code: string;

  @ApiProperty({ description: 'Full name of the country', example: 'United States' })
  @IsString()
  @IsNotEmpty()
  country_name: string;

  @ApiProperty({ description: 'ISO 4217 currency code', example: 'USD' })
  @IsString()
  @IsNotEmpty()
  currency_code: string;

  @ApiProperty({ description: 'Full name of the currency', example: 'US Dollar' })
  @IsString()
  @IsNotEmpty()
  currency_name: string;

  @ApiProperty({
    description: 'Multiplier to convert to NPR (Nepalese Rupees)',
    example: '119.50',
  })
  @IsNumberString()
  npr_multiplier: string;

  @ApiProperty({ description: 'Date when the record was created', type: Date })
  created_at: Date;

  @ApiProperty({ 
    description: 'Date when the record was last updated',
    type: Date,
    nullable: true 
  })
  updated_at: Date | null;
}

export class SeedCountriesResponseDto {
  @ApiProperty({ description: 'Source file path of the seed data' })
  source: string;

  @ApiProperty({ description: 'Number of records affected' })
  affected: number;
}

export class CountryQueryParamsDto {
  @ApiProperty({
    required: false,
    description: 'Search by country name or code',
    example: 'united',
  })
  @IsString()
  @IsOptional()
  search?: string;
}
