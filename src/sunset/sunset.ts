import { GeoLocation } from "../core/types";
import { validateGeoLocation } from "./geo";

function dayOfYearUtc(date: Date): number {
  const start = Date.UTC(date.getUTCFullYear(), 0, 0);
  const current = Date.UTC(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate()
  );
  return Math.floor((current - start) / 86400000);
}

function solarDeclinationApprox(dayOfYear: number): number {
  const rad = Math.PI / 180;
  return 23.44 * Math.sin(((360 * (dayOfYear + 284)) / 365) * rad);
}

export function getLocalSunsetUtc(date: Date, location: GeoLocation): Date {
  validateGeoLocation(location);

  const n = dayOfYearUtc(date);
  const declinationDeg = solarDeclinationApprox(n);

  const latRad = (location.latitude * Math.PI) / 180;
  const decRad = (declinationDeg * Math.PI) / 180;

  const solarAltitudeDeg = -0.833;
  const solarAltitudeRad = (solarAltitudeDeg * Math.PI) / 180;

  const cosH =
    (Math.sin(solarAltitudeRad) -
      Math.sin(latRad) * Math.sin(decRad)) /
    (Math.cos(latRad) * Math.cos(decRad));

  if (cosH < -1 || cosH > 1) {
    throw new Error("Sunset cannot be resolved for this date/location.");
  }

  const hourAngle = Math.acos(cosH);
  const hourAngleHours = (hourAngle * 180) / Math.PI / 15;

  const utcHoursApprox = 12 + hourAngleHours - location.longitude / 15;

  const result = new Date(Date.UTC(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate(),
    0, 0, 0, 0
  ));

  const wholeHours = Math.floor(utcHoursApprox);
  const wholeMinutes = Math.floor((utcHoursApprox - wholeHours) * 60);
  const seconds = Math.floor((((utcHoursApprox - wholeHours) * 60) - wholeMinutes) * 60);

  result.setUTCHours(wholeHours, wholeMinutes, seconds, 0);
  return result;
}
