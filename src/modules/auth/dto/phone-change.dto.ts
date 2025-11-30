import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class RequestPhoneChangeDto {
  @ApiProperty({ description: 'Candidate ID', example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsUUID()
  @IsNotEmpty()
  candidateId: string;

  @ApiProperty({ description: 'New phone number in E.164 format', example: '+9779812345678' })
  @IsString()
  @IsNotEmpty()
  newPhone: string;
}

export class VerifyPhoneChangeDto {
  @ApiProperty({ description: 'Candidate ID', example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsUUID()
  @IsNotEmpty()
  candidateId: string;

  @ApiProperty({ description: 'New phone number in E.164 format', example: '+9779812345678' })
  @IsString()
  @IsNotEmpty()
  newPhone: string;

  @ApiProperty({ description: 'OTP code', example: '123456' })
  @IsString()
  @IsNotEmpty()
  otp: string;
}
