import { getYearBoundary } from "./year-boundary-service";
import { MemoryCache } from "../cache/memory-cache";

export interface YearStructureRequest {
  year: number;
  latitude: number;
  longitude: number;
}

export interface MonthStructure {
  month: number;
  days: number;
}

export interface YearStructureResponse {
  year: number;
  yearType: string;
  weekdayStart: string;
  months: MonthStructure[];
}

const yearStructureCache = new MemoryCache<YearStructureResponse>(60 * 60 * 1000);

function makeCacheKey(request: YearStructureRequest): string {
  return [
    request.year,
    request.latitude.toFixed(6),
    request.longitude.toFixed(6)
  ].join(":");
}

export async function getYearStructure(
  request: YearStructureRequest
): Promise<YearStructureResponse> {
  const cacheKey = makeCacheKey(request);
  const cached = yearStructureCache.get(cacheKey);

  if (cached) {
    return cached;
  }

  // Use closing boundary year (year+1) to match engine weekday logic
  // HPC year structure is determined by the closing boundary, not opening
  const boundary = await getYearBoundary({
    year: request.year + 1,
    latitude: request.latitude,
    longitude: request.longitude
  });

  const months: MonthStructure[] = [];

  for (let i = 1; i <= 12; i++) {
    months.push({
      month: i,
      days: 28
    });
  }

  const month13Days = boundary.yearType === "EQUINOX_ADJUSTMENT"
    ? 30
    : 29;

  months.push({
    month: 13,
    days: month13Days
  });

  const response: YearStructureResponse = {
    year: request.year,
    yearType: boundary.yearType,
    weekdayStart: "Thursday",
    months
  };

  yearStructureCache.set(cacheKey, response);

  return response;
}