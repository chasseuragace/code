import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class RegisterCandidateDto {
  
  @IsString()
  @IsNotEmpty()
    @ApiProperty({ description: 'Full name', example: 'Ram Bahadur' })
  full_name: string;

  
  @IsString()
  @IsNotEmpty()
    @ApiProperty({ description: 'Phone', example: '+9779812345678' })
  phone: string;
}
