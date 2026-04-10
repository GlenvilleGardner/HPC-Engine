import { GeoLocation, HpcDateRecord, HPCYearType } from "../core/types";
import { buildTimeTracks } from "../core/time-tracks";
import { getContinuousWeekdayIndex } from "./structure";
import { getWeekdayFromIndex } from "./weekdays";
import { resolveHpcYearForDate } from "./year-resolver";
import { resolveHpcYearBoundaryUtc } from "../astronomy/year-boundary";
import { resolveGlobalHpcYearBoundaryUtc } from "../astronomy/global-season-boundary";
import { resolveIntercalaryState } from "./intercalation";
import { getMonthFullName } from "./month-names";
import {
  HPC_STANDARD_YEAR_DAYS,
  HPC_ADJUSTMENT_YEAR_DAYS
} from "../core/epoch";

const DAYS_PER_MONTH = 28;
const MONTHS_1_TO_12_TOTAL = 12 * DAYS_PER_MONTH; // 336

/**
 * Maps a 0-indexed counted day of year to month and day.
 *
 * Months 1-12: 28 days each (days 0-335)
 * Month 13:    29 days standard (days 336-364)
 *              30 days adjustment (days 336-365)
 *
 * No intercalary days. All days belong to a month.
 */
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

export async function resolveHpcDate(
  target: Date,
  location: GeoLocation
): Promise<HpcDateRecord> {
  const tracks = buildTimeTracks(target);
  const resolvedYear = await resolveHpcYearForDate(target, location);

  const [, nextBoundary, globalBoundary] = await Promise.all([
    resolveHpcYearBoundaryUtc(resolvedYear.gregorianBoundaryYear, location),
    resolveHpcYearBoundaryUtc(resolvedYear.gregorianBoundaryYear + 1, location),
    resolveGlobalHpcYearBoundaryUtc(resolvedYear.gregorianBoundaryYear)
  ]);

  const elapsedSinceBoundaryMs =
    target.getTime() - resolvedYear.boundaryUtc.getTime();
  const elapsedSinceBoundaryDays =
    Math.floor(elapsedSinceBoundaryMs / 86400000);

  // No intercalary days - all elapsed days map directly to month/day
  const intercalary = resolveIntercalaryState(
    elapsedSinceBoundaryDays,
    globalBoundary.yearType
  );

  let countedDayOfYear = intercalary.countedDayOfYear;

  // Cap at the last day of this year if somehow past boundary
  if (target.getTime() < nextBoundary.boundarySunsetUtc.getTime()) {
    const maxDayIndex = getNominalObservableYearLength(globalBoundary.yearType) - 1;
    if (countedDayOfYear > maxDayIndex) {
      countedDayOfYear = maxDayIndex;
    }
  }

  const { hpcMonth, hpcDay } = getMonthAndDayFromCountedDay(
    countedDayOfYear,
    globalBoundary.yearType
  );

  // Continuous weekday: uses unbroken count from epoch
  // continuousDayFromEpoch = elapsedSolarDaysWhole + 1
  // Formula: (3 + continuousDayFromEpoch) % 7
  // Day 1 from epoch = Thursday (index 4) - Abib 1 year 6038
  const continuousDayFromEpoch = tracks.elapsedSolarDaysWhole + 1;
  const weekday = getWeekdayFromIndex(getContinuousWeekdayIndex(continuousDayFromEpoch));

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