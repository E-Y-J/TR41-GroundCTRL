/**
 * Quick test to verify leaderboard backend endpoint is working
 * Run this with: node test-leaderboard.js
 */

const http = require('http');
const https = require('https');

// Test configuration
const BASE_URL = process.env.VITE_API_BASE_URL || 'http://localhost:3001/api/v1';
const TEST_TOKEN = process.env.TEST_TOKEN || 'your-test-token-here';

/**
 * Make HTTP request
 */
function makeRequest(url, token) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const client = urlObj.protocol === 'https:' ? https : http;
    
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || (urlObj.protocol === 'https:' ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    };

    const req = client.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: JSON.parse(data)
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: data
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.end();
  });
}

/**
 * Test leaderboard endpoint
 */
async function testLeaderboard() {
  console.log('🚀 Testing Leaderboard Backend Integration\n');
  console.log(`📡 Target URL: ${BASE_URL}/leaderboard/global`);
  console.log('⏳ Making request...\n');

  try {
    const response = await makeRequest(
      `${BASE_URL}/leaderboard/global?period=all-time&limit=10&includeUser=true`,
      TEST_TOKEN
    );

    console.log(`✅ Status Code: ${response.status}`);
    console.log(`📦 Response:\n${JSON.stringify(response.data, null, 2)}`);

    if (response.status === 200) {
      console.log('\n✅ SUCCESS: Leaderboard endpoint is working!');
      
      if (response.data.payload) {
        const { operators, topThree, userRank } = response.data.payload;
        console.log(`\n📊 Stats:`);
        console.log(`   - Total operators: ${operators?.length || 0}`);
        console.log(`   - Top 3 loaded: ${topThree?.length || 0}`);
        console.log(`   - User rank included: ${userRank ? 'Yes' : 'No'}`);
      }
    } else if (response.status === 401) {
      console.log('\n⚠️  Authentication required. Please set TEST_TOKEN environment variable.');
      console.log('   You can get a token by logging into the app and checking the network tab.');
    } else if (response.status === 404) {
      console.log('\n❌ Endpoint not found. Check that the backend routes are properly registered.');
    } else {
      console.log(`\n⚠️  Unexpected status code: ${response.status}`);
    }

  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.log(`\n❌ ERROR: Cannot connect to backend at ${BASE_URL}`);
      console.log('   Make sure the backend is running:');
      console.log('   cd backend && npm run dev');
    } else {
      console.log(`\n❌ ERROR: ${error.message}`);
      console.log(error);
    }
  }
}

// Run test
testLeaderboard();
