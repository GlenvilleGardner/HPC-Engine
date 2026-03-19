export type HpcWeekday =
  | "Sunday"
  | "Monday"
  | "Tuesday"
  | "Wednesday"
  | "Thursday"
  | "Friday"
  | "Sabbath";

export interface GeoLocation {
  latitude: number;
  longitude: number;
  elevationMeters?: number;
  timezone?: string;
}

export interface HpcEpochSpec {
  epochUtcIso: string;
  epochGregorianLabel: string;
  epochWeekday: HpcWeekday;
  epochDescription: string;
}

export interface TimeTracks {
  epochMs: number;
  targetMs: number;
  elapsedSolarDaysFloat: number;
  elapsedSolarDaysWhole: number;
  julianDay: number;
  julianDayNumber: number;
  modifiedJulianDay: number;
}

export interface HpcDateRecord {
  hpcYear: number;
  hpcMonth: number | null;
  hpcDay: number | null;
  monthName: string | null;
  weekday: HpcWeekday | null;

  isYearDay: boolean;
  isAdjustmentDay: boolean;

  elapsedSolarDaysWhole: number;
  elapsedSolarDaysFloat: number;

  julianDay: number;
  julianDayNumber: number;
  modifiedJulianDay: number;

  gregorianIso: string;
  gregorianReferenceLabel: string;
}

export interface HpcContinuousDateRecord {
  hpcYear: number;
  hpcMonth: number;
  hpcDay: number;
  monthName: string | null;
  weekday: HpcWeekday;
  isYearDay: boolean;
  isAdjustmentDay: boolean;
  continuousDayFromEpoch: number;
  gregorianIso: string;
  gregorianReferenceLabel: string;
}

export interface IntercalaryState {
  hasYearDay: boolean;
  hasAdjustmentDay: boolean;
  driftAccumulator: number;
}

export interface EngineConfig {
  baseCreationYearAtEpoch: number;
  countedDaysPerYear: number;
  monthsPerYear: number;
  daysPerMonth: number;
  tropicalYearDays: number;
}
export type EquinoxInstant = {
  utc: Date
  julianDay: number
}

export type ObservableBoundary = {
  localSunsetStart: Date
  localSunsetEnd: Date
}

export type EquinoxClassification =
  | "WITHIN_WEDNESDAY_WINDOW"
  | "OUTSIDE_WINDOW"

export type HPCYearType =
  | "STANDARD"
  | "EQUINOX_ADJUSTMENT"

export interface HPCYearBoundaryResult {
  astronomicalEquinox: EquinoxInstant
  observableWindow: ObservableBoundary
  classification: EquinoxClassification
  yearType: HPCYearType
}
