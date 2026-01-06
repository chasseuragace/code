import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Country } from './country.entity';
import { CountryResponseDto } from './dto/country.dto';

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

  async listAll(): Promise<{ data: CountryResponseDto[]; total: number }> {
    const [rows, total] = await this.repo.findAndCount({
      order: { country_name: 'ASC' },
    });
    return { data: rows, total };
  }

  async findByNameOrCode(search: string): Promise<CountryResponseDto | null> {
    if (!search) {
      const { data } = await this.listAll();
      return data[0] ?? null;
    }
    const q = search.trim().toLowerCase();
    // Try exact match by code (2 or 3 letters)
    const code = q.toUpperCase();
    if (code.length === 2 || code.length === 3) {
      const byCode = await this.repo.findOne({ where: { country_code: code } });
      if (byCode) return byCode;
    }
    // Fallback: name ilike
    const found = await this.repo
      .createQueryBuilder('country')
      .where('LOWER(country.country_name) LIKE :search', { search: `%${q}%` })
      .orderBy('country.country_name', 'ASC')
      .getOne();
    return found ?? null;
  }

  async upsertMany(rows: CountrySeedDto[]): Promise<{ affected: number }> {
    if (!rows?.length) return { affected: 0 };
    
    // Validate all rows first
    for (const [index, r] of rows.entries()) {
      if (!r.country_code || (r.country_code.length !== 2 && r.country_code.length !== 3)) {
        throw new BadRequestException(`Row ${index + 1}: Invalid country_code '${r.country_code}'`);
      }
      if (!r.currency_code || r.currency_code.length !== 3) {
        throw new BadRequestException(
          `Row ${index + 1}: Invalid currency_code '${r.currency_code}' for ${r.country_name}`
        );
      }
      if (!r.npr_multiplier || isNaN(Number(r.npr_multiplier))) {
        throw new BadRequestException(
          `Row ${index + 1}: Invalid npr_multiplier '${r.npr_multiplier}' for ${r.country_name}`
        );
      }
    }

    try {
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
    } catch (error) {
      throw new BadRequestException(`Failed to upsert countries: ${error.message}`);
    }
  }

  async findByCode(code: string): Promise<CountryResponseDto> {
    if (!code) {
      throw new BadRequestException('Country code is required');
    }
    
    const country = await this.repo.findOne({ 
      where: { country_code: code.toUpperCase() } 
    });
    
    if (!country) {
      throw new NotFoundException(`Country with code '${code}' not found`);
    }
    
    return country;
  }

  async count(): Promise<number> {
    return this.repo.count();
  }
}
