import 'reflect-metadata';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { describe, beforeAll, afterAll, it, expect } from '@jest/globals';
import { waitForAppReady } from './utils/appReady';
import { DocumentTypeService } from '../src/modules/candidate/document-type.service';
import { CountryService } from '../src/modules/country/country.service';
import { JobPostingService } from '../src/modules/domain/domain.service';

/**
 * Test: Agency Candidate Document Upload
 * Verifies that agencies can upload documents on behalf of candidates who applied to their jobs.
 */
describe('Agency Candidate Document Upload', () => {
  let app: INestApplication;
  let documentTypeService: DocumentTypeService;
  let countryService: CountryService;
  let jobPostingService: JobPostingService;
  
  // Test data
  const testLicense = 'DOC-TEST-' + Math.floor(Math.random() * 100000);
  let agencyLicense: string;
  let jobId: string;
  let positionId: string;
  let candidateId: string;
  let candidateToken: string;
  let passportTypeId: string;
  let medicalTypeId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await waitForAppReady(app);
    
    documentTypeService = app.get(DocumentTypeService);
    countryService = app.get(CountryService);
    jobPostingService = app.get(JobPostingService);

    // Seed country if needed
    await countryService.upsertMany([
      { country_code: 'UAE', country_name: 'United Arab Emirates', currency_code: 'AED', currency_name: 'UAE Dirham', npr_multiplier: '36.00' },
    ]);

    // Get document type IDs
    const passportType = await documentTypeService.findByTypeCode('PASSPORT');
    passportTypeId = passportType!.id;
    
    const medicalType = await documentTypeService.findByTypeCode('MEDICAL');
    medicalTypeId = medicalType!.id;

    // 1. Create a test agency
    const createAgencyRes = await request(app.getHttpServer())
      .post('/agencies')
      .send({
        name: 'Document Test Agency',
        license_number: testLicense,
        address: 'Kathmandu',
        phones: ['+977-1-5551234'],
        emails: ['doctest@agency.example'],
      })
      .expect(201);
    
    agencyLicense = createAgencyRes.body.license_number;

    // 2. Create a job posting for this agency
    const createJobRes = await request(app.getHttpServer())
      .post(`/agencies/${agencyLicense}/job-postings`)
      .send({
        posting_title: 'Document Test Job',
        country: 'UAE',
        city: 'Dubai',
        approval_date_ad: new Date().toISOString().slice(0, 10),
        posting_date_ad: new Date().toISOString().slice(0, 10),
        announcement_type: 'full_ad',
        employer: { company_name: 'Doc Test Employer', country: 'UAE', city: 'Dubai' },
        contract: {
          period_years: 2,
          renewable: true,
          hours_per_day: 8,
          days_per_week: 6,
          overtime_policy: 'paid',
          weekly_off_days: 1,
          food: 'free',
          accommodation: 'free',
          transport: 'paid',
          annual_leave_days: 14,
        },
        positions: [
          {
            title: 'Test Worker',
            vacancies: { male: 5, female: 5 },
            salary: { monthly_amount: 1500, currency: 'AED', converted: [{ amount: 54000, currency: 'NPR' }] },
          },
        ],
      })
      .expect(201);

    jobId = createJobRes.body.id;

    // Get position ID using service (more reliable)
    const jobPosting = await jobPostingService.findJobPostingById(jobId);
    positionId = jobPosting.contracts?.[0]?.positions?.[0]?.id;
    if (!positionId) {
      throw new Error('No position found in created job');
    }

    // 3. Register a candidate
    const rawPhone = '98' + Math.floor(10000000 + Math.random() * 89999999).toString();
    
    const reg = await request(app.getHttpServer())
      .post('/register')
      .send({ full_name: 'Agency Doc Test Candidate', phone: rawPhone })
      .expect(200);

    const verRes = await request(app.getHttpServer())
      .post('/verify')
      .send({ phone: rawPhone, otp: reg.body.dev_otp })
      .expect(200);

    candidateId = verRes.body.candidate_id;
    candidateToken = verRes.body.token;

    // 4. Apply to the job
    await request(app.getHttpServer())
      .post('/applications')
      .send({ 
        candidate_id: candidateId, 
        job_posting_id: jobId,
        position_id: positionId,
        note: 'Test application for document upload'
      })
      .expect(201);
  }, 60000);

  afterAll(async () => {
    await app?.close();
  });

  it('should get candidate documents via agency endpoint', async () => {
    const res = await request(app.getHttpServer())
      .get(`/agencies/${agencyLicense}/jobs/${jobId}/candidates/${candidateId}/documents`)
      .expect(200);

    expect(res.body.data).toBeDefined();
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.summary).toBeDefined();
    expect(res.body.summary.total_types).toBeGreaterThan(0);
  });

  it('should upload document for candidate via agency endpoint', async () => {
    const testFileContent = Buffer.from('%PDF-1.4 agency uploaded passport');

    const res = await request(app.getHttpServer())
      .post(`/agencies/${agencyLicense}/jobs/${jobId}/candidates/${candidateId}/documents`)
      .field('document_type_id', passportTypeId)
      .field('name', 'Passport (Agency Upload)')
      .field('description', 'Collected during interview')
      .field('notes', 'Verified by agency staff')
      .attach('file', testFileContent, {
        filename: 'passport_agency.pdf',
        contentType: 'application/pdf',
      })
      .expect(201);

    expect(res.body.id).toBeDefined();
    expect(res.body.name).toBe('Passport (Agency Upload)');
    expect(res.body.document_url).toBeDefined();
    // Notes should include agency context
    expect(res.body.notes).toContain(agencyLicense);
  });

  it('should show agency-uploaded document in candidate documents', async () => {
    // Check via agency endpoint
    const agencyRes = await request(app.getHttpServer())
      .get(`/agencies/${agencyLicense}/jobs/${jobId}/candidates/${candidateId}/documents`)
      .expect(200);

    const passportSlot = agencyRes.body.data.find(
      (slot: any) => slot.document_type.type_code === 'PASSPORT'
    );
    expect(passportSlot.document).not.toBeNull();
    expect(passportSlot.document.name).toBe('Passport (Agency Upload)');

    // Also verify candidate can see it via their own endpoint
    const candidateRes = await request(app.getHttpServer())
      .get(`/candidates/${candidateId}/documents`)
      .set('Authorization', `Bearer ${candidateToken}`)
      .expect(200);

    const candidatePassportSlot = candidateRes.body.data.find(
      (slot: any) => slot.document_type.type_code === 'PASSPORT'
    );
    expect(candidatePassportSlot.document).not.toBeNull();
    expect(candidatePassportSlot.document.name).toBe('Passport (Agency Upload)');
  });

  it('should reject document upload for candidate not applied to job', async () => {
    // Create another candidate who hasn't applied
    const rawPhone2 = '98' + Math.floor(10000000 + Math.random() * 89999999).toString();
    
    const reg2 = await request(app.getHttpServer())
      .post('/register')
      .send({ full_name: 'Non-Applicant Candidate', phone: rawPhone2 })
      .expect(200);

    const verRes2 = await request(app.getHttpServer())
      .post('/verify')
      .send({ phone: rawPhone2, otp: reg2.body.dev_otp })
      .expect(200);

    const nonApplicantId = verRes2.body.candidate_id;

    const testFileContent = Buffer.from('%PDF-1.4 test');

    await request(app.getHttpServer())
      .post(`/agencies/${agencyLicense}/jobs/${jobId}/candidates/${nonApplicantId}/documents`)
      .field('document_type_id', passportTypeId)
      .field('name', 'Should Fail')
      .attach('file', testFileContent, {
        filename: 'test.pdf',
        contentType: 'application/pdf',
      })
      .expect(404); // Candidate has not applied to this job
  });

  it('should reject document upload for wrong agency', async () => {
    const testFileContent = Buffer.from('%PDF-1.4 test');

    await request(app.getHttpServer())
      .post(`/agencies/WRONG-LICENSE/jobs/${jobId}/candidates/${candidateId}/documents`)
      .field('document_type_id', passportTypeId)
      .field('name', 'Should Fail')
      .attach('file', testFileContent, {
        filename: 'test.pdf',
        contentType: 'application/pdf',
      })
      .expect(403); // Cannot access job posting of another agency
  });

  it('should delete document uploaded by agency', async () => {
    // First upload a document to delete
    const testFileContent = Buffer.from('%PDF-1.4 to be deleted');

    const uploadRes = await request(app.getHttpServer())
      .post(`/agencies/${agencyLicense}/jobs/${jobId}/candidates/${candidateId}/documents`)
      .field('document_type_id', medicalTypeId)
      .field('name', 'Medical to Delete')
      .attach('file', testFileContent, {
        filename: 'medical.pdf',
        contentType: 'application/pdf',
      })
      .expect(201);

    const documentId = uploadRes.body.id;

    // Delete it
    const deleteRes = await request(app.getHttpServer())
      .delete(`/agencies/${agencyLicense}/jobs/${jobId}/candidates/${candidateId}/documents/${documentId}`)
      .expect(200);

    expect(deleteRes.body.success).toBe(true);

    // Verify it's gone
    const docsRes = await request(app.getHttpServer())
      .get(`/agencies/${agencyLicense}/jobs/${jobId}/candidates/${candidateId}/documents`)
      .expect(200);

    const medicalSlot = docsRes.body.data.find(
      (slot: any) => slot.document_type.type_code === 'MEDICAL'
    );
    expect(medicalSlot.document).toBeNull();
  });
});
