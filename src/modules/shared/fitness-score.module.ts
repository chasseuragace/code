import { Module } from '@nestjs/common';
import { FitnessScoreService } from './fitness-score.service';

@Module({
  providers: [FitnessScoreService],
  exports: [FitnessScoreService],
})
export class FitnessScoreModule {}
