/**
 * structure.ts
 *
 * Structural constants and utility functions for the HPC calendar lattice.
 *
 * These functions operate on the 364-day counted year only.
 * They are used for arithmetic position calculations within the grid.
 * Year type classification (STANDARD vs EQUINOX_ADJUSTMENT) is handled
 * by global-season-boundary.ts — not here.
 */

import { HPC_CONFIG } from "../core/epoch";

export const COUNTED_DAYS_PER_YEAR = 364;
export const DAYS_PER_MONTH = 28;
export const MONTHS_PER_YEAR = 13;
export const WEEKS_PER_YEAR = 52;

/**
 * Returns the 0-indexed counted day position within the current year.
 * Input is elapsed counted days since epoch (not elapsed solar days).
 */
export function getCountedDayOfYear(elapsedCountedDays: number): number {
  const mod = elapsedCountedDays % COUNTED_DAYS_PER_YEAR;
  return mod < 0 ? mod + COUNTED_DAYS_PER_YEAR : mod;
}

/**
 * Returns the 1-indexed month number (1–13) for a given 0-indexed
 * counted day of year.
 */
export function getMonthFromCountedDay(countedDayOfYear: number): number {
  return Math.floor(countedDayOfYear / DAYS_PER_MONTH) + 1;
}

/**
 * Returns the 1-indexed day within the month for a given 0-indexed
 * counted day of year.
 */
export function getDayOfMonthFromCountedDay(countedDayOfYear: number): number {
  return (countedDayOfYear % DAYS_PER_MONTH) + 1;
}

/**
 * Returns the weekday index (0–6) for a given 1-indexed day of month.
 * 0 = Thursday, 1 = Friday, 2 = Sabbath, 3 = Sunday,
 * 4 = Monday, 5 = Tuesday, 6 = Wednesday
 *
 * Formula: W = (day - 1) mod 7
 * This is invariant across all months and all years due to annual grid reset.
 */
export function getWeekdayIndexFromDay(day: number): number {
  return (day - 1) % 7;
}

/**
 * Returns the complete HPC year counted structure as a summary object.
 */
export function getYearStructureSummary() {
  return {
    countedDaysPerYear: COUNTED_DAYS_PER_YEAR,
    daysPerMonth: DAYS_PER_MONTH,
    monthsPerYear: MONTHS_PER_YEAR,
    weeksPerYear: WEEKS_PER_YEAR,
    tropicalYearDays: HPC_CONFIG.tropicalYearDays,
    fractionalExcessPerYear: HPC_CONFIG.tropicalYearDays - 365
  };
}

/**
 * Resolves the continuous HPC day position including intercalary days.
 *
 * In continuous count mode every day advances the count including
 * the Year Day and Equinox Adjustment Day. The weekday therefore
 * advances through intercalary days just as in the Gregorian system.
 *
 * This mode is for research and chronological calculation only.
 * The standard HPC mode remains the authoritative liturgical calendar.
 *
 * Standard year:   364 counted + 1 Year Day = 365 continuous days
 * Adjustment year: 364 counted + 1 Year Day + 1 EAD = 366 continuous days
 */
export function getContinuousDayOfYear(
  elapsedSinceBoundaryDays: number
): number {
  return elapsedSinceBoundaryDays + 1;
}

/**
 * Returns the continuous weekday index including intercalary days.
 * Unlike the standard mode, this advances through every day.
 */
export function getContinuousWeekdayIndex(
  continuousDayFromEpoch: number
): number {
  // Epoch day 0 = Wednesday sunset (HPC Thursday = index 4 in HPC_WEEKDAYS)
  // Thursday = index 0 in continuous count (same as standard day 1)
  const mod = continuousDayFromEpoch % 7;
  return mod < 0 ? mod + 7 : mod;
}