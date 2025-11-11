import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn, UpdateDateColumn, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { Candidate } from './candidate.entity';
import { DocumentType } from './document-type.entity';

@Entity('candidate_documents')
@Unique('unique_candidate_document_type', ['candidate_id', 'document_type_id', 'is_active'])
export class CandidateDocument {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updated_at: Date;

  @Index()
  @Column({ type: 'uuid' })
  candidate_id: string;

  @Index()
  @Column({ type: 'uuid' })
  document_type_id: string;

  @Column({ type: 'varchar', length: 1000 })
  document_url: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  file_type?: string;

  @Column({ type: 'integer', nullable: true })
  file_size?: number;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  // Verification fields
  @Column({ 
    type: 'varchar', 
    length: 20, 
    default: 'pending',
    enum: ['pending', 'approved', 'rejected']
  })
  verification_status: 'pending' | 'approved' | 'rejected';

  @Column({ type: 'uuid', nullable: true })
  verified_by?: string;

  @Column({ type: 'timestamp with time zone', nullable: true })
  verified_at?: Date;

  @Column({ type: 'text', nullable: true })
  rejection_reason?: string;

  // Document replacement tracking
  @Column({ type: 'uuid', nullable: true })
  replaced_by_document_id?: string;

  @ManyToOne(() => Candidate)
  @JoinColumn({ name: 'candidate_id' })
  candidate: Candidate;

  @ManyToOne(() => DocumentType)
  @JoinColumn({ name: 'document_type_id' })
  document_type: DocumentType;
}
