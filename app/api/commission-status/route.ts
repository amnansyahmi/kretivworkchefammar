import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getDb } from "../../../lib/db/client";
import { commissionStatus } from "../../../lib/db/schema";

const CURRENT_WEEK = 0;
const DEFAULT_STATUS = { approved: false, paid: false, payMethod: "bank" as const };

export async function GET() {
  const db = getDb();
  if (!db) return NextResponse.json(DEFAULT_STATUS);

  const row = await db.query.commissionStatus.findFirst({ where: eq(commissionStatus.weekIndex, CURRENT_WEEK) });
  if (!row) return NextResponse.json(DEFAULT_STATUS);
  return NextResponse.json({ approved: row.approved, paid: row.paid, payMethod: row.payMethod });
}

export async function POST(request: Request) {
  const body = await request.json();
  const db = getDb();
  if (!db) return NextResponse.json({ persisted: false });

  await db
    .insert(commissionStatus)
    .values({ weekIndex: CURRENT_WEEK, approved: body.approved, paid: body.paid, payMethod: body.payMethod })
    .onConflictDoUpdate({
      target: commissionStatus.weekIndex,
      set: { approved: body.approved, paid: body.paid, payMethod: body.payMethod, updatedAt: new Date() },
    });
  return NextResponse.json({ persisted: true });
}
