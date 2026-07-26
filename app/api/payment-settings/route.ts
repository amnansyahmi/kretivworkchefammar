import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getDb } from "../../../lib/db/client";
import { paymentSettings } from "../../../lib/db/schema";

const KEY = "current";
const DEFAULTS = {
  bankName: "Demo Bank",
  accountName: "KretivCo Sdn. Bhd.",
  accountNumber: "1234 5678 9012",
  qrImageDataUrl: null as string | null,
};

export async function GET() {
  const db = getDb();
  if (!db) return NextResponse.json(DEFAULTS);

  const row = await db.query.paymentSettings.findFirst({ where: eq(paymentSettings.key, KEY) });
  if (!row) return NextResponse.json(DEFAULTS);
  return NextResponse.json({
    bankName: row.bankName,
    accountName: row.accountName,
    accountNumber: row.accountNumber,
    qrImageDataUrl: row.qrImageDataUrl,
  });
}

export async function POST(request: Request) {
  const body = await request.json();
  const db = getDb();
  if (!db) return NextResponse.json({ persisted: false });

  await db
    .insert(paymentSettings)
    .values({
      key: KEY,
      bankName: body.bankName,
      accountName: body.accountName,
      accountNumber: body.accountNumber,
      qrImageDataUrl: body.qrImageDataUrl ?? null,
    })
    .onConflictDoUpdate({
      target: paymentSettings.key,
      set: {
        bankName: body.bankName,
        accountName: body.accountName,
        accountNumber: body.accountNumber,
        qrImageDataUrl: body.qrImageDataUrl ?? null,
        updatedAt: new Date(),
      },
    });
  return NextResponse.json({ persisted: true });
}
