import { NextResponse } from "next/server";
import { getContent, saveContentPiece, deleteContentPiece } from "../../../lib/content";
import { CONTENT_CHANNELS, CONTENT_FORMATS, CONTENT_STAGES } from "../../../lib/content/types";

export async function GET() {
  return NextResponse.json(await getContent());
}

export async function POST(request: Request) {
  const body = await request.json();

  if (typeof body.id !== "string" || !body.id.trim()) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }
  if (typeof body.title !== "string" || !body.title.trim()) {
    return NextResponse.json({ error: "title is required" }, { status: 400 });
  }
  if (!CONTENT_STAGES.includes(body.status)) {
    return NextResponse.json({ error: `status must be one of: ${CONTENT_STAGES.join(", ")}` }, { status: 400 });
  }
  if (!CONTENT_FORMATS.includes(body.format)) {
    return NextResponse.json({ error: `format must be one of: ${CONTENT_FORMATS.join(", ")}` }, { status: 400 });
  }
  if (!CONTENT_CHANNELS.includes(body.channel)) {
    return NextResponse.json({ error: `channel must be one of: ${CONTENT_CHANNELS.join(", ")}` }, { status: 400 });
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(body.scheduledFor ?? "")) {
    return NextResponse.json({ error: "scheduledFor must be YYYY-MM-DD" }, { status: 400 });
  }

  const persisted = await saveContentPiece({
    id: body.id.trim(),
    title: body.title.trim(),
    format: body.format,
    channel: body.channel,
    status: body.status,
    scheduledFor: body.scheduledFor,
    owner: String(body.owner ?? ""),
    productSku: body.productSku ?? null,
    driveUrl: body.driveUrl ?? null,
    notes: String(body.notes ?? ""),
    updatedAt: new Date().toISOString().slice(0, 10),
  });
  return NextResponse.json({ persisted });
}

export async function DELETE(request: Request) {
  const id = new URL(request.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });
  return NextResponse.json({ persisted: await deleteContentPiece(id) });
}
