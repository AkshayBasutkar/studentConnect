import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@shared/schema";

// 1. Use the environment variable OR the local fallback
const connectionString = process.env.DATABASE_URL || "postgresql://postgres:Basutkar@localhost:5432/proctorStudent";

if (!connectionString) {
  throw new Error("DATABASE_URL is missing and no fallback provided");
}

const { Pool } = pg;

export const pool = new Pool({
  connectionString,
});

export const db = drizzle(pool, { schema });