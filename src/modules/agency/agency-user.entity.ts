import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

export type AgencyUserRole = 'owner' | 'staff' | 'admin' | 'manager' | 'recruiter' | 'coordinator' | 'visaOfficer' | 'accountant';

@Entity('agency_users')
export class AgencyUser {
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
  phone: string; // E.164

  @Index({ unique: true })
  @Column({ type: 'uuid' })
  user_id: string;

  @Index()
  @Column({ type: 'uuid', nullable: true })
  agency_id?: string | null;

  @Column({ type: 'varchar', length: 32, default: 'owner' })
  role: AgencyUserRole;

  @Column({ type: 'varchar', length: 32, default: 'active' })
  status?: string; // active, inactive, pending, suspended

  @Column({ type: 'varchar', length: 200, nullable: true })
  password_hash?: string | null;

  @Column({ type: 'timestamp with time zone', nullable: true })
  password_set_by_admin_at?: Date | null;
}
