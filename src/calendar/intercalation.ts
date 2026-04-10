import { HPCYearType } from "../core/types";

export interface IntercalaryResult {
  isYearDay: boolean;
  isAdjustmentDay: boolean;
  countedDayOfYear: number;
  observableYearLength: number;
}

/**
 * HPC Calendar has no intercalary days outside the month structure.
 * All days belong to a month:
 *   Months 1-12: 28 days each (336 days total)
 *   Month 13:    29 days (STANDARD) or 30 days (EQUINOX_ADJUSTMENT)
 *
 * STANDARD year:          365 observable days (336 + 29)
 * EQUINOX_ADJUSTMENT year: 366 observable days (336 + 30)
 *
 * The weekly cycle is continuous and never resets.
 * The calendar grid resets each year at the new year boundary.
 */
export function resolveIntercalaryState(
  elapsedSinceBoundaryDays: number,
  yearType: HPCYearType
): IntercalaryResult {
  const observableYearLength = yearType === "EQUINOX_ADJUSTMENT" ? 366 : 365;
  return {
    isYearDay: false,
    isAdjustmentDay: false,
    countedDayOfYear: elapsedSinceBoundaryDays,
    observableYearLength
  };
}