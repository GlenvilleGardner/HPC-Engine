export interface CycleInput {
  cycleStartElapsedDay: number;
  averageCycleLength: number;
  averageLutealLength: number;
}

export interface FertilityPrediction {
  cycleDay: number;
  estimatedOvulationDay: number;
  fertileWindowStart: number;
  fertileWindowEnd: number;
  lutealDay: number | null;
}
