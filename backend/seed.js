const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');
require('dotenv').config();

async function seed() {
  const db = await mysql.createConnection({
    host:     process.env.DB_HOST,
    user:     process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });

  console.log('Connected. Clearing tables...');
  await db.query('SET FOREIGN_KEY_CHECKS = 0');
  await db.query('TRUNCATE TABLE ratings');
  await db.query('TRUNCATE TABLE stores');
  await db.query('TRUNCATE TABLE users');
  await db.query('SET FOREIGN_KEY_CHECKS = 1');

  const adminHash  = await bcrypt.hash('Admin@123',  10);
  const userHash   = await bcrypt.hash('User@1234',  10);
  const ownerHash  = await bcrypt.hash('Owner@123',  10);

  // ── USERS ──────────────────────────────────────────────────────────
  const users = [
    ['System Administrator User One',  'admin@storeapp.com',   adminHash, '123 Admin Street City Hall Block',    'admin'],
    ['Normal User One Account Here',   'user1@example.com',    userHash,  '45 User Lane Andheri Mumbai',         'user'],
    ['Normal User Two Account Here',   'user2@example.com',    userHash,  '67 User Road Kothrud Pune',           'user'],
    ['Store Owner One Business Here',  'owner1@example.com',   ownerHash, '89 Owner Blvd Lajpat Nagar Delhi',   'store_owner'],
    ['Store Owner Two Business Here',  'owner2@example.com',   ownerHash, '12 Market Street Indiranagar Blr',   'store_owner'],
  ];
  for (const u of users) {
    await db.query(
      'INSERT INTO users (name, email, password, address, role) VALUES (?, ?, ?, ?, ?)', u
    );
  }

  // ── STORES ─────────────────────────────────────────────────────────
  // owner_id 4 = owner1, 5 = owner2
  const stores = [
    ['Best Electronics Store One',  'store1@storeapp.com', 'Shop 1 MG Road Connaught Place Delhi',  4],
    ['Fresh Grocery Market Two',    'store2@storeapp.com', 'Shop 5 FC Road Shivajinagar Pune',      5],
    ['Tech Gadgets World Store',    'store3@storeapp.com', 'Shop 3 Linking Road Bandra Mumbai',   null],
  ];
  for (const s of stores) {
    await db.query(
      'INSERT INTO stores (name, email, address, owner_id) VALUES (?, ?, ?, ?)', s
    );
  }

  // ── RATINGS ────────────────────────────────────────────────────────
  // user1(id=2) rates store1 & store2; user2(id=3) rates store1 & store3
  const ratings = [
    [2, 1, 4],
    [2, 2, 3],
    [3, 1, 5],
    [3, 3, 2],
  ];
  for (const r of ratings) {
    await db.query(
      'INSERT INTO ratings (user_id, store_id, rating) VALUES (?, ?, ?)', r
    );
  }

  console.log('\n✅ Seed complete!\n');
  console.log('─────────────────────────────────────────');
  console.log(' Role          Email                  Password');
  console.log('─────────────────────────────────────────');
  console.log(' Admin         admin@storeapp.com     Admin@123');
  console.log(' User 1        user1@example.com      User@1234');
  console.log(' User 2        user2@example.com      User@1234');
  console.log(' Store Owner 1 owner1@example.com     Owner@123');
  console.log(' Store Owner 2 owner2@example.com     Owner@123');
  console.log('─────────────────────────────────────────');

  await db.end();
}

seed().catch(err => { console.error(err); process.exit(1); });