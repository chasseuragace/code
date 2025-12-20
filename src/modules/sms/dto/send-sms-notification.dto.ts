import { IsNotEmpty, IsString } from 'class-validator';

export class sendSmsNotificationDto {
  @IsNotEmpty()
  @IsString()
  contactNumber: string;

  @IsNotEmpty()
  @IsString()
  message: string;
}
