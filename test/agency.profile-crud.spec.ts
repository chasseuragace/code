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

  it('AG-5: findAgencyById returns complete agency details', async () => {
    const suf = uniqueSuffix();
    const dto = {
      name: `Rich Agency ${suf}`,
      license_number: `RICH-${suf}`,
      city: 'Kathmandu',
      country: 'Nepal',
      address: '123 Main St',
      phones: ['+977-1234567', '+977-9876543'],
      emails: ['info@agency.com', 'contact@agency.com'],
      website: 'https://agency.com',
      description: 'A comprehensive manpower agency',
      logo_url: 'https://agency.com/logo.png',
      banner_url: 'https://agency.com/banner.jpg',
      established_year: 2010,
      services: ['Recruitment', 'Training', 'Visa Processing'],
      target_countries: ['UAE', 'Qatar', 'Saudi Arabia'],
      specializations: ['Construction', 'Healthcare', 'IT'],
      certifications: [
        { name: 'ISO 9001', number: 'ISO-001', issued_by: 'ISO', issued_date: '2020-01-01', expiry_date: '2023-01-01' }
      ],
      social_media: {
        facebook: 'https://facebook.com/agency',
        linkedin: 'https://linkedin.com/company/agency'
      },
      contact_persons: [
        { name: 'John Doe', position: 'Manager', phone: '+977-1111111', email: 'john@agency.com' }
      ],
      operating_hours: {
        weekdays: '9:00 AM - 6:00 PM',
        saturday: '9:00 AM - 2:00 PM',
        sunday: 'Closed'
      },
      statistics: {
        total_placements: 1500,
        active_since: '2010-01-01',
        success_rate: 95,
        countries_served: 5
      }
    };
    
    const created = await agencies.createAgency(dto);
    const found = await agencies.findAgencyById(created.id);
    
    // Verify all fields are returned
    expect(found.id).toBe(created.id);
    expect(found.name).toBe(dto.name);
    expect(found.license_number).toBe(dto.license_number);
    expect(found.city).toBe(dto.city);
    expect(found.country).toBe(dto.country);
    expect(found.address).toBe(dto.address);
    expect(found.phones).toEqual(dto.phones);
    expect(found.emails).toEqual(dto.emails);
    expect(found.website).toBe(dto.website);
    expect(found.description).toBe(dto.description);
    expect(found.logo_url).toBe(dto.logo_url);
    expect(found.banner_url).toBe(dto.banner_url);
    expect(found.established_year).toBe(dto.established_year);
    expect(found.services).toEqual(dto.services);
    expect(found.target_countries).toEqual(dto.target_countries);
    expect(found.specializations).toEqual(dto.specializations);
    expect(found.certifications).toEqual(dto.certifications);
    expect(found.social_media).toEqual(dto.social_media);
    expect(found.contact_persons).toEqual(dto.contact_persons);
    expect(found.operating_hours).toEqual(dto.operating_hours);
    expect(found.statistics).toEqual(dto.statistics);
  });

  it('AG-6: findAgencyByLicense returns complete agency details', async () => {
    const suf = uniqueSuffix();
    const dto = {
      name: `License Agency ${suf}`,
      license_number: `LIC-FIND-${suf}`,
      city: 'Pokhara',
      country: 'Nepal',
      description: 'Agency found by license',
      services: ['Recruitment', 'Documentation'],
      specializations: ['Engineering', 'Medical']
    };
    
    const created = await agencies.createAgency(dto);
    const found = await agencies.findAgencyByLicense(dto.license_number);
    
    expect(found.id).toBe(created.id);
    expect(found.name).toBe(dto.name);
    expect(found.license_number).toBe(dto.license_number);
    expect(found.city).toBe(dto.city);
    expect(found.country).toBe(dto.country);
    expect(found.description).toBe(dto.description);
    expect(found.services).toEqual(dto.services);
    expect(found.specializations).toEqual(dto.specializations);
  });
});
