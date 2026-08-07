import { NextResponse } from "next/server";
import { getShoots, saveShoot, deleteShoot } from "../../../../lib/content";
import { SHOOT_LOCATIONS, SHOOT_STATUSES } from "../../../../lib/content/shoots";

export async function GET() {
  return NextResponse.json({ shoots: await getShoots() });
}

export async function POST(request: Request) {
  const body = await request.json();

  if (typeof body.id !== "string" || !body.id.trim()) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }
  if (typeof body.title !== "string" || !body.title.trim()) {
    return NextResponse.json({ error: "title is required" }, { status: 400 });
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(body.date ?? "")) {
    return NextResponse.json({ error: "date must be YYYY-MM-DD" }, { status: 400 });
  }
  if (!SHOOT_LOCATIONS.includes(body.location)) {
    return NextResponse.json({ error: `location must be one of: ${SHOOT_LOCATIONS.join(", ")}` }, { status: 400 });
  }
  if (!SHOOT_STATUSES.includes(body.status)) {
    return NextResponse.json({ error: `status must be one of: ${SHOOT_STATUSES.join(", ")}` }, { status: 400 });
  }

  const persisted = await saveShoot({
    id: body.id.trim(),
    title: body.title.trim(),
    date: body.date,
    location: body.location,
    status: body.status,
    crew: String(body.crew ?? ""),
    callTime: String(body.callTime ?? ""),
    driveUrl: body.driveUrl ?? null,
    notes: String(body.notes ?? ""),
  });
  return NextResponse.json({ persisted });
}

export async function DELETE(request: Request) {
  const id = new URL(request.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });
  return NextResponse.json({ persisted: await deleteShoot(id) });
}
