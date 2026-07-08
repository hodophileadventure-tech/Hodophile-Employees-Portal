const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://postgres:postgres@localhost:5432/hodophile_portal'
});

async function run() {
  try {
    console.log('Querying Sales employees and altamash@hodophile.pk...');
    const res = await pool.query(`SELECT "fullName", email, "employeeId", "department" FROM "Employee" WHERE "department" ILIKE '%Sales%' OR email=$1 ORDER BY "fullName"`, ['altamash@hodophile.pk']);
    console.log(JSON.stringify(res.rows, null, 2));
  } catch (err) {
    console.error('ERROR', err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

run();
