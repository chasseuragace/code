import { ApiProperty } from '@nestjs/swagger';
import { CandidateJobCardDto } from './candidate-job-card.dto';
import { IsString } from "class-validator";

export class CandidateCreatedResponseDto {
  
    @IsString()
    @ApiProperty({ description: 'Id', format: 'uuid' })
  id!: string;
}

export class AddJobProfileResponseDto {
  
  @ApiProperty({ description: 'Id', format: 'uuid' })
    id!: string;
}

export class GroupedJobsGroupDto {
  
  @ApiProperty({ description: 'Title', example: 'example' })
    title!: string;

  
  @ApiProperty({ description: 'Jobs', type: [CandidateJobCardDto] })
    jobs!: CandidateJobCardDto[];
}

export class GroupedJobsResponseDto {
  
  @ApiProperty({ description: 'Groups', type: [GroupedJobsGroupDto] })
    groups!: GroupedJobsGroupDto[];
}
