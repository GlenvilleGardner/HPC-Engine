export interface EquinoxResponse {
  year: number;
  kernel?: string;
  equinoxUTC: string;
}

export interface SolarLongitudeResponse {
  date: string;
  kernel?: string;
  solarLongitude: number;
}

export interface SunsetResponse {
  date: string;
  latitude: number;
  longitude: number;
  kernel?: string;
  sunsetUTC: string;
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
