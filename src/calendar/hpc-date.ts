import { GeoLocation, HpcDateRecord } from "../core/types";
import { buildTimeTracks } from "../core/time-tracks";
import { getWeekdayFromIndex } from "./weekdays";
import { resolveHpcYearForDate } from "./year-resolver";

const DAYS_PER_MONTH = 28;
const MONTHS_PER_YEAR = 13;
const COUNTED_DAYS_PER_YEAR = DAYS_PER_MONTH * MONTHS_PER_YEAR;

// Creation-week model:
// Wednesday equinox day corresponds to weekday index 3
// Thursday new year begins at sunset after the equinox boundary
const THURSDAY_INDEX = 4;

export async function resolveHpcDate(
  target: Date,
  location: GeoLocation
): Promise<HpcDateRecord> {
  const tracks = buildTimeTracks(target);
  const resolvedYear = await resolveHpcYearForDate(target, location);

  const elapsedSinceBoundaryMs =
    target.getTime() - resolvedYear.boundaryUtc.getTime();

  const elapsedSinceBoundaryDays =
    Math.floor(elapsedSinceBoundaryMs / 86400000);

  const countedDayOfYear =
    ((elapsedSinceBoundaryDays % COUNTED_DAYS_PER_YEAR) + COUNTED_DAYS_PER_YEAR) %
    COUNTED_DAYS_PER_YEAR;

  const hpcMonth = Math.floor(countedDayOfYear / DAYS_PER_MONTH) + 1;
  const hpcDay = (countedDayOfYear % DAYS_PER_MONTH) + 1;

  const weekday = getWeekdayFromIndex(THURSDAY_INDEX + countedDayOfYear);

  return {
    hpcYear: resolvedYear.hpcYear,
    hpcMonth,
    hpcDay,
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
