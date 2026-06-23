import { Database } from 'sqlite-async';
import path from 'path';
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, '../../data/app.db');
export const instance = await Database.open(dbPath);