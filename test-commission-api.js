#!/usr/bin/env node
/**
 * Integration Test Script
 * Tests the commission endpoint without needing manual curl commands
 */

const http = require('http');

const API_BASE = 'http://localhost:3000';
const API_KEY = 'integration-test-api-key-32-chars-secure';
const EMPLOYEE_PORTAL_DB = 'postgresql://postgres:postgres@localhost:5432/hodophile_portal';

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  gray: '\x1b[90m'
};

function log(level, message) {
  const timestamp = new Date().toISOString().split('T')[1].split('Z')[0];
  const prefix = `[${timestamp}]`;
  
  switch (level) {
    case 'success':
      console.log(`${colors.green}✓${colors.reset} ${prefix} ${message}`);
      break;
    case 'error':
      console.log(`${colors.red}✗${colors.reset} ${prefix} ${message}`);
      break;
    case 'info':
      console.log(`${colors.blue}ℹ${colors.reset} ${prefix} ${message}`);
      break;
    case 'warn':
      console.log(`${colors.yellow}⚠${colors.reset} ${prefix} ${message}`);
      break;
    case 'debug':
      console.log(`${colors.gray}◆${colors.reset} ${prefix} ${message}`);
      break;
  }
}

function makeRequest(method, path, body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, API_BASE);
    const options = {
      hostname: url.hostname,
      port: url.port || 3000,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      },
      timeout: 5000
    };

    log('debug', `${method} ${path}`);

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const parsed = data ? JSON.parse(data) : {};
          resolve({ status: res.statusCode, headers: res.headers, body: parsed, raw: data });
        } catch (e) {
          resolve({ status: res.statusCode, headers: res.headers, body: {}, raw: data });
        }
      });
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function testCommissionEndpoint() {
  console.log('\n' + colors.blue + '═'.repeat(60) + colors.reset);
  console.log(colors.blue + 'COMMISSION ENDPOINT INTEGRATION TESTS' + colors.reset);
  console.log(colors.blue + '═'.repeat(60) + colors.reset + '\n');

  let testsPassed = 0;
  let testsFailed = 0;

  // Test 1: Missing API Key
  try {
    log('info', 'Test 1: Missing API Key (should return 401)');
    const response = await makeRequest('POST', '/api/external/commission', {
      leadId: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
      employeeId: 'emp-001',
      leadWorth: 30000,
      commission: 1000,
      confirmedAt: new Date().toISOString()
    });

    if (response.status === 401) {
      log('success', `Test 1 PASSED - Got 401 Unauthorized as expected`);
      testsPassed++;
    } else {
      log('error', `Test 1 FAILED - Expected 401, got ${response.status}`);
      testsFailed++;
    }
  } catch (error) {
    log('error', `Test 1 ERROR - ${error.message}`);
    testsFailed++;
  }

  // Test 2: Invalid API Key
  try {
    log('info', 'Test 2: Invalid API Key (should return 401)');
    const response = await makeRequest('POST', '/api/external/commission', {
      leadId: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
      employeeId: 'emp-001',
      leadWorth: 30000,
      commission: 1000,
      confirmedAt: new Date().toISOString()
    }, {
      'Authorization': 'ApiKey wrong-key'
    });

    if (response.status === 401) {
      log('success', `Test 2 PASSED - Got 401 Unauthorized as expected`);
      testsPassed++;
    } else {
      log('error', `Test 2 FAILED - Expected 401, got ${response.status}`);
      testsFailed++;
    }
  } catch (error) {
    log('error', `Test 2 ERROR - ${error.message}`);
    testsFailed++;
  }

  // Test 3: Valid API Key but Employee Not Found
  try {
    log('info', 'Test 3: Valid API Key but Employee Not Found (should return 404)');
    const response = await makeRequest('POST', '/api/external/commission', {
      leadId: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
      employeeId: 'non-existent-employee-id',
      leadWorth: 30000,
      commission: 1000,
      confirmedAt: new Date().toISOString()
    }, {
      'Authorization': `ApiKey ${API_KEY}`
    });

    if (response.status === 404) {
      log('success', `Test 3 PASSED - Got 404 Employee Not Found as expected`);
      testsPassed++;
    } else {
      log('error', `Test 3 FAILED - Expected 404, got ${response.status}`);
      testsFailed++;
    }
  } catch (error) {
    log('error', `Test 3 ERROR - ${error.message}`);
    testsFailed++;
  }

  // Test 4: Missing Required Fields
  try {
    log('info', 'Test 4: Missing Required Fields (should return 400)');
    const response = await makeRequest('POST', '/api/external/commission', {
      leadId: 'f47ac10b-58cc-4372-a567-0e02b2c3d479'
      // Missing employeeId, leadWorth, commission, confirmedAt
    }, {
      'Authorization': `ApiKey ${API_KEY}`
    });

    if (response.status === 400) {
      log('success', `Test 4 PASSED - Got 400 Validation Error as expected`);
      log('debug', `  Error details: ${response.body.message || 'N/A'}`);
      testsPassed++;
    } else {
      log('error', `Test 4 FAILED - Expected 400, got ${response.status}`);
      testsFailed++;
    }
  } catch (error) {
    log('error', `Test 4 ERROR - ${error.message}`);
    testsFailed++;
  }

  // Test 5: Invalid UUID format
  try {
    log('info', 'Test 5: Invalid UUID format for leadId (should return 400)');
    const response = await makeRequest('POST', '/api/external/commission', {
      leadId: 'not-a-valid-uuid',
      employeeId: 'emp-001',
      leadWorth: 30000,
      commission: 1000,
      confirmedAt: new Date().toISOString()
    }, {
      'Authorization': `ApiKey ${API_KEY}`
    });

    if (response.status === 400) {
      log('success', `Test 5 PASSED - Got 400 Validation Error as expected`);
      testsPassed++;
    } else {
      log('error', `Test 5 FAILED - Expected 400, got ${response.status}`);
      testsFailed++;
    }
  } catch (error) {
    log('error', `Test 5 ERROR - ${error.message}`);
    testsFailed++;
  }

  // Test 6: Negative lead worth (should fail validation)
  try {
    log('info', 'Test 6: Negative lead worth (should return 400)');
    const response = await makeRequest('POST', '/api/external/commission', {
      leadId: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
      employeeId: 'emp-001',
      leadWorth: -30000,
      commission: 1000,
      confirmedAt: new Date().toISOString()
    }, {
      'Authorization': `ApiKey ${API_KEY}`
    });

    if (response.status === 400) {
      log('success', `Test 6 PASSED - Got 400 Validation Error as expected`);
      testsPassed++;
    } else {
      log('error', `Test 6 FAILED - Expected 400, got ${response.status}`);
      testsFailed++;
    }
  } catch (error) {
    log('error', `Test 6 ERROR - ${error.message}`);
    testsFailed++;
  }

  // Test 7: Invalid datetime format
  try {
    log('info', 'Test 7: Invalid datetime format (should return 400)');
    const response = await makeRequest('POST', '/api/external/commission', {
      leadId: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
      employeeId: 'emp-001',
      leadWorth: 30000,
      commission: 1000,
      confirmedAt: 'not-a-valid-date'
    }, {
      'Authorization': `ApiKey ${API_KEY}`
    });

    if (response.status === 400) {
      log('success', `Test 7 PASSED - Got 400 Validation Error as expected`);
      testsPassed++;
    } else {
      log('error', `Test 7 FAILED - Expected 400, got ${response.status}`);
      testsFailed++;
    }
  } catch (error) {
    log('error', `Test 7 ERROR - ${error.message}`);
    testsFailed++;
  }

  // Summary
  console.log('\n' + colors.blue + '═'.repeat(60) + colors.reset);
  console.log(colors.blue + 'TEST SUMMARY' + colors.reset);
  console.log(colors.blue + '═'.repeat(60) + colors.reset);
  console.log(`${colors.green}Passed: ${testsPassed}${colors.reset}`);
  console.log(`${colors.red}Failed: ${testsFailed}${colors.reset}`);
  console.log(`Total: ${testsPassed + testsFailed}\n`);

  if (testsFailed === 0) {
    log('success', 'All tests passed! Integration is working correctly.');
    process.exit(0);
  } else {
    log('error', `${testsFailed} tests failed. Please review the errors above.`);
    process.exit(1);
  }
}

// Check if Employee Portal is running
(async () => {
  try {
    log('info', 'Checking if Employee Portal is running...');
    const response = await makeRequest('GET', '/api/admin/employees');
    log('success', 'Employee Portal is running on http://localhost:3000');
    await testCommissionEndpoint();
  } catch (error) {
    log('error', `Cannot connect to Employee Portal: ${error.message}`);
    log('warn', 'Please start Employee Portal with: npm run dev');
    process.exit(1);
  }
})();
