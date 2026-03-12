import { FertilityPrediction, CycleInput } from "./types";

export function predictCycleFromElapsedDay(
  currentElapsedDay: number,
  input: CycleInput
): FertilityPrediction {
  const cycleDay =
    currentElapsedDay - input.cycleStartElapsedDay + 1;

  const estimatedOvulationDay =
    input.averageCycleLength - input.averageLutealLength;

  const fertileWindowStart = estimatedOvulationDay - 5;
  const fertileWindowEnd = estimatedOvulationDay + 1;

  let lutealDay: number | null = null;

  if (cycleDay > estimatedOvulationDay) {
    lutealDay = cycleDay - estimatedOvulationDay;
  }

  return {
    cycleDay,
    estimatedOvulationDay,
    fertileWindowStart,
    fertileWindowEnd,
    lutealDay
  };
}
