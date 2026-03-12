import { getPrimaryEquinoxUtc } from "./ephemeris-client";

export async function getSpringEquinoxUtc(year: number): Promise<Date> {
  return getPrimaryEquinoxUtc(year);
}
