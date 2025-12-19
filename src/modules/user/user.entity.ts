import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

export type UserRole = 'candidate' | 'agency_user' | 'owner' | 'call_agent';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updated_at: Date;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 20 })
  phone: string; // E.164

  @Column({ type: 'varchar', length: 150, nullable: true })
  full_name?: string | null; // User's full name

  @Column({ type: 'varchar', length: 32 })
  role: UserRole;

  @Column({ type: 'boolean', default: false })
  is_active: boolean;

  @Index()
  @Column({ type: 'uuid', nullable: true })
  candidate_id?: string | null;

  @Index()
  @Column({ type: 'uuid', nullable: true })
  agency_id?: string | null;

  @Column({ type: 'boolean', default: false })
  is_agency_owner: boolean;

  @Column({ type: 'varchar', nullable: true })
  fcm_token?: string | null;
}
