export interface EquinoxResponse {
  year: number;
  kernel?: string;
  equinoxUTC: string;
}

export interface SolarLongitudeResponse {
  date: string;
  kernel?: string;
  solarLongitude: number;
  subsolarLatitude?: number;
  subsolarLongitude?: number;
}

export interface SubsolarPointResponse {
  date: string;
  subsolarLatitude: number;
  subsolarLongitude: number;
}

export interface SunsetResponse {
  date: string;
  latitude: number;
  longitude: number;
  kernel?: string;
  sunsetUTC: string;
}

export interface SeasonEventAuthorityRecord {
  utc: string;
  eventType:
    | "spring_equinox"
    | "summer_solstice"
    | "autumn_equinox"
    | "winter_solstice";
}

export interface SeasonEventsAuthorityResponse {
  year: number;
  kernel?: string;
  events: {
    spring_equinox: SeasonEventAuthorityRecord;
    summer_solstice: SeasonEventAuthorityRecord;
    autumn_equinox: SeasonEventAuthorityRecord;
    winter_solstice: SeasonEventAuthorityRecord;
  };
}

const BASE_URL = "http://127.0.0.1:8000";

export async function getEquinox(year: number): Promise<EquinoxResponse> {
  const res = await fetch(`${BASE_URL}/equinox/${year}`);

  if (!res.ok) {
    throw new Error(`Astronomy Authority error: ${res.status}`);
  }

  return res.json();
}

export async function getSolarLongitude(date: Date): Promise<SolarLongitudeResponse> {
  const iso = date.toISOString();
  const res = await fetch(`${BASE_URL}/solar_longitude?date=${encodeURIComponent(iso)}`);

  if (!res.ok) {
    throw new Error(`Astronomy Authority error: ${res.status}`);
  }

  return res.json();
}

export async function getSubsolarPoint(date: Date): Promise<SubsolarPointResponse> {
  const iso = date.toISOString();
  const res = await fetch(`${BASE_URL}/subsolar-point?date=${encodeURIComponent(iso)}`);

  if (!res.ok) {
    throw new Error(`Astronomy Authority error: ${res.status}`);
  }

  return res.json();
}

export async function getSunset(date: Date, latitude: number, longitude: number): Promise<SunsetResponse> {
  const isoDate = date.toISOString().slice(0, 10);
  const res = await fetch(
    `${BASE_URL}/sunset?date=${encodeURIComponent(isoDate)}&latitude=${latitude}&longitude=${longitude}`
  );

  if (!res.ok) {
    throw new Error(`Astronomy Authority error: ${res.status}`);
  }

  return res.json();
}

export async function getSeasonEvents(year: number): Promise<SeasonEventsAuthorityResponse> {
  const res = await fetch(`${BASE_URL}/season-events?year=${year}`);

  if (!res.ok) {
    throw new Error(`Astronomy Authority error: ${res.status}`);
  }

  return res.json();
}
