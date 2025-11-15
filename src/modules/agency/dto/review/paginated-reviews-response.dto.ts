import { ApiProperty } from '@nestjs/swagger';
import { ReviewResponseDto } from './review-response.dto';

export class PaginatedReviewsResponseDto {
  @ApiProperty({
    description: 'Array of reviews',
    type: [ReviewResponseDto],
  })
  data: ReviewResponseDto[];

  @ApiProperty({
    description: 'Total number of reviews',
    example: 25,
    type: Number,
  })
  total: number;

  @ApiProperty({
    description: 'Current page number',
    example: 1,
    type: Number,
  })
  page: number;

  @ApiProperty({
    description: 'Number of items per page',
    example: 10,
    type: Number,
  })
  limit: number;
}
