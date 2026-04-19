import { GeoLocation, HpcDateRecord, HPCYearType } from "../core/types";
import { buildTimeTracks } from "../core/time-tracks";
import { getWeekdayFromIndex } from "./weekdays";
import { resolveHpcYearForDate } from "./year-resolver";
import { resolveHpcYearBoundaryUtc } from "../astronomy/year-boundary";
import { resolveGlobalHpcYearBoundaryUtc } from "../astronomy/global-season-boundary";
import { resolveIntercalaryState } from "./intercalation";
import { getMonthFullName } from "./month-names";
import { getSunset } from "../services/astronomy-authority-client";
import { getLocalSunsetUtc as getApproxLocalSunsetUtc } from "../sunset/sunset";
import {
  HPC_STANDARD_YEAR_DAYS,
  HPC_ADJUSTMENT_YEAR_DAYS,
  HPC_CONFIG
} from "../core/epoch";

const DAYS_PER_MONTH = 28;
const MONTHS_1_TO_12_TOTAL = 12 * DAYS_PER_MONTH; // 336
const MS_PER_DAY = 86400000;

// Epoch anchor: 6038 Abib 1 = Thursday (index 4)
const EPOCH_HPC_YEAR = HPC_CONFIG.baseCreationYearAtEpoch + 1; // 6038
const EPOCH_WEEKDAY_INDEX = 4; // Thursday

function getMonthAndDayFromCountedDay(
  countedDayOfYear: number,
  yearType: HPCYearType
): { hpcMonth: number; hpcDay: number } {
  if (countedDayOfYear < MONTHS_1_TO_12_TOTAL) {
    return {
      hpcMonth: Math.floor(countedDayOfYear / DAYS_PER_MONTH) + 1,
      hpcDay: (countedDayOfYear % DAYS_PER_MONTH) + 1
    };
  }

  const month13Day = countedDayOfYear - MONTHS_1_TO_12_TOTAL + 1;
  const month13MaxDay = yearType === "EQUINOX_ADJUSTMENT" ? 30 : 29;

  if (month13Day < 1 || month13Day > month13MaxDay) {
    throw new Error(
      `Counted day ${countedDayOfYear} is outside observable year for ${yearType}. Month 13 max = ${month13MaxDay}.`
    );
  }

  return {
    hpcMonth: 13,
    hpcDay: month13Day
  };
}

function getNominalObservableYearLength(yearType: HPCYearType): number {
  return yearType === "EQUINOX_ADJUSTMENT"
    ? HPC_ADJUSTMENT_YEAR_DAYS
    : HPC_STANDARD_YEAR_DAYS;
}

async function resolveLocalSunset(utcDay: Date, location: GeoLocation): Promise<Date> {
  try {
    const data = await getSunset(utcDay, location.latitude, location.longitude);
    return new Date(data.sunsetUTC);
  } catch {
    return getApproxLocalSunsetUtc(utcDay, location);
  }
}

export async function resolveHpcDate(
  target: Date,
  location: GeoLocation
): Promise<HpcDateRecord> {
  const tracks = buildTimeTracks(target);
  const resolvedYear = await resolveHpcYearForDate(target, location);

  const [, nextBoundary, globalBoundary] = await Promise.all([
    resolveHpcYearBoundaryUtc(resolvedYear.gregorianBoundaryYear, location),
    resolveHpcYearBoundaryUtc(resolvedYear.gregorianBoundaryYear + 1, location),
    // Option A: use closing boundary classification for current HPC year structure
    resolveGlobalHpcYearBoundaryUtc(resolvedYear.gregorianBoundaryYear + 1)
  ]);

  // Determine which HPC day the target falls in using actual local sunsets
  const targetUtcDay = new Date(Date.UTC(
    target.getUTCFullYear(),
    target.getUTCMonth(),
    target.getUTCDate()
  ));
  const previousUtcDay = new Date(Date.UTC(
    target.getUTCFullYear(),
    target.getUTCMonth(),
    target.getUTCDate() - 1
  ));

  const [targetDaySunset, previousDaySunset] = await Promise.all([
    resolveLocalSunset(targetUtcDay, location),
    resolveLocalSunset(previousUtcDay, location)
  ]);

  // If target is after today's sunset, the HPC day started at today's sunset.
  // Otherwise, it started at yesterday's sunset.
  const hpcDayStartSunset = target.getTime() >= targetDaySunset.getTime()
    ? targetDaySunset
    : previousDaySunset;

  // Count sunset-bounded days from year boundary to the current HPC day start.
  const elapsedSinceBoundaryDays = Math.round(
    (hpcDayStartSunset.getTime() - resolvedYear.boundaryUtc.getTime()) / MS_PER_DAY
  );

  const intercalary = resolveIntercalaryState(
    elapsedSinceBoundaryDays,
    globalBoundary.yearType
  );

  let countedDayOfYear = intercalary.countedDayOfYear;
  const weekdayElapsed = countedDayOfYear; // preserve pre-Option-A value for weekday calc

  // Cap at the final day index of the current year structure
  const maxDayIndex = getNominalObservableYearLength(globalBoundary.yearType) - 1;
  if (countedDayOfYear > maxDayIndex) {
    countedDayOfYear = maxDayIndex;
  }

  // Option A: global structure determines day count.
  // The day before the next boundary is always the final day of the current year.
  // For adjustment years, this guarantees Adar II / Telma day 30 exists at all locations.
  if (globalBoundary.yearType === "EQUINOX_ADJUSTMENT") {
    const msUntilNextBoundary = nextBoundary.boundarySunsetUtc.getTime() - target.getTime();
    if (msUntilNextBoundary > 0 && msUntilNextBoundary <= MS_PER_DAY) {
      countedDayOfYear = maxDayIndex;
    }
  }

  const { hpcMonth, hpcDay } = getMonthAndDayFromCountedDay(
    countedDayOfYear,
    globalBoundary.yearType
  );

  // Continuous weekday — location-independent year-by-year count from epoch anchor
  // Uses closing boundary year type matching global structure
  let totalDaysFromEpoch = 0;
  const targetHpcYear = resolvedYear.hpcYear;

  for (let y = EPOCH_HPC_YEAR; y < targetHpcYear; y++) {
    const closingGreg = 2020 + (y - EPOCH_HPC_YEAR);
    const gb = await resolveGlobalHpcYearBoundaryUtc(closingGreg);
    totalDaysFromEpoch += gb.yearType === "EQUINOX_ADJUSTMENT"
      ? HPC_ADJUSTMENT_YEAR_DAYS
      : HPC_STANDARD_YEAR_DAYS;
  }

  totalDaysFromEpoch += weekdayElapsed + 1;

  const weekdayIndex = ((EPOCH_WEEKDAY_INDEX + totalDaysFromEpoch) % 7 + 7) % 7;
  const weekday = getWeekdayFromIndex(weekdayIndex);

  return {
    hpcYear: resolvedYear.hpcYear,
    hpcMonth,
    hpcDay,
    monthName: hpcMonth !== null ? getMonthFullName(hpcMonth) : null,
    weekday,
    isYearDay: false,
    isAdjustmentDay: false,
    elapsedSolarDaysWhole: tracks.elapsedSolarDaysWhole,
    elapsedSolarDaysFloat: tracks.elapsedSolarDaysFloat,
    julianDay: tracks.julianDay,
    julianDayNumber: tracks.julianDayNumber,
    modifiedJulianDay: tracks.modifiedJulianDay,
    gregorianIso: target.toISOString(),
    gregorianReferenceLabel: target.toUTCString()
  };
}