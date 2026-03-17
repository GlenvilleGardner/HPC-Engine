import { GeoLocation } from "../core/types";
import { getSpringEquinoxUtc } from "./equinox";
import { getLocalSunsetUtc as getApproxLocalSunsetUtc } from "../sunset/sunset";
import { getSunset } from "../services/astronomy-authority-client";
import { resolveGlobalHpcYearBoundaryUtc } from "./global-season-boundary";

export interface LocalYearBoundaryObservation {
  equinoxUtc: Date;
  observableWindowStartUtc: Date;
  observableWindowEndUtc: Date;
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

function sortDatesAscending(dates: Date[]): Date[] {
  return [...dates].sort((a, b) => a.getTime() - b.getTime());
}

export async function resolveLocalObservationBoundaryUtc(
  year: number,
  location: GeoLocation
): Promise<LocalYearBoundaryObservation> {
  const [equinoxUtc, globalBoundary] = await Promise.all([
    getSpringEquinoxUtc(year),
    resolveGlobalHpcYearBoundaryUtc(year)
  ]);

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

  const containingWindowIndex = sunsets.findIndex(
    (d) => d.getTime() === containingWindowStartUtc!.getTime()
  );

  if (containingWindowIndex < 0) {
    throw new Error("Unable to locate containing local sunset window index.");
  }

  let boundarySunsetUtc: Date;

  if (globalBoundary.usedNextDaySunset) {
    if (containingWindowIndex + 2 >= sunsets.length) {
      throw new Error("Insufficient sunset samples to resolve local next-day boundary.");
    }
    boundarySunsetUtc = sunsets[containingWindowIndex + 2];
  } else {
    boundarySunsetUtc = containingWindowEndUtc;
  }

  return {
    equinoxUtc,
    observableWindowStartUtc: containingWindowStartUtc,
    observableWindowEndUtc: containingWindowEndUtc,
    boundarySunsetUtc,
    usedNextDaySunset: globalBoundary.usedNextDaySunset
  };
}

// Temporary compatibility alias during refactor
export const resolveHpcYearBoundaryUtc = resolveLocalObservationBoundaryUtc;
