import { ApiValidationError } from "./api-errors";

export function parseNumber(value: unknown, name: string): number {
  const parsed = Number(value);

  if (!Number.isFinite(parsed)) {
    throw new ApiValidationError(`Invalid ${name}`, "INVALID_NUMBER");
  }

  return parsed;
}

export function parseInteger(value: unknown, name: string): number {
  const parsed = parseNumber(value, name);

  if (!Number.isInteger(parsed)) {
    throw new ApiValidationError(`Invalid ${name}: must be an integer`, "INVALID_INTEGER");
  }

  return parsed;
}

export function parseString(value: unknown, name: string): string {
  const parsed = String(value ?? "").trim();

  if (!parsed) {
    throw new ApiValidationError(`Missing ${name}`, "MISSING_STRING");
  }

  return parsed;
}

export function parseIsoDate(value: unknown, name: string): string {
  const parsed = parseString(value, name);
  const date = new Date(parsed);

  if (Number.isNaN(date.getTime())) {
    throw new ApiValidationError(`Invalid ${name}: must be a valid ISO date`, "INVALID_ISO_DATE");
  }

  return parsed;
}

export function parseLatitude(value: unknown): number {
  const latitude = parseNumber(value, "latitude");

  if (latitude < -90 || latitude > 90) {
    throw new ApiValidationError("Invalid latitude: must be between -90 and 90", "INVALID_LATITUDE");
  }

  return latitude;
}

export function parseLongitude(value: unknown): number {
  const longitude = parseNumber(value, "longitude");

  if (longitude < -180 || longitude > 180) {
    throw new ApiValidationError("Invalid longitude: must be between -180 and 180", "INVALID_LONGITUDE");
  }

  return longitude;
}

export function parseHpcMonth(value: unknown): number {
  const month = parseInteger(value, "hpcMonth");

  if (month < 1 || month > 13) {
    throw new ApiValidationError("Invalid hpcMonth: must be between 1 and 13", "INVALID_HPC_MONTH");
  }

  return month;
}

export function parseHpcDay(value: unknown): number {
  const day = parseInteger(value, "hpcDay");

  if (day < 1 || day > 30) {
    throw new ApiValidationError("Invalid hpcDay: must be between 1 and 30", "INVALID_HPC_DAY");
  }

  return day;
}

export function parseYear(value: unknown): number {
  return parseInteger(value, "year");
}

export function parseHpcYear(value: unknown): number {
  return parseInteger(value, "hpcYear");
}
