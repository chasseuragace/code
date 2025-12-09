import 'reflect-metadata';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { describe, beforeAll, afterAll, it, expect } from '@jest/globals';
import { waitForAppReady } from './utils/appReady';
import { DocumentTypeService } from '../src/modules/candidate/document-type.service';

/**
 * Test: Document Type Extensibility
 * Verifies that document types are database-driven (not enums) and can be extended dynamically.
 */
describe('DocumentType Extensibility', () => {
  let app: INestApplication;
  let documentTypeService: DocumentTypeService;
  let candidateId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await waitForAppReady(app);
    
    documentTypeService = app.get(DocumentTypeService);
  }, 30000);

  afterAll(async () => {
    await app?.close();
  });

  it('should add a new document type TEST1 dynamically via service', async () => {
    const newType = {
      name: 'Test Document 1',
      type_code: 'TEST1',
      description: 'Test document for extensibility validation',
      is_required: false,
      display_order: 99,
      allowed_mime_types: ['application/pdf', 'image/jpeg', 'image/png'],
      max_file_size_mb: 5,
    };

    const result = await documentTypeService.upsertMany([newType]);
    expect(result.affected).toBe(1);

    const found = await documentTypeService.findByTypeCode('TEST1');
    expect(found).not.toBeNull();
    expect(found!.name).toBe('Test Document 1');
    expect(found!.type_code).toBe('TEST1');
  });

  it('should show TEST1 in GET /document-types endpoint', async () => {
    const res = await request(app.getHttpServer())
      .get('/document-types')
      .expect(200);

    const test1 = res.body.find((t: any) => t.type_code === 'TEST1');
    expect(test1).toBeDefined();
    expect(test1.name).toBe('Test Document 1');
    expect(test1.display_order).toBe(99);
  });

  it('should show TEST1 in candidate documents slots', async () => {
    // Register a test candidate
    const rawPhone = '98' + Math.floor(10000000 + Math.random() * 89999999).toString();
    
    const reg = await request(app.getHttpServer())
      .post('/register')
      .send({ full_name: 'DocType Test User', phone: rawPhone })
      .expect(200);

    const verRes = await request(app.getHttpServer())
      .post('/verify')
      .send({ phone: rawPhone, otp: reg.body.dev_otp })
      .expect(200);

    candidateId = verRes.body.candidate_id;

    // Get documents with slots - should include TEST1
    const docsRes = await request(app.getHttpServer())
      .get(`/candidates/${candidateId}/documents`)
      .set('Authorization', `Bearer ${verRes.body.token}`)
      .expect(200);

    const test1Slot = docsRes.body.data.find(
      (slot: any) => slot.document_type.type_code === 'TEST1'
    );

    expect(test1Slot).toBeDefined();
    expect(test1Slot.document_type.name).toBe('Test Document 1');
    expect(test1Slot.document).toBeNull(); // Not uploaded yet
    
    // Verify summary includes the new type (7 original + TEST1 = at least 8)
    expect(docsRes.body.summary.total_types).toBeGreaterThanOrEqual(8);
  });

  it('should allow updating existing document type via upsert', async () => {
    const updated = {
      name: 'Test Document 1 Updated',
      type_code: 'TEST1', // Same code = update
      description: 'Updated description for TEST1',
      is_required: true,
      display_order: 99,
      allowed_mime_types: ['application/pdf'],
      max_file_size_mb: 10,
    };

    await documentTypeService.upsertMany([updated]);

    const found = await documentTypeService.findByTypeCode('TEST1');
    expect(found!.name).toBe('Test Document 1 Updated');
    expect(found!.description).toBe('Updated description for TEST1');
    expect(found!.is_required).toBe(true);
  });
});
