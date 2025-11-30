import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ReviewResponseDto {
  @ApiProperty({
    description: 'Review UUID',
    example: 'd841e933-1a14-4602-97e2-c51c9e5d8cf2',
    type: String,
  })
  id: string;

  @ApiProperty({
    description: 'Agency UUID',
    example: 'a123e933-1a14-4602-97e2-c51c9e5d8cf2',
    type: String,
  })
  agency_id: string;

  @ApiProperty({
    description: 'Candidate UUID',
    example: 'c456e933-1a14-4602-97e2-c51c9e5d8cf2',
    type: String,
  })
  candidate_id: string;

  @ApiProperty({
    description: 'Rating from 1 to 5',
    minimum: 1,
    maximum: 5,
    example: 5,
    type: Number,
  })
  rating: number;

  @ApiProperty({
    description: 'Review text content',
    example: 'Excellent service!',
    type: String,
  })
  review_text: string;

  @ApiProperty({
    description: 'Review creation timestamp',
    example: '2025-11-15T10:30:00.000Z',
    type: String,
    format: 'date-time',
  })
  created_at: string;

  @ApiProperty({
    description: 'Review last update timestamp',
    example: '2025-11-15T10:30:00.000Z',
    type: String,
    format: 'date-time',
  })
  updated_at: string;

  
  @ApiPropertyOptional({
        description: 'Candidate full name (optional, for display)',
        example: 'Ramesh Kumar',
        type: String,
        required: false,
      })
    candidate_name?: string;
}
