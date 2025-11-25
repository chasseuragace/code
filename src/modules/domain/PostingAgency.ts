import { Entity, Column, OneToMany } from 'typeorm';
import { BaseEntity } from './base.entity';
import { JobContract } from './domain.entity';


@Entity('posting_agencies')
export class PostingAgency extends BaseEntity {
  // Note: AgencyReview imported at bottom to avoid circular dependency
  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  license_number: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  country?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  city?: string;

  @Column({ type: 'text', nullable: true })
  address?: string;

  @Column({ type: 'double precision', nullable: true })
  latitude?: number;

  @Column({ type: 'double precision', nullable: true })
  longitude?: number;

  @Column({ type: 'text', array: true, nullable: true })
  phones?: string[];

  @Column({ type: 'text', array: true, nullable: true })
  emails?: string[];

  @Column({ type: 'varchar', length: 255, nullable: true })
  contact_email?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  contact_phone?: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  website?: string;

  @Column({ type: 'varchar', length: 1000, nullable: true })
  description?: string;

  @Column({ type: 'varchar', length: 1000, nullable: true })
  logo_url?: string;

  @Column({ type: 'varchar', length: 1000, nullable: true })
  banner_url?: string;

  @Column({ type: 'integer', nullable: true })
  established_year?: number;

  @Column({ type: 'date', nullable: true })
  license_valid_till?: Date;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  // Arrays/simple lists
  @Column({ type: 'text', array: true, nullable: true })
  services?: string[];

  @Column({ type: 'text', array: true, nullable: true })
  target_countries?: string[];

  @Column({ type: 'text', array: true, nullable: true })
  specializations?: string[];

  // Rich/nested structures as JSONB
  @Column({ type: 'jsonb', nullable: true })
  certifications?: Array<{ name?: string; number?: string; issued_by?: string; issued_date?: string; expiry_date?: string }>;

  @Column({ type: 'jsonb', nullable: true })
  social_media?: Record<string, string | null>;

  @Column({ type: 'jsonb', nullable: true })
  bank_details?: { bank_name?: string; account_name?: string; account_number?: string; swift_code?: string };

  @Column({ type: 'jsonb', nullable: true })
  contact_persons?: Array<{ name?: string; position?: string; phone?: string; email?: string }>;

  @Column({ type: 'jsonb', nullable: true })
  operating_hours?: { weekdays?: string; saturday?: string; sunday?: string };

  @Column({ type: 'jsonb', nullable: true })
  statistics?: { total_placements?: number; active_since?: string; success_rate?: number; countries_served?: number; partner_companies?: number; active_recruiters?: number };

  @Column({ type: 'jsonb', nullable: true })
  settings?: { currency?: string; timezone?: string; language?: string; date_format?: string; notifications?: any; features?: any };

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 0 })
  average_rating: number;

  @Column({ type: 'integer', default: 0 })
  review_count: number;

  @OneToMany(() => JobContract, contract => contract.agency)
  contracts: JobContract[];

  @OneToMany('AgencyReview', 'agency')
  reviews: any[];
}

