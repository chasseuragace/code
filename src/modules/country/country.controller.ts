import { Controller, Post, HttpCode, Get } from '@nestjs/common';
import { CountryService } from './country.service';
import * as fs from 'fs';
import * as path from 'path';

@Controller('countries')
export class CountryController {
  constructor(private readonly countryService: CountryService) {}

  @Get()
  async list() {
    return this.countryService.listAll();
  }

  // SeedV1: upsert countries from JSON file
  @Post('seedv1')
  @HttpCode(200)
  async seedV1() {
    const seedPath = path.resolve(process.cwd(), 'src/seed/countries.seed.json');
    if (!fs.existsSync(seedPath)) {
      throw new Error(`Seed file not found at ${seedPath}`);
    }
    const rows = JSON.parse(fs.readFileSync(seedPath, 'utf-8'));
    if (!Array.isArray(rows)) {
      throw new Error('countries.seed.json must contain an array');
    }
    const res = await this.countryService.upsertMany(rows);
    return { source: 'src/seed/countries.seed.json', upserted: res.affected };
  }
}
