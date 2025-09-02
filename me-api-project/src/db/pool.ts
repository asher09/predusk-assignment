import { Pool } from 'pg';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

// Path to the Aiven CA certificate
const caPath = path.join(__dirname, 'ca.pem');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // SSL configuration to trust the Aiven CA
  ssl: {
    rejectUnauthorized: true,
    ca: fs.readFileSync(caPath).toString(),
  },
});

export default pool;
