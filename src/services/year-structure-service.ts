import { getYearBoundary } from "./year-boundary-service";

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

export async function getYearStructure(
  request: YearStructureRequest
): Promise<YearStructureResponse> {

  const boundary = await getYearBoundary({
    year: request.year,
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

  return {
    year: request.year,
    yearType: boundary.yearType,
    weekdayStart: "Thursday",
    months
  };
}
