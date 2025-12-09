import { IsString, IsBoolean, IsOptional, IsUUID, MinLength } from 'class-validator';

export class CreateApplicationNoteDto {
  @IsUUID()
  job_application_id: string;

  @IsString()
  @MinLength(1, { message: 'Note text cannot be empty' })
  note_text: string;

  @IsBoolean()
  @IsOptional()
  is_private?: boolean = true; // Default to private
}

export class UpdateApplicationNoteDto {
  @IsString()
  @IsOptional()
  @MinLength(1, { message: 'Note text cannot be empty' })
  note_text?: string;

  @IsBoolean()
  @IsOptional()
  is_private?: boolean;
}

export class ApplicationNoteResponseDto {
  id: string;
  job_application_id: string;
  agency_id: string;
  added_by_user_id: string;
  added_by_name: string;
  note_text: string;
  is_private: boolean;
  created_at: Date;
  updated_at: Date;
}
