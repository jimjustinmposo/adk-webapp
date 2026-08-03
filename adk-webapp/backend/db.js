const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Railway's Postgres needs SSL when reached over the public proxy URL,
  // and is fine without it on the internal network. This works for both.
  ssl: process.env.DATABASE_URL && process.env.DATABASE_URL.includes('railway.internal')
    ? false
    : { rejectUnauthorized: false }
});

module.exports = pool;
