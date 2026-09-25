// Navigation and interaction policy is shared by player, NPC and future agents.
export const commonRooms = [
  "living",
  "studio",
  "gpt",
  "kitchen",
  "library",
  "basement",
  "cafe",
];
export function canEnter(actor, room) {
  return actor === "pauli" || commonRooms.includes(room);
}
export function enterRoom(actor, room, previous) {
  return canEnter(actor, room) ? room : previous;
}
export function approach(actor, object) {
  if (!canEnter(actor, object.room)) return null;
  return {
    room: object.room,
    x: object.x,
    y: object.y,
    pose: "walking",
    target: object.id,
  };
}
export function arrive(state, object) {
  if (state.target !== object.id || state.room !== object.room) return state;
  return { ...state, pose: object.pose || "using", target: null };
}
export function leave(state) {
  return { ...state, pose: "idle", target: null, y: Math.min(88, state.y + 8) };
}
export function weatherKind(code) {
  return code >= 95
    ? "storm"
    : code >= 51
      ? "rain"
      : code >= 2
        ? "cloud"
        : "clear";
}
export function safeUrl(value) {
  try {
    const u = new URL(value);
    return ["https:", "http:"].includes(u.protocol) ? u.href : "";
  } catch {
    return "";
  }
}

// The staircase/common corridor is outside Pauli's private polygon.
// Every inter-room route goes through it, including paths to exterior wings.
export function worldPath(actor, from, to, targetRoom) {
  if (!canEnter(actor, targetRoom)) return [];
  const corridor = 55;
  if (from.y === to.y) return [to];
  return [{ x: corridor, y: from.y }, { x: corridor, y: to.y }, to];
}
