#!/usr/bin/env node
/**
 * Advanced Integration Test - Full Commission Flow
 * Tests creating employees and processing commissions with database verification
 */

const http = require('http');
const { Pool } = require('pg');

const API_BASE = 'http://localhost:3000';
const API_KEY = 'integration-test-api-key-32-chars-secure';

const pool = new Pool({
  connectionString: 'postgresql://postgres:postgres@localhost:5432/hodophile_portal'
});

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  gray: '\x1b[90m',
  cyan: '\x1b[36m'
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
    case 'test':
      console.log(`${colors.cyan}★${colors.reset} ${prefix} ${message}`);
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

async function createTestEmployee() {
  log('test', 'Creating test employee in database...');
  
  const employeeData = {
    fullName: 'Commission Test Agent',
    email: `test-agent-${Date.now()}@example.com`,
    cnicNumber: `42101-${Date.now()}-1`,
    phoneNumber: '+923001234567',
    address: '123 Test Street',
    emergencyContactName: 'Test Emergency',
    emergencyContactNumber: '+923009999999',
    designation: 'Sales Executive',
    department: 'Sales',
    joiningDate: new Date('2024-01-01').toISOString(),
    monthlySalary: 50000
  };

  try {
    // First create a User
    const userResult = await pool.query(
      `INSERT INTO "User" ("id", "email", "password", "role", "createdAt", "updatedAt")
       VALUES (gen_random_uuid(), $1, 'hashed-password-dummy', 'EMPLOYEE', NOW(), NOW())
       RETURNING id`,
      [employeeData.email]
    );

    const userId = userResult.rows[0].id;

    // Then create Employee with the userId
    const result = await pool.query(
      `INSERT INTO "Employee" (
        "id", "userId", "fullName", "cnicNumber", "email", "phoneNumber", 
        "address", "emergencyContactName", "emergencyContactNumber",
        "designation", "department", "joiningDate", "monthlySalary", "employeeId",
        "createdAt", "updatedAt"
      ) VALUES (
        gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12,
        gen_random_uuid()::text, NOW(), NOW()
      )
      RETURNING id, "fullName", email`,
      [
        userId,
        employeeData.fullName,
        employeeData.cnicNumber,
        employeeData.email,
        employeeData.phoneNumber,
        employeeData.address,
        employeeData.emergencyContactName,
        employeeData.emergencyContactNumber,
        employeeData.designation,
        employeeData.department,
        employeeData.joiningDate,
        employeeData.monthlySalary
      ]
    );

    const employee = result.rows[0];
    log('success', `Created employee: ${employee.fullName} (ID: ${employee.id})`);
    return employee;
  } catch (error) {
    log('error', `Failed to create employee: ${error.message}`);
    throw error;
  }
}

async function generateUUID() {
  const result = await pool.query("SELECT gen_random_uuid()::text as uuid");
  return result.rows[0].uuid;
}

