import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsUUID, IsOptional, IsString } from 'class-validator';

export class ApplyJobDto {
  @ApiProperty({
    description: 'UUID of the candidate applying for the job',
    example: '7103d484-19b0-4c62-ae96-256da67a49a4',
    format: 'uuid',
  })
  @IsUUID(4)
  candidate_id: string;

  @ApiProperty({
    description: 'UUID of the job posting to apply for',
    example: '1e8c9c1a-352c-485d-ac9a-767cbbca4a4c',
    format: 'uuid',
  })
  @IsUUID(4)
  job_posting_id: string;

  @ApiProperty({
    description: 'UUID of the specific position being applied for within the job posting',
    example: '2f4a8d3b-1c5e-4f7a-9d2c-8e3f6a5b4d7e',
    format: 'uuid',
  })
  @IsUUID(4)
  position_id: string;

  
  @IsOptional()
  @IsString()
    @ApiPropertyOptional({
        description: 'Optional note or cover letter from the candidate',
        example: 'I am very interested in this electrical position and have 5 years of experience.',
        required: false,
      })
  note?: string;

  
  @IsOptional()
  @IsString()
    @ApiPropertyOptional({
        description: 'Optional field to track who created this application (for audit purposes)',
        example: 'candidate-mobile-app',
        required: false,
      })
  updatedBy?: string;
}

export class ApplyJobResponseDto {
  @ApiProperty({
    description: 'UUID of the created job application',
    example: '075ce7d9-fcdb-4f7e-b794-4190f49d729f',
    format: 'uuid',
  })
  id: string;

  @ApiProperty({
    description: 'Current status of the application',
    example: 'applied',
    enum: ['applied', 'shortlisted', 'interview_scheduled', 'interview_completed', 'selected', 'rejected', 'withdrawn'],
  })
  status: string;
}