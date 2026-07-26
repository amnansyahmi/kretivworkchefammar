import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getDb } from "../../../lib/db/client";
import { campaigns } from "../../../lib/db/schema";

const KEY = "current";

export async function GET() {
  const db = getDb();
  if (!db) return NextResponse.json({ campaign: null });

  const row = await db.query.campaigns.findFirst({ where: eq(campaigns.key, KEY) });
  if (!row) return NextResponse.json({ campaign: null });
  return NextResponse.json({
    campaign: { name: row.name, channel: row.channel, contentType: row.contentType, days: row.days, budget: row.budget, notes: row.notes },
  });
}

export async function POST(request: Request) {
  const body = await request.json();
  const db = getDb();
  if (!db) return NextResponse.json({ persisted: false });

  await db
    .insert(campaigns)
    .values({ key: KEY, name: body.name, channel: body.channel, contentType: body.contentType, days: body.days, budget: body.budget, notes: body.notes })
    .onConflictDoUpdate({
      target: campaigns.key,
      set: { name: body.name, channel: body.channel, contentType: body.contentType, days: body.days, budget: body.budget, notes: body.notes, updatedAt: new Date() },
    });
  return NextResponse.json({ persisted: true });
}

export async function DELETE() {
  const db = getDb();
  if (!db) return NextResponse.json({ persisted: false });

  await db.delete(campaigns).where(eq(campaigns.key, KEY));
  return NextResponse.json({ persisted: true });
}
