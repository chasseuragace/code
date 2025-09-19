import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AuthModule } from 'src/modules/auth/auth.module';
import { CandidateModule } from 'src/modules/candidate/candidate.module';

export async function registerAndLoginCandidate(app: INestApplication, phone: string) {
  // Register candidate
  const registerRes = await request(app.getHttpServer())
    .post('/auth/register')
    .send({ phone })
    .expect(201);

  // Get OTP from response (dev environment might return OTP in response)
  const otp = registerRes.body.dev_otp; // Adjust based on actual response

  // Verify OTP
  const verifyRes = await request(app.getHttpServer())
    .post('/auth/verify')
    .send({ phone, otp })
    .expect(200);

  // Return tokens and candidate ID
  return {
    accessToken: verifyRes.body.access_token,
    refreshToken: verifyRes.body.refresh_token,
    candidateId: verifyRes.body.candidate_id,
  };
}
