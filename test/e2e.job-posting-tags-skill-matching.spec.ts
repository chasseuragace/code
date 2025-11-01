import 'reflect-metadata';
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { CandidateService } from 'src/modules/candidate/candidate.service';

/**
 * E2E: Job Tagging and Skill Matching (expected to expose current gap)
 *
 * Flow:
 * 1) Seed Countries and Job Titles (via endpoints)
 * 2) Create Agency (via endpoint)
 * 3) Create Job Posting with tags (via endpoint)
 * 4) Verify tags via GET (since POST response omits tags)
 * 5) Create Candidate with skills/education (service)
 * 6) Add CandidatePreference for the canonical title (Electrician)
 * 7) Call getRelevantJobs (service)
 * 8) ASSERT: Candidate sees the job (ID-only matching)
 */

describe('E2E: Job Tagging and Skill Matching', () => {
  let app: INestApplication;
  let http: any;
  let candidates: CandidateService;

  let agencyLicense = 'LIC-TAGS-001';
  let postingId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    http = app.getHttpServer();

    candidates = app.get(CandidateService);

    // Seed prerequisites
    await request(http).post('/countries/seedv1').expect((res) => [200, 201].includes(res.status));
    await request(http).post('/job-titles/seedv1').expect((res) => [200, 201].includes(res.status));

    // Create agency
    const agencyRes = await request(http)
      .post('/agencies')
      .send({ name: 'Tags Agency', license_number: agencyLicense, country: 'Nepal' })
      .expect(201);
    expect(agencyRes.body.license_number).toBe(agencyLicense);

    // Discover a canonical title to attach (e.g., Electrician)
    const jtRes = await request(http).get('/job-titles').expect(200);
    const jtData = Array.isArray(jtRes.body?.data) ? jtRes.body.data : [];
    const electrician = jtData.find((r: any) => (r.title || '').toLowerCase() === 'electrician');
    expect(electrician).toBeDefined();

    // Create a job posting with tags and canonical title id
    const createPosting = {
      posting_title: 'Senior Electrician Needed',
      country: 'UAE',
      employer: { company_name: 'ACME Electrics', country: 'UAE', city: 'Dubai' },
      contract: { period_years: 2, renewable: true },
      positions: [
        {
          title: 'Senior Electrician',
          vacancies: { male: 5, female: 0 },
          salary: { monthly_amount: 1200, currency: 'AED', converted: [{ amount: 400, currency: 'USD' }] },
        },
      ],
      // Tags (these are passed through and saved by service)
      skills: ['electrical-systems', 'troubleshooting', 'safety-protocols'],
      education_requirements: ['technical-diploma'],
      experience_requirements: { min_years: 3, level: 'experienced' },
      canonical_title_ids: [electrician.id],
    } as any;

    const postRes = await request(http)
      .post(`/agencies/${agencyLicense}/job-postings`)
      .send(createPosting)
      .expect(201);

    postingId = postRes.body.id;
    expect(postingId).toBeTruthy();

    // Verify tags via GET tags endpoint
    const tagsRes = await request(http)
      .get(`/agencies/${agencyLicense}/job-postings/${postingId}/tags`)
      .expect(200);
    expect(tagsRes.body.skills).toEqual(expect.arrayContaining(['electrical-systems', 'troubleshooting']));
    expect(tagsRes.body.education_requirements).toEqual(expect.arrayContaining(['technical-diploma']));
    expect(tagsRes.body.experience_requirements?.level).toBe('experienced');
    expect((tagsRes.body.canonical_titles || []).map((t: any) => t.title)).toContain('Electrician');
  });

  afterAll(async () => {
    await app?.close();
  });

  it('should return the tagged job based on preference (ID) and tags', async () => {
    // Create a candidate with skills that match the job's skills, but with preferred_titles not matching the position title
    const rand = Math.floor(Math.random() * 1_000_000_00)
      .toString()
      .padStart(8, '0');
    const cand = await candidates.createCandidate({
      full_name: 'Skill Match User',
      phone: `+97798${rand}`,
      skills: [
        { title: 'electrical-systems', years: 2 },
        { title: 'troubleshooting', years: 1 },
      ] as any,
      education: [{ degree: 'technical-diploma' }] as any,
    });

    // Add an explicit preference by ID semantics (title -> ID under the hood)
    await candidates.addPreference(cand.id, 'Electrician');

    const result = await candidates.getRelevantJobs(cand.id, { page: 1, limit: 10 });
    const ids = result.data.map((p) => p.id);

    expect(ids).toContain(postingId);
  });
});
