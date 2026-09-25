import { test } from "node:test";
import assert from "node:assert/strict";
import { localDay, progress, route } from "../src/domain.mjs";
test("day uses local calendar rather than UTC", () => {
  assert.equal(localDay(new Date(2026, 8, 24, 23, 59)), "2026-09-24");
});
test("sample progress handles six videos and zero target", () => {
  assert.equal(progress(3, 6), 50);
  assert.equal(progress(8, 6), 100);
  assert.equal(progress(1, 0), 0);
});
test("moving floors passes through staircase", () => {
  assert.deepEqual(route({ x: 25, y: 48 }, { x: 75, y: 79 }), [
    { x: 50, y: 48 },
    { x: 50, y: 79 },
    { x: 75, y: 79 },
  ]);
});
