import { resolveHpcYearBoundaryUtc } from "../astronomy/year-boundary";

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

export async function getYearBoundary(
  request: YearBoundaryRequest
): Promise<YearBoundaryResponse> {
  const result = await resolveHpcYearBoundaryUtc(
    request.year,
    {
      latitude: request.latitude,
      longitude: request.longitude
    }
  );

  return {
    year: request.year,
    equinoxUtc: result.equinoxUtc.toISOString(),
    boundarySunsetUtc: result.boundarySunsetUtc.toISOString(),
    classification: result.classification,
    yearType: result.yearType
  };
}
