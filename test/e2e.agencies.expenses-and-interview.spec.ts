import 'reflect-metadata';
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from 'src/app.module';

/**
 * E2E: Agency controller extended routes over HTTP
 * - create agency
 * - create job posting
 * - update posting (PATCH)
 * - attach expenses (medical, travel)
 * - create/get/update interview
 */
describe('E2E: agencies controller extended routes', () => {
  let app: INestApplication;
  let postingId: string;
  const license = 'LIC-E2E-EXP-0001';

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app?.close();
  });

  it('creates agency', async () => {
    const payload = {
      name: 'E2E Expenses Agency',
      license_number: license,
      address: 'Kathmandu',
    };
    await request(app.getHttpServer())
      .post('/agencies')
      .send(payload)
      .expect(201)
      .expect((res) => {
        expect(res.body).toHaveProperty('id');
        expect(res.body.license_number).toBe(license);
      });
  });

  it('creates job posting for agency (draft/full)', async () => {
    const body = {
      posting_title: 'E2E Posting (Expenses)',
      country: 'UAE',
      city: 'Dubai',
      approval_date_ad: new Date().toISOString().slice(0, 10),
      posting_date_ad: new Date().toISOString().slice(0, 10),
      announcement_type: 'full_ad',
      notes: 'initial',
      employer: { company_name: 'E2E Co', country: 'UAE', city: 'Dubai' },
      contract: {
        period_years: 2,
        hours_per_day: 8,
        days_per_week: 6,
        overtime_policy: 'paid',
        weekly_off_days: 1,
        food: 'free',
        accommodation: 'free',
        transport: 'paid',
      },
      positions: [
        {
          title: 'Worker',
          vacancies: { male: 2, female: 1 },
          salary: { monthly_amount: 1200, currency: 'AED' },
        },
      ],
    };

    await request(app.getHttpServer())
      .post(`/agencies/${license}/job-postings`)
      .send(body)
      .expect(201)
      .expect((res) => {
        expect(res.body).toHaveProperty('id');
        postingId = res.body.id;
      });
  });

  it('patches posting notes (update)', async () => {
    await request(app.getHttpServer())
      .patch(`/agencies/${license}/job-postings/${postingId}`)
      .send({ notes: 'updated notes' })
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty('id', postingId);
      });
  });

  it('attaches medical expense with mixed payers', async () => {
    const payload = {
      domestic: { who_pays: 'worker', is_free: false, amount: 2000, currency: 'NPR' },
      foreign: { who_pays: 'company', is_free: true },
    };
    await request(app.getHttpServer())
      .post(`/agencies/${license}/job-postings/${postingId}/expenses/medical`)
      .send(payload)
      .expect(201)
      .expect((res) => {
        expect(res.body).toHaveProperty('id');
      });
  });

  it('attaches travel expense (round_trip, employer pays)', async () => {
    const payload = {
      who_pays: 'company',
      is_free: false,
      amount: 800,
      currency: 'AED',
      ticket_type: 'round_trip',
    };
    await request(app.getHttpServer())
      .post(`/agencies/${license}/job-postings/${postingId}/expenses/travel`)
      .send(payload)
      .expect(201)
      .expect((res) => {
        expect(res.body).toHaveProperty('id');
      });
  });

  it('creates, gets, and updates interview', async () => {
    const createPayload = {
      interview_date_ad: new Date().toISOString().slice(0, 10),
      interview_time: '10:00',
      location: 'Agency Office',
      contact_person: 'Ops Lead',
      required_documents: ['Passport', 'CV'],
    };
    await request(app.getHttpServer())
      .post(`/agencies/${license}/job-postings/${postingId}/interview`)
      .send(createPayload)
      .expect(201)
      .expect((res) => {
        expect(res.body).toHaveProperty('id');
      });

    await request(app.getHttpServer())
      .get(`/agencies/${license}/job-postings/${postingId}/interview`)
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty('id');
        expect(res.body.location).toBe('Agency Office');
      });

    await request(app.getHttpServer())
      .patch(`/agencies/${license}/job-postings/${postingId}/interview`)
      .send({ location: 'Client HQ' })
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty('id');
      });
  });
});
