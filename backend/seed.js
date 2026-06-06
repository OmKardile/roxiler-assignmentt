require('dotenv').config();
const bcrypt = require('bcryptjs');
const db = require('./src/config/db');

async function seed() {
  const hash = await bcrypt.hash('Admin@123', 10);
  try {
    await db.query(
      'INSERT IGNORE INTO users (name, email, password, address, role) VALUES (?, ?, ?, ?, ?)',
      ['System Administrator Account', 'admin@storerating.com', hash, 'Admin HQ, Mumbai, Maharashtra', 'admin']
    );
    console.log('Admin seeded — Login: admin@storerating.com / Admin@123');
  } catch (err) {
    console.error(err.message);
  }
  process.exit(0);
}

seed();