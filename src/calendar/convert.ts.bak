import { GeoLocation } from "../core/types";
import { resolveHpcDate } from "./hpc-date";
import { resolveHpcYearBoundaryUtc } from "../astronomy/year-boundary";
import { HPC_CONFIG } from "../core/epoch";

function mapHpcYearToBoundaryGregorianYear(hpcYear: number): number {
  return 2019 + (hpcYear - (HPC_CONFIG.baseCreationYearAtEpoch + 1));
}

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
  const boundaryGregorianYear = mapHpcYearToBoundaryGregorianYear(hpcYear);
  const boundary = await resolveHpcYearBoundaryUtc(boundaryGregorianYear, location);

  const countedOffsetDays = ((hpcMonth - 1) * 28) + (hpcDay - 1);

  return new Date(
    boundary.boundarySunsetUtc.getTime() + countedOffsetDays * 86400000
  );
}
