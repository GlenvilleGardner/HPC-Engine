import { EngineConfig, HpcEpochSpec } from "./types";

export const HPC_EPOCH: HpcEpochSpec = {
  epochUtcIso: "2019-03-20T21:58:00.000Z",
  epochGregorianLabel: "March 20, 2019",
  epochWeekday: "Wednesday",
  epochDescription:
    "Spring Equinox 2019 epoch anchor; Wednesday equinox with supermoon reference event."
};

export const HPC_CONFIG: EngineConfig = {
  baseCreationYearAtEpoch: 6038,
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
