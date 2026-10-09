import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

pool.connect()
  .then(() => {
    console.log('Successfully connected to the database!');
    pool.end();
  })
  .catch(err => {
    console.error('Connection failed:', err);
    pool.end();
  });