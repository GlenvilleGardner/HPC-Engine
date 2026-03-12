import { HpcDateRecord } from "../core/types";

export interface IntercalaryResult {
  isYearDay: boolean;
  isAdjustmentDay: boolean;
  countedDayOfYear: number;
}

const COUNTED_DAYS_PER_YEAR = 364;

// Tropical year drift
const TROPICAL_YEAR = 365.242189;

// Drift relative to counted year
const YEARLY_DRIFT = TROPICAL_YEAR - 365;

// Approx cycle where an extra correction day is needed
const DRIFT_THRESHOLD = 1.0;

export function resolveIntercalaryState(
  elapsedSinceBoundaryDays: number,
  hpcYear: number
): IntercalaryResult {

  // Determine position in counted year
  const countedDayOfYear =
    ((elapsedSinceBoundaryDays % COUNTED_DAYS_PER_YEAR) + COUNTED_DAYS_PER_YEAR) %
    COUNTED_DAYS_PER_YEAR;

  // Year Day occurs immediately after the 364 counted days
  const isYearDay = countedDayOfYear === COUNTED_DAYS_PER_YEAR;

  // Long-term drift accumulator
  const yearsSinceEpoch = hpcYear - 6039;

  const drift = yearsSinceEpoch * YEARLY_DRIFT;

  const isAdjustmentDay = drift >= DRIFT_THRESHOLD;

  return {
    isYearDay,
    isAdjustmentDay,
    countedDayOfYear
  };
}
