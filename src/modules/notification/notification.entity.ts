import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from '../domain/base.entity';
import { JobApplication } from '../application/job-application.entity';

export type NotificationType = 
  | 'shortlisted'
  | 'interview_scheduled'
  | 'interview_rescheduled'
  | 'interview_passed'
  | 'interview_failed';

export type NotificationPayload = {
  job_title: string;
  agency_name: string;
  interview_details?: {
    date: string;
    time: string;
    location: string;
  };
  image_url?: string;
};

@Entity('notifications')
@Index('idx_notifications_candidate', ['candidate_id'])
@Index('idx_notifications_candidate_created', ['candidate_id', 'created_at'])
@Index('idx_notifications_unread', ['candidate_id', 'is_read'])
export class Notification extends BaseEntity {
  @Column('uuid')
  @Index('idx_notifications_candidate_id')
  candidate_id: string;

  @Column('uuid')
  job_application_id: string;

  @Column('uuid')
  job_posting_id: string;

  @Column('uuid')
  agency_id: string;

  @Column('uuid', { nullable: true })
  interview_id?: string;

  @Column({
    type: 'enum',
    enum: ['shortlisted', 'interview_scheduled', 'interview_rescheduled', 'interview_passed', 'interview_failed']
  })
  notification_type: NotificationType;

  @Column({ type: 'varchar', length: 500 })
  title: string;

  @Column({ type: 'text' })
  message: string;

  @Column({ type: 'jsonb' })
  payload: NotificationPayload;

  @Column({ type: 'boolean', default: false })
  is_read: boolean;

  @Column({ type: 'boolean', default: false })
  is_sent: boolean;

  @Column({ type: 'timestamp with time zone', nullable: true })
  sent_at?: Date;

  @Column({ type: 'timestamp with time zone', nullable: true })
  read_at?: Date;

  // Relations
  @ManyToOne(() => JobApplication, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'job_application_id' })
  job_application: JobApplication;
}
