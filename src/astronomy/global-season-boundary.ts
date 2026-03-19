import { EquinoxClassification, HPCYearType } from "../core/types";
import { getPrimaryEquinoxUtc } from "./ephemeris-client";
import { getSubsolarPoint, getSunset } from "../services/astronomy-authority-client";
import { HPC_EPOCH_YEAR } from "../core/epoch";

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

interface DriftEntry {
  yearType: HPCYearType;
  driftAfter: number;
}

const epochDriftCache = new Map<number, DriftEntry>();
epochDriftCache.set(HPC_EPOCH_YEAR, { yearType: "STANDARD", driftAfter: 0.0 });

async function ensureEpochDriftCached(targetYear: number): Promise<void> {
  if (epochDriftCache.has(targetYear)) return;

  if (targetYear > HPC_EPOCH_YEAR) {
    const cachedForwardYears = Array.from(epochDriftCache.keys()).filter(
      (y) => y >= HPC_EPOCH_YEAR
    );
    const maxCached = Math.max(...cachedForwardYears);
    let prevEquinox = await getPrimaryEquinoxUtc(maxCached);
    let drift = epochDriftCache.get(maxCached)!.driftAfter;

    for (let y = maxCached + 1; y <= targetYear; y++) {
      const thisEquinox = await getPrimaryEquinoxUtc(y);
      const daysBetween =
        (thisEquinox.getTime() - prevEquinox.getTime()) / 86_400_000;
      drift += daysBetween - 365;

      let yearType: HPCYearType;
      if (drift >= 1.0) {
        yearType = "EQUINOX_ADJUSTMENT";
        drift -= 1.0;
      } else {
        yearType = "STANDARD";
      }

      epochDriftCache.set(y, { yearType, driftAfter: drift });
      prevEquinox = thisEquinox;
    }
  } else {
    const cachedBackwardYears = Array.from(epochDriftCache.keys()).filter(
      (y) => y <= HPC_EPOCH_YEAR
    );
    const minCached = Math.min(...cachedBackwardYears);
    let nextEquinox = await getPrimaryEquinoxUtc(minCached);
    let drift = epochDriftCache.get(minCached)!.driftAfter;

    for (let y = minCached - 1; y >= targetYear; y--) {
      const thisEquinox = await getPrimaryEquinoxUtc(y);
      const daysBetween =
        (nextEquinox.getTime() - thisEquinox.getTime()) / 86_400_000;
      drift -= daysBetween - 365;

      let yearType: HPCYearType;
      if (drift <= -1.0) {
        yearType = "EQUINOX_ADJUSTMENT";
        drift += 1.0;
      } else {
        yearType = "STANDARD";
      }

      epochDriftCache.set(y, { yearType, driftAfter: drift });
      nextEquinox = thisEquinox;
    }
  }
}

async function resolveSunsetUtc(
  date: Date,
  latitude: number,
  longitude: number
): Promise<Date> {
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
    addUtcDays(equinoxDayUtc, 2),
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
    throw new Error(
      `HPC: Unable to locate observable sunset window containing equinox for year ${year}.`
    );
  }

  await ensureEpochDriftCached(year);
  const { yearType } = epochDriftCache.get(year)!;

  const classification: EquinoxClassification =
    yearType === "STANDARD" ? "WITHIN_WEDNESDAY_WINDOW" : "OUTSIDE_WINDOW";

  const boundarySunsetUtc = containingWindowEndUtc;
  const usedNextDaySunset = yearType === "EQUINOX_ADJUSTMENT";

  return {
    equinoxUtc,
    eventLatitude,
    eventLongitude,
    observableWindowStartUtc: containingWindowStartUtc,
    observableWindowEndUtc: containingWindowEndUtc,
    classification,
    yearType,
    boundarySunsetUtc,
    usedNextDaySunset,
  };
}
