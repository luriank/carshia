import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  // CLI (migrate / seed) uses the direct, non-pooled connection.
  // The runtime PrismaClient adapter uses the pooled DATABASE_URL (lib/prisma.ts).
  datasource: {
    url: env("DIRECT_URL"),
  },
});
