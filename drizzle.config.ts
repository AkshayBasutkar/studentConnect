import { defineConfig } from "drizzle-kit";

const DATABASE_URL =
  "postgresql://postgres:Bukar@localhost:5432/proctorStudent";

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: DATABASE_URL,
  },
});
