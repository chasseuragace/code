import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsString, Min, Max, MinLength, MaxLength, IsOptional } from 'class-validator';

export class UpdateReviewDto {
  @ApiProperty({
    description: 'Updated rating from 1 to 5',
    minimum: 1,
    maximum: 5,
    example: 4,
    type: Number,
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(1, { message: 'Rating must be at least 1' })
  @Max(5, { message: 'Rating cannot exceed 5' })
  rating?: number;

  @ApiProperty({
    description: 'Updated review text content',
    minLength: 10,
    maxLength: 1000,
    example: 'Updated: Good service overall.',
    type: String,
    required: false,
  })
  @IsOptional()
  @IsString()
  @MinLength(10, { message: 'Review must be at least 10 characters long' })
  @MaxLength(1000, { message: 'Review cannot exceed 1000 characters' })
  review_text?: string;
}
