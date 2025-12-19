import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateFcmTokenDto {
  @ApiProperty({
    description: 'FCM device token. Send null/empty to clear.',
    required: false,
    example: 'cxV0OH1-QB-lxIFmCxsmWF:APA91bH21C...',
  })
  @IsString()
  @IsOptional()
  fcmToken?: string | null;
}
