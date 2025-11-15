import { ApiProperty } from '@nestjs/swagger';

export class DeleteReviewResponseDto {
  @ApiProperty({
    description: 'Operation success status',
    example: true,
    type: Boolean,
  })
  success: boolean;

  @ApiProperty({
    description: 'Success message',
    example: 'Review deleted successfully',
    type: String,
  })
  message: string;
}
