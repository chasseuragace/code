import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('candidate_job_profiles')
export class CandidateJobProfile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  candidate_id: string;

  @Column('jsonb')
  profile_blob: any;

  @Column({ type: 'varchar', nullable: true })
  label?: string;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updated_at: Date;
}
