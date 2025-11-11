import 'reflect-metadata';
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from 'src/app.module';
import { AgencyService } from 'src/modules/agency/agency.service';
import { uniqueSuffix } from './utils/id';

describe('E2E Agency Details API', () => {
  let app: INestApplication;
  let agencies: AgencyService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
    
    agencies = moduleRef.get(AgencyService);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /agencies/:id', () => {
    it('should return agency details by ID with all fields', async () => {
      const suf = uniqueSuffix();
      const dto = {
        name: `API Test Agency ${suf}`,
        license_number: `API-${suf}`,
        city: 'Kathmandu',
        country: 'Nepal',
        address: '123 Test Street',
        phones: ['+977-1234567'],
        emails: ['test@agency.com'],
        website: 'https://testagency.com',
        description: 'Test agency for API',
        logo_url: 'https://testagency.com/logo.png',
        banner_url: 'https://testagency.com/banner.jpg',
        established_year: 2015,
        services: ['Recruitment', 'Training'],
        target_countries: ['UAE', 'Qatar'],
        specializations: ['Construction', 'Healthcare'],
        certifications: [
          { name: 'ISO 9001', number: 'ISO-001', issued_by: 'ISO', issued_date: '2020-01-01' }
        ],
        social_media: {
          facebook: 'https://facebook.com/testagency',
          linkedin: 'https://linkedin.com/company/testagency'
        },
        contact_persons: [
          { name: 'Test Manager', position: 'Manager', phone: '+977-1111111', email: 'manager@agency.com' }
        ],
        operating_hours: {
          weekdays: '9:00 AM - 6:00 PM',
          saturday: '9:00 AM - 2:00 PM',
          sunday: 'Closed'
        },
        statistics: {
          total_placements: 500,
          active_since: '2015-01-01',
          success_rate: 90
        }
      };

      const created = await agencies.createAgency(dto);

      const response = await request(app.getHttpServer())
        .get(`/agencies/${created.id}`)
        .expect(200);

      expect(response.body).toMatchObject({
        id: created.id,
        name: dto.name,
        license_number: dto.license_number,
        city: dto.city,
        country: dto.country,
        address: dto.address,
        phones: dto.phones,
        emails: dto.emails,
        website: dto.website,
        description: dto.description,
        logo_url: dto.logo_url,
        banner_url: dto.banner_url,
        established_year: dto.established_year,
        services: dto.services,
        target_countries: dto.target_countries,
        specializations: dto.specializations,
        certifications: dto.certifications,
        social_media: dto.social_media,
        contact_persons: dto.contact_persons,
        operating_hours: dto.operating_hours,
        statistics: dto.statistics
      });
    });

    it('should return 404 for non-existent agency ID', async () => {
      const nonExistentId = '00000000-0000-0000-0000-000000000000';
      
      await request(app.getHttpServer())
        .get(`/agencies/${nonExistentId}`)
        .expect(404);
    });

    it('should return 400 for invalid UUID format', async () => {
      await request(app.getHttpServer())
        .get('/agencies/invalid-uuid')
        .expect(400);
    });
  });

  describe('GET /agencies/license/:license', () => {
    it('should return agency details by license number', async () => {
      const suf = uniqueSuffix();
      const dto = {
        name: `License Test Agency ${suf}`,
        license_number: `LIC-TEST-${suf}`,
        city: 'Pokhara',
        country: 'Nepal',
        description: 'Agency found by license number',
        services: ['Documentation', 'Visa Processing'],
        specializations: ['Engineering']
      };

      const created = await agencies.createAgency(dto);

      const response = await request(app.getHttpServer())
        .get(`/agencies/license/${dto.license_number}`)
        .expect(200);

      expect(response.body).toMatchObject({
        id: created.id,
        name: dto.name,
        license_number: dto.license_number,
        city: dto.city,
        country: dto.country,
        description: dto.description,
        services: dto.services,
        specializations: dto.specializations
      });
    });

    it('should return 404 for non-existent license number', async () => {
      await request(app.getHttpServer())
        .get('/agencies/license/NON-EXISTENT-LICENSE')
        .expect(404);
    });

    it('should handle special characters in license number', async () => {
      const suf = uniqueSuffix();
      const licenseWithSpecialChars = `LIC-SPECIAL-${suf}-@#$`;
      const dto = {
        name: `Special License Agency ${suf}`,
        license_number: licenseWithSpecialChars,
        city: 'Lalitpur',
        country: 'Nepal'
      };

      const created = await agencies.createAgency(dto);

      const response = await request(app.getHttpServer())
        .get(`/agencies/license/${encodeURIComponent(licenseWithSpecialChars)}`)
        .expect(200);

      expect(response.body.id).toBe(created.id);
      expect(response.body.license_number).toBe(licenseWithSpecialChars);
    });
  });

  describe('Agency Details Response Structure', () => {
    it('should return null for optional fields when not provided', async () => {
      const suf = uniqueSuffix();
      const minimalDto = {
        name: `Minimal Agency ${suf}`,
        license_number: `MIN-${suf}`
      };

      const created = await agencies.createAgency(minimalDto);

      const response = await request(app.getHttpServer())
        .get(`/agencies/${created.id}`)
        .expect(200);

      expect(response.body).toMatchObject({
        id: created.id,
        name: minimalDto.name,
        license_number: minimalDto.license_number,
        banner_url: null,
        established_year: null,
        services: null,
        certifications: null,
        social_media: null,
        bank_details: null,
        contact_persons: null,
        operating_hours: null,
        target_countries: null,
        specializations: null,
        statistics: null,
        settings: null
      });
    });

    it('should handle agencies with only basic contact information', async () => {
      const suf = uniqueSuffix();
      const basicDto = {
        name: `Basic Agency ${suf}`,
        license_number: `BASIC-${suf}`,
        city: 'Bhaktapur',
        country: 'Nepal',
        address: 'Basic Address',
        contact_email: 'basic@agency.com',
        contact_phone: '+977-9999999',
        website: 'https://basic-agency.com',
        description: 'A basic agency profile'
      };

      const created = await agencies.createAgency(basicDto);

      const response = await request(app.getHttpServer())
        .get(`/agencies/license/${basicDto.license_number}`)
        .expect(200);

      expect(response.body).toMatchObject({
        id: created.id,
        name: basicDto.name,
        license_number: basicDto.license_number,
        address: basicDto.address,
        website: basicDto.website,
        description: basicDto.description
      });
    });
  });
});
