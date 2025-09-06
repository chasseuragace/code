import 'reflect-metadata';
import { TestingModule } from '@nestjs/testing';
import { bootstrapDomainTestModule } from './utils/testModule';
import { createPostingWithDefaults } from './utils/ops/domainOps';
import { uniqueSuffix } from './utils/id';

describe('Domain Posting - pagination edges (CC-2)', () => {
  let moduleRef: TestingModule;
  let jobs: import('src/modules/domain/domain.service').JobPostingService;

  const marker = `Pageland-CC2-${uniqueSuffix('-')}`;

  beforeAll(async () => {
    const boot = await bootstrapDomainTestModule();
    moduleRef = boot.moduleRef;
    jobs = boot.jobs;

    // Seed an isolated dataset for this test suite
    const N = 13;
    for (let i = 0; i < N; i++) {
      await createPostingWithDefaults(jobs, {
        country: marker,
        posting_title: `CC2-${i}`,
      });
    }
  });

  afterAll(async () => {
    await moduleRef?.close();
  });

  it('findAllJobPostings: page 1 small limit, last page remainder, and empty beyond last', async () => {
    // Page 1 small limit
    const page1 = await jobs.findAllJobPostings(1, 5, marker);
    expect(page1.page).toBe(1);
    expect(page1.limit).toBe(5);
    expect(page1.data.length).toBe(5);
    expect(page1.total).toBeGreaterThanOrEqual(13); // at least the seeded set

    // Last page (ceil(13/5) = 3) should have 3 items for our seeded subset
    const page3 = await jobs.findAllJobPostings(3, 5, marker);
    expect(page3.page).toBe(3);
    expect(page3.data.length).toBeLessThanOrEqual(5);
    // When isolated correctly, should be exactly 3
    // Allow >= 3 to tolerate any pre-existing rows with same country (unlikely due to marker)
    expect(page3.data.length).toBe(3);

    // Empty page beyond last
    const page4 = await jobs.findAllJobPostings(4, 5, marker);
    expect(page4.page).toBe(4);
    expect(page4.data.length).toBe(0);
    expect(page4.total).toBe(page1.total);
  });

  it('searchJobPostings: respects page/limit with same marker filter', async () => {
    // Use search API with the same country marker
    const s1 = await jobs.searchJobPostings({ country: marker, page: 2, limit: 4 });
    expect(s1.page).toBe(2);
    expect(s1.limit).toBe(4);
    expect(s1.data.length).toBe(4);

    const sLast = await jobs.searchJobPostings({ country: marker, page: 4, limit: 4 });
    // ceil(13/4) = 4, last page should have 1 item
    expect(sLast.page).toBe(4);
    expect(sLast.data.length).toBe(1);
    expect(sLast.total).toBe(s1.total);

    const sEmpty = await jobs.searchJobPostings({ country: marker, page: 5, limit: 4 });
    expect(sEmpty.data.length).toBe(0);
    expect(sEmpty.total).toBe(s1.total);
  });
});
