import { IsString, IsBoolean, IsOptional, IsUUID, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CreateApplicationNoteDto {
  @IsUUID()
    @ApiProperty({ description: 'Job application id', example: 'example' })
  job_application_id: string;

  @IsString()
  @MinLength(1, { message: 'Note text cannot be empty' })
    @ApiProperty({ description: 'Note text', example: 'example' })
  note_text: string;

  @IsBoolean()
  @IsOptional()
    @ApiPropertyOptional({ description: 'Is private', example: true })
  is_private?: boolean = true; // Default to private
}

export class UpdateApplicationNoteDto {
  @IsString()
  @IsOptional()
  @MinLength(1, { message: 'Note text cannot be empty' })
    @ApiPropertyOptional({ description: 'Note text', example: 'example' })
  note_text?: string;

  @IsBoolean()
  @IsOptional()
    @ApiPropertyOptional({ description: 'Is private', example: true })
  is_private?: boolean;
}

export class ApplicationNoteResponseDto {
  @ApiProperty({ description: 'Id', example: 'example' })
    id: string;
  @ApiProperty({ description: 'Job application id', example: 'example' })
    job_application_id: string;
  @ApiProperty({ description: 'Agency id', example: 'example' })
    agency_id: string;
  @ApiProperty({ description: 'Added by user id', example: 'example' })
    added_by_user_id: string;
  @ApiProperty({ description: 'Added by name', example: 'Example Name' })
    added_by_name: string;
  @ApiProperty({ description: 'Note text', example: 'example' })
    note_text: string;
  @ApiProperty({ description: 'Is private', example: true })
    is_private: boolean;
  @ApiProperty({ description: 'Created at', example: new Date('2024-01-01') })
    created_at: Date;
  @ApiProperty({ description: 'Updated at', example: new Date('2024-01-01') })
    updated_at: Date;
}
