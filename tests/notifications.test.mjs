import assert from "node:assert/strict";
import test from "node:test";

import { deriveNotifications } from "../lib/notifications.ts";

function input(overrides) {
  return {
    shipments: [],
    products: [],
    sourceStatus: null,
    courierStatus: null,
    statementApproved: true,
    canApproveStatement: false,
    ...overrides,
  };
}

function shipment(status, orderId = "#CA-1") {
  return { trackingNo: "T1", orderId, courier: "J&T Express", provider: "easyparcel", service: "S", recipient: "R", initials: "R", destination: "D", postcode: "40150", weightKg: 1, cost: 5, status, bookedAt: "", estimatedDelivery: "", checkpoints: [] };
}

function product(name, stock, reorderLevel) {
  return { sku: name, name, code: "X", tone: "#000", weightLabel: "140g", price: 1, stock, reorderLevel, soldThisWeek: 1 };
}

const ids = (list) => list.map((n) => n.id);

test("a quiet system produces no notifications", () => {
  assert.deepEqual(deriveNotifications(input()), []);
});

test("failed deliveries raise a danger notification naming the orders", () => {
  const [notification] = deriveNotifications(input({
    shipments: [shipment("Gagal dihantar", "#CA-1044"), shipment("Dihantar")],
  }));
  assert.equal(notification.id, "shipments-failed");
  assert.equal(notification.tone, "danger");
  assert.match(notification.detail, /#CA-1044/);
  assert.deepEqual(notification.target, { view: "logistics", tab: "shipments" });
});

test("out of stock and low stock are reported separately, out first", () => {
  const result = deriveNotifications(input({
    products: [product("Bukhari", 0, 30), product("Kabsah", 10, 40), product("Mandi", 500, 40)],
  }));
  assert.deepEqual(ids(result), ["stock-out", "stock-low"]);
  assert.match(result[0].detail, /Bukhari/);
  assert.match(result[1].detail, /Kabsah/);
  assert.ok(!result[1].detail.includes("Mandi"), "healthy stock must not be flagged");
});

test("the approval prompt only appears for the role that can approve", () => {
  const pending = { statementApproved: false };
  assert.ok(ids(deriveNotifications(input({ ...pending, canApproveStatement: true }))).includes("statement-pending"));
  assert.ok(!ids(deriveNotifications(input({ ...pending, canApproveStatement: false }))).includes("statement-pending"));
});

test("an approved statement never prompts, even for the approver", () => {
  const result = deriveNotifications(input({ statementApproved: true, canApproveStatement: true }));
  assert.ok(!ids(result).includes("statement-pending"));
});

test("only errored data sources are reported, and they are named", () => {
  const [notification] = deriveNotifications(input({
    sourceStatus: { bclmy: "mock", shopee: "error", tiktok: "real" },
  }));
  assert.equal(notification.id, "sources-error");
  assert.match(notification.detail, /Shopee/);
  assert.ok(!notification.detail.includes("BCL.my"), "mock sources are not errors");
});

test("errored couriers are reported against the couriers tab", () => {
  const [notification] = deriveNotifications(input({
    courierStatus: { easyparcel: "error", jnt: "mock" },
  }));
  assert.equal(notification.id, "couriers-error");
  assert.match(notification.detail, /EasyParcel/);
  assert.deepEqual(notification.target, { view: "logistics", tab: "couriers" });
});

test("parcels awaiting pickup are informational, and sort below the urgent ones", () => {
  const result = deriveNotifications(input({
    shipments: [shipment("Menunggu pickup"), shipment("Gagal dihantar")],
    products: [product("Bukhari", 0, 30)],
  }));
  assert.deepEqual(ids(result), ["shipments-failed", "stock-out", "shipments-pickup"]);
  assert.equal(result.at(-1).tone, "info");
});

test("notification ids are unique so they are safe as React keys", () => {
  const result = deriveNotifications(input({
    shipments: [shipment("Gagal dihantar"), shipment("Menunggu pickup")],
    products: [product("A", 0, 5), product("B", 1, 5)],
    sourceStatus: { bclmy: "error", shopee: "error", tiktok: "mock" },
    courierStatus: { easyparcel: "error", jnt: "error" },
    statementApproved: false,
    canApproveStatement: true,
  }));
  assert.equal(new Set(ids(result)).size, result.length, "ids must be unique");
  assert.deepEqual(ids(result), [
    "shipments-failed",
    "stock-out",
    "stock-low",
    "statement-pending",
    "sources-error",
    "couriers-error",
    "shipments-pickup",
  ], "danger and warning items sort above the informational one");
});
