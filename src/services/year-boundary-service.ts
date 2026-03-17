import { resolveLocalObservationBoundaryUtc } from "../astronomy/year-boundary";
import { resolveGlobalHpcYearBoundaryUtc } from "../astronomy/global-season-boundary";
import { MemoryCache } from "../cache/memory-cache";

export interface YearBoundaryRequest {
  year: number;
  latitude: number;
  longitude: number;
}

export interface YearBoundaryResponse {
  year: number;
  equinoxUtc: string;
  boundarySunsetUtc: string;
  classification: string;
  yearType: string;
}

const yearBoundaryCache = new MemoryCache<YearBoundaryResponse>(60 * 60 * 1000);

function makeCacheKey(request: YearBoundaryRequest): string {
  return [
    request.year,
    request.latitude.toFixed(6),
    request.longitude.toFixed(6)
  ].join(":");
}

export async function getYearBoundary(
  request: YearBoundaryRequest
): Promise<YearBoundaryResponse> {
  const cacheKey = makeCacheKey(request);
  const cached = yearBoundaryCache.get(cacheKey);

  if (cached) {
    return cached;
  }

  const location = {
    latitude: request.latitude,
    longitude: request.longitude
  };

  const [globalBoundary, localObservation] = await Promise.all([
    resolveGlobalHpcYearBoundaryUtc(request.year),
    resolveLocalObservationBoundaryUtc(request.year, location)
  ]);

  const response: YearBoundaryResponse = {
    year: request.year,
    equinoxUtc: globalBoundary.equinoxUtc.toISOString(),
    boundarySunsetUtc: localObservation.boundarySunsetUtc.toISOString(),
    classification: globalBoundary.classification,
    yearType: globalBoundary.yearType
  };

  yearBoundaryCache.set(cacheKey, response);

  return response;
}
