import 'reflect-metadata';
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { CandidateService } from 'src/modules/candidate/candidate.service';
import { ApplicationService } from 'src/modules/application/application.service';

/**
 * Candidate Matching - Tag-Aware Behavior
 *
 * Covers:
 * - Canonical title matching toggle (off vs on)
 * - Education overlap matching
 * - Experience boundaries influence on fitness score
 * - Fitness score presence and simple magnitude checks
 */

describe('Candidate Matching - Tag-Aware Behavior', () => {
  let app: INestApplication;
  let http: any;
  let candidates: CandidateService;
  let applications: ApplicationService;

  let agencyLicense = 'LIC-MATCH-001';
  let postingId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    http = app.getHttpServer();

    candidates = app.get(CandidateService);
    applications = app.get(ApplicationService);

    // Seed pre-reqs
    await request(http).post('/countries/seedv1').expect((res) => [200, 201].includes(res.status));
    await request(http).post('/job-titles/seedv1').expect((res) => [200, 201].includes(res.status));

    // Create agency
    await request(http)
      .post('/agencies')
      .send({ name: 'Match Agency', license_number: agencyLicense, country: 'Nepal' })
      .expect(201);

    // Find canonical title Electrician
    const jtRes = await request(http).get('/job-titles').expect(200);
    const jtData = Array.isArray(jtRes.body?.data) ? jtRes.body.data : [];
    const electrician = jtData.find((r: any) => (r.title || '').toLowerCase() === 'electrician');
    expect(electrician).toBeDefined();

    // Create a posting with tags and canonical title (Electrician)
    const createPosting = {
      posting_title: 'Industrial Wiring Specialist',
      country: 'UAE',
      employer: { company_name: 'IW Corp', country: 'UAE', city: 'Dubai' },
      contract: { period_years: 2, renewable: true },
      positions: [
        {
          title: 'Wiring Specialist', // intentionally not exactly the same as preferred 'Electrician'
          vacancies: { male: 2, female: 0 },
          salary: { monthly_amount: 1500, currency: 'AED', converted: [{ amount: 400, currency: 'USD' }] },
        },
      ],
      skills: ['electrical-systems', 'industrial-wiring', 'safety-protocols'],
      education_requirements: ['technical-diploma', 'electrical-certification'],
      experience_requirements: { min_years: 3, max_years: 5, level: 'skilled' },
      canonical_title_ids: [electrician.id],
    } as any;

    const postRes = await request(http)
      .post(`/agencies/${agencyLicense}/job-postings`)
      .send(createPosting)
      .expect(201);

    postingId = postRes.body.id;
    expect(postingId).toBeTruthy();
  });

  it('candidate can apply to a matched posting', async () => {
    // Candidate with matching skills and canonical title preference
    const cand = await candidates.createCandidate({
      full_name: 'Apply User',
      phone: uniquePhone(),
      skills: [
        { title: 'industrial-wiring', years: 2 },
        { title: 'electrical-systems', years: 1 },
      ] as any,
    });
    await candidates.addJobProfile(cand.id, { profile_blob: { preferred_titles: ['Electrician'] } });

    // Ensure posting appears with canonical title matching enabled
    const rel = await candidates.getRelevantJobs(cand.id, { useCanonicalTitles: true, page: 1, limit: 10 });
    const ids = rel.data.map((p: any) => p.id);
    expect(ids).toContain(postingId);

    // Apply to the posting
    const appRow = await applications.apply(cand.id, postingId, { note: 'Applying from E2E' });
    expect(appRow).toBeDefined();
    expect(appRow.status).toBe('applied');

    // Verify listed in candidate applications
    const listed = await applications.listApplied(cand.id, { page: 1, limit: 10 });
    expect(listed.items.some((x) => x.job_posting_id === postingId)).toBe(true);
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

  it('canonical title matching: off -> not returned; on -> returned', async () => {
    // Candidate prefers Electrician, but position title is 'Wiring Specialist'
    const cand = await candidates.createCandidate({
      full_name: 'CT Toggle',
      phone: uniquePhone(),
    });
    await candidates.addJobProfile(cand.id, { profile_blob: { preferred_titles: ['Electrician'] } });

    // OFF (default)
    const resOff = await candidates.getRelevantJobs(cand.id, { page: 1, limit: 10 });
    const idsOff = resOff.data.map((p) => p.id);
    expect(idsOff).not.toContain(postingId);

    // ON
    const resOn = await candidates.getRelevantJobs(cand.id, { page: 1, limit: 10, useCanonicalTitles: true });
    const idsOn = resOn.data.map((p) => p.id);
    expect(idsOn).toContain(postingId);
  });

  it('education overlap surfaces the posting', async () => {
    // Candidate has education matching job requirements but different preferred title
    const cand = await candidates.createCandidate({
      full_name: 'Edu Overlap',
      phone: uniquePhone(),
      education: [{ degree: 'technical-diploma' }] as any,
    });
    await candidates.addJobProfile(cand.id, { profile_blob: { preferred_titles: ['Welder'] } });

    const res = await candidates.getRelevantJobs(cand.id, { page: 1, limit: 10 });
    const ids = res.data.map((p) => p.id);
    expect(ids).toContain(postingId);
  });

  it('experience boundary behavior reflected in fitness score', async () => {
    // Candidate exactly within bounds -> high score component for experience
    const candIn = await candidates.createCandidate({
      full_name: 'Exp In',
      phone: uniquePhone(),
      skills: [{ title: 'electrical-systems', duration_months: 36 }] as any, // 3 years
    });
    await candidates.addJobProfile(candIn.id, { profile_blob: { preferred_titles: ['Welder'] } });

    const resIn = await candidates.getRelevantJobs(candIn.id, { page: 1, limit: 10, includeScore: true });
    const rowIn = resIn.data.find((p: any) => p.id === postingId);
    expect((rowIn as any)?.fitness_score).toBeGreaterThanOrEqual(40); // skills (1/3) + experience (1) over 3 parts ≈ 44%

    // Candidate below min -> experience component 0
    const candOut = await candidates.createCandidate({
      full_name: 'Exp Out',
      phone: uniquePhone(),
      skills: [{ title: 'electrical-systems', duration_months: 12 }] as any, // 1 year (below min 3)
    });
    await candidates.addJobProfile(candOut.id, { profile_blob: { preferred_titles: ['Welder'] } });

    const resOut = await candidates.getRelevantJobs(candOut.id, { page: 1, limit: 10, includeScore: true });
    const rowOut = resOut.data.find((p: any) => p.id === postingId);
    expect((rowOut as any)?.fitness_score).toBeDefined();
    // since other components can contribute (skills overlap), but exp=0 should lower the average
    expect((((rowOut as any)?.fitness_score) || 0)).toBeLessThanOrEqual(((rowIn as any)?.fitness_score) || 100);
  });
});
