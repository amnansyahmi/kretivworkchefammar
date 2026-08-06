import { courierConfig } from "../config";
import { mockShipments } from "./mock-shipments";
import type { Shipment } from "./types";

async function fetchMock(): Promise<Shipment[]> {
  return mockShipments.filter((shipment) => shipment.provider === "jnt");
}

// Direct J&T Express Malaysia integration.
//
// Heads up before wiring this: J&T Malaysia has no public, self-serve API. The
// J&T OpenAPI is issued per-merchant under a business account / VIP contract —
// your account manager provisions a customer code plus a private key, and the
// gateway host is assigned to you (it is not a single documented public URL).
// Requests are signed by base64-encoding an MD5 of the request body joined
// with that private key, sent as the `digest` header.
//
// Because of that, most Malaysian merchants reach J&T through an aggregator
// instead. lib/logistics/easyparcel.ts covers J&T with a self-serve key and is
// the recommended path — use this file only once you have a signed J&T
// merchant agreement and the credentials that come with it.
async function fetchReal(): Promise<Shipment[]> {
  const missing = ["JNT_API_BASE_URL", "JNT_CUSTOMER_CODE", "JNT_PRIVATE_KEY"].filter((name) => !process.env[name]);
  if (missing.length) {
    throw new Error(
      `DATA_SOURCE_JNT=real but ${missing.join(", ")} ${missing.length > 1 ? "are" : "is"} not set. These come from your J&T merchant agreement — see lib/logistics/jnt.ts. Set DATA_SOURCE_JNT=mock to keep using test data.`
    );
  }
  throw new Error(
    "J&T direct integration is not implemented yet. Implement fetchReal() in lib/logistics/jnt.ts against the tracking endpoint on your assigned J&T gateway, or route J&T through EasyParcel instead. Set DATA_SOURCE_JNT=mock until then."
  );
}

export async function getShipments(): Promise<Shipment[]> {
  return courierConfig.jnt === "real" ? fetchReal() : fetchMock();
}
