import { GeoLocation } from "../core/types";

export function validateGeoLocation(location: GeoLocation): void {
  if (location.latitude < -90 || location.latitude > 90) {
    throw new Error("Latitude must be between -90 and 90.");
  }

  if (location.longitude < -180 || location.longitude > 180) {
    throw new Error("Longitude must be between -180 and 180.");
  }
}
