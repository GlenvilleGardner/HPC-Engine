import { GeoLocation } from "../core/types";
import { HPC_CONFIG } from "../core/epoch";
import { resolveHpcDate } from "./hpc-date";
import { resolveHpcYearBoundaryUtc } from "../astronomy/year-boundary";
import {
  HPC_MONTH_13_STANDARD_DAYS,
  HPC_MONTH_13_ADJUSTMENT_DAYS
} from "../core/epoch";

const DAYS_PER_MONTH = 28;
const EPOCH_GREGORIAN_BOUNDARY_YEAR = 2019;

function getDayIndexFromHpcDate(
  month: number,
  day: number,
  yearType: "STANDARD" | "EQUINOX_ADJUSTMENT"
): number {
  if (month < 1 || month > 13) {
    throw new Error("Invalid HPC month");
  }

  if (month <= 12) {
    if (day < 1 || day > DAYS_PER_MONTH) {
      throw new Error("Invalid HPC day for months 1-12");
    }

    return ((month - 1) * DAYS_PER_MONTH) + (day - 1);
  }

  const month13Length =
    yearType === "EQUINOX_ADJUSTMENT"
      ? HPC_MONTH_13_ADJUSTMENT_DAYS
      : HPC_MONTH_13_STANDARD_DAYS;

  if (day < 1 || day > month13Length) {
    throw new Error("Invalid HPC day for month 13");
  }

  return (12 * DAYS_PER_MONTH) + (day - 1);
}

function mapHpcYearToBoundaryGregorianYear(hpcYear: number): number {
  const firstHpcYearAt2019Boundary = HPC_CONFIG.baseCreationYearAtEpoch + 1;
  return EPOCH_GREGORIAN_BOUNDARY_YEAR + (hpcYear - firstHpcYearAt2019Boundary);
}

export async function gregorianToHpc(
  target: Date,
  location: GeoLocation
) {
  return resolveHpcDate(target, location);
}

export async function hpcToGregorian(
  hpcYear: number,
  month: number,
  day: number,
  location: GeoLocation
): Promise<Date> {
  const gregorianBoundaryYear = mapHpcYearToBoundaryGregorianYear(hpcYear);

  const boundary = await resolveHpcYearBoundaryUtc(gregorianBoundaryYear, location);

  const dayIndex = getDayIndexFromHpcDate(
    month,
    day,
    boundary.yearType
  );

  const result = new Date(boundary.boundarySunsetUtc);
  result.setUTCDate(result.getUTCDate() + dayIndex);

  return result;
}
