export function calculateGDD(
  tMaxC: number,
  tMinC: number,
  baseTempC: number
): number {
  const mean = (tMaxC + tMinC) / 2;
  return Math.max(0, mean - baseTempC);
}
