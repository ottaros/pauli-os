import test from "node:test";
import assert from "node:assert/strict";
import {
  canEnter,
  approach,
  arrive,
  leave,
  worldPath,
  weatherKind,
  safeUrl,
  commonRooms,
} from "../src/inhabitants.mjs";
test("Gepetinho is denied the private bedroom at every navigation entry", () => {
  assert.equal(canEnter("gpt", "pauli"), false);
  assert.equal(approach("gpt", { room: "pauli" }), null);
  assert.deepEqual(
    worldPath("gpt", { x: 70, y: 79 }, { x: 30, y: 48 }, "pauli"),
    [],
  );
  assert.equal(canEnter("pauli", "gpt"), true);
  for (const room of commonRooms) assert.equal(canEnter("gpt", room), true);
});
test("inter-floor paths never cross the bedroom interior", () => {
  const points = [
    { room: "studio", x: 70, y: 48 },
    { room: "living", x: 30, y: 79 },
    { room: "gpt", x: 70, y: 79 },
    { room: "kitchen", x: 14, y: 89 },
    { room: "cafe", x: 85, y: 95 },
  ];
  for (const from of points)
    for (const to of points) {
      let prev = from;
      for (const next of worldPath("gpt", from, to, to.room)) {
        for (let n = 0; n <= 100; n++) {
          const x = prev.x + ((next.x - prev.x) * n) / 100,
            y = prev.y + ((next.y - prev.y) * n) / 100;
          assert.ok(!(x < 54 && y < 52), "route enters private bedroom");
        }
        prev = next;
      }
    }
});
test("interactions require approach and support exit/cancellation", () => {
  const bed = { id: "bed", room: "pauli", x: 30, y: 60, pose: "lying" };
  const state = approach("pauli", bed);
  assert.equal(state.pose, "walking");
  assert.equal(arrive(state, bed).pose, "lying");
  assert.equal(arrive({ ...state, target: null }, bed).pose, "walking");
  assert.equal(leave(arrive(state, bed)).pose, "idle");
});
test("external links reject scripts and weather maps rain/storm", () => {
  assert.equal(safeUrl("javascript:alert(1)"), "");
  assert.equal(safeUrl("data:text/html,hi"), "");
  assert.equal(safeUrl("https://example.com"), "https://example.com/");
  assert.equal(weatherKind(95), "storm");
  assert.equal(weatherKind(61), "rain");
  assert.equal(weatherKind(3), "cloud");
  assert.equal(weatherKind(0), "clear");
});
