import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

import { JobPosting, JobPosition } from '../domain/domain.entity';
import { InterviewDetail } from '../domain/domain.entity';

export type JobApplicationHistoryEntry = {
  prev_status: JobApplicationStatus | null;
  next_status: JobApplicationStatus;
  updated_at: string; // ISO timestamp
  updated_by?: string | null; // free-form until auth exists
  note?: string | null;
  corrected?: boolean; // set by makeCorrection path
};

export type JobApplicationStatus =
  | 'applied'
  | 'shortlisted'
  | 'interview_scheduled'
  | 'interview_rescheduled'
  | 'interview_passed'
  | 'interview_failed'
  | 'withdrawn';

@Entity('job_applications')
@Index('idx_job_applications_candidate_created', ['candidate_id', 'created_at'])
@Index('idx_job_applications_posting', ['job_posting_id'])
export class JobApplication {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  @Index('idx_job_applications_candidate')
  candidate_id: string;

  @Column('uuid')
  job_posting_id: string;

  @Column('uuid')
  position_id: string;

  @ManyToOne(() => JobPosting)
  @JoinColumn({ name: 'job_posting_id' })
  job_posting: JobPosting;

  @ManyToOne(() => JobPosition)
  @JoinColumn({ name: 'position_id' })
  position: JobPosition;

  @OneToMany(() => InterviewDetail, interview => interview.job_application)
  interview_details: InterviewDetail[];

  @Column({ type: 'varchar' })
  status: JobApplicationStatus;

  // Append-only array of history entries stored in a single JSONB field
  @Column({ type: 'jsonb', default: () => "'[]'::jsonb" })
  history_blob: JobApplicationHistoryEntry[];

  @Column({ type: 'timestamp with time zone', nullable: true })
  withdrawn_at?: Date | null;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updated_at: Date;
}
