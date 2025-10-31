const axios = require('axios');
require('dotenv').config({ path: '.env.backend' });

async function testOpenChargeMapAPI() {
  try {
    console.log('Testing Open Charge Map API...');
    console.log('API Key:', process.env.OPEN_CHARGE_MAP_API_KEY ? 'Loaded ✓' : 'Missing ✗');
    
    const response = await axios.get('https://api.openchargemap.io/v3/poi/', {
      params: {
        key: process.env.OPEN_CHARGE_MAP_API_KEY,
        latitude: 12.8355,
        longitude: 80.2244,
        distance: 10,
        distanceunit: 'km',
        maxresults: 5,
        compact: true,
        verbose: false
      }
    });
    
    console.log('✅ API Test Successful!');
    console.log(`Found ${response.data.length} stations near Chennai`);
    
    if (response.data.length > 0) {
      const station = response.data[0];
      console.log('\nSample Station:');
      console.log(`Name: ${station.AddressInfo?.Title || 'Unknown'}`);
      console.log(`Address: ${station.AddressInfo?.AddressLine1 || 'N/A'}`);
      console.log(`Status: ${station.StatusType?.IsOperational ? 'Operational' : 'Out of Order'}`);
      console.log(`Connections: ${station.Connections?.length || 0}`);
    }
    
  } catch (error) {
    console.error('❌ API Test Failed:', error.response?.data || error.message);
  }
}

testOpenChargeMapAPI();
