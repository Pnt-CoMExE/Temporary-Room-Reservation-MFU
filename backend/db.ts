import { Pool } from "pg";
import dotenv from "dotenv";
dotenv.config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT || "5432"),
  // Connection pool optimizations
  max: 20,                          // Maximum connections in pool
  idleTimeoutMillis: 30000,         // Close idle connections after 30s
  connectionTimeoutMillis: 5000,    // Timeout after 5s if can't connect
  allowExitOnIdle: false,          // Keep pool alive between requests
});

pool.on("error", (err: Error) => {
  console.error("❌ Unexpected error on idle PostgreSQL client", err.message);
  // Don't crash the process — let it try to reconnect
});

// Health check helper
export const checkDatabaseConnection = async (): Promise<boolean> => {
  try {
    await pool.query("SELECT 1");
    return true;
  } catch {
    return false;
  }
};

export const query = (text: string, params?: any[]) => pool.query(text, params);
export { pool };
