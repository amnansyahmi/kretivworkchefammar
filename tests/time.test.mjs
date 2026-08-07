import assert from "node:assert/strict";
import test from "node:test";

import { parseTimeLabel, formatTime12, minutesOf, timeOptions, timeOptionsIncluding } from "../lib/content/time.ts";
import { parseIsoDate } from "../lib/content/calendar.ts";

test("parseTimeLabel reads the stored 12-hour format", () => {
  assert.deepEqual(parseTimeLabel("9:00 AM"), { hour: 9, minute: 0 });
  assert.deepEqual(parseTimeLabel("2:30 PM"), { hour: 14, minute: 30 });
  assert.deepEqual(parseTimeLabel("8:00 PM"), { hour: 20, minute: 0 });
});

test("parseTimeLabel handles the midnight and noon edges", () => {
  assert.deepEqual(parseTimeLabel("12:00 AM"), { hour: 0, minute: 0 }, "12 AM is midnight");
  assert.deepEqual(parseTimeLabel("12:30 AM"), { hour: 0, minute: 30 });
  assert.deepEqual(parseTimeLabel("12:00 PM"), { hour: 12, minute: 0 }, "12 PM is noon");
  assert.deepEqual(parseTimeLabel("12:45 PM"), { hour: 12, minute: 45 });
});

test("parseTimeLabel tolerates values typed before the picker existed", () => {
  assert.deepEqual(parseTimeLabel("09:00"), { hour: 9, minute: 0 }, "24-hour with no meridiem");
  assert.deepEqual(parseTimeLabel("21:30"), { hour: 21, minute: 30 });
  assert.deepEqual(parseTimeLabel("9.30pm"), { hour: 21, minute: 30 }, "dot separator, no space");
  assert.deepEqual(parseTimeLabel("9 AM"), { hour: 9, minute: 0 }, "no minutes");
  assert.deepEqual(parseTimeLabel("  9:00 am  "), { hour: 9, minute: 0 }, "surrounding space");
});

test("parseTimeLabel rejects nonsense instead of guessing", () => {
  assert.equal(parseTimeLabel(""), null);
  assert.equal(parseTimeLabel("   "), null);
  assert.equal(parseTimeLabel("pagi"), null);
  assert.equal(parseTimeLabel("25:00"), null, "hour out of range");
  assert.equal(parseTimeLabel("9:75 AM"), null, "minute out of range");
  assert.equal(parseTimeLabel("13:00 PM"), null, "13 is not a valid 12-hour clock hour");
  assert.equal(parseTimeLabel("0:00 AM"), null, "0 is not a valid 12-hour clock hour");
});

test("formatTime12 renders the stored label", () => {
  assert.equal(formatTime12(9, 0), "9:00 AM");
  assert.equal(formatTime12(14, 30), "2:30 PM");
  assert.equal(formatTime12(0, 0), "12:00 AM");
  assert.equal(formatTime12(12, 0), "12:00 PM");
  assert.equal(formatTime12(23, 45), "11:45 PM");
  assert.equal(formatTime12(9, 5), "9:05 AM", "minutes are zero-padded");
});

test("parse and format round-trip every option", () => {
  timeOptions().forEach((label) => {
    const parts = parseTimeLabel(label);
    assert.notEqual(parts, null, `should parse ${label}`);
    assert.equal(formatTime12(parts.hour, parts.minute), label);
  });
});

test("minutesOf orders times correctly across midday", () => {
  assert.equal(minutesOf({ hour: 0, minute: 0 }), 0);
  assert.equal(minutesOf({ hour: 9, minute: 30 }), 570);
  assert.ok(minutesOf(parseTimeLabel("12:00 PM")) > minutesOf(parseTimeLabel("11:59 AM")));
  assert.ok(minutesOf(parseTimeLabel("12:00 AM")) < minutesOf(parseTimeLabel("1:00 AM")));
});

test("timeOptions covers the range in even steps", () => {
  const options = timeOptions(5, 23, 15);
  assert.equal(options[0], "5:00 AM");
  assert.equal(options.at(-1), "11:45 PM");
  assert.equal(options.length, 19 * 4, "19 hours × 4 quarters");
  assert.equal(new Set(options).size, options.length, "no duplicates");
});

test("timeOptions honours a custom step and range", () => {
  const options = timeOptions(9, 10, 30);
  assert.deepEqual(options, ["9:00 AM", "9:30 AM", "10:00 AM", "10:30 AM"]);
});

test("timeOptionsIncluding keeps an off-grid existing value selectable", () => {
  const options = timeOptionsIncluding("9:07 AM");
  assert.ok(options.includes("9:07 AM"), "the odd value must survive");
  assert.equal(options.indexOf("9:07 AM"), options.indexOf("9:00 AM") + 1, "and sort into place");
});

test("timeOptionsIncluding does not duplicate a value already on the grid", () => {
  const options = timeOptionsIncluding("9:00 AM");
  assert.equal(options.filter((o) => o === "9:00 AM").length, 1);
  assert.equal(options.length, timeOptions().length);
});

test("timeOptionsIncluding normalises before comparing", () => {
  // "09:00" is the same instant as "9:00 AM" and must not be added twice.
  const options = timeOptionsIncluding("09:00");
  assert.equal(options.length, timeOptions().length);
});

test("timeOptionsIncluding ignores an unparseable current value", () => {
  assert.deepEqual(timeOptionsIncluding("pagi"), timeOptions());
  assert.deepEqual(timeOptionsIncluding(""), timeOptions());
});

test("parseIsoDate splits a valid date", () => {
  assert.deepEqual(parseIsoDate("2026-08-24"), { year: 2026, month: 7, day: 24 });
  assert.deepEqual(parseIsoDate("2028-02-29"), { year: 2028, month: 1, day: 29 }, "leap day");
});

test("parseIsoDate rejects malformed and impossible dates", () => {
  assert.equal(parseIsoDate(""), null);
  assert.equal(parseIsoDate("24/08/2026"), null);
  assert.equal(parseIsoDate("2026-8-4"), null, "must be zero-padded");
  assert.equal(parseIsoDate("2026-13-01"), null, "month out of range");
  assert.equal(parseIsoDate("2026-02-31"), null, "must not roll forward into March");
  assert.equal(parseIsoDate("2026-02-29"), null, "2026 is not a leap year");
});
