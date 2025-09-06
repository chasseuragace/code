import 'reflect-metadata';
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from 'src/app.module';

/**
 * E2E happy flows simulating production runs over HTTP
 * - flow_system_initialized -> seed countries and job titles
 * - flow_agency_flow_create_agency -> create agency
 * - flow_agency_create_job -> create job posting for agency
 */

describe('E2E: production-like happy flows', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app?.close();
  });

  it('flow_system_initialized: seeds countries and job titles', async () => {
    await request(app.getHttpServer())
      .post('/countries/seedv1')
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty('upserted');
      });

    await request(app.getHttpServer())
      .post('/job-titles/seedv1')
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty('upserted');
      });
  });

  it('flow_agency_flow_create_agency: creates an agency', async () => {
    const payload = {
      name: 'E2E Test Agency',
      license_number: 'LIC-E2E-0001',
      address: 'Kathmandu',
      phones: ['+977-1-5551234'],
      emails: ['ops@e2e-agency.example'],
      website: 'https://e2e.agency.example',
    };

    await request(app.getHttpServer())
      .post('/agencies')
      .send(payload)
      .expect(201)
      .expect((res) => {
        expect(res.body).toHaveProperty('id');
        expect(res.body.license_number).toBe('LIC-E2E-0001');
      });
  });

  it('flow_agency_create_job: creates job posting for agency', async () => {
    const body = {
      posting_title: 'Electricians - Dubai (E2E)',
      country: 'UAE',
      city: 'Dubai',
      approval_date_ad: new Date().toISOString().slice(0, 10),
      posting_date_ad: new Date().toISOString().slice(0, 10),
      announcement_type: 'full_ad',
      notes: 'E2E posting',
      employer: { company_name: 'E2E Electric Co', country: 'UAE', city: 'Dubai' },
      contract: {
        period_years: 2,
        renewable: true,
        hours_per_day: 8,
        days_per_week: 6,
        overtime_policy: 'paid',
        weekly_off_days: 1,
        food: 'free',
        accommodation: 'free',
        transport: 'paid',
        annual_leave_days: 14,
      },
      positions: [
        {
          title: 'Electrician',
          vacancies: { male: 5, female: 1 },
          salary: {
            monthly_amount: 1600,
            currency: 'AED',
            converted: [{ amount: 57600, currency: 'NPR' }],
          },
        },
      ],
    };

    await request(app.getHttpServer())
      .post('/agencies/LIC-E2E-0001/job-postings')
      .send(body)
      .expect(201)
      .expect((res) => {
        expect(res.body).toHaveProperty('id');
        expect(res.body.posting_title).toBe('Electricians - Dubai (E2E)');
      });
  });
});
