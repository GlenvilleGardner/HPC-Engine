import { gregorianToHpc } from "../calendar/convert";
import { resolveHpcYearBoundaryUtc } from "../astronomy/year-boundary";

export interface CalendarDayRequest {
  isoDate: string;
  latitude: number;
  longitude: number;
}

export interface CalendarDayResponse {
  inputIsoDate: string;
  hpcYear: number | null;
  hpcMonth: number | null;
  hpcDay: number | null;
  weekday: string | null;
  gregorianReferenceLabel: string | null;
  boundaryYear: number;
  boundarySunsetUtc: string;
  classification: string;
  yearType: string;
}

export async function getCalendarDay(
  request: CalendarDayRequest
): Promise<CalendarDayResponse> {
  const target = new Date(request.isoDate);

  const location = {
    latitude: request.latitude,
    longitude: request.longitude
  };

  const hpc = await gregorianToHpc(target, location);
  const boundaryYear = target.getUTCFullYear();
  const boundary = await resolveHpcYearBoundaryUtc(boundaryYear, location);

  return {
    inputIsoDate: request.isoDate,
    hpcYear: hpc.hpcYear ?? null,
    hpcMonth: hpc.hpcMonth ?? null,
    hpcDay: hpc.hpcDay ?? null,
    weekday: hpc.weekday ?? null,
    gregorianReferenceLabel: hpc.gregorianReferenceLabel ?? null,
    boundaryYear,
    boundarySunsetUtc: boundary.boundarySunsetUtc.toISOString(),
    classification: boundary.classification,
    yearType: boundary.yearType
  };
}
