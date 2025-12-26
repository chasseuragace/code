import { Controller, Post, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CurrencySyncService } from './currency-sync.service';

@ApiTags('Currency Sync')
@Controller('currency-sync')
export class CurrencySyncController {
  constructor(private readonly currencySyncService: CurrencySyncService) {}

  @Post('sync')
  @ApiOperation({ summary: 'Manually trigger currency rate synchronization' })
  @ApiResponse({ 
    status: 200, 
    description: 'Currency sync completed',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        updated: { type: 'number' },
        errors: { type: 'array', items: { type: 'string' } },
        message: { type: 'string' }
      }
    }
  })
  async syncCurrencyRates() {
    const result = await this.currencySyncService.syncCurrencyRates();
    
    return {
      ...result,
      message: result.success 
        ? `Successfully updated ${result.updated} currency rates`
        : `Sync completed with ${result.errors.length} errors`
    };
  }

  @Get('test-connection')
  @ApiOperation({ summary: 'Test FastForex API connection' })
  @ApiResponse({ 
    status: 200, 
    description: 'API connection test result',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' }
      }
    }
  })
  async testConnection() {
    return await this.currencySyncService.testApiConnection();
  }
}