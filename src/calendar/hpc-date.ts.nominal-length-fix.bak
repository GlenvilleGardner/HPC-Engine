import { GeoLocation, HpcDateRecord, HPCYearType } from "../core/types";
import { buildTimeTracks } from "../core/time-tracks";
import { getWeekdayFromIndex } from "./weekdays";
import { resolveHpcYearForDate } from "./year-resolver";
import { resolveHpcYearBoundaryUtc } from "../astronomy/year-boundary";
import { resolveIntercalaryState } from "./intercalation";
import {
  HPC_NEW_YEAR_WEEKDAY_INDEX,
  HPC_MONTH_13_STANDARD_DAYS,
  HPC_MONTH_13_ADJUSTMENT_DAYS
} from "../core/epoch";

const DAYS_PER_MONTH = 28;
const MONTHS_1_TO_12_TOTAL = 12 * DAYS_PER_MONTH;
const FIXED_GRID_DAYS = 364;

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

  const month13Length =
    yearType === "EQUINOX_ADJUSTMENT"
      ? HPC_MONTH_13_ADJUSTMENT_DAYS
      : HPC_MONTH_13_STANDARD_DAYS;

  const month13Day = countedDayOfYear - MONTHS_1_TO_12_TOTAL + 1;

  if (month13Day < 1 || month13Day > month13Length) {
    throw new Error(
      `Counted day ${countedDayOfYear} is outside observable year length for ${yearType}.`
    );
  }

  return {
    hpcMonth: 13,
    hpcDay: month13Day
  };
}

function getGridWeekdayOffset(countedDayOfYear: number): number {
  const maxGridOffset = FIXED_GRID_DAYS - 1;
  return countedDayOfYear > maxGridOffset ? maxGridOffset : countedDayOfYear;
}

export async function resolveHpcDate(
  target: Date,
  location: GeoLocation
): Promise<HpcDateRecord> {
  const tracks = buildTimeTracks(target);
  const resolvedYear = await resolveHpcYearForDate(target, location);

  const startBoundary = await resolveHpcYearBoundaryUtc(
    resolvedYear.gregorianBoundaryYear,
    location
  );

  const nextBoundary = await resolveHpcYearBoundaryUtc(
    resolvedYear.gregorianBoundaryYear + 1,
    location
  );

  const elapsedSinceBoundaryMs =
    target.getTime() - resolvedYear.boundaryUtc.getTime();

  const elapsedSinceBoundaryDays =
    Math.floor(elapsedSinceBoundaryMs / 86400000);

  const observableYearLength =
    Math.round(
      (nextBoundary.boundarySunsetUtc.getTime() - resolvedYear.boundaryUtc.getTime()) / 86400000
    );

  const intercalary = resolveIntercalaryState(
    elapsedSinceBoundaryDays,
    observableYearLength
  );

  const countedDayOfYear = intercalary.countedDayOfYear;

  const { hpcMonth, hpcDay } = getMonthAndDayFromCountedDay(
    countedDayOfYear,
    startBoundary.yearType
  );

  const weekday = getWeekdayFromIndex(
    HPC_NEW_YEAR_WEEKDAY_INDEX + getGridWeekdayOffset(countedDayOfYear)
  );

  return {
    hpcYear: resolvedYear.hpcYear,
    hpcMonth,
    hpcDay,
    weekday,

    isYearDay: false,
    isAdjustmentDay: intercalary.isAdjustmentDay,

    elapsedSolarDaysWhole: tracks.elapsedSolarDaysWhole,
    elapsedSolarDaysFloat: tracks.elapsedSolarDaysFloat,

    julianDay: tracks.julianDay,
    julianDayNumber: tracks.julianDayNumber,
    modifiedJulianDay: tracks.modifiedJulianDay,

    gregorianIso: target.toISOString(),
    gregorianReferenceLabel: target.toUTCString()
  };
}
