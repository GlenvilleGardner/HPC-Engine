import { estimateMarchEquinoxUtc } from "./meeus-fallback";
import { getEquinox } from "../services/astronomy-authority-client";

export async function getPrimaryEquinoxUtc(year: number): Promise<Date> {
  try {
    const data = await getEquinox(year);
    return new Date(data.equinoxUTC);
  } catch {
    console.warn("Astronomy authority unavailable, falling back to Meeus solver.");
    return estimateMarchEquinoxUtc(year);
  }
}
