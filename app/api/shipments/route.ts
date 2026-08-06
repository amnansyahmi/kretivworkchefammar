import { NextResponse } from "next/server";
import { getAllShipments } from "../../../lib/logistics";

export async function GET() {
  const data = await getAllShipments();
  return NextResponse.json(data);
}
