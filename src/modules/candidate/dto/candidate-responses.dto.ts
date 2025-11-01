import { ApiProperty } from '@nestjs/swagger';
import { CandidateJobCardDto } from './candidate-job-card.dto';

export class CandidateCreatedResponseDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;
}

export class AddJobProfileResponseDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;
}

export class GroupedJobsGroupDto {
  @ApiProperty()
  title!: string;

  @ApiProperty({ type: [CandidateJobCardDto] })
  jobs!: CandidateJobCardDto[];
}

export class GroupedJobsResponseDto {
  @ApiProperty({ type: [GroupedJobsGroupDto] })
  groups!: GroupedJobsGroupDto[];
}
