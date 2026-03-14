import { GeoLocation } from "../core/types";
import { HPC_CONFIG } from "../core/epoch";
import { resolveHpcYearBoundaryUtc } from "../astronomy/year-boundary";

export interface ResolvedHpcYear {
  hpcYear: number;
  gregorianBoundaryYear: number;
  boundaryUtc: Date;
}

function mapBoundaryYearToHpcYear(boundaryGregorianYear: number): number {
  return (
    HPC_CONFIG.baseCreationYearAtEpoch +
    (boundaryGregorianYear - 2019) +
    1
  );
}

export async function resolveHpcYearForDate(
  target: Date,
  location: GeoLocation
): Promise<ResolvedHpcYear> {
  const gregorianYear = target.getUTCFullYear();

  const currentBoundary = await resolveHpcYearBoundaryUtc(gregorianYear, location);

  if (target.getTime() >= currentBoundary.boundarySunsetUtc.getTime()) {
    return {
      hpcYear: mapBoundaryYearToHpcYear(gregorianYear),
      gregorianBoundaryYear: gregorianYear,
      boundaryUtc: currentBoundary.boundarySunsetUtc
    };
  }

  const previousBoundaryYear = gregorianYear - 1;
  const previousBoundary = await resolveHpcYearBoundaryUtc(previousBoundaryYear, location);

  return {
    hpcYear: mapBoundaryYearToHpcYear(previousBoundaryYear),
    gregorianBoundaryYear: previousBoundaryYear,
    boundaryUtc: previousBoundary.boundarySunsetUtc
  };
}
