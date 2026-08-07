import assert from "node:assert/strict";
import test from "node:test";

import { stockLevelOf, weeksOfCover } from "../lib/inventory/types.ts";
import { quoteFor } from "../lib/logistics/booking.ts";

function product(overrides) {
  return { sku: "X", name: "X", code: "X", tone: "#000", weightLabel: "140g", price: 25.9, stock: 100, reorderLevel: 40, soldThisWeek: 10, ...overrides };
}

test("stockLevelOf flags out of stock, low and healthy", () => {
  assert.equal(stockLevelOf(product({ stock: 0 })), "out");
  assert.equal(stockLevelOf(product({ stock: 100, reorderLevel: 40 })), "ok");
  assert.equal(stockLevelOf(product({ stock: 20, reorderLevel: 40 })), "low");
});

test("stockLevelOf treats stock exactly at the reorder level as low", () => {
  assert.equal(stockLevelOf(product({ stock: 40, reorderLevel: 40 })), "low");
  assert.equal(stockLevelOf(product({ stock: 41, reorderLevel: 40 })), "ok");
});

test("stockLevelOf reports negative stock as out, not low", () => {
  assert.equal(stockLevelOf(product({ stock: -5 })), "out");
});

test("weeksOfCover divides stock by weekly sell-through, rounded down", () => {
  assert.equal(weeksOfCover(product({ stock: 100, soldThisWeek: 30 })), 3);
  assert.equal(weeksOfCover(product({ stock: 29, soldThisWeek: 30 })), 0);
});

test("weeksOfCover returns null when nothing sold, rather than dividing by zero", () => {
  assert.equal(weeksOfCover(product({ stock: 100, soldThisWeek: 0 })), null);
});

test("quoteFor bills by started kilogram", () => {
  // J&T: base 5.30 + 1.00 per kg after the first.
  assert.equal(quoteFor("J&T Express", 0.6), 5.3, "under 1kg is just the base rate");
  assert.equal(quoteFor("J&T Express", 1), 5.3);
  assert.equal(quoteFor("J&T Express", 1.2), 6.3, "1.2kg rounds up to 2kg");
  assert.equal(quoteFor("J&T Express", 3), 7.3);
});

test("quoteFor never goes below the base rate for tiny or zero weights", () => {
  assert.equal(quoteFor("Ninja Van", 0), 5.9);
  assert.equal(quoteFor("Ninja Van", 0.01), 5.9);
});

test("quoteFor differs per courier", () => {
  const weights = [1, 2, 3];
  weights.forEach((w) => {
    assert.notEqual(quoteFor("Pos Laju", w), quoteFor("J&T Express", w));
  });
});
