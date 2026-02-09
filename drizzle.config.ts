import { defineConfig } from "drizzle-kit";
import * as dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();


const DATABASE_URL="postgresql://postgres:Basutkar@localhost:5432/proctorStudent"
// if (!process.env.DATABASE_URL) {
//   throw new Error("DATABASE_URL is missing in .env file");
// }

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: DATABASE_URL,
  },
});