const { Pool } = require('pg');

const portalUrl = process.env.PORTAL_DB;
const leadUrl = process.env.LEAD_DB;

if (!portalUrl || !leadUrl) {
  console.error('PORTAL_DB and LEAD_DB environment variables are required');
  process.exit(2);
}

const portalPool = new Pool({ connectionString: portalUrl });
const leadPool = new Pool({ connectionString: leadUrl });

async function fetchPortal() {
  const q = `SELECT "fullName", email, "employeeId", "department" FROM "Employee" WHERE "department" ILIKE '%Sales%' OR email ILIKE '%altamash%' ORDER BY email`;
  const r = await portalPool.query(q);
  return r.rows;
}

async function fetchLead() {
  const q = `SELECT id, email, role FROM users WHERE role ILIKE '%agent%' OR role ILIKE '%sales%' OR email ILIKE '%altamash%' ORDER BY email`;
  const r = await leadPool.query(q);
  return r.rows;
}

function toEmailSet(rows, field='email'){
  const s = new Set();
  rows.forEach(r=>{ if(r[field]) s.add(r[field].toLowerCase()); });
  return s;
}

(async ()=>{
  try{
    console.log('Connecting to both databases...');
    const [portalRows, leadRows] = await Promise.all([fetchPortal(), fetchLead()]);

    console.log('\nEmployee Portal Sales Employees:');
    console.log(JSON.stringify(portalRows, null, 2));

    console.log('\nLead Manager Sales Agents:');
    console.log(JSON.stringify(leadRows, null, 2));

    const portalEmails = toEmailSet(portalRows);
    const leadEmails = toEmailSet(leadRows);

    const inLeadNotPortal = [...leadEmails].filter(e=>!portalEmails.has(e));
    const inPortalNotLead = [...portalEmails].filter(e=>!leadEmails.has(e));

    console.log('\nEmails present in Lead Manager but NOT in Employee Portal:');
    console.log(inLeadNotPortal);

    console.log('\nEmails present in Employee Portal but NOT in Lead Manager:');
    console.log(inPortalNotLead);

    const intersection = [...leadEmails].filter(e=>portalEmails.has(e));
    console.log('\nIntersection (present in both):');
    console.log(intersection);

    if (portalEmails.has('altamash@hodophile.pk')){
      console.log('\naltamash@hodophile.pk FOUND in Employee Portal');
    } else {
      console.log('\naltamash@hodophile.pk NOT FOUND in Employee Portal');
    }

    if (leadEmails.has('altamash@hodophile.pk')){
      console.log('altamash@hodophile.pk FOUND in Lead Manager');
    } else {
      console.log('altamash@hodophile.pk NOT FOUND in Lead Manager');
    }

  }catch(err){
    console.error('ERROR', err.message);
    process.exit(1);
  }finally{
    await portalPool.end();
    await leadPool.end();
  }
})();
