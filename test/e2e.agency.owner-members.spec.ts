import 'reflect-metadata';
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from 'src/app.module';

/**
 * E2E: Agency owner invites members and members login with admin-set password
 */
describe('E2E: agency owner members invite + member login', () => {
  let app: INestApplication;
  let ownerToken: string;
  let agencyId: string;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app?.close();
  });

  it('registers and verifies an agency owner, then creates an agency', async () => {
    const uniq = Math.floor(Math.random() * 9000000) + 1000000;
    const phone = `+97798${uniq}`;

    const reg = await request(app.getHttpServer())
      .post('/agency/register-owner')
      .send({ phone, full_name: 'Owner One' })
      .expect(200);
    expect(typeof reg.body?.dev_otp).toBe('string');

    const ver = await request(app.getHttpServer())
      .post('/agency/verify-owner')
      .send({ phone, otp: reg.body.dev_otp })
      .expect(200);
    expect(typeof ver.body?.token).toBe('string');
    ownerToken = ver.body.token;

    const agencyRes = await request(app.getHttpServer())
      .post('/agencies/owner/agency')
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({ name: 'My Agency', license_number: `LIC-${uniq}` })
      .expect(201);
    expect(typeof agencyRes.body?.id).toBe('string');
    agencyId = agencyRes.body.id;
  });

  it('invites a member and member can login with provided password; after reset, new password works', async () => {
    // Invite member
    const mUniq = Math.floor(Math.random() * 9000000) + 1000000;
    const mPhone = `+97798${mUniq}`;
    const invite = await request(app.getHttpServer())
      .post('/agencies/owner/members/invite')
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({ full_name: 'Staff One', phone: mPhone, role: 'staff' })
      .expect(201);

    expect(typeof invite.body?.id).toBe('string');
    expect(typeof invite.body?.dev_password).toBe('string');
    const memberId = invite.body.id as string;
    const pwd1 = invite.body.dev_password as string;

    // Member login with initial password
    const login1 = await request(app.getHttpServer())
      .post('/member/login')
      .send({ phone: mPhone, password: pwd1 })
      .expect(200);
    expect(typeof login1.body?.token).toBe('string');
    expect(login1.body?.agency_id).toBeDefined();

    // Reset password by owner
    const reset = await request(app.getHttpServer())
      .post(`/agencies/owner/members/${memberId}/reset-password`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .expect(200);
    expect(typeof reset.body?.dev_password).toBe('string');
    const pwd2 = reset.body.dev_password as string;

    // Member login with new password
    const login2 = await request(app.getHttpServer())
      .post('/member/login')
      .send({ phone: mPhone, password: pwd2 })
      .expect(200);
    expect(typeof login2.body?.token).toBe('string');
    expect(login2.body?.agency_id).toBeDefined();
  });
});
