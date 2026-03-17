import { estimateMarchEquinoxUtc } from "./meeus-fallback";
import {
  getEquinox,
  getSeasonEvents,
} from "../services/astronomy-authority-client";

export async function getPrimaryEquinoxUtc(year: number): Promise<Date> {
  try {
    const seasonData = await getSeasonEvents(year);
    return new Date(seasonData.events.spring_equinox.utc);
  } catch {
    try {
      const equinoxData = await getEquinox(year);
      return new Date(equinoxData.equinoxUTC);
    } catch {
      console.warn("Astronomy authority unavailable, falling back to Meeus solver.");
      return estimateMarchEquinoxUtc(year);
    }
  }
}
