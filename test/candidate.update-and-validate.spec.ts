import 'reflect-metadata';
import { TestingModule } from '@nestjs/testing';
import { bootstrapCandidateTestModule } from './utils/candidateTestModule';

describe('Candidate - update and validations', () => {
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

  it('TC1.2 creates candidate with full details JSONB persisted', async () => {
    const c = await candidates.createCandidate({
      full_name: 'Charlie Full',
      phone: '9811111111',
      passport_number: 'P1234567',
      address: {
        municipality: 'KMC',
        ward: '1',
      },
    });
    expect(c.address?.municipality).toBe('KMC');
    expect(c.passport_number).toBe('P1234567');
  });

  it('TC2.1 updates partial fields and preserves others; updated_at changes', async () => {
    const c1 = await candidates.createCandidate({ full_name: 'Delta Update', phone: '9822222222' });
    const prevUpdatedAt = c1.updated_at;

    const c2 = await candidates.updateCandidate(c1.id, {
      passport_number: 'N9999999',
    });

    expect(c2.passport_number).toBe('N9999999');
    expect(c2.full_name).toBe('Delta Update');
    expect((c2.updated_at as any) >= (prevUpdatedAt as any)).toBe(true);
  });

  it('TC12.1 rejects invalid coordinates in address', async () => {
    await expect(
      candidates.createCandidate({
        full_name: 'Echo Bad Coords',
        phone: '9833333333',
        address: { coordinates: { lat: 91, lng: 0 } as any },
      }),
    ).rejects.toBeDefined();
  });

  it('TC13.1 validates phone number format', async () => {
    await expect(
      candidates.createCandidate({
        full_name: 'Foxtrot Bad Phone',
        phone: 'invalid-phone',
      }),
    ).rejects.toBeDefined();
  });
});
