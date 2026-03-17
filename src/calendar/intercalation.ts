export interface IntercalaryResult {
  isYearDay: boolean;
  isAdjustmentDay: boolean;
  countedDayOfYear: number;
  observableYearLength: number;
}

export function resolveIntercalaryState(
  elapsedSinceBoundaryDays: number,
  observableYearLength: number
): IntercalaryResult {

  const countedDayOfYear = elapsedSinceBoundaryDays + 1;

  const isAdjustmentDay =
    observableYearLength === 366 &&
    countedDayOfYear === observableYearLength;

  return {
    isYearDay: false,
    isAdjustmentDay,
    countedDayOfYear,
    observableYearLength
  };
}
