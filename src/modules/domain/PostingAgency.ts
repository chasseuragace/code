import { Entity, Column, OneToMany } from 'typeorm';
import { BaseEntity } from './base.entity';
import { JobContract } from './domain.entity';


@Entity('posting_agencies')
export class PostingAgency extends BaseEntity {
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

  @Column({ type: 'date', nullable: true })
  license_valid_till?: Date;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @OneToMany(() => JobContract, contract => contract.agency)
  contracts: JobContract[];
}
