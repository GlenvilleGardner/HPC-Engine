import { HpcWeekday } from "../core/types";

export const HPC_WEEKDAYS: HpcWeekday[] = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Sabbath"
];

export function normalizeWeekdayIndex(index: number): number {
  const mod = index % 7;
  return mod < 0 ? mod + 7 : mod;
}

export function getWeekdayFromIndex(index: number): HpcWeekday {
  return HPC_WEEKDAYS[normalizeWeekdayIndex(index)];
}
