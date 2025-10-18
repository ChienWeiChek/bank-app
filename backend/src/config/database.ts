import { Pool } from "postgres";
import { config } from "./environment.ts";

// Create database connection pool
export const pool = new Pool(config.databaseUrl, 3, true);

// Database connection helper
export async function connectToDatabase() {
  try {
    const client = await pool.connect();
    console.log("✅ Connected to PostgreSQL database");
    client.release();
    return true;
  } catch (error) {
    console.error("❌ Failed to connect to database:", error.message);
    return false;
  }
}

// Database query helper
export async function query<T = any>(
  sql: string,
  params: any[] = []
): Promise<{ rows: T[]; rowCount: number }> {
  const client = await pool.connect();
  try {
    const result = await client.queryObject<T>(sql, ...params);
    return {
      rows: result.rows || [],
      rowCount: result.rowCount || 0,
    };
  } finally {
    client.release();
  }
}

// Health check
export async function checkDatabaseHealth(): Promise<boolean> {
  try {
    const result = await query("SELECT 1 as health");
    return result.rows.length > 0;
  } catch {
    return false;
  }
}
