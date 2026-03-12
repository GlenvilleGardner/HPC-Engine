import { GeoLocation } from "../core/types";
import { resolveHpcDate } from "./hpc-date";
import { resolveHpcYearBoundaryUtc } from "../astronomy/year-boundary";

export async function gregorianToHpc(
  target: Date,
  location: GeoLocation
) {
  return resolveHpcDate(target, location);
}

export async function hpcToGregorian(
  hpcYear: number,
  hpcMonth: number,
  hpcDay: number,
  location: GeoLocation
): Promise<Date> {
  const gregorianYear = 2019 + (hpcYear - 6039);
  const boundary = await resolveHpcYearBoundaryUtc(gregorianYear, location);

  const dayOffset = ((hpcMonth - 1) * 28) + (hpcDay - 1);

  return new Date(
    boundary.boundarySunsetUtc.getTime() + dayOffset * 86400000
  );
}
