import { estimateMarchEquinoxUtc } from "./meeus-fallback";

export async function getPrimaryEquinoxUtc(year: number): Promise<Date> {
  // Placeholder for DE440/DE441 service integration.
  // For now, use the fallback solver until the ephemeris service is connected.
  return estimateMarchEquinoxUtc(year);
}
