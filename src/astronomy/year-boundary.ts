import { GeoLocation, EquinoxClassification, HPCYearType } from "../core/types";
import { getSpringEquinoxUtc } from "./equinox";
import { getLocalSunsetUtc as getApproxLocalSunsetUtc } from "../sunset/sunset";
import { getSunset } from "../services/astronomy-authority-client";

export interface YearBoundaryResult {
  equinoxUtc: Date;
  observableWindowStartUtc: Date;
  observableWindowEndUtc: Date;
  classification: EquinoxClassification;
  yearType: HPCYearType;
  boundarySunsetUtc: Date;
  usedNextDaySunset: boolean;
}

async function resolveSunsetUtc(date: Date, location: GeoLocation): Promise<Date> {
  try {
    const data = await getSunset(date, location.latitude, location.longitude);
    return new Date(data.sunsetUTC);
  } catch {
    console.warn("Astronomy authority sunset unavailable, falling back to approximate sunset solver.");
    return getApproxLocalSunsetUtc(date, location);
  }
}

function startOfUtcDay(date: Date): Date {
  return new Date(Date.UTC(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate(),
    0, 0, 0, 0
  ));
}

function addUtcDays(date: Date, days: number): Date {
  const copy = new Date(date);
  copy.setUTCDate(copy.getUTCDate() + days);
  return copy;
}

export async function resolveHpcYearBoundaryUtc(
  year: number,
  location: GeoLocation
): Promise<YearBoundaryResult> {
  const equinoxUtc = await getSpringEquinoxUtc(year);

  const equinoxDayUtc = startOfUtcDay(equinoxUtc);
  const previousDayUtc = addUtcDays(equinoxDayUtc, -1);
  const nextDayUtc = addUtcDays(equinoxDayUtc, 1);

  const tuesdaySunsetUtc = await resolveSunsetUtc(previousDayUtc, location);
  const wednesdaySunsetUtc = await resolveSunsetUtc(equinoxDayUtc, location);
  const thursdaySunsetUtc = await resolveSunsetUtc(nextDayUtc, location);

  const withinWednesdayWindow =
    equinoxUtc.getTime() >= tuesdaySunsetUtc.getTime() &&
    equinoxUtc.getTime() < wednesdaySunsetUtc.getTime();

  const classification: EquinoxClassification = withinWednesdayWindow
    ? "WITHIN_WEDNESDAY_WINDOW"
    : "OUTSIDE_WINDOW";

  const yearType: HPCYearType = withinWednesdayWindow
    ? "STANDARD"
    : "EQUINOX_ADJUSTMENT";

  const boundarySunsetUtc = withinWednesdayWindow
    ? wednesdaySunsetUtc
    : thursdaySunsetUtc;

  return {
    equinoxUtc,
    observableWindowStartUtc: tuesdaySunsetUtc,
    observableWindowEndUtc: wednesdaySunsetUtc,
    classification,
    yearType,
    boundarySunsetUtc,
    usedNextDaySunset: !withinWednesdayWindow
  };
}
