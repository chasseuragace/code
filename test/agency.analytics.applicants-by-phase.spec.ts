import 'reflect-metadata';
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

/**
 * agency_analytics_applicants_by_phase
 * Validates /agencies/:license/analytics/applicants-by-phase aggregates per posting across statuses.
 */

describe('agency_analytics_applicants_by_phase', () => {
  let app: INestApplication;
  let http: any;
  const agencyLicense = 'LIC-ANL-001';
  let postingA: string;
  let postingB: string;
  let cand1: string;
  let cand2: string;

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    await app.init();
    http = app.getHttpServer();

    await request(http).post('/countries/seedv1').expect((res) => [200, 201].includes(res.status));
    await request(http).post('/job-titles/seedv1').expect((res) => [200, 201].includes(res.status));

    await request(http).post('/agencies').send({ name: 'Analytics Agency', license_number: agencyLicense, country: 'Nepal' }).expect(201);

    // Titles
    const jtRes = await request(http).get('/job-titles').expect(200);
    const jtData = Array.isArray(jtRes.body?.data) ? jtRes.body.data : [];
    const electrician = jtData.find((r: any) => (r.title || '').toLowerCase() === 'electrician');
    const plumber = jtData.find((r: any) => (r.title || '').toLowerCase() === 'plumber');

    // Two postings
    postingA = (
      await request(http)
        .post(`/agencies/${agencyLicense}/job-postings`)
        .send({
          posting_title: 'A - Elec',
          country: 'UAE',
          employer: { company_name: 'CoA', country: 'UAE', city: 'Dubai' },
          contract: { period_years: 2, renewable: true },
          positions: [{ title: 'Electrical Tech', vacancies: { male: 2, female: 0 }, salary: { monthly_amount: 1200, currency: 'AED', converted: [] } }],
          skills: ['industrial-wiring'],
          education_requirements: ['technical-diploma'],
          experience_requirements: { min_years: 1, max_years: 5, level: 'experienced' },
          canonical_title_ids: [electrician.id],
        })
        .expect(201)
    ).body.id;

    postingB = (
      await request(http)
        .post(`/agencies/${agencyLicense}/job-postings`)
        .send({
          posting_title: 'B - Plumb',
          country: 'UAE',
          employer: { company_name: 'CoB', country: 'UAE', city: 'Abu Dhabi' },
          contract: { period_years: 2, renewable: true },
          positions: [{ title: 'Residential Plumber', vacancies: { male: 1, female: 0 }, salary: { monthly_amount: 1000, currency: 'AED', converted: [] } }],
          skills: ['pipe-fitting'],
          education_requirements: ['trade-certificate'],
          experience_requirements: { min_years: 1, max_years: 4, level: 'experienced' },
          canonical_title_ids: [plumber.id],
        })
        .expect(201)
    ).body.id;
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

  it('aggregates applicants by phase per posting', async () => {
    // Create two candidates
    cand1 = (
      await request(http)
        .post('/candidates')
        .send({ full_name: 'ANL User 1', phone: uniquePhone(), skills: [{ title: 'industrial-wiring', years: 2 }], education: [{ degree: 'technical-diploma' }] })
        .expect(201)
    ).body.id;

    cand2 = (
      await request(http)
        .post('/candidates')
        .send({ full_name: 'ANL User 2', phone: uniquePhone(), skills: [{ title: 'pipe-fitting', years: 2 }] })
        .expect(201)
    ).body.id;

    // Add basic profiles
    await request(http).post(`/candidates/${cand1}/job-profiles`).send({ profile_blob: { preferred_titles: ['Electrician'] } }).expect(201);
    await request(http).post(`/candidates/${cand2}/job-profiles`).send({ profile_blob: { preferred_titles: ['Plumber'] } }).expect(201);

    // Apply: cand1 -> postingA; cand2 -> postingB
    await request(http).post('/applications').send({ candidate_id: cand1, job_posting_id: postingA }).expect(201);
    await request(http).post('/applications').send({ candidate_id: cand2, job_posting_id: postingB }).expect(201);

    // Update statuses to create distribution
    // For postingA: shortlist and schedule for cand1
    const listA = await request(http).get(`/applications/candidates/${cand1}`).expect(200);
    const appA = (listA.body.items || [])[0]?.id;
    await request(http).post(`/applications/${appA}/shortlist`).send({ note: 'SL' }).expect(200);
    await request(http).post(`/applications/${appA}/schedule-interview`).send({ interview_date_ad: new Date().toISOString().substring(0, 10), interview_time: '11:00' }).expect(200);

    // For postingB: withdraw cand2
    const listB = await request(http).get(`/applications/candidates/${cand2}`).expect(200);
    const appB = (listB.body.items || [])[0]?.id;
    await request(http).post(`/applications/${appB}/withdraw`).send({ note: 'WD' }).expect(200);

    // Fetch analytics
    const anl = await request(http).get(`/agencies/${agencyLicense}/analytics/applicants-by-phase`).expect(200);
    const rows: any[] = anl.body;

    const rowA = rows.find((r) => r.posting_id === postingA);
    const rowB = rows.find((r) => r.posting_id === postingB);

    expect(rowA).toBeDefined();
    expect(rowB).toBeDefined();

    // Posting A: should have 1 applied that moved to shortlisted and interview_scheduled; counts reflect current statuses
    expect(rowA.counts.shortlisted + rowA.counts.interview_scheduled + rowA.counts.interview_rescheduled + rowA.counts.interview_passed + rowA.counts.interview_failed).toBeGreaterThanOrEqual(1);

    // Posting B: should have 1 withdrawn
    expect(rowB.counts.withdrawn).toBeGreaterThanOrEqual(1);
  });
});
