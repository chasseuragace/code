import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Country } from '../country/country.entity';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class CurrencySyncService {
  private readonly logger = new Logger(CurrencySyncService.name);
  private readonly apiKey = process.env.FASTFOREX_API_KEY;
  private readonly apiUrl = process.env.FASTFOREX_API_URL || 'https://api.fastforex.io';

  constructor(
    private readonly httpService: HttpService,
    @InjectRepository(Country)
    private readonly countryRepository: Repository<Country>,
  ) {}

  @Cron('0 */12 * * *') // Every 12 hours
  async syncCurrencyRatesScheduled() {
    this.logger.log('Starting scheduled currency sync...');
    try {
      await this.syncCurrencyRates();
      this.logger.log('Scheduled currency sync completed successfully');
    } catch (error) {
      this.logger.error('Scheduled currency sync failed:', error.message);
    }
  }

  async syncCurrencyRates(): Promise<{ success: boolean; updated: number; errors: string[] }> {
    const errors: string[] = [];
    let updated = 0;

    try {
      // Get all countries with their currency codes
      const countries = await this.countryRepository.find();
      
      if (!countries.length) {
        throw new Error('No countries found in database');
      }

      // Get unique currency codes (excluding NPR as it's our base)
      const uniqueCurrencies = [...new Set(
        countries
          .filter(country => country.currency_code !== 'NPR')
          .map(country => country.currency_code)
      )];

      this.logger.log(`Syncing rates for ${uniqueCurrencies.length} currencies: ${uniqueCurrencies.join(', ')}`);

      // Fetch exchange rates from FastForex API
      for (const currencyCode of uniqueCurrencies) {
        try {
          const rate = await this.fetchExchangeRate('NPR', currencyCode);
          
          if (rate) {
            // Update all countries with this currency code
            const result = await this.countryRepository.update(
              { currency_code: currencyCode },
              { 
                npr_multiplier: (1 / rate).toFixed(6), // Convert to NPR multiplier
                updated_at: new Date()
              }
            );
            
            updated += result.affected || 0;
            this.logger.log(`Updated ${currencyCode}: 1 NPR = ${rate} ${currencyCode} (multiplier: ${(1/rate).toFixed(6)})`);
          }
        } catch (error) {
          const errorMsg = `Failed to update ${currencyCode}: ${error.message}`;
          errors.push(errorMsg);
          this.logger.error(errorMsg);
        }
      }

      return {
        success: errors.length === 0,
        updated,
        errors
      };

    } catch (error) {
      this.logger.error('Currency sync failed:', error.message);
      return {
        success: false,
        updated: 0,
        errors: [error.message]
      };
    }
  }

  private async fetchExchangeRate(from: string, to: string): Promise<number | null> {
    try {
      const url = `${this.apiUrl}/fetch-one?from=${from}&to=${to}`;
      const response = await firstValueFrom(
        this.httpService.get(url, {
          headers: {
            'X-API-Key': this.apiKey
          },
          timeout: 10000
        })
      );

      if (response.data && response.data.result && response.data.result[to]) {
        return parseFloat(response.data.result[to]);
      }

      throw new Error(`Invalid API response for ${from} to ${to}`);
    } catch (error) {
      if (error.response) {
        throw new Error(`API Error ${error.response.status}: ${error.response.data?.message || 'Unknown error'}`);
      }
      throw new Error(`Network error: ${error.message}`);
    }
  }

  async testApiConnection(): Promise<{ success: boolean; message: string }> {
    try {
      const rate = await this.fetchExchangeRate('USD', 'EUR');
      return {
        success: true,
        message: `API connection successful. USD to EUR rate: ${rate}`
      };
    } catch (error) {
      return {
        success: false,
        message: `API connection failed: ${error.message}`
      };
    }
  }
}