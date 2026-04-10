/**
 * structure.ts
 *
 * Structural constants and utility functions for the HPC calendar lattice.
 *
 * Rules:
 * - 12 months of 28 days + month 13 of 29 (standard) or 30 (adjustment) days
 * - No intercalary days, no year days, no zero days
 * - Weekly cycle is continuous from epoch
 * - Calendar grid resets each year at new year boundary
 */
import { HPC_CONFIG } from "../core/epoch";

export const COUNTED_DAYS_PER_YEAR = 364;
export const DAYS_PER_MONTH = 28;
export const MONTHS_PER_YEAR = 13;
export const WEEKS_PER_YEAR = 52;

/**
 * Returns the 0-indexed counted day position within the current year.
 */
export function getCountedDayOfYear(elapsedCountedDays: number): number {
  const mod = elapsedCountedDays % COUNTED_DAYS_PER_YEAR;
  return mod < 0 ? mod + COUNTED_DAYS_PER_YEAR : mod;
}

/**
 * Returns the 1-indexed month number (1-13) for a given 0-indexed
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
 * Returns the continuous day of year (1-indexed) from elapsed days since boundary.
 */
export function getContinuousDayOfYear(
  elapsedSinceBoundaryDays: number
): number {
  return elapsedSinceBoundaryDays + 1;
}

/**
 * Returns the continuous weekday index for a given continuousDayFromEpoch.
 *
 * Epoch: 2019-03-20 New York sunset ushers in Abib 1 = Thursday (index 4).
 * continuousDayFromEpoch = 1 corresponds to Thursday.
 *
 * Formula: (3 + continuousDayFromEpoch) % 7
 * Day 1: (3+1)%7 = 4 = Thursday
 * Day 2: (3+2)%7 = 5 = Friday
 * Day 3: (3+3)%7 = 6 = Sabbath
 */
export function getContinuousWeekdayIndex(
  continuousDayFromEpoch: number
): number {
  const mod = (3 + continuousDayFromEpoch) % 7;
  return mod < 0 ? mod + 7 : mod;
}