import { NextResponse } from "next/server";
import { getProducts, saveStockLevel } from "../../../lib/inventory";

export async function GET() {
  return NextResponse.json({ products: await getProducts() });
}

export async function POST(request: Request) {
  const body = await request.json();
  const stock = Number(body.stock);
  const reorderLevel = Number(body.reorderLevel);

  if (typeof body.sku !== "string" || !body.sku) {
    return NextResponse.json({ error: "sku is required" }, { status: 400 });
  }
  if (!Number.isInteger(stock) || stock < 0 || !Number.isInteger(reorderLevel) || reorderLevel < 0) {
    return NextResponse.json({ error: "stock and reorderLevel must be non-negative integers" }, { status: 400 });
  }

  const persisted = await saveStockLevel(body.sku, stock, reorderLevel);
  return NextResponse.json({ persisted });
}
