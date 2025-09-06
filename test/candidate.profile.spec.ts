import 'reflect-metadata';
import { TestingModule } from '@nestjs/testing';
import { bootstrapCandidateTestModule } from './utils/candidateTestModule';

describe('Candidate - create and phone normalization/uniqueness', () => {
  let moduleRef: TestingModule;
  let candidates: import('src/modules/candidate/candidate.service').CandidateService;

  beforeAll(async () => {
    const boot = await bootstrapCandidateTestModule();
    moduleRef = boot.moduleRef;
    candidates = boot.candidates;
  });

  afterAll(async () => {
    await moduleRef?.close();
  });

  it('TC1.1 creates minimal candidate and normalizes phone to E.164 (+977)', async () => {
    const c = await candidates.createCandidate({ full_name: 'Alice Example', phone: '9812345678' });
    expect((c as any).id).toBeDefined();
    expect(c.phone).toBe('+9779812345678');
    expect(c.is_active).toBe(true);
  });

  it('TC11.2 accepts already-normalized E.164 numbers unchanged', async () => {
    const c = await candidates.createCandidate({ full_name: 'Bob Example', phone: '+9779800000000' });
    expect(c.phone).toBe('+9779800000000');
  });

  it('TC11.1 enforces phone uniqueness (normalized)', async () => {
    // Make this test self-contained to avoid cross-file interference
    const phone = '+9779899999999';
    await candidates.createCandidate({ full_name: 'Seed Phone', phone });
    await expect(candidates.createCandidate({ full_name: 'Dup Phone', phone })).rejects.toBeDefined();
  });
});
