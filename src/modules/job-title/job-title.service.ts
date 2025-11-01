import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { JobTitle } from './job-title.entity';

export interface JobTitleSeedDto {
  title: string;
  rank: number;
  is_active?: boolean;
  difficulty?: string;
  skills_summary?: string;
  description?: string;
}

@Injectable()
export class JobTitleService {
  constructor(
    @InjectRepository(JobTitle)
    private readonly repo: Repository<JobTitle>,
  ) {}

  async listAll(params?: { is_active?: boolean; q?: string; limit?: number; offset?: number }) {
    const where: any = {};
    if (params?.is_active !== undefined) where.is_active = params.is_active;
    if (params?.q) where.title = ILike(`%${params.q}%`);
    const [data, total] = await this.repo.findAndCount({
      where,
      order: { rank: 'ASC', title: 'ASC' },
      take: params?.limit ?? 50,
      skip: params?.offset ?? 0,
    });
    return { data, total };
    }

  async findByTitle(title: string) {
    return this.repo.findOne({ where: { title } });
  }

  async upsertMany(rows: JobTitleSeedDto[]) {
    if (!rows?.length) return { affected: 0 };
    await this.repo.upsert(
      rows.map((r) => ({
        title: r.title,
        rank: r.rank,
        is_active: r.is_active ?? true,
        difficulty: r.difficulty,
        skills_summary: r.skills_summary,
        description: r.description,
      })),
      ['title'],
    );
    return { affected: rows.length };
  }
}
