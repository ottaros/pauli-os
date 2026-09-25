export function localDay(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
export function progress(videos, target) {
  return target > 0 ? Math.min(100, Math.round((videos / target) * 100)) : 0;
}
export function route(from, to) {
  const path = [];
  if (from.y < 57 !== to.y < 57) {
    path.push(
      { x: 50, y: from.y < 57 ? 48 : 79 },
      { x: 50, y: to.y < 57 ? 48 : 79 },
    );
  }
  path.push(to);
  return path;
}
