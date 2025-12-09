import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { JobApplication } from '../application/job-application.entity';

@Entity('application_notes')
export class ApplicationNote {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  job_application_id: string;

  @Column({ type: 'uuid' })
  agency_id: string;

  @Column({ type: 'uuid' })
  added_by_user_id: string;

  @Column({ type: 'varchar', length: 150 })
  added_by_name: string;

  @Column({ type: 'text' })
  note_text: string;

  @Column({ type: 'boolean', default: true })
  is_private: boolean;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;

  @ManyToOne(() => JobApplication, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'job_application_id' })
  job_application: JobApplication;
}
