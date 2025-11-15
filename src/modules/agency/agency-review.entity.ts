import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Index, ManyToOne, JoinColumn } from 'typeorm';
import { PostingAgency } from '../domain/PostingAgency';
import { Candidate } from '../candidate/candidate.entity';

@Entity('agency_reviews')
@Index(['candidate_id', 'agency_id'], { unique: true })
export class AgencyReview {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ type: 'uuid' })
  agency_id: string;

  @Index()
  @Column({ type: 'uuid' })
  candidate_id: string;

  @Column({ type: 'integer' })
  rating: number;

  @Column({ type: 'text' })
  review_text: string;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updated_at: Date;

  @ManyToOne(() => PostingAgency, agency => agency.reviews)
  @JoinColumn({ name: 'agency_id' })
  agency: PostingAgency;

  @ManyToOne(() => Candidate)
  @JoinColumn({ name: 'candidate_id' })
  candidate: Candidate;
}
