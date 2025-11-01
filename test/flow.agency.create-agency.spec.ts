import 'reflect-metadata';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { AgencyModule } from 'src/modules/agency/agency.module';
import { AgencyService } from 'src/modules/agency/agency.service';

/**
 * flow_agency_flow_create_agency
 * Preconditions: DB up, schema synchronized
 * Flow: create an agency minimal, then fetch by id and by license
 */

describe('flow_agency_flow_create_agency', () => {
  let moduleRef: TestingModule;
  let agencySvc: AgencyService;
  let dataSource: DataSource;

  beforeAll(async () => {
    moduleRef = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'postgres',
          host: process.env.DB_HOST || 'localhost',
          port: parseInt(process.env.DB_PORT || '5432', 10),
          username: process.env.DB_USERNAME || 'postgres',
          password: process.env.DB_PASSWORD || 'postgres',
          database: process.env.DB_DATABASE || 'app_db',
          autoLoadEntities: true,
          synchronize: true,
        }),
        AgencyModule,
      ],
    }).compile();

    agencySvc = moduleRef.get(AgencyService);
    dataSource = moduleRef.get(DataSource);
  });

  afterAll(async () => {
    await moduleRef?.close();
  });

  it('creates an agency and fetches it', async () => {
    const created = await agencySvc.createAgency({
      name: 'Test Agency Pvt Ltd',
      license_number: 'LIC-TST-0001',
      address: 'Kathmandu',
      phones: ['+977-1-5550000'],
      emails: ['ops@test-agency.example'],
    });

    const byId = await agencySvc.findAgencyById(created.id);
    expect(byId.name).toBe('Test Agency Pvt Ltd');

    const byLicense = await agencySvc.findAgencyByLicense('LIC-TST-0001');
    expect(byLicense.id).toBe(created.id);
  });
});
