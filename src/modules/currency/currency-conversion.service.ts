import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Country } from '../country/country.entity';

export interface ConvertedAmount {
  amount: number;
  currency: string;
}

@Injectable()
export class CurrencyConversionService {
  private readonly logger = new Logger(CurrencyConversionService.name);
  private readonly cache = new Map<string, number>(); // Simple in-memory cache for multipliers

  constructor(
    @InjectRepository(Country)
    private readonly countryRepository: Repository<Country>,
  ) {}

  /**
   * Convert salary amount from one currency to multiple target currencies
   * Uses NPR as the base conversion currency via npr_multiplier
   */
  async convertSalary(
    amount: number,
    fromCurrency: string,
    toCurrencies: string[] = ['NPR', 'USD']
  ): Promise<ConvertedAmount[]> {
    if (!amount || amount <= 0) {
      return [];
    }

    try {
      // Get NPR equivalent first (base conversion)
      const nprAmount = await this.convertToNPR(amount, fromCurrency);
      if (nprAmount === null) {
        this.logger.warn(`No conversion rate found for currency: ${fromCurrency}`);
        return [];
      }

      const conversions: ConvertedAmount[] = [];

      // Convert to each target currency
      for (const toCurrency of toCurrencies) {
        if (toCurrency === fromCurrency) {
          // Same currency, return original amount
          conversions.push({ amount: Math.round(amount), currency: toCurrency });
        } else if (toCurrency === 'NPR') {
          // Already have NPR amount
          conversions.push({ amount: Math.round(nprAmount), currency: 'NPR' });
        } else {
          // Convert from NPR to target currency
          const convertedAmount = await this.convertFromNPR(nprAmount, toCurrency);
          if (convertedAmount !== null) {
            conversions.push({ 
              amount: Math.round(convertedAmount), 
              currency: toCurrency 
            });
          }
        }
      }

      return conversions;
    } catch (error) {
      this.logger.error(`Currency conversion failed: ${error.message}`, error.stack);
      return [];
    }
  }

  /**
   * Convert amount from any currency to NPR using npr_multiplier
   */
  private async convertToNPR(amount: number, fromCurrency: string): Promise<number | null> {
    const multiplier = await this.getNPRMultiplier(fromCurrency);
    return multiplier !== null ? amount * multiplier : null;
  }

  /**
   * Convert amount from NPR to target currency
   */
  private async convertFromNPR(nprAmount: number, toCurrency: string): Promise<number | null> {
    const multiplier = await this.getNPRMultiplier(toCurrency);
    return multiplier !== null ? nprAmount / multiplier : null;
  }

  /**
   * Get NPR multiplier for a currency with caching
   */
  private async getNPRMultiplier(currency: string): Promise<number | null> {
    const cacheKey = currency.toUpperCase();
    
    // Check cache first
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    try {
      const country = await this.countryRepository.findOne({
        where: { currency_code: currency.toUpperCase() }
      });

      if (!country) {
        this.logger.warn(`Currency not found in countries table: ${currency}`);
        return null;
      }

      const multiplier = Number(country.npr_multiplier);
      if (isNaN(multiplier) || multiplier <= 0) {
        this.logger.warn(`Invalid NPR multiplier for ${currency}: ${country.npr_multiplier}`);
        return null;
      }

      // Cache the result
      this.cache.set(cacheKey, multiplier);
      return multiplier;
    } catch (error) {
      this.logger.error(`Failed to get NPR multiplier for ${currency}: ${error.message}`);
      return null;
    }
  }

  /**
   * Clear the multiplier cache (useful for testing or when rates are updated)
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Get supported currencies from countries table
   */
  async getSupportedCurrencies(): Promise<string[]> {
    try {
      const countries = await this.countryRepository.find({
        select: ['currency_code']
      });
      return [...new Set(countries.map(c => c.currency_code))];
    } catch (error) {
      this.logger.error(`Failed to get supported currencies: ${error.message}`);
      return [];
    }
  }

  /**
   * Format converted salary for display
   */
  formatConvertedSalary(conversions: ConvertedAmount[], preferredCurrency: string = 'NPR'): string | undefined {
    if (!conversions.length) return undefined;

    // Try preferred currency first
    const preferred = conversions.find(c => c.currency === preferredCurrency);
    if (preferred) {
      return `${preferred.currency} ${preferred.amount.toLocaleString()}`;
    }

    // Fallback to first available
    const first = conversions[0];
    return `${first.currency} ${first.amount.toLocaleString()}`;
  }
}
