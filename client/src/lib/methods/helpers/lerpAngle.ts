export function lerpAngle(current: number, target: number, t: number) {
  const delta = ((target - current + Math.PI) % (Math.PI * 2)) - Math.PI;
  return current + delta * t;
}
