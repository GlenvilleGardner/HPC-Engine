import { GeoLocation } from "../core/types";
import { HPC_CONFIG } from "../core/epoch";
import { resolveHpcYearBoundaryUtc } from "../astronomy/year-boundary";

export interface ResolvedHpcYear {
  hpcYear: number;
  gregorianYear: number;
  boundaryUtc: Date;
}

export async function resolveHpcYearForDate(
  target: Date,
  location: GeoLocation
): Promise<ResolvedHpcYear> {
  const gregorianYear = target.getUTCFullYear();

  const currentBoundary = await resolveHpcYearBoundaryUtc(gregorianYear, location);

  if (target.getTime() >= currentBoundary.boundarySunsetUtc.getTime()) {
    return {
      hpcYear: HPC_CONFIG.baseCreationYearAtEpoch + (gregorianYear - 2019) + 1,
      gregorianYear,
      boundaryUtc: currentBoundary.boundarySunsetUtc
    };
  }

  const previousBoundary = await resolveHpcYearBoundaryUtc(gregorianYear - 1, location);

  return {
    hpcYear: HPC_CONFIG.baseCreationYearAtEpoch + ((gregorianYear - 1) - 2019) + 1,
    gregorianYear: gregorianYear - 1,
    boundaryUtc: previousBoundary.boundarySunsetUtc
  };
}
