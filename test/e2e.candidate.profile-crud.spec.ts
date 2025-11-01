import 'reflect-metadata';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { describe, beforeAll, afterAll, it, expect } from '@jest/globals';
import { Candidate } from '../src/modules/candidate/candidate.entity';
import { CandidateJobProfile } from '../src/modules/candidate/candidate-job-profile.entity';
import { CandidatePreference } from '../src/modules/candidate/candidate-preference.entity';
import { JobTitle } from '../src/modules/job-title/job-title.entity';
import { JobPosting } from '../src/modules/domain/domain.entity';
import { waitForAppReady } from './utils/appReady';

/**
 * E2E: Candidate auth (register+verify) and profile CRUD
 */
describe('Candidate Profile CRUD', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await waitForAppReady(app);
  });

  afterAll(async () => {
    await app.close();
  });

  // Generate a unique phone per run to avoid cross-run uniqueness conflicts
  const rawPhone = '98' + Math.floor(10000000 + Math.random() * 89999999).toString();
  const normalized = '+977' + rawPhone; // per normalizePhoneE164()
  const fullName = 'Profile CRUD User';

  let candidateId: string;
  let accessToken: string;

  it('registers the candidate and verifies OTP to get candidate_id', async () => {
    // Register candidate
    const reg = await request(app.getHttpServer())
      .post('/register')
      .send({ full_name: 'Profile CRUD User', phone: rawPhone })
      .expect(200);
    const reg_otp = reg.body.dev_otp;

    // Verify registration
    const verReg = await request(app.getHttpServer())
      .post('/verify')
      .send({ phone: rawPhone, otp: reg_otp })
      .expect(200);
    candidateId = verReg.body.candidate_id;
    accessToken = verReg.body.token;
  });

  it('logs in the candidate and verifies OTP to get access token', async () => {
    const start = await request(app.getHttpServer())
      .post('/login/start')
      .send({ phone: rawPhone })
      .expect(200);

    expect(typeof start.body?.dev_otp).toBe('string');
    const dev_otp: string = start.body.dev_otp;

    const ver = await request(app.getHttpServer())
      .post('/login/verify')
      .send({ phone: rawPhone, otp: dev_otp })
      .expect(200);
    accessToken = ver.body.access_token; // Update the access token
  });

  it('reads the candidate profile via GET /candidates/:id', async () => {
    const res = await request(app.getHttpServer())
      .get(`/candidates/${candidateId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(res.body?.id).toBe(candidateId);
    expect(res.body?.is_active).toBe(true);
  });

  it('updates the candidate profile via PUT /candidates/:id and verifies the changes', async () => {
    const updateBody = {
      full_name: 'Updated Name',
      address: {
        name: 'Somewhere',
        coordinates: { lat: 27.7172, lng: 85.3240 },
        province: 'Bagmati',
        district: 'Kathmandu',
        municipality: 'Kathmandu',
        ward: '1',
      },
      passport_number: 'P1234567',
      is_active: true,
    };

    const upd = await request(app.getHttpServer())
      .put(`/candidates/${candidateId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send(updateBody)
      .expect(200);

    expect(upd.body?.id).toBe(candidateId);
    expect(upd.body?.full_name).toBe('Updated Name');
    expect(upd.body?.address?.coordinates?.lat).toBe(27.7172);
    expect(upd.body?.passport_number).toBe('P1234567');

    const res = await request(app.getHttpServer())
      .get(`/candidates/${candidateId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(res.body?.full_name).toBe('Updated Name');
    expect(res.body?.address?.name).toBe('Somewhere');
    expect(res.body?.address?.coordinates?.lng).toBe(85.3240);
    expect(res.body?.passport_number).toBe('P1234567');
  });

  describe('Phone Change Flow', () => {
    it('should change phone number with OTP verification', async () => {
      const phoneOld = '+97798' + Math.floor(10000000 + Math.random() * 89999999).toString();
      const phoneNew = '+97798' + Math.floor(10000000 + Math.random() * 89999999).toString();
      // Register candidate
      const registerRes = await request(app.getHttpServer())
        .post('/register')
        .send({ full_name: 'Test User', phone: phoneOld })
        .expect(200);

      const reg_otp = registerRes.body.dev_otp;

      // Verify registration
      const verifyReg = await request(app.getHttpServer())
        .post('/verify')
        .send({ phone: phoneOld, otp: reg_otp })
        .expect(200);

      const candidateId = verifyReg.body.candidate_id;

      // Initiate phone change
      const initiateRes = await request(app.getHttpServer())
        .post('/phone-change-requests')
        .send({ candidateId, newPhone: phoneNew })
        .expect(201);
      
      expect(initiateRes.body.dev_otp).toBeDefined();
      const otp = initiateRes.body.dev_otp;
      console.log('Using OTP:', otp);
      
      // Verify phone change
      const verifyRes = await request(app.getHttpServer())
        .post('/phone-change-verifications')
        .send({ candidateId, otp, newPhone: phoneNew });
      
      console.log('Verification response:', {
        status: verifyRes.status,
        body: verifyRes.body,
        headers: verifyRes.headers
      });
      
      expect(verifyRes.status).toBe(201);

      // Try login with new phone
      await request(app.getHttpServer())
        .post('/login/start')
        .send({ phone: phoneNew })
        .expect(200);
    });
  });
});
