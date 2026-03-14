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
  countedDaysPerYear: 364,
  monthsPerYear: 13,
  daysPerMonth: 28,
  tropicalYearDays: 365.242189
};

export function getEpochDate(): Date {
  return new Date(HPC_EPOCH.epochUtcIso);
}

export function getEpochMs(): number {
  return getEpochDate().getTime();
}
