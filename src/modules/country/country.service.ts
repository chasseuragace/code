import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { Country } from './country.entity';

export interface CountrySeedDto {
  country_code: string; // ISO alpha-2
  country_name: string;
  currency_code: string; // ISO 4217
  currency_name: string;
  npr_multiplier: string; // decimal as string
}

@Injectable()
export class CountryService {
  constructor(
    @InjectRepository(Country)
    private readonly repo: Repository<Country>,
  ) {}

  async upsertMany(rows: CountrySeedDto[]) {
    if (!rows?.length) return { affected: 0 };
    // basic validation
    for (const r of rows) {
      if (!r.country_code || (r.country_code.length !== 2 && r.country_code.length !== 3)) {
        throw new BadRequestException(`Invalid country_code for ${r.country_name}`);
      }
      if (!r.currency_code || r.currency_code.length !== 3) {
        throw new BadRequestException(`Invalid currency_code for ${r.country_name}`);
      }
    }
    await this.repo.upsert(
      rows.map((r) => ({
        country_code: r.country_code.toUpperCase(),
        country_name: r.country_name,
        currency_code: r.currency_code.toUpperCase(),
        currency_name: r.currency_name,
        npr_multiplier: r.npr_multiplier,
      })),
      ['country_code'],
    );
    return { affected: rows.length };
  }

  async findByNameOrCode(value: string) {
    if (!value) return null;
    const upper = value.toUpperCase();
    // Try exact code match for alpha-2 or alpha-3
    if (upper.length === 2 || upper.length === 3) {
      const byCodeExact = await this.repo.findOne({ where: { country_code: upper } });
      if (byCodeExact) return byCodeExact;
      const byCodeIlike = await this.repo.findOne({ where: { country_code: ILike(value) } });
      if (byCodeIlike) return byCodeIlike;
    }
    // Fallback to case-insensitive name search
    return this.repo.findOne({ where: { country_name: ILike(value) } });
  }

  async listAll(limit = 250) {
    const [data, total] = await this.repo.findAndCount({ order: { country_name: 'ASC' }, take: limit });
    return { data, total };
  }
}
