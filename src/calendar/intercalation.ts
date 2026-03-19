import { HPCYearType } from "../core/types";

export interface IntercalaryResult {
  isYearDay: boolean;
  isAdjustmentDay: boolean;
  countedDayOfYear: number;
  observableYearLength: number;
}

/**
 * Resolves the intercalary state for a given day within a year.
 *
 * The observable year has the following structure:
 *
 *   STANDARD year (365 observable days):
 *     Days 0–363  → 364 counted days (months 1–13, days 1–28)
 *     Day  364    → Year Day (isYearDay = true, outside weekly count)
 *
 *   ADJUSTMENT year (366 observable days):
 *     Days 0–363  → 364 counted days (months 1–13, days 1–28)
 *     Day  364    → Year Day (isYearDay = true, outside weekly count)
 *     Day  365    → Equinox Adjustment Day (isAdjustmentDay = true)
 *
 * The weekly counter NEVER advances past day 363 (0-indexed).
 * Days 364 and 365 are observable but invisible to the weekday grid.
 * This is the mechanism that guarantees permanent weekday invariance.
 */
export function resolveIntercalaryState(
  elapsedSinceBoundaryDays: number,
  yearType: HPCYearType
): IntercalaryResult {
  const observableYearLength = yearType === "EQUINOX_ADJUSTMENT" ? 366 : 365;

  // Days 0–363 are counted structural days
  // Day 364 is always the Year Day
  // Day 365 (adjustment years only) is the Equinox Adjustment Day

  const isYearDay = elapsedSinceBoundaryDays === 364;
  const isAdjustmentDay =
    yearType === "EQUINOX_ADJUSTMENT" && elapsedSinceBoundaryDays === 365;

  // Weekday grid is capped at day 363 — intercalary days do not advance it
  const countedDayOfYear = Math.min(elapsedSinceBoundaryDays, 363);

  return {
    isYearDay,
    isAdjustmentDay,
    countedDayOfYear,
    observableYearLength
  };
}