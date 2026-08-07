import { eq } from "drizzle-orm";
import { getDb } from "../db/client";
import { contentPieces, contentSettings } from "../db/schema";
import { mockContent } from "./mock-content";
import type { ContentPiece } from "./types";

const KEY = "current";

function toPiece(row: typeof contentPieces.$inferSelect): ContentPiece {
  return {
    id: row.id,
    title: row.title,
    format: row.format as ContentPiece["format"],
    channel: row.channel as ContentPiece["channel"],
    status: row.status as ContentPiece["status"],
    scheduledFor: row.scheduledFor,
    owner: row.owner,
    productSku: row.productSku,
    driveUrl: row.driveUrl,
    notes: row.notes,
    updatedAt: row.updatedAt.toISOString().slice(0, 10),
  };
}

export async function getContent(): Promise<{ pieces: ContentPiece[]; persisted: boolean }> {
  const db = getDb();
  if (!db) return { pieces: mockContent, persisted: false };

  const rows = await db.select().from(contentPieces);
  // An empty table on a fresh database would look like a broken board, so
  // seed it once with the sample plan rather than showing nothing.
  if (!rows.length) {
    await db.insert(contentPieces).values(mockContent.map((piece) => ({ ...piece, updatedAt: new Date() })));
    return { pieces: mockContent, persisted: true };
  }
  return { pieces: rows.map(toPiece).sort((a, b) => a.scheduledFor.localeCompare(b.scheduledFor)), persisted: true };
}

export async function saveContentPiece(piece: ContentPiece): Promise<boolean> {
  const db = getDb();
  if (!db) return false;

  const values = {
    id: piece.id,
    title: piece.title,
    format: piece.format,
    channel: piece.channel,
    status: piece.status,
    scheduledFor: piece.scheduledFor,
    owner: piece.owner,
    productSku: piece.productSku,
    driveUrl: piece.driveUrl,
    notes: piece.notes,
    updatedAt: new Date(),
  };
  await db.insert(contentPieces).values(values).onConflictDoUpdate({ target: contentPieces.id, set: values });
  return true;
}

export async function deleteContentPiece(id: string): Promise<boolean> {
  const db = getDb();
  if (!db) return false;
  await db.delete(contentPieces).where(eq(contentPieces.id, id));
  return true;
}

export async function getContentSettings(): Promise<{ driveFolderUrl: string | null }> {
  const db = getDb();
  if (!db) return { driveFolderUrl: null };
  const row = await db.query.contentSettings.findFirst({ where: eq(contentSettings.key, KEY) });
  return { driveFolderUrl: row?.driveFolderUrl ?? null };
}

export async function saveContentSettings(driveFolderUrl: string | null): Promise<boolean> {
  const db = getDb();
  if (!db) return false;
  await db
    .insert(contentSettings)
    .values({ key: KEY, driveFolderUrl })
    .onConflictDoUpdate({ target: contentSettings.key, set: { driveFolderUrl, updatedAt: new Date() } });
  return true;
}
