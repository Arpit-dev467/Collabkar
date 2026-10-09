import { db } from './src/db/db.js';

try {
  await db.execute('SELECT 1');
  console.log('Successfully connected to the database!');
} catch (error) {
  console.error('Neon database connection failed:', error?.message || 'Unknown connection error.');
}