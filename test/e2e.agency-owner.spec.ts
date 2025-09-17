import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../src/modules/user/user.entity';
import { Repository } from 'typeorm';
import { Agency } from '../src/modules/agency/agency.entity';

describe('Agency Owner Flow (e2e)', () => {
  let app: INestApplication;
  let userRepo: Repository<User>;
  const testPhone = '+9779876543210';
  
  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    userRepo = moduleFixture.get<Repository<User>>(getRepositoryToken(User));
    // Clean test data
    await userRepo.delete({ phone: testPhone });
  });

  afterAll(async () => {
    await app.close();
  });

  it('should complete agency owner flow', async () => {
    // Step 1: Register as agency owner
    const registerRes = await request(app.getHttpServer())
      .post('/agency/register-owner')
      .send({ 
        full_name: 'Test Owner',
        phone: testPhone
      })
      .expect(200);

    // Get OTP from response
    const otp = registerRes.body.dev_otp;
    expect(otp).toBeDefined();

    // Step 2: Verify OTP
    const verifyRes = await request(app.getHttpServer())
      .post('/agency/verify-owner')
      .send({ phone: testPhone, otp })
      .expect(200);
    
    const accessToken = verifyRes.body.token;
    expect(accessToken).toBeDefined();

    // Step 4: Create agency
    const createAgencyRes = await request(app.getHttpServer())
      .post('/agencies/owner/agency')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ 
        name: 'Test Agency', 
        license_number: 'TEST123' 
      })
      .expect(201);
    
    const agencyId = createAgencyRes.body.id;

    // Step 5: Get agency
    const getAgencyRes = await request(app.getHttpServer())
      .get('/agencies/owner/agency')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);
    
    expect(getAgencyRes.body).toEqual({
      id: agencyId,
      name: 'Test Agency',
      license_number: 'TEST123',
      address: null,
      phones: null,
      emails: null,
      website: null
    });

    // Verify agency is linked to user
    const user = await userRepo.findOne({ 
      where: { phone: testPhone }
    });
    
    expect(user).toBeDefined();
    expect(user?.agency_id).toBe(agencyId);
    expect(user?.is_agency_owner).toBe(true);
  });
});
