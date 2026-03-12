export function estimateMarchEquinoxUtc(year: number): Date {
  const Y = (year - 2000) / 1000;

  const jde =
    2451623.80984 +
    365242.37404 * Y +
    0.05169 * Y * Y -
    0.00411 * Y * Y * Y -
    0.00057 * Y * Y * Y * Y;

  const unixMs = (jde - 2440587.5) * 86400000;
  return new Date(unixMs);
}
