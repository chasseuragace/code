import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class RegisterOwnerDto {
  @ApiProperty({ description: 'Phone number in E.164 format', example: '+9779812345678' })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiProperty({ description: 'Full name of the agency owner', example: 'Ram Bahadur' })
  @IsString()
  @IsNotEmpty()
  full_name: string;
}
