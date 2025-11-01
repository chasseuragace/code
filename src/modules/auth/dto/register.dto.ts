import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class RegisterCandidateDto {
  @ApiProperty({ example: 'Ram Bahadur' })
  @IsString()
  @IsNotEmpty()
  full_name: string;

  @ApiProperty({ example: '+9779812345678' })
  @IsString()
  @IsNotEmpty()
  phone: string;
}
