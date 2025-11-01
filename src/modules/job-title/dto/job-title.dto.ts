import { ApiProperty } from '@nestjs/swagger';

export class JobTitleDto {
  @ApiProperty() id!: string;
  @ApiProperty() title!: string;
  @ApiProperty() rank!: number;
  @ApiProperty() is_active!: boolean;
  @ApiProperty({ required: false, nullable: true }) difficulty?: string | null;
  @ApiProperty({ required: false, nullable: true }) skills_summary?: string | null;
  @ApiProperty({ required: false, nullable: true }) description?: string | null;
}

export class JobTitleListResponseDto {
  @ApiProperty({ type: [JobTitleDto] }) data!: JobTitleDto[];
  @ApiProperty() total!: number;
}

export class JobTitleSeedResponseDto {
  @ApiProperty() source!: string;
  @ApiProperty() upserted!: number;
}
