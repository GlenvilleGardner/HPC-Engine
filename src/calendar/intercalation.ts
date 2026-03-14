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
  const maxDayIndex = observableYearLength - 1;

  const countedDayOfYear =
    elapsedSinceBoundaryDays < 0
      ? 0
      : elapsedSinceBoundaryDays > maxDayIndex
        ? maxDayIndex
        : elapsedSinceBoundaryDays;

  const isAdjustmentDay = observableYearLength >= 366 && countedDayOfYear === maxDayIndex;

  return {
    isYearDay: false,
    isAdjustmentDay,
    countedDayOfYear,
    observableYearLength
  };
}
