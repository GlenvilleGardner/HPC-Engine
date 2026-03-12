import { HPC_CONFIG } from "./epoch";
import { IntercalaryState } from "./types";

export function buildIntercalaryState(
  elapsedSolarDaysFloat: number
): IntercalaryState {
  const solarExcessPerYear = HPC_CONFIG.tropicalYearDays - 365;
  const approximateYearsElapsed =
    elapsedSolarDaysFloat / HPC_CONFIG.tropicalYearDays;

  const rawDrift = approximateYearsElapsed * solarExcessPerYear;

  const adjustmentDaysUsed = Math.floor(rawDrift);
  const driftAccumulator = rawDrift - adjustmentDaysUsed;

  return {
    hasYearDay: true,
    hasAdjustmentDay: false,
    driftAccumulator
  };
}

export function shouldInsertAdjustmentDay(
  driftAccumulator: number
): boolean {
  return driftAccumulator >= 1;
}