async function testFullCommissionFlow() {
  console.log('\n' + colors.blue + '═'.repeat(60) + colors.reset);
  console.log(colors.blue + 'FULL COMMISSION FLOW TEST' + colors.reset);
  console.log(colors.blue + '═'.repeat(60) + colors.reset + '\n');

  let testsPassed = 0;
  let testsFailed = 0;

  try {
    // Create test employee
    log('info', 'Step 1: Creating test employee...');
    const employee = await createTestEmployee();
    
    // Test 1: Send commission (Tier 2)
    log('info', 'Step 2: Sending Tier 2 commission (lead worth 50000 = 1000 commission)...');
    const leadId1 = await generateUUID();
    
    const response1 = await makeRequest('POST', '/api/external/commission', {
      leadId: leadId1,
      employeeId: employee.id,
      leadWorth: 50000,
      commission: 1000,
      confirmedAt: new Date().toISOString(),
      customerName: 'Test Customer 1'
    }, {
      'Authorization': `ApiKey ${API_KEY}`
    });

    if (response1.status === 201 && response1.body.success) {
      log('success', `Test 1 PASSED - Commission recorded (status: 201)`);
      log('debug', `  Salary Record ID: ${response1.body.data.salaryRecordId}`);
      log('debug', `  Commission Amount: Rs. ${response1.body.data.commission}`);
      testsPassed++;
    } else {
      log('error', `Test 1 FAILED - Expected 201, got ${response1.status}`);
      testsFailed++;
    }

    // Test 2: Idempotency - send same commission again
    log('info', 'Step 3: Testing Idempotency - sending same commission again...');
    const response2 = await makeRequest('POST', '/api/external/commission', {
      leadId: leadId1,
      employeeId: employee.id,
      leadWorth: 50000,
      commission: 1000,
      confirmedAt: new Date().toISOString(),
      customerName: 'Test Customer 1'
    }, {
      'Authorization': `ApiKey ${API_KEY}`
    });

    if (response2.status === 200 && response2.body.success) {
      log('success', `Test 2 PASSED - Idempotent response (status: 200)`);
      log('debug', `  Message: ${response2.body.message}`);
      testsPassed++;
    } else {
      log('error', `Test 2 FAILED - Expected 200, got ${response2.status}`);
      testsFailed++;
    }

    // Test 3: Verify database - no duplicate
    log('info', 'Step 4: Verifying no duplicate in database...');
    const dbResult = await pool.query(
      `SELECT COUNT(*) as count FROM "SalaryRecord" WHERE "leadId" = $1`,
      [leadId1]
    );

    if (dbResult.rows[0].count === 1) {
      log('success', `Test 3 PASSED - Only 1 salary record exists (idempotency working)`);
      testsPassed++;
    } else {
      log('error', `Test 3 FAILED - Expected 1 record, found ${dbResult.rows[0].count}`);
      testsFailed++;
    }

    // Test 4: Add another commission (Tier 1)
    log('info', 'Step 5: Adding Tier 1 commission (lead worth 20000 = 500 commission)...');
    const leadId2 = await generateUUID();

    const response4 = await makeRequest('POST', '/api/external/commission', {
      leadId: leadId2,
      employeeId: employee.id,
      leadWorth: 20000,
      commission: 500,
      confirmedAt: new Date().toISOString(),
      customerName: 'Test Customer 2'
    }, {
      'Authorization': `ApiKey ${API_KEY}`
    });

    if (response4.status === 201 && response4.body.success) {
      log('success', `Test 4 PASSED - Second commission recorded`);
      log('debug', `  Commission Amount: Rs. ${response4.body.data.commission}`);
      log('debug', `  Total Monthly Commission: Rs. ${response4.body.data.totalMonthlyCommission}`);
      testsPassed++;
    } else {
      log('error', `Test 4 FAILED - Expected 201, got ${response4.status}`);
      testsFailed++;
    }

    // Test 5: Verify commission accumulation
    log('info', 'Step 6: Verifying commission accumulation in database...');
    const dbResult2 = await pool.query(
      `SELECT SUM(commission) as total, COUNT(*) as count 
       FROM "SalaryRecord" WHERE "employeeId" = $1`,
      [employee.id]
    );

    const totalCommission = parseInt(dbResult2.rows[0].total) || 0;
    const recordCount = dbResult2.rows[0].count;

    if (totalCommission === 1500 && recordCount === 1) {
      log('success', `Test 5 PASSED - Commissions accumulated correctly`);
      log('debug', `  Total Commission: Rs. ${totalCommission}`);
      log('debug', `  Number of Salary Records: ${recordCount}`);
      testsPassed++;
    } else {
      log('error', `Test 5 FAILED - Expected Rs. 1500 total, got Rs. ${totalCommission}`);
      log('debug', `  Salary Records: ${recordCount}`);
      testsFailed++;
    }

    // Test 6: Verify salary record structure
    log('info', 'Step 7: Verifying salary record structure...');
    const dbResult3 = await pool.query(
      `SELECT id, "employeeId", "leadId", commission, month, status 
       FROM "SalaryRecord" WHERE "employeeId" = $1 LIMIT 1`,
      [employee.id]
    );

    if (dbResult3.rows.length > 0) {
      const record = dbResult3.rows[0];
      if (record.leadId && record.commission && record.month && record.status) {
        log('success', `Test 6 PASSED - Salary record has all required fields`);
        log('debug', `  Status: ${record.status}`);
        log('debug', `  Month: ${new Date(record.month).toLocaleDateString()}`);
        log('debug', `  Total Commission in Record: Rs. ${record.commission}`);
        testsPassed++;
      } else {
        log('error', `Test 6 FAILED - Missing fields in salary record`);
        testsFailed++;
      }
    } else {
      log('error', `Test 6 FAILED - No salary record found`);
      testsFailed++;
    }

  } catch (error) {
    log('error', `Test Error: ${error.message}`);
    testsFailed++;
  }

  // Summary
  console.log('\n' + colors.blue + '═'.repeat(60) + colors.reset);
  console.log(colors.blue + 'FULL FLOW TEST SUMMARY' + colors.reset);
  console.log(colors.blue + '═'.repeat(60) + colors.reset);
  console.log(`${colors.green}Passed: ${testsPassed}${colors.reset}`);
  console.log(`${colors.red}Failed: ${testsFailed}${colors.reset}`);
  console.log(`Total: ${testsPassed + testsFailed}\n`);

  if (testsFailed === 0) {
    log('success', 'All full flow tests passed! Commission integration is fully operational.');
    return true;
  } else {
    log('error', `${testsFailed} tests failed.`);
    return false;
  }
}

// Run tests
(async () => {
  try {
    log('info', 'Connecting to database...');
    await pool.connect();
    log('success', 'Connected to PostgreSQL database');

    const success = await testFullCommissionFlow();
    
    await pool.end();
    process.exit(success ? 0 : 1);
  } catch (error) {
    log('error', `Fatal error: ${error.message}`);
    process.exit(1);
  }
})();
