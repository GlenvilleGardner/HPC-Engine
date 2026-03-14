import { resolveHpcYearBoundaryUtc } from "../astronomy/year-boundary";
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

  const result = await resolveHpcYearBoundaryUtc(
    request.year,
    {
      latitude: request.latitude,
      longitude: request.longitude
    }
  );

  const response: YearBoundaryResponse = {
    year: request.year,
    equinoxUtc: result.equinoxUtc.toISOString(),
    boundarySunsetUtc: result.boundarySunsetUtc.toISOString(),
    classification: result.classification,
    yearType: result.yearType
  };

  yearBoundaryCache.set(cacheKey, response);

  return response;
}
