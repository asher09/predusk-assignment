
import fs from 'fs';
import path from 'path';
import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const runSchema = async () => {
  let pool;
  try {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false,
      },
    });

    console.log('Connecting to the database (SSL validation disabled)...');
    const client = await pool.connect();
    console.log('Connected successfully!');

    const schemaPath = path.join(__dirname, 'schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf-8');

    console.log('Executing schema.sql...');
    await client.query(schemaSql);
    console.log('Schema created successfully!');

    client.release();
  } catch (error) {
    console.error('Error running schema:', error);
    process.exit(1);
  } finally {
    if (pool) {
      await pool.end();
      console.log('Database connection closed.');
    }
  }
};

runSchema();
