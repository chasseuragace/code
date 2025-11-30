import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class MemberLoginDto {
  @ApiProperty({ description: 'Phone number in E.164 format', example: '+9779812345678' })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiProperty({ description: 'Password', example: 'SecurePass123!' })
  @IsString()
  @IsNotEmpty()
  password: string;
}
