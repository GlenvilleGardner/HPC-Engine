import { GeoLocation } from "../core/types";
import { getSpringEquinoxUtc } from "./equinox";
import { getLocalSunsetUtc as getApproxLocalSunsetUtc } from "../sunset/sunset";
import { getSunset } from "../services/astronomy-authority-client";

export interface YearBoundaryResult {
  equinoxUtc: Date;
  boundarySunsetUtc: Date;
  usedNextDaySunset: boolean;
}

async function resolveSunsetUtc(date: Date, location: GeoLocation): Promise<Date> {
  try {
    const data = await getSunset(date, location.latitude, location.longitude);
    return new Date(data.sunsetUTC);
  } catch {
    console.warn("Astronomy authority sunset unavailable, falling back to approximate sunset solver.");
    return getApproxLocalSunsetUtc(date, location);
  }
}

export async function resolveHpcYearBoundaryUtc(
  year: number,
  location: GeoLocation
): Promise<YearBoundaryResult> {
  const equinoxUtc = await getSpringEquinoxUtc(year);

  const equinoxDay = new Date(Date.UTC(
    equinoxUtc.getUTCFullYear(),
    equinoxUtc.getUTCMonth(),
    equinoxUtc.getUTCDate(),
    0, 0, 0, 0
  ));

  const sameDaySunsetUtc = await resolveSunsetUtc(equinoxDay, location);

  if (equinoxUtc.getTime() < sameDaySunsetUtc.getTime()) {
    return {
      equinoxUtc,
      boundarySunsetUtc: sameDaySunsetUtc,
      usedNextDaySunset: false
    };
  }

  const nextDay = new Date(equinoxDay);
  nextDay.setUTCDate(nextDay.getUTCDate() + 1);

  return {
    equinoxUtc,
    boundarySunsetUtc: await resolveSunsetUtc(nextDay, location),
    usedNextDaySunset: true
  };
}
