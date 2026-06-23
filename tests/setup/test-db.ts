import { Database } from 'sqlite-async';

/**
 * Creates a fresh in-memory DB for each test.
 */
export async function createTestDb() {
    const db = await Database.open(':memory:');

    // Create schema
    await db.exec(`
    CREATE TABLE users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE
    );
  `);

    return db;
}
