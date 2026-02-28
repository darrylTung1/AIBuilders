#!/usr/bin/env node
/**
 * Run database migrations (when DATABASE_URL is set) then start the Next.js server.
 * Used on Zeabur so the database is set up automatically on deploy.
 */
const { spawnSync, spawn } = require("child_process");
const path = require("path");

const hasDb = !!process.env.DATABASE_URL;

if (hasDb) {
  console.log("Running database migrations...");
  const result = spawnSync(
    "npx",
    ["drizzle-kit", "migrate"],
    {
      stdio: "inherit",
      shell: true,
      cwd: path.resolve(__dirname, ".."),
      env: process.env,
    }
  );
  if (result.status !== 0) {
    console.warn("Migration failed or already up to date. Starting server anyway.");
  } else {
    console.log("Migrations complete.");
  }
} else {
  console.warn("DATABASE_URL not set. Skipping migrations. Set DATABASE_URL on Zeabur (add PostgreSQL service) to enable the database.");
}

console.log("Starting Next.js...");
const next = spawn("npm", ["run", "start:next"], {
  stdio: "inherit",
  shell: true,
  cwd: path.resolve(__dirname, ".."),
  env: process.env,
});
next.on("close", (code) => process.exit(code ?? 0));
