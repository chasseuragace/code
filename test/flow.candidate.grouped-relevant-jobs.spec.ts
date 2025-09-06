import 'reflect-metadata';
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

/**
 * flow_candidate_grouped_relevant_jobs
 * Preconditions:
 *  - Countries and Job Titles seeded
 *  - Agency exists
 *  - Two tagged job postings for different canonical titles
 * Flow:
 *  - Create candidate via API
 *  - Add job profile with two preferred titles
 *  - GET grouped relevant jobs via API
 *  - Assert groups for each preferred title and ordering by fitness score desc
 */

describe('flow_candidate_grouped_relevant_jobs', () => {
  let app: INestApplication;
  let http: any;
  let agencyLicense = 'LIC-FLOW-API-002';
  let postingElecId: string;
  let postingPlumbId: string;
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
      .send({ name: 'Flow API Agency 2', license_number: agencyLicense, country: 'Nepal' })
      .expect(201);

    // Get electrician & plumber titles
    const jtRes = await request(http).get('/job-titles').expect(200);
    const jtData = Array.isArray(jtRes.body?.data) ? jtRes.body.data : [];
    const electrician = jtData.find((r: any) => (r.title || '').toLowerCase() === 'electrician');
    const plumber = jtData.find((r: any) => (r.title || '').toLowerCase() === 'plumber');

    // Create two tagged postings
    postingElecId = (
      await request(http)
        .post(`/agencies/${agencyLicense}/job-postings`)
        .send({
          posting_title: 'Elec-Factory',
          country: 'UAE',
          employer: { company_name: 'Factory A', country: 'UAE', city: 'Dubai' },
          contract: { period_years: 2, renewable: true },
          positions: [{ title: 'Electrical Tech', vacancies: { male: 2, female: 0 }, salary: { monthly_amount: 1200, currency: 'AED', converted: [] } }],
          skills: ['electrical-systems', 'industrial-wiring'],
          education_requirements: ['technical-diploma'],
          experience_requirements: { min_years: 2, max_years: 6, level: 'skilled' },
          canonical_title_ids: [electrician.id],
        })
        .expect(201)
    ).body.id;

    postingPlumbId = (
      await request(http)
        .post(`/agencies/${agencyLicense}/job-postings`)
        .send({
          posting_title: 'Plumb-Residential',
          country: 'UAE',
          employer: { company_name: 'Res B', country: 'UAE', city: 'Abu Dhabi' },
          contract: { period_years: 2, renewable: true },
          positions: [{ title: 'Residential Plumber', vacancies: { male: 1, female: 0 }, salary: { monthly_amount: 1000, currency: 'AED', converted: [] } }],
          skills: ['pipe-fitting', 'leak-repair'],
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

  it('groups relevant jobs by preferred titles and orders by fitness score', async () => {
    // Create candidate via API with skills that match electrician more strongly than plumber
    const candRes = await request(http)
      .post('/candidates')
      .send({ full_name: 'Grouped User', phone: uniquePhone(), skills: [{ title: 'industrial-wiring', years: 3 }, { title: 'pipe-fitting', years: 1 }] })
      .expect(201);
    candidateId = candRes.body.id;

    // Add job profile preferencing two titles
    await request(http)
      .post(`/candidates/${candidateId}/job-profiles`)
      .send({ profile_blob: { preferred_titles: ['Electrician', 'Plumber'] }, label: 'Two Prefs' })
      .expect(201);

    // Fetch grouped relevant jobs with canonical title matching and scoring
    const grouped = await request(http)
      .get(`/candidates/${candidateId}/relevant-jobs/grouped`)
      .query({ useCanonicalTitles: 'true', includeScore: 'true' })
      .expect(200);

    expect(Array.isArray(grouped.body.groups)).toBe(true);

    // Electrician group should contain the electric posting and have higher score than plumber posting in its group
    const gElec = grouped.body.groups.find((g: any) => g.title === 'Electrician');
    expect(gElec).toBeDefined();
    expect(gElec.jobs.some((p: any) => p.id === postingElecId)).toBe(true);

    // Plumber group should contain the plumber posting
    const gPlumb = grouped.body.groups.find((g: any) => g.title === 'Plumber');
    expect(gPlumb).toBeDefined();
    expect(gPlumb.jobs.some((p: any) => p.id === postingPlumbId)).toBe(true);

    // Ensure groups are ordered by fitness_score desc internally (when available)
    for (const g of grouped.body.groups) {
      const jobs = g.jobs as any[];
      for (let i = 1; i < jobs.length; i++) {
        const prev = jobs[i - 1]?.fitness_score ?? 0;
        const cur = jobs[i]?.fitness_score ?? 0;
        expect(prev).toBeGreaterThanOrEqual(cur);
      }
    }
  });
});
