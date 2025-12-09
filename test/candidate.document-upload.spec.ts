import 'reflect-metadata';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { describe, beforeAll, afterAll, it, expect } from '@jest/globals';
import { waitForAppReady } from './utils/appReady';
import { DocumentTypeService } from '../src/modules/candidate/document-type.service';
import * as path from 'path';
import * as fs from 'fs';

/**
 * Test: Candidate Document Upload
 * Verifies that candidates can upload documents to any document type (including dynamically added ones).
 */
describe('Candidate Document Upload', () => {
  let app: INestApplication;
  let documentTypeService: DocumentTypeService;
  let candidateId: string;
  let accessToken: string;
  let test1TypeId: string;
  let passportTypeId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await waitForAppReady(app);
    
    documentTypeService = app.get(DocumentTypeService);

    // Ensure TEST1 document type exists
    await documentTypeService.upsertMany([{
      name: 'Test Document Upload',
      type_code: 'TEST_UPLOAD',
      description: 'Test document type for upload testing',
      is_required: false,
      display_order: 100,
      allowed_mime_types: ['application/pdf', 'image/jpeg', 'image/png'],
      max_file_size_mb: 5,
    }]);

    // Get document type IDs
    const testType = await documentTypeService.findByTypeCode('TEST_UPLOAD');
    test1TypeId = testType!.id;

    const passportType = await documentTypeService.findByTypeCode('PASSPORT');
    passportTypeId = passportType!.id;

    // Register and login a test candidate
    const rawPhone = '98' + Math.floor(10000000 + Math.random() * 89999999).toString();
    
    const reg = await request(app.getHttpServer())
      .post('/register')
      .send({ full_name: 'Document Upload Test User', phone: rawPhone })
      .expect(200);

    const verRes = await request(app.getHttpServer())
      .post('/verify')
      .send({ phone: rawPhone, otp: reg.body.dev_otp })
      .expect(200);

    candidateId = verRes.body.candidate_id;
    accessToken = verRes.body.token;
  }, 30000);

  afterAll(async () => {
    await app?.close();
  });

  it('should list document slots including dynamically added TEST_UPLOAD type', async () => {
    const res = await request(app.getHttpServer())
      .get(`/candidates/${candidateId}/documents`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    // Find TEST_UPLOAD in slots
    const testSlot = res.body.data.find(
      (slot: any) => slot.document_type.type_code === 'TEST_UPLOAD'
    );

    expect(testSlot).toBeDefined();
    expect(testSlot.document).toBeNull(); // Not uploaded yet
    expect(res.body.summary.uploaded).toBe(0);
  });

  it('should upload a document to PASSPORT type', async () => {
    // Create a simple test file buffer (simulating a PDF)
    const testFileContent = Buffer.from('%PDF-1.4 test content');

    const res = await request(app.getHttpServer())
      .post(`/candidates/${candidateId}/documents`)
      .set('Authorization', `Bearer ${accessToken}`)
      .field('document_type_id', passportTypeId)
      .field('name', 'My Passport')
      .field('description', 'Test passport document')
      .attach('file', testFileContent, {
        filename: 'passport.pdf',
        contentType: 'application/pdf',
      })
      .expect(201);

    expect(res.body.id).toBeDefined();
    expect(res.body.name).toBe('My Passport');
    expect(res.body.document_url).toBeDefined();
  });

  it('should upload a document to dynamically added TEST_UPLOAD type', async () => {
    const testFileContent = Buffer.from('%PDF-1.4 test upload content');

    const res = await request(app.getHttpServer())
      .post(`/candidates/${candidateId}/documents`)
      .set('Authorization', `Bearer ${accessToken}`)
      .field('document_type_id', test1TypeId)
      .field('name', 'Test Upload Document')
      .field('description', 'Testing dynamic document type upload')
      .attach('file', testFileContent, {
        filename: 'test_doc.pdf',
        contentType: 'application/pdf',
      })
      .expect(201);

    expect(res.body.id).toBeDefined();
    expect(res.body.name).toBe('Test Upload Document');
    expect(res.body.document_url).toBeDefined();
  });

  it('should show uploaded documents in document slots', async () => {
    const res = await request(app.getHttpServer())
      .get(`/candidates/${candidateId}/documents`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    // Check PASSPORT slot has document
    const passportSlot = res.body.data.find(
      (slot: any) => slot.document_type.type_code === 'PASSPORT'
    );
    expect(passportSlot.document).not.toBeNull();
    expect(passportSlot.document.name).toBe('My Passport');

    // Check TEST_UPLOAD slot has document
    const testSlot = res.body.data.find(
      (slot: any) => slot.document_type.type_code === 'TEST_UPLOAD'
    );
    expect(testSlot.document).not.toBeNull();
    expect(testSlot.document.name).toBe('Test Upload Document');

    // Verify summary
    expect(res.body.summary.uploaded).toBe(2);
  });

  it('should replace existing document when uploading to same type', async () => {
    const newFileContent = Buffer.from('%PDF-1.4 updated passport content');

    const res = await request(app.getHttpServer())
      .post(`/candidates/${candidateId}/documents`)
      .set('Authorization', `Bearer ${accessToken}`)
      .field('document_type_id', passportTypeId)
      .field('name', 'Updated Passport')
      .field('description', 'Replaced passport document')
      .attach('file', newFileContent, {
        filename: 'passport_v2.pdf',
        contentType: 'application/pdf',
      })
      .expect(201);

    expect(res.body.name).toBe('Updated Passport');

    // Verify only one document per type
    const docsRes = await request(app.getHttpServer())
      .get(`/candidates/${candidateId}/documents`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    const passportSlot = docsRes.body.data.find(
      (slot: any) => slot.document_type.type_code === 'PASSPORT'
    );
    expect(passportSlot.document.name).toBe('Updated Passport');
    
    // Still only 2 uploaded (replaced, not added)
    expect(docsRes.body.summary.uploaded).toBe(2);
  });

  it('should reject upload with invalid document_type_id', async () => {
    const testFileContent = Buffer.from('%PDF-1.4 test content');

    await request(app.getHttpServer())
      .post(`/candidates/${candidateId}/documents`)
      .set('Authorization', `Bearer ${accessToken}`)
      .field('document_type_id', '00000000-0000-0000-0000-000000000000')
      .field('name', 'Invalid Type Doc')
      .attach('file', testFileContent, {
        filename: 'invalid.pdf',
        contentType: 'application/pdf',
      })
      .expect(400);
  });
});
