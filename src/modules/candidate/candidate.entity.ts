import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('candidates')
export class Candidate {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updated_at: Date;
  @Column({ type: 'varchar', length: 150 })
  full_name: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 20 })
  phone: string; // stored normalized (E.164)

  @Column({ type: 'varchar', length: 150, nullable: true })
  email?: string;

  @Column({ type: 'varchar', length: 10, nullable: true })
  gender?: string;

  @Column({ type: 'jsonb', nullable: true })
  address?: {
    name?: string;
    coordinates?: { lat: number; lng: number };
    province?: string;
    district?: string;
    municipality?: string;
    ward?: string;
  };

  @Column({ type: 'varchar', length: 50, nullable: true })
  passport_number?: string;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;
}
