import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, MaxLength, IsUUID, IsBoolean } from 'class-validator';

export class CreateCandidateDocumentDto {
  @ApiProperty({ 
    description: 'Document type ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
    format: 'uuid'
  })
  @IsUUID('4')
  @IsNotEmpty()
  document_type_id!: string;

  @ApiProperty({ description: 'Document name' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name!: string;

  @ApiPropertyOptional({ description: 'Document description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Additional notes' })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateCandidateDocumentDto {
  @ApiPropertyOptional({ description: 'Document name' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  name?: string;

  @ApiPropertyOptional({ description: 'Document description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Additional notes' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ description: 'Document active status' })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}

export class CandidateDocumentResponseDto {
  @ApiProperty({ 
    description: 'Document unique identifier',
    example: '123e4567-e89b-12d3-a456-426614174000',
    format: 'uuid'
  })
  id!: string;

  @ApiProperty({ 
    description: 'Candidate unique identifier',
    example: '987fcdeb-51a2-43d1-9f12-345678901234',
    format: 'uuid'
  })
  candidate_id!: string;

  @ApiProperty({ 
    description: 'Document type unique identifier',
    example: '456e7890-e89b-12d3-a456-426614174111',
    format: 'uuid'
  })
  document_type_id!: string;

  @ApiProperty({ 
    description: 'Document file URL',
    example: '/uploads/candidates/987fcdeb-51a2-43d1-9f12-345678901234/documents/resume.pdf'
  })
  document_url!: string;

  @ApiProperty({ 
    description: 'Document name',
    example: 'Resume - Software Engineer'
  })
  name!: string;

  @ApiPropertyOptional({ 
    description: 'Document description',
    example: 'Updated resume with latest work experience'
  })
  description?: string;

  @ApiPropertyOptional({ 
    description: 'Additional notes',
    example: 'Verified by HR department'
  })
  notes?: string;

  @ApiPropertyOptional({ 
    description: 'File MIME type',
    example: 'application/pdf'
  })
  file_type?: string;

  @ApiPropertyOptional({ 
    description: 'File size in bytes',
    example: 1048576,
    type: 'integer'
  })
  file_size?: number;

  @ApiProperty({ 
    description: 'Document active status',
    example: true,
    type: 'boolean'
  })
  is_active!: boolean;

  @ApiProperty({ 
    description: 'Document verification status',
    example: 'pending',
    enum: ['pending', 'approved', 'rejected']
  })
  verification_status!: 'pending' | 'approved' | 'rejected';

  @ApiPropertyOptional({ 
    description: 'User ID who verified the document',
    example: '789e0123-e89b-12d3-a456-426614174222',
    format: 'uuid'
  })
  verified_by?: string;

  @ApiPropertyOptional({ 
    description: 'Document verification timestamp',
    example: '2024-01-16T10:30:00Z',
    type: 'string',
    format: 'date-time'
  })
  verified_at?: Date;

  @ApiPropertyOptional({ 
    description: 'Rejection reason if document was rejected',
    example: 'Document is expired'
  })
  rejection_reason?: string;

  @ApiProperty({ 
    description: 'Document creation timestamp',
    example: '2024-01-15T10:30:00Z',
    type: 'string',
    format: 'date-time'
  })
  created_at!: Date;

  @ApiProperty({ 
    description: 'Document last update timestamp',
    example: '2024-01-15T10:30:00Z',
    type: 'string',
    format: 'date-time'
  })
  updated_at!: Date;
}

export class UploadResponseDto {
  @ApiProperty({ 
    description: 'Upload operation success status',
    example: true,
    type: 'boolean'
  })
  success!: boolean;

  @ApiPropertyOptional({ 
    description: 'File URL if upload successful',
    example: '/uploads/candidates/123e4567-e89b-12d3-a456-426614174000/profile.jpg',
    type: 'string'
  })
  url?: string;

  @ApiPropertyOptional({ 
    description: 'Success message',
    example: 'File uploaded successfully',
    type: 'string'
  })
  message?: string;

  @ApiPropertyOptional({ 
    description: 'Error message if upload failed',
    example: 'File size exceeds 5MB limit',
    type: 'string'
  })
  error?: string;
}
