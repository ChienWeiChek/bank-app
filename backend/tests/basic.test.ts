import { assertEquals } from "https://deno.land/std@0.208.0/assert/mod.ts";
import { config } from "../src/config/environment.ts";
import { checkDatabaseHealth } from "../src/config/database.ts";

Deno.test("Database connection", async () => {
  const isHealthy = await checkDatabaseHealth();
  assertEquals(isHealthy, true, "Database should be connected and healthy");
});

Deno.test("Environment configuration", () => {
  assertEquals(typeof config.port, "number", "Port should be a number");
  assertEquals(config.port > 0, true, "Port should be positive");
  assertEquals(typeof config.databaseUrl, "string", "Database URL should be a string");
  assertEquals(config.databaseUrl.includes("postgresql"), true, "Database URL should be PostgreSQL");
});

Deno.test("JWT configuration", () => {
  assertEquals(typeof config.jwtSecret, "string", "JWT secret should be a string");
  assertEquals(config.jwtSecret.length > 0, true, "JWT secret should not be empty");
  assertEquals(typeof config.jwtRefreshSecret, "string", "JWT refresh secret should be a string");
  assertEquals(config.jwtRefreshSecret.length > 0, true, "JWT refresh secret should not be empty");
});
