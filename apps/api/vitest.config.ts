import { defineConfig } from "vitest/config";

process.env.DATABASE_URL ??=
  "postgresql://postgres:postgres@localhost:5432/aisaf?schema=public";
process.env.JWT_SECRET ??= "test-only-jwt-secret-min-32-characters!!";
process.env.NODE_ENV ??= "test";

export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
  },
});
