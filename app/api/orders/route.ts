import { NextResponse } from "next/server";
import { getAllOrders } from "../../../lib/sources";

export async function GET() {
  const data = await getAllOrders();
  return NextResponse.json(data);
}
