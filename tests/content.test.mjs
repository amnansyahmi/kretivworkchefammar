import assert from "node:assert/strict";
import test from "node:test";

import { parseDriveUrl, isDriveUrl } from "../lib/content/drive.ts";
import { daysUntil, isOverdue, isDueSoon } from "../lib/content/types.ts";

test("parseDriveUrl recognises a folder link and builds a grid embed", () => {
  const ref = parseDriveUrl("https://drive.google.com/drive/folders/1AbC-dEf_GhI123");
  assert.equal(ref.kind, "folder");
  assert.equal(ref.id, "1AbC-dEf_GhI123");
  assert.equal(ref.embedUrl, "https://drive.google.com/embeddedfolderview?id=1AbC-dEf_GhI123#grid");
});

test("parseDriveUrl tolerates ?usp=sharing and /u/0/ account prefixes", () => {
  const shared = parseDriveUrl("https://drive.google.com/drive/folders/ABC123?usp=sharing");
  assert.equal(shared.id, "ABC123");

  const scoped = parseDriveUrl("https://drive.google.com/drive/u/0/folders/ABC123");
  assert.equal(scoped.kind, "folder");
  assert.equal(scoped.id, "ABC123");
});

test("parseDriveUrl builds a /preview embed for a file link", () => {
  const ref = parseDriveUrl("https://drive.google.com/file/d/FILE123/view?usp=drive_link");
  assert.equal(ref.kind, "file");
  assert.equal(ref.embedUrl, "https://drive.google.com/file/d/FILE123/preview");
});

test("parseDriveUrl handles Docs, Sheets and Slides with their own embed paths", () => {
  assert.equal(
    parseDriveUrl("https://docs.google.com/document/d/DOC1/edit").embedUrl,
    "https://docs.google.com/document/d/DOC1/preview",
  );
  assert.equal(
    parseDriveUrl("https://docs.google.com/spreadsheets/d/SHEET1/edit#gid=0").embedUrl,
    "https://docs.google.com/spreadsheets/d/SHEET1/preview",
  );
  // Slides uses /embed rather than /preview.
  assert.equal(
    parseDriveUrl("https://docs.google.com/presentation/d/SLIDE1/edit").embedUrl,
    "https://docs.google.com/presentation/d/SLIDE1/embed",
  );
});

test("parseDriveUrl supports the legacy open?id= share form", () => {
  const ref = parseDriveUrl("https://drive.google.com/open?id=LEGACY1");
  assert.equal(ref.kind, "file");
  assert.equal(ref.embedUrl, "https://drive.google.com/file/d/LEGACY1/preview");
});

test("parseDriveUrl marks a non-Drive URL as unknown with no embed", () => {
  const ref = parseDriveUrl("https://example.com/whatever");
  assert.equal(ref.kind, "unknown");
  assert.equal(ref.embedUrl, null);
});

test("parseDriveUrl returns null for empty or non-URL text", () => {
  assert.equal(parseDriveUrl(""), null);
  assert.equal(parseDriveUrl("   "), null);
  assert.equal(parseDriveUrl("just some notes"), null);
});

test("isDriveUrl accepts Drive links and rejects everything else", () => {
  assert.equal(isDriveUrl("https://drive.google.com/drive/folders/X1"), true);
  assert.equal(isDriveUrl("https://docs.google.com/document/d/X1/edit"), true);
  assert.equal(isDriveUrl("https://dropbox.com/x"), false);
  assert.equal(isDriveUrl(""), false);
});

const TODAY = new Date("2026-07-22T10:00:00");

function piece(overrides) {
  return { id: "CT-1", title: "x", format: "Video pendek", channel: "TikTok", status: "Idea", scheduledFor: "2026-07-22", owner: "", productSku: null, driveUrl: null, notes: "", updatedAt: "2026-07-22", ...overrides };
}

test("daysUntil counts whole days either side of today", () => {
  assert.equal(daysUntil("2026-07-22", TODAY), 0);
  assert.equal(daysUntil("2026-07-25", TODAY), 3);
  assert.equal(daysUntil("2026-07-20", TODAY), -2);
});

test("daysUntil returns null for an unparseable date", () => {
  assert.equal(daysUntil("not-a-date", TODAY), null);
});

test("isOverdue flags a past go-live date that hasn't shipped", () => {
  assert.equal(isOverdue(piece({ scheduledFor: "2026-07-20" }), TODAY), true);
  assert.equal(isOverdue(piece({ scheduledFor: "2026-07-22" }), TODAY), false, "due today is not yet late");
  assert.equal(isOverdue(piece({ scheduledFor: "2026-07-25" }), TODAY), false);
});

test("published work is never overdue, however old", () => {
  assert.equal(isOverdue(piece({ scheduledFor: "2020-01-01", status: "Diterbitkan" }), TODAY), false);
});

test("isDueSoon covers today through the next two days, excluding published", () => {
  assert.equal(isDueSoon(piece({ scheduledFor: "2026-07-22" }), 2, TODAY), true);
  assert.equal(isDueSoon(piece({ scheduledFor: "2026-07-24" }), 2, TODAY), true);
  assert.equal(isDueSoon(piece({ scheduledFor: "2026-07-25" }), 2, TODAY), false);
  assert.equal(isDueSoon(piece({ scheduledFor: "2026-07-20" }), 2, TODAY), false, "already late is not 'due soon'");
  assert.equal(isDueSoon(piece({ scheduledFor: "2026-07-22", status: "Diterbitkan" }), 2, TODAY), false);
});
