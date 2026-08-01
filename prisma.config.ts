import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "npx tsx prisma/seed.ts",
  },
  datasource: {
    // Prisma CLI (untuk migrasi/seed) membutuhkan koneksi langsung (Direct URL)
    url: env("DIRECT_URL"),
  },
});
