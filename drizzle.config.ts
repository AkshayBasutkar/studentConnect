import { defineConfig } from "drizzle-kit";
import * as dotenv from "dotenv";

dotenv.config();

// 1. Define the URL in the outer scope
const databaseUrl = process.env.DATABASE_URL || "postgresql://postgres:Basutkar@localhost:5432/proctorStudent";

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: databaseUrl, // 2. Use the variable we just created
  },
});