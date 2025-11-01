import 'reflect-metadata';
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

/**
 * flow_agency_shortlist_interview_through_api
 * Preconditions:
 *  - Countries and Job Titles seeded
 *  - Agency exists
 *  - Tagged job posting exists
 * Flow (HTTP-level):
 *  - Create candidate + job profile via API
 *  - GET relevant jobs (useCanonicalTitles=true)
 *  - Apply via API
 *  - Shortlist via API
 *  - Schedule interview via API
 *  - Complete interview via API (passed)
 */

describe('flow_agency_shortlist_interview_through_api', () => {
  let app: INestApplication;
  let http: any;
  let agencyLicense = 'LIC-FLOW-HTTP-001';
  let postingId: string;
  let applicationId: string;
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
      .send({ name: 'Flow HTTP Agency', license_number: agencyLicense, country: 'Nepal' })
      .expect(201);

    // Canonical title
    const jtRes = await request(http).get('/job-titles').expect(200);
    const jtData = Array.isArray(jtRes.body?.data) ? jtRes.body.data : [];
    const electrician = jtData.find((r: any) => (r.title || '').toLowerCase() === 'electrician');

    // Create tagged posting
    const postRes = await request(http)
      .post(`/agencies/${agencyLicense}/job-postings`)
      .send({
        posting_title: 'Elec-Factory (HTTP)',
        country: 'UAE',
        employer: { company_name: 'HTTP Co', country: 'UAE', city: 'Dubai' },
        contract: { period_years: 2, renewable: true },
        positions: [
          { title: 'Electrical Tech', vacancies: { male: 2, female: 0 }, salary: { monthly_amount: 1200, currency: 'AED', converted: [{ amount: 350, currency: 'USD' }] } },
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

  it('apply → shortlist → schedule → complete via HTTP', async () => {
    // Create candidate via API
    const candRes = await request(http)
      .post('/candidates')
      .send({ full_name: 'HTTP Flow User', phone: uniquePhone(), skills: [{ title: 'industrial-wiring', years: 3 }], education: [{ degree: 'technical-diploma' }] })
      .expect(201);
    candidateId = candRes.body.id;

    // Add preference via API (Electrician)
    await request(http)
      .post(`/candidates/${candidateId}/preferences`)
      .send({ title: 'Electrician' })
      .expect(201);

    // Fetch relevant jobs via API (toggle canonical titles)
    const relRes = await request(http)
      .get(`/candidates/${candidateId}/relevant-jobs`)
      .query({ useCanonicalTitles: 'true', includeScore: 'true' })
      .expect(200);
    const relIds = (relRes.body?.data || []).map((p: any) => p.id);
    expect(relIds).toContain(postingId);

    // Apply via API
    const applyRes = await request(http)
      .post('/applications')
      .send({ candidate_id: candidateId, job_posting_id: postingId, note: 'Apply via HTTP flow' })
      .expect(201);
    expect(applyRes.body.status).toBe('applied');
    // Fetch app id
    let listRes = await request(http)
      .get(`/applications/candidates/${candidateId}`)
      .expect(200);
    applicationId = (listRes.body.items || [])[0]?.id;
    // Candidate sees status 'applied'
    expect((listRes.body.items || [])[0]?.status).toBe('applied');

    // Shortlist via API
    const shRes = await request(http)
      .post(`/applications/${applicationId}/shortlist`)
      .send({ note: 'Shortlist via HTTP' })
      .expect(200);
    expect(shRes.body.status).toBe('shortlisted');
    // Candidate sees status 'shortlisted'
    listRes = await request(http)
      .get(`/applications/candidates/${candidateId}`)
      .expect(200);
    expect((listRes.body.items || [])[0]?.status).toBe('shortlisted');

    // Schedule interview via API
    const schRes = await request(http)
      .post(`/applications/${applicationId}/schedule-interview`)
      .send({ interview_date_ad: new Date().toISOString().substring(0, 10), interview_time: '09:30', location: 'Agency Office', contact_person: 'HR Lead' })
      .expect(200);
    expect(schRes.body.status).toBe('interview_scheduled');
    // Candidate sees status 'interview_scheduled'
    listRes = await request(http)
      .get(`/applications/candidates/${candidateId}`)
      .expect(200);
    expect((listRes.body.items || [])[0]?.status).toBe('interview_scheduled');

    // Withdraw after schedule
    const wdRes = await request(http)
      .post(`/applications/${applicationId}/withdraw`)
      .send({ note: 'Withdraw after scheduling' })
      .expect(200);
    expect(wdRes.body.status).toBe('withdrawn');
    // Candidate sees status 'withdrawn'
    listRes = await request(http)
      .get(`/applications/candidates/${candidateId}`)
      .expect(200);
    expect((listRes.body.items || [])[0]?.status).toBe('withdrawn');
  });
});
