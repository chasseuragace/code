import { PartialType } from '@nestjs/mapped-types';
import { CreateDraftJobDto } from './create-draft-job.dto';
import { IsOptional, IsEnum } from 'class-validator';
import { DraftStatus } from '../draft-job.entity';

export class UpdateDraftJobDto extends PartialType(CreateDraftJobDto) {
  @IsOptional()
  @IsEnum(DraftStatus)
  status?: DraftStatus;
}
