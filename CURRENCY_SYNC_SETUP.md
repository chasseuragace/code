# Currency Synchronization System

## Overview
Automated currency exchange rate synchronization system that updates NPR multipliers for all countries in the database using the FastForex API.

## Features
- ✅ **Scheduled Sync**: Automatically runs every 12 hours
- ✅ **Manual Sync**: API endpoint to trigger sync on-demand
- ✅ **API Testing**: Connection test endpoint
- ✅ **Error Handling**: Comprehensive error logging and reporting
- ✅ **Docker Ready**: Fully configured for Docker environment

## Configuration

### Environment Variables
```bash
# FastForex API Configuration
FASTFOREX_API_KEY=146833ad5f-1ee3e7a4b5-t7vdqs
FASTFOREX_API_URL=https://api.fastforex.io
```

### Database Schema
The system uses the existing `countries` table:
- `currency_code`: ISO 4217 currency code (e.g., USD, EUR)
- `npr_multiplier`: Exchange rate multiplier to NPR (updated by sync)
- `updated_at`: Timestamp of last update

## API Endpoints

### Manual Sync
```http
POST /currency-sync/sync
```
**Response:**
```json
{
  "success": true,
  "updated": 36,
  "errors": [],
  "message": "Successfully updated 36 currency rates"
}
```

### Test API Connection
```http
GET /currency-sync/test-connection
```
**Response:**
```json
{
  "success": true,
  "message": "API connection successful. USD to EUR rate: 0.8496"
}
```

## Scheduled Jobs

### Currency Rate Sync
- **Schedule**: Every 12 hours (`0 */12 * * *`)
- **Function**: Updates all currency rates from FastForex API
- **Logging**: Comprehensive logs in application console

## How It Works

1. **Fetch Countries**: Retrieves all countries from database
2. **Extract Currencies**: Gets unique currency codes (excluding NPR)
3. **API Calls**: Fetches NPR to foreign currency rates
4. **Calculate Multipliers**: Converts rates to NPR multipliers (1/rate)
5. **Update Database**: Updates all countries with same currency code
6. **Log Results**: Records success/failure for each currency

## Currency Multiplier Logic

The `npr_multiplier` represents how many NPR equals 1 unit of foreign currency:
- If 1 USD = 133 NPR, then `npr_multiplier` = 133.000000
- If 1 NPR = 0.0075 USD, then `npr_multiplier` = 133.333333

## Supported Currencies

Currently syncing 36 currencies:
- **Major**: USD, EUR, GBP, JPY, AUD, CAD
- **Regional**: AED, SAR, QAR, KWD, OMR, BHD
- **Asian**: INR, CNY, KRW, THB, SGD, MYR, IDR
- **European**: PLN, CZK, HUF, RON, BGN, TRY
- **Others**: ZAR, KES, MUR, MVR, LKR, BDT, PKR

## Testing

### Manual Test
```bash
# Test the system
node test-currency-sync.js
```

### Docker Environment
```bash
# Start services
docker-compose up -d

# Check logs
docker-compose logs -f server

# Test endpoints
curl http://localhost:3000/currency-sync/test-connection
curl -X POST http://localhost:3000/currency-sync/sync
```

## Monitoring

### Application Logs
```bash
# View sync logs
docker-compose logs -f server | grep "CurrencySyncService"
```

### Database Verification
```sql
-- Check recent updates
SELECT currency_code, npr_multiplier, updated_at 
FROM countries 
WHERE currency_code != 'NPR' 
ORDER BY updated_at DESC;

-- Check sync coverage
SELECT 
  COUNT(DISTINCT currency_code) as total_currencies,
  COUNT(CASE WHEN updated_at > NOW() - INTERVAL '1 day' THEN 1 END) as recently_updated
FROM countries 
WHERE currency_code != 'NPR';
```

## Error Handling

### Common Issues
1. **API Rate Limits**: FastForex has usage limits
2. **Network Timeouts**: 10-second timeout configured
3. **Invalid Responses**: Validates API response structure
4. **Database Errors**: Handles connection and update failures

### Error Recovery
- Individual currency failures don't stop the entire sync
- Detailed error logging for troubleshooting
- Automatic retry on next scheduled run

## Deployment Notes

### Docker Setup
- Environment variables automatically passed to container
- Scheduling works in Docker environment
- Timezone set to Asia/Kathmandu in database container

### Production Considerations
- Monitor API usage limits
- Set up alerting for sync failures
- Consider backup currency data source
- Implement rate limiting for manual sync endpoint

## Files Created/Modified

### New Files
- `src/modules/currency/currency-sync.service.ts` - Main sync logic
- `src/modules/currency/currency-sync.controller.ts` - API endpoints
- `src/modules/currency/currency.module.ts` - Module configuration
- `test-currency-sync.js` - Test script

### Modified Files
- `package.json` - Added @nestjs/schedule dependency
- `src/app.module.ts` - Added CurrencyModule and ScheduleModule
- `docker-compose.yml` - Added FastForex environment variables
- `.env` - Added API key and URL

## Next Steps

1. **Test the system**: Run `node test-currency-sync.js`
2. **Monitor logs**: Check for successful scheduled runs
3. **Verify data**: Confirm currency rates are updating
4. **Set up alerts**: Monitor for sync failures in production