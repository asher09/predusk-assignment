import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();

let connectionString = process.env.DATABASE_URL;

// Append sslmode=require if it's not already in the connection string
if (connectionString && !/sslmode=/.test(connectionString)) {
  connectionString += "?sslmode=require";
}

const pool = new Pool({
  connectionString: connectionString,
  ssl: {
    rejectUnauthorized: false,
  },
});

export default pool;
