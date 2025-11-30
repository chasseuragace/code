import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class JobTitleDto {
  @ApiProperty({ description: 'Id', example: 'example' })
    id!: string;
  @ApiProperty({ description: 'Title', example: 'example' })
    title!: string;
  @ApiProperty({ description: 'Rank', example: 0 })
    rank!: number;
  @ApiProperty({ description: 'Is active', example: true })
    is_active!: boolean;
  
    @ApiPropertyOptional({ description: 'Difficulty', required: false, nullable: true })
    difficulty?: string | null;
  
    @ApiPropertyOptional({ description: 'Skills summary', required: false, nullable: true })
    skills_summary?: string | null;
  
    @ApiPropertyOptional({ description: 'Description', required: false, nullable: true })
    description?: string | null;
}

export class JobTitleListResponseDto {
  @ApiProperty({ description: 'Data', type: [JobTitleDto] })
    data!: JobTitleDto[];
  @ApiProperty({ description: 'Total', example: 10 })
    total!: number;
}

export class JobTitleSeedResponseDto {
  @ApiProperty({ description: 'Source', example: 'example' })
    source!: string;
  @ApiProperty({ description: 'Upserted', example: 0 })
    upserted!: number;
}
