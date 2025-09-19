import 'reflect-metadata';
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { waitForAppReady } from './utils/appReady';

/**
 * E2E: Application analytics for candidate
 * Tests GET /applications/analytics/:candidateId
 * Preconditions:
 * - Candidate 9862146252 exists and is logged in
 * - Job posting created for testing
 * Flow:
 * - Create multiple applications with different statuses
 * - Fetch analytics and verify counts
 */

describe('E2E: application analytics', () => {
  let app: INestApplication;
  let candidateId: string;
  let postingId: string;
  let applicationIds: string[] = [];
  let accessToken: string;
  const testPhone = '98' + Math.floor(10000000 + Math.random() * 89999999).toString();

  async function seedData() {
    await request(app.getHttpServer()).post('/countries/seedv1').expect((res) => [200, 201].includes(res.status));
    await request(app.getHttpServer()).post('/job-titles/seedv1').expect((res) => [200, 201].includes(res.status));
  }

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    await waitForAppReady(app);
  });

  afterAll(async () => {
    await app?.close();
  });

  it('logs in candidate and creates applications with different statuses', async () => {
    // Seed data
    await seedData();

    // Register candidate
    const reg = await request(app.getHttpServer())
      .post('/register')
      .send({ full_name: 'Analytics Test User', phone: testPhone })
      .expect(200);
    const reg_otp = reg.body.dev_otp;

    // Verify registration
    const verReg = await request(app.getHttpServer())
      .post('/verify')
      .send({ phone: testPhone, otp: reg_otp })
      .expect(200);
    candidateId = verReg.body.candidate_id;
    accessToken = verReg.body.token;

    // Login
    const startRes = await request(app.getHttpServer())
      .post('/login/start')
      .send({ phone: testPhone })
      .expect(200);
    const dev_otp = startRes.body.dev_otp;

    const verRes = await request(app.getHttpServer())
      .post('/login/verify')
      .send({ phone: testPhone, otp: dev_otp })
      .expect(200);
    candidateId = verRes.body.candidate_id;
    accessToken = verRes.body.access_token;

    // Create agency
    await request(app.getHttpServer())
      .post('/agencies')
      .send({ name: 'Analytics Test Agency', license_number: 'LIC-ANALYTICS-001', country: 'Nepal' })
      .expect(201);

    // Get job title
    const jtRes = await request(app.getHttpServer()).get('/job-titles').expect(200);
    const jtData = Array.isArray(jtRes.body?.data) ? jtRes.body.data : [];
    const electrician = jtData.find((r: any) => (r.title || '').toLowerCase() === 'electrician');
    expect(electrician).toBeDefined();

    // Create job posting
    const postRes = await request(app.getHttpServer())
      .post('/agencies/LIC-ANALYTICS-001/job-postings')
      .send({
        posting_title: 'Analytics Test Job',
        country: 'UAE',
        employer: { company_name: 'Test Co', country: 'UAE', city: 'Dubai' },
        contract: { period_years: 2, renewable: true },
        positions: [
          { title: 'Test Position', vacancies: { male: 1, female: 0 }, salary: { monthly_amount: 1000, currency: 'AED', converted: [] } },
        ],
        skills: ['test-skill'],
        education_requirements: ['bachelor-degree'],
        experience_requirements: { min_years: 1, max_years: 5 },
        canonical_title_ids: [electrician.id],
      })
      .expect(201);
    postingId = postRes.body.id;

    // Apply to the posting
    const appRes = await request(app.getHttpServer())
      .post('/applications')
      .send({ candidate_id: candidateId, job_posting_id: postingId })
      .expect(201);
    const appId = appRes.body.id;
    applicationIds.push(appId);

    // Shortlist
    await request(app.getHttpServer())
      .post(`/applications/${appId}/shortlist`)
      .send({ note: 'Shortlisted for analytics test' })
      .expect(200);

    // Schedule interview
    await request(app.getHttpServer())
      .post(`/applications/${appId}/schedule-interview`)
      .send({
        interview_date_ad: '2025-10-01',
        interview_time: '10:00',
        location: 'Test Office',
        note: 'Scheduled for analytics test'
      })
      .expect(200);

    // Complete interview as passed
    await request(app.getHttpServer())
      .post(`/applications/${appId}/complete-interview`)
      .send({ result: 'passed', note: 'Passed analytics test' })
      .expect(200);
  });

  it('fetches analytics and verifies counts', async () => {
    const res = await request(app.getHttpServer())
      .get(`/applications/analytics/${candidateId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(typeof res.body.total).toBe('number');
    expect(typeof res.body.active).toBe('number');
    expect(typeof res.body.by_status).toBe('object');

    const { total, active, by_status } = res.body;

    // At least 1 total (from this test or previous)
    expect(total).toBeGreaterThanOrEqual(1);

    // Active should be <= total
    expect(active).toBeLessThanOrEqual(total);

    // by_status should have all statuses as numbers
    const expectedStatuses = ['applied', 'shortlisted', 'interview_scheduled', 'interview_rescheduled', 'interview_passed', 'interview_failed', 'withdrawn'];
    expectedStatuses.forEach(status => {
      expect(typeof by_status[status]).toBe('number');
      expect(by_status[status]).toBeGreaterThanOrEqual(0);
    });

    // Sum of by_status should equal total
    const sum = Object.values(by_status).reduce((acc: number, val: any) => acc + val, 0);
    expect(sum).toBe(total);

    // Active should match non-terminal statuses
    const activeFromStatus = by_status.applied + by_status.shortlisted + by_status.interview_scheduled + by_status.interview_rescheduled;
    expect(active).toBe(activeFromStatus);
  });
});
