import { ApiProperty } from '@nestjs/swagger';

export class PreferenceDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty()
  title!: string;

  @ApiProperty({ description: '1-based priority; lower means higher priority', example: 1 })
  priority!: number;

  @ApiProperty({ format: 'uuid', nullable: true, description: 'Linked job title id when available' })
  job_title_id!: string | null;
}

export class AddPreferenceDto {
  @ApiProperty({ description: 'Job title string (must exist and be active in JobTitle)' })
  title!: string;
}

export class RemovePreferenceDto {
  @ApiProperty({ description: 'Job title string to remove' })
  title!: string;
}

export class ReorderPreferencesDto {
  @ApiProperty({
    required: false,
    type: [String],
    description: 'Ordered list of preference row IDs. Preferred for drag-and-drop.',
    example: [
      '3f0e3a82-6c8b-4c42-9b22-9d9f7c8aec01',
      'f6d09772-b0a2-4a54-9e8c-0f1b9d49c3d2',
    ],
  })
  orderedIds?: string[];

  @ApiProperty({
    required: false,
    type: [String],
    description: 'Fallback: ordered list of titles (must be a permutation of existing titles).',
    example: ['Electrician', 'Welder', 'Plumber'],
  })
  orderedTitles?: string[];
}
