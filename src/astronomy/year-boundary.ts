import { GeoLocation } from "../core/types";
import { getSpringEquinoxUtc } from "./equinox";
import { getLocalSunsetUtc } from "../sunset/sunset";

export interface YearBoundaryResult {
  equinoxUtc: Date;
  boundarySunsetUtc: Date;
  usedNextDaySunset: boolean;
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

  const sameDaySunsetUtc = getLocalSunsetUtc(equinoxDay, location);

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
    boundarySunsetUtc: getLocalSunsetUtc(nextDay, location),
    usedNextDaySunset: true
  };
}
