import assert from "node:assert/strict";
import test from "node:test";

import { aggregateCustomers, summariseCustomers } from "../lib/customers.ts";

function order(overrides) {
  return {
    id: "#CA-1",
    customer: "Ali Bakar",
    initials: "AB",
    channel: "Shopee",
    item: "Rempah Mandi 140g × 1",
    productCode: "MA",
    productTone: "#000",
    payment: "FPX",
    amount: 25.9,
    time: "Hari ini",
    status: "Selesai",
    ...overrides,
  };
}

test("aggregateCustomers groups orders by customer regardless of case and spacing", () => {
  const customers = aggregateCustomers([
    order({ id: "#A", customer: "Ali Bakar" }),
    order({ id: "#B", customer: "  ali bakar  " }),
  ]);
  assert.equal(customers.length, 1);
  assert.equal(customers[0].orderCount, 2);
});

test("aggregateCustomers excludes refunds from lifetime value but counts the order", () => {
  const customers = aggregateCustomers([
    order({ id: "#A", amount: 100, status: "Selesai" }),
    order({ id: "#B", amount: 40, status: "Refund" }),
  ]);
  const [customer] = customers;

  assert.equal(customer.orderCount, 2, "a refund is still an order placed");
  assert.equal(customer.lifetimeValue, 100, "a refund earns nothing");
  assert.equal(customer.refunds, 1);
  assert.equal(customer.averageOrder, 100, "average is over earning orders only");
});

test("aggregateCustomers picks the most-used channel as the top channel", () => {
  const [customer] = aggregateCustomers([
    order({ id: "#A", channel: "Shopee" }),
    order({ id: "#B", channel: "TikTok Shop" }),
    order({ id: "#C", channel: "TikTok Shop" }),
  ]);
  assert.equal(customer.topChannel, "TikTok Shop");
  assert.equal(customer.channels.length, 2);
});

test("aggregateCustomers sorts by lifetime value, highest first", () => {
  const customers = aggregateCustomers([
    order({ id: "#A", customer: "Small", amount: 10 }),
    order({ id: "#B", customer: "Big", amount: 900 }),
    order({ id: "#C", customer: "Medium", amount: 100 }),
  ]);
  assert.deepEqual(customers.map((c) => c.name), ["Big", "Medium", "Small"]);
});

test("aggregateCustomers handles a customer whose every order was refunded", () => {
  const [customer] = aggregateCustomers([order({ amount: 50, status: "Refund" })]);
  assert.equal(customer.lifetimeValue, 0);
  assert.equal(customer.averageOrder, 0, "must not divide by zero");
});

test("summariseCustomers computes the repeat rate", () => {
  const customers = aggregateCustomers([
    order({ id: "#A", customer: "Repeat", amount: 50 }),
    order({ id: "#B", customer: "Repeat", amount: 50 }),
    order({ id: "#C", customer: "Once", amount: 100 }),
  ]);
  const summary = summariseCustomers(customers);

  assert.equal(summary.total, 2);
  assert.equal(summary.repeat, 1);
  assert.equal(summary.repeatRate, 50);
  assert.equal(summary.averageLifetimeValue, 100);
});

test("summariseCustomers returns zeroes for no customers rather than NaN", () => {
  const summary = summariseCustomers([]);
  assert.deepEqual(summary, { total: 0, repeat: 0, repeatRate: 0, averageLifetimeValue: 0 });
});
