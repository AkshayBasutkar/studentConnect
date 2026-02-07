import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@shared/schema";

const { Pool } = pg;

const DATABASE_URL =
  "postgresql://postgres:Baskar@localhost:5432/proctorStudent";

export const pool = new Pool({
  connectionString: DATABASE_URL
});
export const db = drizzle(pool, { schema });
