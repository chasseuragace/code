import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from "@nestjs/swagger";

export class sendSmsNotificationDto {
  @IsNotEmpty()
  @IsString()
    @ApiProperty({ description: 'Contact number', example: 'example' })
  contactNumber: string;

  @IsNotEmpty()
  @IsString()
    @ApiProperty({ description: 'Message', example: 'example' })
  message: string;
}
