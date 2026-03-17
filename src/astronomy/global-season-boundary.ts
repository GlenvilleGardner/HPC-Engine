import { EquinoxClassification, HPCYearType } from "../core/types";
import { getPrimaryEquinoxUtc } from "./ephemeris-client";
import { getSubsolarPoint, getSunset } from "../services/astronomy-authority-client";

export interface GlobalSeasonBoundaryResult {
  equinoxUtc: Date;
  eventLatitude: number;
  eventLongitude: number;
  observableWindowStartUtc: Date;
  observableWindowEndUtc: Date;
  classification: EquinoxClassification;
  yearType: HPCYearType;
  boundarySunsetUtc: Date;
  usedNextDaySunset: boolean;
}

async function resolveSunsetUtc(date: Date, latitude: number, longitude: number): Promise<Date> {
  const data = await getSunset(date, latitude, longitude);
  return new Date(data.sunsetUTC);
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

export async function resolveGlobalHpcYearBoundaryUtc(
  year: number
): Promise<GlobalSeasonBoundaryResult> {
  const equinoxUtc = await getPrimaryEquinoxUtc(year);
  const subsolar = await getSubsolarPoint(equinoxUtc);

  const eventLatitude = subsolar.subsolarLatitude;
  const eventLongitude = subsolar.subsolarLongitude;

  const equinoxDayUtc = startOfUtcDay(equinoxUtc);

  const sampleDays = [
    addUtcDays(equinoxDayUtc, -2),
    addUtcDays(equinoxDayUtc, -1),
    equinoxDayUtc,
    addUtcDays(equinoxDayUtc, 1),
    addUtcDays(equinoxDayUtc, 2)
  ];

  const sampledSunsets = await Promise.all(
    sampleDays.map((day) => resolveSunsetUtc(day, eventLatitude, eventLongitude))
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
    throw new Error("Unable to locate global observable sunset window containing equinox.");
  }

  const localDayIndexAtWindowEnd = approximateLocalDayIndex(
    containingWindowEndUtc,
    eventLongitude
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
    throw new Error("Insufficient sunset samples to resolve global new year boundary.");
  }

  const boundarySunsetUtc = isWednesdayWindow
    ? containingWindowEndUtc
    : sunsets[containingWindowIndex + 2];

  return {
    equinoxUtc,
    eventLatitude,
    eventLongitude,
    observableWindowStartUtc: containingWindowStartUtc,
    observableWindowEndUtc: containingWindowEndUtc,
    classification,
    yearType,
    boundarySunsetUtc,
    usedNextDaySunset: !isWednesdayWindow
  };
}
