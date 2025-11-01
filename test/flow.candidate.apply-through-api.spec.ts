import 'reflect-metadata';
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

/**
 * flow_candidiate_apply_through_api
 * Preconditions:
 *  - Countries and Job Titles seeded
 *  - Agency exists
 *  - Tagged job posting exists
 * Flow:
 *  - Create candidate via API
 *  - Add job profile via API
 *  - Fetch relevant jobs via API with useCanonicalTitles/includeScore
 *  - Apply to a job via API
 *  - List candidate applications via API
 */

describe('flow_candidate_apply_through_api', () => {
  let app: INestApplication;
  let http: any;
  let agencyLicense = 'LIC-FLOW-API-001';
  let postingId: string;
  let candidateId: string;

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    await app.init();
    http = app.getHttpServer();

    // Seed prerequisites
    await request(http).post('/countries/seedv1').expect((res) => [200, 201].includes(res.status));
    await request(http).post('/job-titles/seedv1').expect((res) => [200, 201].includes(res.status));

    // Create agency
    await request(http)
      .post('/agencies')
      .send({ name: 'Flow API Agency', license_number: agencyLicense, country: 'Nepal' })
      .expect(201);

    // Get electrician title
    const jtRes = await request(http).get('/job-titles').expect(200);
    const jtData = Array.isArray(jtRes.body?.data) ? jtRes.body.data : [];
    const electrician = jtData.find((r: any) => (r.title || '').toLowerCase() === 'electrician');

    // Create tagged posting
    const postRes = await request(http)
      .post(`/agencies/${agencyLicense}/job-postings`)
      .send({
        posting_title: 'Electrical Tech - Factory',
        country: 'UAE',
        employer: { company_name: 'Factory Co', country: 'UAE', city: 'Dubai' },
        contract: { period_years: 2, renewable: true },
        positions: [
          { title: 'Electrical Tech', vacancies: { male: 3, female: 0 }, salary: { monthly_amount: 1200, currency: 'AED', converted: [] } },
        ],
        skills: ['electrical-systems', 'industrial-wiring'],
        education_requirements: ['technical-diploma'],
        experience_requirements: { min_years: 2, max_years: 6, level: 'skilled' },
        canonical_title_ids: [electrician.id],
      })
      .expect(201);

    postingId = postRes.body.id;
  });

  afterAll(async () => {
    await app?.close();
  });

  function uniquePhone(): string {
    const rand = Math.floor(Math.random() * 1_000_000_00)
      .toString()
      .padStart(8, '0');
    return `+97798${rand}`;
  }

  it('candidate creates profile, gets relevant jobs, and applies via API', async () => {
    // Create candidate via API
    const candRes = await request(http)
      .post('/candidates')
      .send({ full_name: 'API Flow User', phone: uniquePhone(), skills: [{ title: 'industrial-wiring', years: 3 }] })
      .expect(201);
    candidateId = candRes.body.id;

    // Add preferences via API (Electrician)
    await request(http)
      .post(`/candidates/${candidateId}/preferences`)
      .send({ title: 'Electrician' })
      .expect(201);

    // Fetch relevant jobs via API (toggle canonical titles + scoring)
    const relRes = await request(http)
      .get(`/candidates/${candidateId}/relevant-jobs`)
      .query({ useCanonicalTitles: 'true', includeScore: 'true', page: '1', limit: '10' })
      .expect(200);
    const relIds = (relRes.body?.data || []).map((p: any) => p.id);
    expect(relIds).toContain(postingId);

    // Apply via API
    const applyRes = await request(http)
      .post('/applications')
      .send({ candidate_id: candidateId, job_posting_id: postingId, note: 'Apply via API' })
      .expect(201);
    expect(applyRes.body.status).toBe('applied');

    // List candidate applications via API
    const listRes = await request(http)
      .get(`/applications/candidates/${candidateId}`)
      .expect(200);
    expect(Array.isArray(listRes.body.items)).toBe(true);
    expect(listRes.body.items.some((x: any) => x.job_posting_id === postingId)).toBe(true);
  });
});
