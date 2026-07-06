/**
 * Creates game tables in Supabase.
 *
 * Usage:
 *   1. Add DATABASE_URL to .env (from Supabase Dashboard → Settings → Database → URI)
 *   2. Run: npm run db:setup
 */
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import pg from "pg";

const __dirname = dirname(fileURLToPath(import.meta.url));

function loadEnv() {
  try {
    const envPath = join(__dirname, "..", ".env");
    const content = readFileSync(envPath, "utf8");
    for (const line of content.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq);
      const val = trimmed.slice(eq + 1);
      if (!process.env[key]) process.env[key] = val;
    }
  } catch {
    // .env optional if DATABASE_URL set in shell
  }
}

loadEnv();

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error("Missing DATABASE_URL in .env");
  console.error("Get it from: Supabase Dashboard → Settings → Database → Connection string → URI");
  console.error("Or paste supabase/game-tables.sql into the Supabase SQL Editor manually.");
  process.exit(1);
}

const sql = readFileSync(join(__dirname, "..", "supabase", "game-tables.sql"), "utf8");

const client = new pg.Client({ connectionString: databaseUrl, ssl: { rejectUnauthorized: false } });

try {
  await client.connect();
  await client.query(sql);
  console.log("✓ Game tables created successfully!");
} catch (err) {
  console.error("Setup failed:", err.message);
  process.exit(1);
} finally {
  await client.end();
}
