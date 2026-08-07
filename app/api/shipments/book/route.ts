import { NextResponse } from "next/server";
import { bookShipment } from "../../../../lib/logistics/booking";
import type { CourierName } from "../../../../lib/logistics/types";

const COURIERS: CourierName[] = ["J&T Express", "Pos Laju", "Ninja Van", "DHL eCommerce"];

export async function POST(request: Request) {
  const body = await request.json();
  const weightKg = Number(body.weightKg);

  if (typeof body.orderId !== "string" || !body.orderId) {
    return NextResponse.json({ error: "orderId is required" }, { status: 400 });
  }
  if (!COURIERS.includes(body.courier)) {
    return NextResponse.json({ error: `courier must be one of: ${COURIERS.join(", ")}` }, { status: 400 });
  }
  if (!Number.isFinite(weightKg) || weightKg <= 0) {
    return NextResponse.json({ error: "weightKg must be a positive number" }, { status: 400 });
  }

  try {
    const shipment = await bookShipment({
      orderId: body.orderId,
      recipient: String(body.recipient ?? ""),
      initials: String(body.initials ?? "??"),
      destination: String(body.destination ?? ""),
      postcode: String(body.postcode ?? ""),
      weightKg,
      courier: body.courier,
    });
    return NextResponse.json({ shipment });
  } catch (error) {
    console.error("[courier:book]", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Booking failed" }, { status: 502 });
  }
}
