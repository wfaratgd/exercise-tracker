import { createDbUtils } from "@/db/db-utils.js";
import { instance } from "@/db/db.js";

export async function initDatabase() {
    await instance.exec(`
        CREATE TABLE IF NOT EXISTS users (
                                             id INTEGER PRIMARY KEY AUTOINCREMENT,
                                             username TEXT NOT NULL UNIQUE
        );
    `);

    // 2. ADD THIS: Create the exercises table with a relation to the users table
    await instance.exec(`
    CREATE TABLE IF NOT EXISTS exercises (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      description TEXT NOT NULL,
      duration INTEGER NOT NULL,
      date TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

    console.log("All database tables (users & exercises) initialized successfully.");
}

const db = createDbUtils(instance);
export { db };