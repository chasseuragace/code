import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsString, Min, Max, MinLength, MaxLength, IsNumber } from 'class-validator';

export class CreateReviewDto {
  @ApiProperty({
    description: 'Rating from 1 to 5',
    minimum: 1,
    maximum: 5,
    example: 5,
    type: Number,
  })
  @IsInt()
  @Min(1, { message: 'Rating must be at least 1' })
  @Max(5, { message: 'Rating cannot exceed 5' })
    @IsNumber()
  rating: number;

  @ApiProperty({
    description: 'Review text content',
    minLength: 10,
    maxLength: 1000,
    example: 'Excellent service! Very professional and helpful staff.',
    type: String,
  })
  @IsString()
  @MinLength(10, { message: 'Review must be at least 10 characters long' })
  @MaxLength(1000, { message: 'Review cannot exceed 1000 characters' })
  review_text: string;
}
