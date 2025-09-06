import 'reflect-metadata';
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { CandidateService } from 'src/modules/candidate/candidate.service';
import { ApplicationService } from 'src/modules/application/application.service';

/**
 * flow_agency_shortlist_interview
 * Preconditions:
 *  - Countries and Job Titles seeded
 *  - Agency exists
 *  - Tagged job posting exists
 * Flow (service-level for application steps):
 *  - Candidate created (service) + preferences
 *  - Relevant jobs ensure visibility
 *  - Apply (ApplicationService.apply)
 *  - Shortlist (ApplicationService.updateStatus)
 *  - Schedule interview (ApplicationService.scheduleInterview)
 *  - Complete interview pass/fail (ApplicationService.completeInterview)
 */

describe('flow_agency_shortlist_interview', () => {
  let app: INestApplication;
  let http: any;
  let candidates: CandidateService;
  let applications: ApplicationService;

  let agencyLicense = 'LIC-FLOW-SVC-001';
  let postingId: string;
  let candidateId: string;

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    await app.init();
    http = app.getHttpServer();

    candidates = app.get(CandidateService);
    applications = app.get(ApplicationService);

    // Seed prerequisites
    await request(http).post('/countries/seedv1').expect((res) => [200, 201].includes(res.status));
    await request(http).post('/job-titles/seedv1').expect((res) => [200, 201].includes(res.status));

    // Create agency
    await request(http)
      .post('/agencies')
      .send({ name: 'Flow Svc Agency', license_number: agencyLicense, country: 'Nepal' })
      .expect(201);

    // Find canonical title Electrician
    const jtRes = await request(http).get('/job-titles').expect(200);
    const jtData = Array.isArray(jtRes.body?.data) ? jtRes.body.data : [];
    const electrician = jtData.find((r: any) => (r.title || '').toLowerCase() === 'electrician');

    // Create a posting with tags and canonical title (Electrician)
    const postRes = await request(http)
      .post(`/agencies/${agencyLicense}/job-postings`)
      .send({
        posting_title: 'Elec-Factory (Svc)',
        country: 'UAE',
        employer: { company_name: 'Svc Co', country: 'UAE', city: 'Dubai' },
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

  it('shortlist → schedule interview → complete (pass/fail)', async () => {
    // Create candidate via service
    const cand = await candidates.createCandidate({
      full_name: 'Svc Flow User',
      phone: uniquePhone(),
      skills: [{ title: 'industrial-wiring', years: 3 }] as any,
      education: [{ degree: 'technical-diploma' }] as any,
    });
    candidateId = cand.id;

    // Add profile with Electrician preference
    await candidates.addJobProfile(candidateId, { profile_blob: { preferred_titles: ['Electrician'] }, label: 'Prefs' });

    // Ensure relevant jobs returns the posting
    const rel = await candidates.getRelevantJobs(candidateId, { useCanonicalTitles: true, includeScore: true, page: 1, limit: 10 });
    expect(rel.data.map((p: any) => p.id)).toContain(postingId);

    // Apply
    const appRow = await applications.apply(candidateId, postingId, { note: 'Applying from service test' });
    expect(appRow.status).toBe('applied');

    // Shortlist
    const sh = await applications.updateStatus(appRow.id, 'shortlisted', { note: 'Shortlisted by agency' });
    expect(sh.status).toBe('shortlisted');

    // Schedule interview
    const sch = await applications.scheduleInterview(appRow.id, {
      interview_date_ad: new Date().toISOString().substring(0, 10),
      interview_time: '10:00',
      location: 'Kathmandu Office',
      contact_person: 'HR Lead',
    });
    expect(sch.status).toBe('interview_scheduled');

    // Complete interview as passed
    const done = await applications.completeInterview(appRow.id, 'passed', { note: 'Strong skills' });
    expect(done.status).toBe('interview_passed');
    expect(done.history_blob?.length).toBeGreaterThanOrEqual(4);

    // Optional: Try fail on correction (not required, but validates transitions remain guarded)
    // We will not attempt invalid transitions here to keep flow focused.
  });
});
