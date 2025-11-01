import { TestingModule } from '@nestjs/testing';
import { AgencyService } from 'src/modules/agency/agency.service';
import { bootstrapDomainTestModule } from './utils/testModule';
import { uniqueSuffix } from './utils/id';

describe('Agency Profile CRUD (AG-CRUD)', () => {
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

  it('AG-1: create agency minimal, fetch by id and license', async () => {
    const suf = uniqueSuffix();
    const dto = {
      name: `Acme Agency ${suf}`,
      license_number: `LIC-${suf}`,
    };
    const created = await agencies.createAgency(dto);
    expect(created).toBeTruthy();
    expect(created.id).toBeDefined();
    expect(created.license_number).toBe(dto.license_number);

    const byId = await agencies.findAgencyById(created.id);
    expect(byId.name).toBe(dto.name);

    const byLic = await agencies.findAgencyByLicense(dto.license_number);
    expect(byLic.id).toBe(created.id);
  });

  it('AG-2: update profile fields (city, contact info) and verify', async () => {
    const suf = uniqueSuffix();
    const created = await agencies.createAgency({
      name: `UpdateMe ${suf}`,
      license_number: `ULIC-${suf}`,
    });
    const updated = await agencies.updateAgency(created.id, {
      city: 'Kathmandu',
      country: 'Nepal',
      contact_email: 'contact@example.com',
      contact_phone: '+977-123456',
      website: 'https://example.com',
      description: 'Trusted manpower agency',
    });
    expect(updated.city).toBe('Kathmandu');
    expect(updated.country).toBe('Nepal');
    expect(updated.contact_email).toBe('contact@example.com');
    expect(updated.contact_phone).toBe('+977-123456');
    expect(updated.website).toContain('example.com');
    expect(updated.description).toContain('Trusted');
  });

  it('AG-3: deactivate/activate agency affects directory default filter', async () => {
    const suf = uniqueSuffix();
    const created = await agencies.createAgency({ name: `Toggle ${suf}`, license_number: `TLIC-${suf}` });
    // ensure appears when active by name filter
    let list = await agencies.listAgencies({ name: 'Toggle ' + suf, page: 1, limit: 10 });
    expect(list.data.some(a => a.id === created.id)).toBe(true);

    await agencies.deactivateAgency(created.id);
    list = await agencies.listAgencies({ name: 'Toggle ' + suf, page: 1, limit: 10 });
    expect(list.data.some(a => a.id === created.id)).toBe(false);

    // include inactive flag should show
    list = await agencies.listAgencies({ name: 'Toggle ' + suf, page: 1, limit: 10, include_inactive: true });
    expect(list.data.some(a => a.id === created.id)).toBe(true);

    await agencies.activateAgency(created.id);
    list = await agencies.listAgencies({ name: 'Toggle ' + suf, page: 1, limit: 10 });
    expect(list.data.some(a => a.id === created.id)).toBe(true);
  });

  it('AG-4: prevent duplicate by license_number (reuses existing)', async () => {
    const suf = uniqueSuffix();
    const lic = `DLIC-${suf}`;
    const first = await agencies.createAgency({ name: `Dup ${suf}`, license_number: lic });
    const second = await agencies.createAgency({ name: `Dup-2 ${suf}`, license_number: lic });
    expect(second.id).toBe(first.id);
    // name should remain as first or as stored; allow either equality by id is sufficient
  });
});
