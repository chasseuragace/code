import { TestingModule } from '@nestjs/testing';
import { AgencyService } from 'src/modules/agency/agency.service';
import { bootstrapDomainTestModule } from './utils/testModule';
import { uniqueSuffix } from './utils/id';

describe('Agency Directory (AG-DIR)', () => {
  let moduleRef: TestingModule;
  let agencies: AgencyService;

  beforeAll(async () => {
    const boot = await bootstrapDomainTestModule();
    moduleRef = boot.moduleRef;
    agencies = boot.agencies;
  });

  afterAll(async () => {
    await moduleRef.close();
  });

  it('filters by name, country, city, license_number (ILIKE, Unicode); paginates', async () => {
    const suf = uniqueSuffix();

    const a1 = await agencies.createAgency({ name: `Global Talent ${suf}`, license_number: `AG-${suf}-001`, country: 'Nepal', city: 'Kathmandu' });
    const a2 = await agencies.createAgency({ name: `ग्लोबल ट्यालेन्ट ${suf}`, license_number: `AG-${suf}-002`, country: 'नेपाल', city: 'पोखरा' });
    const a3 = await agencies.createAgency({ name: `Nepal Recruit ${suf}`, license_number: `AG-${suf}-003`, country: 'NEPAL', city: 'Lalitpur' });

    // Name filter (ILIKE)
    let res = await agencies.listAgencies({ name: 'nepal', page: 1, limit: 10 });
    const idsByName = res.data.map(x => x.id);
    expect(idsByName.includes(a3.id)).toBe(true);

    // Country filter supports ASCII case-insensitive
    res = await agencies.listAgencies({ country: 'nepal', page: 1, limit: 10 });
    const idsByCountryAscii = res.data.map(x => x.id);
    expect(idsByCountryAscii.includes(a1.id)).toBe(true);
    expect(idsByCountryAscii.includes(a3.id)).toBe(true);

    // Country filter supports Unicode
    res = await agencies.listAgencies({ country: 'नेपाल', page: 1, limit: 10 });
    expect(res.data.some(x => x.id === a2.id)).toBe(true);

    // City filter
    res = await agencies.listAgencies({ city: 'kath', page: 1, limit: 10 });
    expect(res.data.some(x => x.id === a1.id)).toBe(true);

    // License filter
    res = await agencies.listAgencies({ license_number: `-003`, page: 1, limit: 10 });
    expect(res.data.some(x => x.id === a3.id)).toBe(true);

    // Pagination page/limit
    res = await agencies.listAgencies({ page: 1, limit: 2, include_inactive: true });
    expect(res.data.length).toBeLessThanOrEqual(2);
    const res2 = await agencies.listAgencies({ page: 2, limit: 2, include_inactive: true });
    expect(res2.page).toBe(2);
  });
});
