import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class VerifyOtpDto {
  
  @IsString()
  @IsNotEmpty()
    @ApiProperty({ description: 'Phone', example: '+9779812345678' })
  phone: string;

  
  @IsString()
  @IsNotEmpty()
    @ApiProperty({ description: 'Otp', example: '123456' })
  otp: string;
}
