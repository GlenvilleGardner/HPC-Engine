import { TimeTracks } from "./types";
import { getEpochMs } from "./epoch";

const MS_PER_DAY = 86400000;
const JULIAN_UNIX_EPOCH_OFFSET = 2440587.5;

export function toJulianDay(date: Date): number {
  return date.getTime() / MS_PER_DAY + JULIAN_UNIX_EPOCH_OFFSET;
}

export function toJulianDayNumber(julianDay: number): number {
  return Math.floor(julianDay + 0.5);
}

export function toModifiedJulianDay(julianDay: number): number {
  return julianDay - 2400000.5;
}

export function buildTimeTracks(target: Date): TimeTracks {
  const epochMs = getEpochMs();
  const targetMs = target.getTime();

  const elapsedSolarDaysFloat = (targetMs - epochMs) / MS_PER_DAY;
  const elapsedSolarDaysWhole = Math.floor(elapsedSolarDaysFloat);

  const julianDay = toJulianDay(target);
  const julianDayNumber = toJulianDayNumber(julianDay);
  const modifiedJulianDay = toModifiedJulianDay(julianDay);

  return {
    epochMs,
    targetMs,
    elapsedSolarDaysFloat,
    elapsedSolarDaysWhole,
    julianDay,
    julianDayNumber,
    modifiedJulianDay
  };
}
