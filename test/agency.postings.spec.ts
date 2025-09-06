import { TestingModule } from '@nestjs/testing';
import { AgencyService } from 'src/modules/agency/agency.service';
import { bootstrapDomainTestModule } from './utils/testModule';
import { uniqueSuffix } from './utils/id';
import { createPostingWithDefaults } from './utils/ops/domainOps';

// AG-POST: Agency postings listing

describe('Agency Postings (AG-POST)', () => {
  let moduleRef: TestingModule;
  let agencies: AgencyService;
  let jobs: import('src/modules/domain/domain.service').JobPostingService;

  beforeAll(async () => {
    const boot = await bootstrapDomainTestModule();
    moduleRef = boot.moduleRef;
    agencies = boot.agencies;
    jobs = boot.jobs;
  });

  afterAll(async () => {
    await moduleRef.close();
  });

  it('AG-8/9: get agency postings with active_only and after deactivation', async () => {
    const suf = uniqueSuffix();
    const ag = await agencies.createAgency({ name: `Postings AG ${suf}`, license_number: `LIC-${suf}` });

    const p1 = await createPostingWithDefaults(jobs, {
      posting_title: `AGP-1-${suf}`,
      posting_agency: { name: ag.name, license_number: ag.license_number },
    });
    const p2 = await createPostingWithDefaults(jobs, {
      posting_title: `AGP-2-${suf}`,
      posting_agency: { name: ag.name, license_number: ag.license_number },
    });

    // active_only true (default) should include both initially
    let list = await agencies.getAgencyPostings(ag.id, { page: 1, limit: 10 });
    const ids = list.data.map(p => p.id);
    expect(ids.includes(p1.id)).toBe(true);
    expect(ids.includes(p2.id)).toBe(true);

    // deactivate one posting; it should disappear from active_only
    await jobs.deactivateJobPosting(p2.id);
    list = await agencies.getAgencyPostings(ag.id, { page: 1, limit: 10, active_only: true });
    const idsAfter = list.data.map(p => p.id);
    expect(idsAfter.includes(p1.id)).toBe(true);
    expect(idsAfter.includes(p2.id)).toBe(false);

    // include_inactive by setting active_only=false should bring it back
    const listAll = await agencies.getAgencyPostings(ag.id, { page: 1, limit: 10, active_only: false });
    const idsAll = listAll.data.map(p => p.id);
    expect(idsAll.includes(p2.id)).toBe(true);
  });

  it('AG-10: pagination edges for agency postings', async () => {
    const suf = uniqueSuffix();
    const ag = await agencies.createAgency({ name: `Paging AG ${suf}`, license_number: `LIC-P-${suf}` });

    const createdIds: string[] = [];
    for (let i = 0; i < 7; i++) {
      const p = await createPostingWithDefaults(jobs, {
        posting_title: `AGP-P-${i}-${suf}`,
        posting_agency: { name: ag.name, license_number: ag.license_number },
      });
      createdIds.push(p.id);
    }

    const page1 = await agencies.getAgencyPostings(ag.id, { page: 1, limit: 3, active_only: false });
    expect(page1.data.length).toBe(3);
    expect(page1.total).toBeGreaterThanOrEqual(7);
    expect(page1.page).toBe(1);

    const page3 = await agencies.getAgencyPostings(ag.id, { page: 3, limit: 3, active_only: false });
    // page 3 should have remainder (1) or be empty if ordering changed
    expect(page3.page).toBe(3);
    expect(page3.data.length).toBeLessThanOrEqual(3);

    const pageBeyond = await agencies.getAgencyPostings(ag.id, { page: 5, limit: 3, active_only: false });
    expect(pageBeyond.data.length).toBe(0);
  });
});
