import 'reflect-metadata';
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { CandidateService } from 'src/modules/candidate/candidate.service';

/**
 * Candidate Fitness Score - deterministic numeric assertions
 *
 * Scenario:
 * - Create four postings under the same canonical title (Electrician)
 *   A) skills = [industrial-wiring, electrical-systems, safety-protocols], education = [technical-diploma], experience min_years = 2
 *   B) skills = [industrial-wiring, electrical-systems, safety-protocols, cable-management], education = [], no experience bounds (skills-only)
 *   C) skills = [industrial-wiring, electrical-systems], education = [], no experience bounds (skills-only, full overlap -> 100)
 *   D) education = [technical-diploma], skills = [], no experience bounds (education-only, full overlap -> 100)
 * - Candidate profile: skills [industrial-wiring, electrical-systems], education [technical-diploma], total years = 2
 *
 * Expected fitness_score:
 *   For A: skills 2/3 ≈ 0.6667, edu 1/1 = 1, exp in-bounds = 1 -> avg ≈ 0.8889 -> 89
 *   For B: skills 2/4 = 0.5 (only component present) -> 50
 *   For C: skills 2/2 = 1.0 -> 100
 *   For D: edu 1/1 = 1.0 -> 100
 */

describe('Candidate Fitness Score - deterministic', () => {
  let app: INestApplication;
  let http: any;
  let candidates: CandidateService;

  let agencyLicense = 'LIC-FIT-SCORE-001';
  let postingA: string; // richer requirements
  let postingB: string; // looser requirements but more skills to lower overlap (skills-only)
  let postingC: string; // skills-only, full overlap -> 100
  let postingD: string; // education-only, full overlap -> 100
  let candidateId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    http = app.getHttpServer();
    candidates = app.get(CandidateService);

    // Seed
    await request(http).post('/countries/seedv1').expect((res) => [200, 201].includes(res.status));
    await request(http).post('/job-titles/seedv1').expect((res) => [200, 201].includes(res.status));

    // Create agency
    await request(http)
      .post('/agencies')
      .send({ name: 'Fitness Score Agency', license_number: agencyLicense, country: 'Nepal' })
      .expect(201);

    // Resolve canonical title Electrician
    const jtRes = await request(http).get('/job-titles').expect(200);
    const jtData = Array.isArray(jtRes.body?.data) ? jtRes.body.data : [];
    const electrician = jtData.find((r: any) => (r.title || '').toLowerCase() === 'electrician');

    // Posting A (richer requirements)
    postingA = (
      await request(http)
        .post(`/agencies/${agencyLicense}/job-postings`)
        .send({
          posting_title: 'Score-A',
          country: 'UAE',
          employer: { company_name: 'Score Co A', country: 'UAE', city: 'Dubai' },
          contract: { period_years: 2 },
          positions: [
            { title: 'Electrician', vacancies: { male: 1, female: 0 }, salary: { monthly_amount: 1200, currency: 'AED', converted: [] } },
          ],
          skills: ['industrial-wiring', 'electrical-systems', 'safety-protocols'],
          education_requirements: ['technical-diploma'],
          experience_requirements: { min_years: 2 },
          canonical_title_ids: [electrician?.id].filter(Boolean),
        })
        .expect(201)
    ).body.id;

    // Posting C (skills-only, full overlap)
    postingC = (
      await request(http)
        .post(`/agencies/${agencyLicense}/job-postings`)
        .send({
          posting_title: 'Score-C',
          country: 'UAE',
          employer: { company_name: 'Score Co C', country: 'UAE', city: 'Dubai' },
          contract: { period_years: 2 },
          positions: [
            { title: 'Electrician', vacancies: { male: 1, female: 0 }, salary: { monthly_amount: 1150, currency: 'AED', converted: [] } },
          ],
          skills: ['industrial-wiring', 'electrical-systems'],
          canonical_title_ids: [electrician?.id].filter(Boolean),
        })
        .expect(201)
    ).body.id;

    // Posting D (education-only, full overlap)
    postingD = (
      await request(http)
        .post(`/agencies/${agencyLicense}/job-postings`)
        .send({
          posting_title: 'Score-D',
          country: 'UAE',
          employer: { company_name: 'Score Co D', country: 'UAE', city: 'Dubai' },
          contract: { period_years: 2 },
          positions: [
            { title: 'Electrician', vacancies: { male: 1, female: 0 }, salary: { monthly_amount: 1050, currency: 'AED', converted: [] } },
          ],
          education_requirements: ['technical-diploma'],
          canonical_title_ids: [electrician?.id].filter(Boolean),
        })
        .expect(201)
    ).body.id;

    // Posting B (skills only, larger set to dilute overlap)
    postingB = (
      await request(http)
        .post(`/agencies/${agencyLicense}/job-postings`)
        .send({
          posting_title: 'Score-B',
          country: 'UAE',
          employer: { company_name: 'Score Co B', country: 'UAE', city: 'Dubai' },
          contract: { period_years: 2 },
          positions: [
            { title: 'Electrician', vacancies: { male: 1, female: 0 }, salary: { monthly_amount: 1100, currency: 'AED', converted: [] } },
          ],
          skills: ['industrial-wiring', 'electrical-systems', 'safety-protocols', 'cable-management'],
          canonical_title_ids: [electrician?.id].filter(Boolean),
        })
        .expect(201)
    ).body.id;

    // Candidate with known overlaps
    const cand = await candidates.createCandidate({ full_name: 'Score User', phone: uniquePhone() });
    candidateId = cand.id;

    await candidates.updateJobProfile(candidateId, {
      profile_blob: {
        skills: [
          { title: 'industrial-wiring', years: 1 },
          { title: 'electrical-systems', years: 1 },
        ],
        education: [{ degree: 'technical-diploma' }],
      },
      label: 'Default',
    });
    // Preference to ensure inclusion
    await candidates.addPreference(candidateId, 'Electrician');
  });

  it('computes exact scores for skills-only and education-only (service)', async () => {
    const res = await candidates.getRelevantJobs(candidateId, { includeScore: true, useCanonicalTitles: true, page: 1, limit: 10 });
    const byId = new Map(res.data.map((p: any) => [p.id, p] as const));
    const c = byId.get(postingC) as any;
    const d = byId.get(postingD) as any;
    expect(c?.fitness_score).toBe(100);
    expect(d?.fitness_score).toBe(100);
  });

  it('orders non-grouped relevant jobs by fitness_score desc (HTTP)', async () => {
    const relRes = await request(http)
      .get(`/candidates/${candidateId}/relevant-jobs`)
      .query({ includeScore: 'true' })
      .expect(200);
    const rows = (relRes.body?.data || []) as any[];
    const scores = rows.map((p) => p.fitness_score ?? 0);
    // Assert non-increasing order
    for (let i = 1; i < scores.length; i++) {
      expect(scores[i - 1]).toBeGreaterThanOrEqual(scores[i]);
    }
    // Build helpers
    const byId = new Map(rows.map((p) => [p.id, p] as const));
    // Our specific postings have expected scores
    expect((byId.get(postingA) as any)?.fitness_score).toBe(89);
    expect((byId.get(postingB) as any)?.fitness_score).toBe(50);
    expect((byId.get(postingC) as any)?.fitness_score).toBe(100);
    expect((byId.get(postingD) as any)?.fitness_score).toBe(100);
    // Relative ordering: C and D should appear ahead of A; A should appear ahead of B
    const idx = (id: string) => rows.findIndex((p) => p.id === id);
    const iC = idx(postingC);
    const iD = idx(postingD);
    const iA = idx(postingA);
    const iB = idx(postingB);
    expect(iC).toBeGreaterThanOrEqual(0);
    expect(iD).toBeGreaterThanOrEqual(0);
    expect(iA).toBeGreaterThanOrEqual(0);
    expect(iB).toBeGreaterThanOrEqual(0);
    expect(Math.min(iC, iD)).toBeLessThan(iA);
    expect(iA).toBeLessThan(iB);
  });

  afterAll(async () => {
    await app?.close();
  });

  it('computes expected fitness_score for Posting A and B (service)', async () => {
    const res = await candidates.getRelevantJobs(candidateId, { includeScore: true, useCanonicalTitles: true, page: 1, limit: 10 });
    const byId = new Map(res.data.map((p: any) => [p.id, p] as const));
    const a = byId.get(postingA) as any;
    const b = byId.get(postingB) as any;
    expect(typeof a?.fitness_score).toBe('number');
    expect(typeof b?.fitness_score).toBe('number');
    expect(a.fitness_score).toBe(89); // ~0.8889 rounded to 89
    expect(b.fitness_score).toBe(50); // 0.5 -> 50
    expect(a.fitness_score).toBeGreaterThan(b.fitness_score);
  });

  it('computes expected fitness_score on job-details endpoint (HTTP)', async () => {
    const aRes = await request(http)
      .get(`/candidates/${candidateId}/jobs/${postingA}`)
      .expect(200);
    const bRes = await request(http)
      .get(`/candidates/${candidateId}/jobs/${postingB}`)
      .expect(200);

    expect(aRes.body.id).toBe(postingA);
    expect(bRes.body.id).toBe(postingB);
    expect(typeof aRes.body.fitness_score).toBe('number');
    expect(typeof bRes.body.fitness_score).toBe('number');
    expect(aRes.body.fitness_score).toBe(89);
    expect(bRes.body.fitness_score).toBe(50);
  });

  function uniquePhone(): string {
    const rand = Math.floor(Math.random() * 1_000_000_00)
      .toString()
      .padStart(8, '0');
    return `+97798${rand}`;
  }
});
