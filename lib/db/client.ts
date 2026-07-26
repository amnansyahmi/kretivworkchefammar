import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

let db: NodePgDatabase<typeof schema> | null = null;

// Returns null when DATABASE_URL isn't set, so API routes can fall back
// to sensible defaults instead of crashing. Set DATABASE_URL (any
// Postgres provider — Vercel Postgres, Neon, Supabase, etc.) to persist
// commission approvals and the scheduled campaign across sessions.
export function getDb() {
  if (!process.env.DATABASE_URL) return null;
  if (!db) {
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    db = drizzle(pool, { schema });
  }
  return db;
}
