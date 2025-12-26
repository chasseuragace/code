#!/usr/bin/env node

const axios = require('axios');

async function testCurrencySync() {
  const baseUrl = 'http://localhost:3000';
  
  console.log('🧪 Testing Currency Sync System...\n');

  try {
    // Test 1: Check API connection
    console.log('1️⃣ Testing FastForex API connection...');
    const connectionTest = await axios.get(`${baseUrl}/currency-sync/test-connection`);
    console.log(`✅ API Connection: ${connectionTest.data.message}\n`);

    // Test 2: Manual sync trigger
    console.log('2️⃣ Triggering manual currency sync...');
    const syncResult = await axios.post(`${baseUrl}/currency-sync/sync`);
    console.log(`✅ Sync Result: ${syncResult.data.message}`);
    console.log(`   - Updated: ${syncResult.data.updated} records`);
    console.log(`   - Errors: ${syncResult.data.errors.length}`);
    if (syncResult.data.errors.length > 0) {
      console.log(`   - Error details: ${syncResult.data.errors.join(', ')}`);
    }
    console.log('');

    // Test 3: Check updated rates
    console.log('3️⃣ Checking updated currency rates...');
    const countriesResult = await axios.get(`${baseUrl}/countries`);
    const countries = countriesResult.data;
    
    console.log('Sample updated rates:');
    const sampleCurrencies = ['USD', 'EUR', 'AED', 'SAR', 'INR'];
    sampleCurrencies.forEach(currency => {
      const country = countries.find(c => c.currency_code === currency);
      if (country) {
        console.log(`   - ${currency}: 1 NPR = ${(1/parseFloat(country.npr_multiplier)).toFixed(4)} ${currency}`);
      }
    });

    console.log('\n🎉 All tests completed successfully!');
    console.log('\n📅 Scheduled sync: Every 12 hours (0 */12 * * *)');
    console.log('🔧 Manual sync: POST /currency-sync/sync');
    console.log('🔍 Test connection: GET /currency-sync/test-connection');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    process.exit(1);
  }
}

testCurrencySync();