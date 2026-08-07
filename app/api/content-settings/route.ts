import { NextResponse } from "next/server";
import { getContentSettings, saveContentSettings } from "../../../lib/content";
import { isDriveUrl } from "../../../lib/content/drive";

export async function GET() {
  return NextResponse.json(await getContentSettings());
}

export async function POST(request: Request) {
  const body = await request.json();
  const raw = typeof body.driveFolderUrl === "string" ? body.driveFolderUrl.trim() : "";

  // Empty clears the folder; anything else must be a link we can embed.
  if (raw && !isDriveUrl(raw)) {
    return NextResponse.json({ error: "driveFolderUrl must be a Google Drive or Google Docs link" }, { status: 400 });
  }

  const persisted = await saveContentSettings(raw || null);
  return NextResponse.json({ persisted });
}
