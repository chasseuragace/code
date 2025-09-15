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

  async listAll(): Promise<CountryResponseDto[]> {
    return this.repo.find({
      order: { country_name: 'ASC' },
    });
  }

  async findByNameOrCode(search: string): Promise<CountryResponseDto[]> {
    if (!search) {
      return this.listAll();
    }
    
    const searchTerm = `%${search.toLowerCase()}%`;
    return this.repo
      .createQueryBuilder('country')
      .where('LOWER(country.country_name) LIKE :search', { search: searchTerm })
      .orWhere('LOWER(country.country_code) = :code', { code: search.toLowerCase() })
      .orderBy('country.country_name', 'ASC')
      .getMany();
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
}
