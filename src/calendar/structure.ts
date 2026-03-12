import { HPC_CONFIG } from "../core/epoch";

export function getCountedDayOfYear(elapsedSolarDaysWhole: number): number {
  const mod = elapsedSolarDaysWhole % HPC_CONFIG.countedDaysPerYear;
  return mod < 0 ? mod + HPC_CONFIG.countedDaysPerYear : mod;
}

export function getMonthFromCountedDay(countedDayOfYear: number): number {
  return Math.floor(countedDayOfYear / HPC_CONFIG.daysPerMonth) + 1;
}

export function getDayOfMonthFromCountedDay(countedDayOfYear: number): number {
  return (countedDayOfYear % HPC_CONFIG.daysPerMonth) + 1;
}

export function getCountedYearIndex(elapsedSolarDaysWhole: number): number {
  return Math.floor(elapsedSolarDaysWhole / HPC_CONFIG.tropicalYearDays);
}
