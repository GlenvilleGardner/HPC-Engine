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

function approximateLocalDayIndex(date: Date, longitude: number): number {
  const offsetHours = longitude / 15;
  const localMs = date.getTime() + (offsetHours * 60 * 60 * 1000);
  return new Date(localMs).getUTCDay();
}

function sortDatesAscending(dates: Date[]): Date[] {
  return [...dates].sort((a, b) => a.getTime() - b.getTime());
}

export async function resolveHpcYearBoundaryUtc(
  year: number,
  location: GeoLocation
): Promise<YearBoundaryResult> {
  const equinoxUtc = await getSpringEquinoxUtc(year);
  const equinoxDayUtc = startOfUtcDay(equinoxUtc);

  const sampleDays = [
    addUtcDays(equinoxDayUtc, -2),
    addUtcDays(equinoxDayUtc, -1),
    equinoxDayUtc,
    addUtcDays(equinoxDayUtc, 1),
    addUtcDays(equinoxDayUtc, 2)
  ];

  const sampledSunsets = await Promise.all(
    sampleDays.map((day) => resolveSunsetUtc(day, location))
  );

  const sunsets = sortDatesAscending(sampledSunsets);

  let containingWindowStartUtc: Date | null = null;
  let containingWindowEndUtc: Date | null = null;

  for (let i = 0; i < sunsets.length - 1; i++) {
    const start = sunsets[i];
    const end = sunsets[i + 1];

    if (
      equinoxUtc.getTime() >= start.getTime() &&
      equinoxUtc.getTime() < end.getTime()
    ) {
      containingWindowStartUtc = start;
      containingWindowEndUtc = end;
      break;
    }
  }

  if (!containingWindowStartUtc || !containingWindowEndUtc) {
    throw new Error("Unable to locate observable sunset window containing equinox.");
  }

  const localDayIndexAtWindowEnd = approximateLocalDayIndex(
    containingWindowEndUtc,
    location.longitude
  );

  const isWednesdayWindow = localDayIndexAtWindowEnd === 3;

  const classification: EquinoxClassification = isWednesdayWindow
    ? "WITHIN_WEDNESDAY_WINDOW"
    : "OUTSIDE_WINDOW";

  const yearType: HPCYearType = isWednesdayWindow
    ? "STANDARD"
    : "EQUINOX_ADJUSTMENT";

  const containingWindowIndex = sunsets.findIndex(
    (d) => d.getTime() === containingWindowStartUtc!.getTime()
  );

  if (containingWindowIndex < 0 || containingWindowIndex + 2 >= sunsets.length) {
    throw new Error("Insufficient sunset samples to resolve new year boundary.");
  }

  const boundarySunsetUtc = isWednesdayWindow
    ? containingWindowEndUtc
    : sunsets[containingWindowIndex + 2];

  return {
    equinoxUtc,
    observableWindowStartUtc: containingWindowStartUtc,
    observableWindowEndUtc: containingWindowEndUtc,
    classification,
    yearType,
    boundarySunsetUtc,
    usedNextDaySunset: !isWednesdayWindow
  };
}
