import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class DocumentTypeResponseDto {
  @ApiProperty({ 
    description: 'Document type unique identifier',
    example: '123e4567-e89b-12d3-a456-426614174000',
    format: 'uuid'
  })
  id!: string;

  @ApiProperty({ 
    description: 'Document type name',
    example: 'Passport'
  })
  name!: string;

  @ApiProperty({ 
    description: 'Document type code',
    example: 'PASSPORT'
  })
  type_code!: string;

  @ApiPropertyOptional({ 
    description: 'Document type description',
    example: 'Valid passport document'
  })
  description?: string;

  @ApiProperty({ 
    description: 'Whether this document type is required',
    example: true,
    type: 'boolean'
  })
  is_required!: boolean;

  @ApiProperty({ 
    description: 'Display order for UI',
    example: 1,
    type: 'integer'
  })
  display_order!: number;

  @ApiPropertyOptional({ 
    description: 'Allowed MIME types for this document',
    example: ['application/pdf', 'image/jpeg', 'image/png'],
    type: [String]
  })
  allowed_mime_types?: string[];

  @ApiPropertyOptional({ 
    description: 'Maximum file size in MB',
    example: 10,
    type: 'integer'
  })
  max_file_size_mb?: number;
}

export class CandidateDocumentDto {
  @ApiProperty({ 
    description: 'Document unique identifier',
    example: '123e4567-e89b-12d3-a456-426614174000',
    format: 'uuid'
  })
  id!: string;

  @ApiProperty({ 
    description: 'Document URL',
    example: '/uploads/documents/123e4567-e89b-12d3-a456-426614174000.pdf'
  })
  document_url!: string;

  @ApiProperty({ 
    description: 'Document name',
    example: 'Passport Copy'
  })
  name!: string;

  @ApiPropertyOptional({ 
    description: 'Additional notes about the document',
    example: 'Expires on 2025-12-31'
  })
  notes?: string;

  @ApiPropertyOptional({ 
    description: 'File type (MIME type)',
    example: 'application/pdf'
  })
  file_type?: string;

  @ApiPropertyOptional({ 
    description: 'File size in bytes',
    example: 1024
  })
  file_size?: number;

  @ApiProperty({ 
    description: 'Verification status of the document',
    enum: ['pending', 'approved', 'rejected'],
    example: 'pending'
  })
  verification_status!: 'pending' | 'approved' | 'rejected';

  @ApiPropertyOptional({ 
    description: 'Reason for rejection if document was rejected',
    example: 'Document is expired'
  })
  rejection_reason?: string;

  @ApiProperty({ 
    description: 'When the document was created',
    type: String,
    format: 'date-time'
  })
  created_at!: Date;

  @ApiProperty({ 
    description: 'When the document was last updated',
    type: String,
    format: 'date-time'
  })
  updated_at!: Date;
}

export class DocumentSlotResponseDto {
  @ApiProperty({ 
    description: 'Document type information',
    type: DocumentTypeResponseDto
  })
  document_type!: DocumentTypeResponseDto;

  @ApiPropertyOptional({ 
    description: 'Uploaded document information (null if not uploaded)',
    type: CandidateDocumentDto,
    nullable: true
  })
  document?: CandidateDocumentDto | null;
}

export class DocumentsSummaryDto {
  @ApiProperty({ 
    description: 'Total number of document types',
    example: 7,
    type: 'integer'
  })
  total_types!: number;

  @ApiProperty({ 
    description: 'Number of uploaded documents',
    example: 2,
    type: 'integer'
  })
  uploaded!: number;

  @ApiProperty({ 
    description: 'Number of pending documents',
    example: 5,
    type: 'integer'
  })
  pending!: number;

  @ApiProperty({ 
    description: 'Number of required documents still pending',
    example: 1,
    type: 'integer'
  })
  required_pending!: number;
}

export class DocumentsWithSlotsResponseDto {
  @ApiProperty({ 
    description: 'List of document slots with upload status',
    type: [DocumentSlotResponseDto]
  })
  data!: DocumentSlotResponseDto[];

  @ApiProperty({ 
    description: 'Summary of document upload status',
    type: DocumentsSummaryDto
  })
  summary!: DocumentsSummaryDto;
}
