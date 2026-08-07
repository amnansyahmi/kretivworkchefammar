import assert from "node:assert/strict";
import test from "node:test";

import { buildMonthGrid, shiftMonth, toIsoDate, monthLabelBM, groupByDate, WEEKDAY_LABELS_BM } from "../lib/content/calendar.ts";

test("the grid is always 42 cells so the calendar height never jumps", () => {
  // February 2026 starts on a Sunday — the tightest case.
  assert.equal(buildMonthGrid(2026, 1).length, 42);
  // August 2026 starts on a Saturday — the longest leading pad.
  assert.equal(buildMonthGrid(2026, 7).length, 42);
});

test("the grid starts on Monday, matching the rest of the app", () => {
  assert.equal(WEEKDAY_LABELS_BM[0], "Isn");
  // 1 Aug 2026 is a Saturday, so the grid should start Mon 27 July.
  const grid = buildMonthGrid(2026, 7);
  assert.equal(grid[0].date, "2026-07-27");
  assert.equal(grid[0].inMonth, false, "leading pad belongs to the previous month");
});

test("a month starting on Monday needs no leading pad", () => {
  // 1 June 2026 is a Monday.
  const grid = buildMonthGrid(2026, 5);
  assert.equal(grid[0].date, "2026-06-01");
  assert.equal(grid[0].inMonth, true);
});

test("a month starting on Sunday gets a full six-day leading pad", () => {
  // 1 Feb 2026 is a Sunday, so the grid starts Mon 26 Jan.
  const grid = buildMonthGrid(2026, 1);
  assert.equal(grid[0].date, "2026-01-26");
  assert.equal(grid[6].date, "2026-02-01");
  assert.equal(grid[6].inMonth, true);
});

test("inMonth marks exactly the days of the requested month", () => {
  const grid = buildMonthGrid(2026, 7); // August has 31 days
  assert.equal(grid.filter((d) => d.inMonth).length, 31);
  const inMonth = grid.filter((d) => d.inMonth);
  assert.equal(inMonth[0].date, "2026-08-01");
  assert.equal(inMonth.at(-1).date, "2026-08-31");
});

test("February in a leap year has 29 in-month days", () => {
  assert.equal(buildMonthGrid(2028, 1).filter((d) => d.inMonth).length, 29);
  assert.equal(buildMonthGrid(2026, 1).filter((d) => d.inMonth).length, 28);
});

test("the grid crosses a year boundary without losing days", () => {
  const dec = buildMonthGrid(2026, 11);
  assert.equal(dec.filter((d) => d.inMonth).length, 31);
  // Trailing pad must run into January of the next year.
  assert.ok(dec.some((d) => d.date.startsWith("2027-01")), "expected trailing days in Jan 2027");
});

test("isWeekend flags Saturday and Sunday only", () => {
  const grid = buildMonthGrid(2026, 7);
  const sat = grid.find((d) => d.date === "2026-08-01"); // Saturday
  const sun = grid.find((d) => d.date === "2026-08-02"); // Sunday
  const mon = grid.find((d) => d.date === "2026-08-03"); // Monday
  assert.equal(sat.isWeekend, true);
  assert.equal(sun.isWeekend, true);
  assert.equal(mon.isWeekend, false);
});

test("isToday marks exactly one cell, and only when the month is on screen", () => {
  const today = new Date(2026, 7, 12);
  const august = buildMonthGrid(2026, 7, today);
  assert.equal(august.filter((d) => d.isToday).length, 1);
  assert.equal(august.find((d) => d.isToday).date, "2026-08-12");

  // A month far away should have no today cell at all.
  const march = buildMonthGrid(2026, 2, today);
  assert.equal(march.filter((d) => d.isToday).length, 0);
});

test("toIsoDate uses local date parts, not UTC", () => {
  // Late-evening local time would roll back a day under toISOString() in a
  // positive-offset zone like Malaysia's UTC+8.
  assert.equal(toIsoDate(new Date(2026, 7, 12, 23, 30)), "2026-08-12");
  assert.equal(toIsoDate(new Date(2026, 0, 1, 0, 5)), "2026-01-01");
});

test("shiftMonth steps forward and back across year boundaries", () => {
  assert.deepEqual(shiftMonth(2026, 7, 1), { year: 2026, month: 8 });
  assert.deepEqual(shiftMonth(2026, 11, 1), { year: 2027, month: 0 });
  assert.deepEqual(shiftMonth(2026, 0, -1), { year: 2025, month: 11 });
  assert.deepEqual(shiftMonth(2026, 7, -12), { year: 2025, month: 7 });
  assert.deepEqual(shiftMonth(2026, 7, 0), { year: 2026, month: 7 });
});

test("monthLabelBM names months in Malay", () => {
  assert.equal(monthLabelBM(2026, 0), "Januari 2026");
  assert.equal(monthLabelBM(2026, 2), "Mac 2026");
  assert.equal(monthLabelBM(2026, 7), "Ogos 2026");
  assert.equal(monthLabelBM(2026, 11), "Disember 2026");
});

test("groupByDate buckets records by day and keeps input order", () => {
  const items = [
    { id: "a", date: "2026-08-12" },
    { id: "b", date: "2026-08-13" },
    { id: "c", date: "2026-08-12" },
  ];
  const grouped = groupByDate(items, (i) => i.date);
  assert.deepEqual(grouped.get("2026-08-12").map((i) => i.id), ["a", "c"]);
  assert.deepEqual(grouped.get("2026-08-13").map((i) => i.id), ["b"]);
  assert.equal(grouped.get("2026-08-14"), undefined);
});
