import { HPCYearType } from "../core/types";
import {
  HPC_STANDARD_YEAR_DAYS,
  HPC_ADJUSTMENT_YEAR_DAYS
} from "../core/epoch";

export interface IntercalaryResult {
  isYearDay: boolean;
  isAdjustmentDay: boolean;
  countedDayOfYear: number;
  observableYearLength: number;
}

export function resolveIntercalaryState(
  elapsedSinceBoundaryDays: number,
  yearType: HPCYearType
): IntercalaryResult {
  const observableYearLength =
    yearType === "EQUINOX_ADJUSTMENT"
      ? HPC_ADJUSTMENT_YEAR_DAYS
      : HPC_STANDARD_YEAR_DAYS;

  const normalizedDay =
    ((elapsedSinceBoundaryDays % observableYearLength) + observableYearLength) %
    observableYearLength;

  const isAdjustmentDay =
    yearType === "EQUINOX_ADJUSTMENT" &&
    normalizedDay === (HPC_ADJUSTMENT_YEAR_DAYS - 1);

  return {
    isYearDay: false,
    isAdjustmentDay,
    countedDayOfYear: normalizedDay,
    observableYearLength
  };
}
