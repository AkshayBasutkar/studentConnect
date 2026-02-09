import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@shared/schema";


// if (!process.env.DATABASE_URL) {
//   throw new Error("DATABASE_URL must be set. Did you forget to provision a database?");
// }
const DATABASE_URL="postgresql://postgres:Basutkar@localhost:5432/proctorStudent"

const { Pool } = pg;

// Check if the environment variable exists to prevent runtime errors


export const pool = new Pool({
  connectionString: DATABASE_URL,
});

export const db = drizzle(pool, { schema });