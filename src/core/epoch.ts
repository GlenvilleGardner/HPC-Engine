import { EngineConfig, HpcEpochSpec } from "./types";

export const HPC_EPOCH: HpcEpochSpec = {
  epochUtcIso: "2019-03-20T21:58:00.000Z",
  epochGregorianLabel: "March 20, 2019",
  epochWeekday: "Wednesday",
  epochDescription:
    "Spring Equinox 2019 epoch anchor; Wednesday equinox with supermoon reference event."
};

export const HPC_CONFIG: EngineConfig = {
  // 2026 remains 6044 until the new year boundary after the spring equinox.
  // Therefore the 2019 epoch must be one year lower than the previous placeholder.
  baseCreationYearAtEpoch: 6037,
  countedDaysPerYear: 365,
  monthsPerYear: 13,
  daysPerMonth: 28,
  tropicalYearDays: 365.242189
};
export const HPC_EPOCH_YEAR = 2019;
export const HPC_EPOCH_WEEKDAY_INDEX = 3; // Wednesday
export const HPC_NEW_YEAR_WEEKDAY_INDEX = 4; // Thursday, zero-based index in HPC_WEEKDAYS
export const HPC_STANDARD_YEAR_DAYS = 365;
export const HPC_ADJUSTMENT_YEAR_DAYS = 366;
export const HPC_MONTH_13_STANDARD_DAYS = 29;
export const HPC_MONTH_13_ADJUSTMENT_DAYS = 30;

export function getEpochDate(): Date {
  return new Date(HPC_EPOCH.epochUtcIso);
}

export function getEpochMs(): number {
  return getEpochDate().getTime();
}

