import assert from "node:assert/strict";
import test from "node:test";

import { toCsv, parseCsv } from "../lib/csv/index.ts";
import { importOrdersFromCsv } from "../lib/csv/import-orders.ts";

test("toCsv quotes fields containing commas, quotes and newlines", () => {
  const csv = toCsv(["a", "b", "c"], [["plain", "has,comma", 'has"quote']]);
  const line = csv.split("\r\n")[1];
  assert.equal(line, 'plain,"has,comma","has""quote"');
});

test("toCsv emits a BOM and CRLF line endings so Excel reads UTF-8", () => {
  const csv = toCsv(["a"], [["x"]]);
  assert.ok(csv.startsWith("﻿"), "expected a leading BOM");
  assert.ok(csv.includes("\r\n"), "expected CRLF line endings");
});

test("parseCsv round-trips values that need quoting", () => {
  const rows = [["Tan, Wei Ming", 'He said "hi"', "line\nbreak"]];
  const parsed = parseCsv(toCsv(["a", "b", "c"], rows));
  assert.deepEqual(parsed[1], rows[0]);
});

test("parseCsv strips the BOM and drops blank lines", () => {
  const parsed = parseCsv("﻿a,b\r\n1,2\r\n\r\n3,4");
  assert.deepEqual(parsed, [["a", "b"], ["1", "2"], ["3", "4"]]);
});

test("parseCsv keeps a trailing row with no final newline", () => {
  assert.deepEqual(parseCsv("a,b\n1,2"), [["a", "b"], ["1", "2"]]);
});

const HEADER = "Order ID,Order Date,Buyer Name,Platform,Product Name,Payment Method,Total,Status";

test("importOrdersFromCsv maps aliased columns and normalises values", () => {
  const csv = `${HEADER}\nCA-9001,23 Jul 2026,Zulaikha Hassan,Shopee,Rempah Kabsah 140g x 2,ShopeePay,"RM51.80",Completed`;
  const result = importOrdersFromCsv(csv, []);

  assert.equal(result.orders.length, 1);
  const order = result.orders[0];
  assert.equal(order.id, "#CA-9001", "should prefix a bare id with #");
  assert.equal(order.customer, "Zulaikha Hassan");
  assert.equal(order.initials, "ZH");
  assert.equal(order.channel, "Shopee");
  assert.equal(order.amount, 51.8, "should strip the RM prefix");
  assert.equal(order.productCode, "KA", "should derive the code from the spice name");
  assert.equal(order.status, "Selesai");
});

test("importOrdersFromCsv parses thousands separators and fuzzy channel names", () => {
  const csv = `${HEADER}\nCA-9002,23 Jul 2026,Nur Aisyah,bcl.my,Rempah Beriani 140g x 3,FPX,"1,077.70",Completed`;
  const { orders } = importOrdersFromCsv(csv, []);
  assert.equal(orders[0].amount, 1077.7);
  assert.equal(orders[0].channel, "BCL.my", "lowercase 'bcl.my' should match the channel");
});

test("importOrdersFromCsv skips duplicates of existing orders, ignoring the # prefix", () => {
  const csv = `${HEADER}\nCA-1048,23 Jul 2026,Farah Nadia,Shopee,Rempah Mandi 140g x 1,FPX,25.90,Completed`;
  const result = importOrdersFromCsv(csv, ["#CA-1048"]);
  assert.equal(result.orders.length, 0);
  assert.deepEqual(result.duplicates, ["#CA-1048"]);
});

test("importOrdersFromCsv treats duplicates within one file as duplicates too", () => {
  const row = "CA-9003,23 Jul 2026,Ali,Shopee,Rempah Mandi 140g x 1,FPX,25.90,Completed";
  const result = importOrdersFromCsv(`${HEADER}\n${row}\n${row}`, []);
  assert.equal(result.orders.length, 1);
  assert.equal(result.duplicates.length, 1);
});

test("importOrdersFromCsv reports each rejected row with its own reason", () => {
  const csv = [
    HEADER,
    "CA-9004,,,,,,,",
    "CA-9005,23 Jul 2026,Bad Amount,Shopee,Rempah Mandi 140g x 1,FPX,abc,Completed",
  ].join("\n");
  const result = importOrdersFromCsv(csv, []);

  assert.equal(result.orders.length, 0);
  assert.deepEqual(result.skipped, [
    { line: 2, reason: "Medan wajib kosong" },
    { line: 3, reason: "Jumlah tidak sah" },
  ]);
});

test("importOrdersFromCsv reports missing required columns instead of guessing", () => {
  const result = importOrdersFromCsv("Foo,Bar\n1,2", []);
  assert.deepEqual(result.missingColumns, ["id", "customer", "item", "amount"]);
  assert.equal(result.orders.length, 0);
});

test("importOrdersFromCsv maps status text to the app's statuses", () => {
  const rows = [
    ["CA-9010", "Completed", "Selesai"],
    ["CA-9011", "Processing", "Diproses"],
    ["CA-9012", "Refunded", "Refund"],
    ["CA-9013", "Dibatalkan", "Refund"],
    ["CA-9014", "Shipping", "Diproses"],
  ];
  rows.forEach(([id, input, expected]) => {
    const csv = `${HEADER}\n${id},23 Jul,Ali,Shopee,Rempah Mandi 140g x 1,FPX,25.90,${input}`;
    assert.equal(importOrdersFromCsv(csv, []).orders[0].status, expected, `${input} -> ${expected}`);
  });
});

test("importOrdersFromCsv handles an empty file without throwing", () => {
  const result = importOrdersFromCsv("", []);
  assert.equal(result.orders.length, 0);
  assert.ok(result.missingColumns.length > 0);
});
