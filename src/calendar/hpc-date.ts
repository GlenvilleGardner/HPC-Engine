import { HPC_CONFIG, HPC_EPOCH } from "../core/epoch";
import { buildTimeTracks } from "../core/time-tracks";
import { HpcDateRecord } from "../core/types";
import { buildIntercalaryState } from "../core/intercalary";
import {
  getCountedDayOfYear,
  getMonthFromCountedDay,
  getDayOfMonthFromCountedDay,
  getCountedYearIndex
} from "./structure";
import { getWeekdayFromIndex } from "./weekdays";

const CREATION_WEEKDAY_INDEX_AT_EPOCH_EQUINOX = 3;
// Sunday=0, Monday=1, Tuesday=2, Wednesday=3

export function resolveHpcDate(target: Date): HpcDateRecord {
  const tracks = buildTimeTracks(target);
  const intercalary = buildIntercalaryState(tracks.elapsedSolarDaysFloat);

  const countedYearIndex = getCountedYearIndex(tracks.elapsedSolarDaysWhole);
  const countedDayOfYear = getCountedDayOfYear(tracks.elapsedSolarDaysWhole);

  const hpcMonth = getMonthFromCountedDay(countedDayOfYear);
  const hpcDay = getDayOfMonthFromCountedDay(countedDayOfYear);

  const weekdayIndex =
    CREATION_WEEKDAY_INDEX_AT_EPOCH_EQUINOX + countedDayOfYear;

  const weekday = getWeekdayFromIndex(weekdayIndex);

  return {
    hpcYear: HPC_CONFIG.baseCreationYearAtEpoch + countedYearIndex,
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
