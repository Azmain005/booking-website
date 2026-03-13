import "dotenv/config";
import { defineConfig } from "prisma/config";

function getPrismaEngineDatasourceUrl(): string {
  // IMPORTANT:
  // - This URL is consumed by the Prisma *engine* (CLI, generate, studio, etc.)
  // - Prisma's SQLite connector expects a `file:` URL and does NOT accept `libsql://`.
  // - Runtime DB access for Turso happens via the driver adapter in `src/lib/prisma.ts`.
  return (process.env["PRISMA_DATABASE_URL"] ?? "file:./dev.db").trim();
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: getPrismaEngineDatasourceUrl(),
  },
});
