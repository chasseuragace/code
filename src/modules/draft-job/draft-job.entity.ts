import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../domain/base.entity';
import { PostingAgency } from '../domain/PostingAgency';
import { User } from '../user/user.entity';

export enum DraftStatus {
  DRAFT = 'draft',
  READY_TO_PUBLISH = 'ready_to_publish',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
}

@Entity('draft_jobs')
export class DraftJob extends BaseEntity {
  @Column({ type: 'uuid' })
  posting_agency_id: string;

  @Column({ type: 'uuid' })
  created_by: string;

  @Column({
    type: 'enum',
    enum: DraftStatus,
    default: DraftStatus.DRAFT,
  })
  status: DraftStatus;

  // Basic job posting info
  @Column({ type: 'varchar', length: 500, nullable: true })
  posting_title?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  country?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  city?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  lt_number?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  chalani_number?: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  approval_date_bs?: string;

  @Column({ type: 'date', nullable: true })
  approval_date_ad?: Date;

  @Column({ type: 'date', nullable: true })
  posting_date_ad?: Date;

  @Column({ type: 'varchar', length: 20, nullable: true })
  posting_date_bs?: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  announcement_type?: string;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  // Employer data (JSONB for flexibility)
  @Column({ type: 'jsonb', nullable: true })
  employer?: {
    company_name?: string;
    country?: string;
    city?: string;
  };

  // Contract data (JSONB)
  @Column({ type: 'jsonb', nullable: true })
  contract?: {
    period_years?: number;
    renewable?: boolean;
    hours_per_day?: number;
    days_per_week?: number;
    overtime_policy?: string;
    weekly_off_days?: number;
    food?: string;
    accommodation?: string;
    transport?: string;
    annual_leave_days?: number;
  };

  // Positions array (JSONB)
  @Column({ type: 'jsonb', nullable: true })
  positions?: Array<{
    title?: string;
    vacancies?: { male?: number; female?: number };
    salary?: {
      monthly_amount?: number;
      currency?: string;
      converted?: Array<{ amount: number; currency: string }>;
    };
    hours_per_day_override?: number;
    days_per_week_override?: number;
    overtime_policy_override?: string;
    weekly_off_days_override?: number;
    food_override?: string;
    accommodation_override?: string;
    transport_override?: string;
    position_notes?: string;
  }>;

  // Expenses (JSONB for all 6 types)
  @Column({ type: 'jsonb', nullable: true })
  expenses?: {
    medical?: {
      domestic?: {
        who_pays?: string;
        is_free?: boolean;
        amount?: number;
        currency?: string;
        notes?: string;
      };
      foreign?: {
        who_pays?: string;
        is_free?: boolean;
        amount?: number;
        currency?: string;
        notes?: string;
      };
    };
    insurance?: {
      who_pays?: string;
      is_free?: boolean;
      amount?: number;
      currency?: string;
      coverage_amount?: number;
      coverage_currency?: string;
      notes?: string;
    };
    travel?: {
      who_provides?: string;
      ticket_type?: string;
      is_free?: boolean;
      amount?: number;
      currency?: string;
      notes?: string;
    };
    visa?: {
      who_pays?: string;
      is_free?: boolean;
      amount?: number;
      currency?: string;
      refundable?: boolean;
      notes?: string;
    };
    training?: {
      who_pays?: string;
      is_free?: boolean;
      amount?: number;
      currency?: string;
      duration_days?: number;
      mandatory?: boolean;
      notes?: string;
    };
    welfare?: {
      welfare?: {
        who_pays?: string;
        is_free?: boolean;
        amount?: number;
        currency?: string;
        fund_purpose?: string;
        refundable?: boolean;
        notes?: string;
      };
      service?: {
        who_pays?: string;
        is_free?: boolean;
        amount?: number;
        currency?: string;
        service_type?: string;
        refundable?: boolean;
        notes?: string;
      };
    };
  };

  // Tagging fields
  @Column({ type: 'jsonb', nullable: true })
  skills?: string[];

  @Column({ type: 'jsonb', nullable: true })
  education_requirements?: string[];

  @Column({ type: 'jsonb', nullable: true })
  experience_requirements?: {
    min_years?: number;
    max_years?: number;
    level?: string;
  };

  @Column({ type: 'jsonb', nullable: true })
  canonical_title_names?: string[];

  // Cutout/Advertisement image
  @Column({ type: 'jsonb', nullable: true })
  cutout?: {
    file_name?: string;
    file_url?: string;
    file_size?: number;
    file_type?: string;
    has_file?: boolean;
    is_uploaded?: boolean;
    preview_url?: string;
    uploaded_url?: string;
  };

  // Interview details
  @Column({ type: 'jsonb', nullable: true })
  interview?: {
    date_ad?: string;
    date_bs?: string;
    date_format?: string;
    time?: string;
    location?: string;
    contact_person?: string;
    required_documents?: string[];
    notes?: string;
    expenses?: Array<{
      type: string;
      who_pays: string;
      is_free: boolean;
      amount?: number;
      currency?: string;
      notes?: string;
    }>;
  };

  // Draft progress tracking
  @Column({ type: 'boolean', default: false })
  is_partial: boolean;

  @Column({ type: 'integer', default: 0 })
  last_completed_step: number;

  @Column({ type: 'boolean', default: false })
  is_complete: boolean;

  @Column({ type: 'boolean', default: false })
  ready_to_publish: boolean;

  @Column({ type: 'boolean', default: false })
  reviewed: boolean;

  // Bulk draft support
  @Column({ type: 'boolean', default: false })
  is_bulk_draft: boolean;

  @Column({ type: 'jsonb', nullable: true })
  bulk_entries?: Array<{
    position?: string;
    job_count?: number;
    country?: string;
    salary?: string;
    currency?: string;
  }>;

  @Column({ type: 'integer', nullable: true })
  total_jobs?: number;

  // Reference to published job (if converted)
  @Column({ type: 'uuid', nullable: true })
  published_job_id?: string;

  // Relations
  @ManyToOne(() => PostingAgency)
  @JoinColumn({ name: 'posting_agency_id' })
  agency: PostingAgency;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'created_by' })
  creator: User;
}
