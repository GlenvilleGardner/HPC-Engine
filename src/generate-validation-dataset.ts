import { writeFileSync } from "node:fs";
import { resolveHpcYearBoundaryUtc } from "./astronomy/year-boundary";
import { getEquinox, getSolarLongitude } from "./services/astronomy-authority-client";

const location = {
  latitude: 40.74,
  longitude: -74.03,
};

const startYear = 2000;
const endYear = 3000;

async function main() {
  const rows: string[] = [];
  rows.push([
    "year",
    "kernel",
    "latitude",
    "longitude",
    "equinox_utc",
    "solar_longitude_deg",
    "boundary_sunset_utc",
    "used_next_day_sunset"
  ].join(","));

  for (let year = startYear; year <= endYear; year++) {
    try {
      const eq = await getEquinox(year);
      const boundary = await resolveHpcYearBoundaryUtc(year, location);
      const lon = await getSolarLongitude(boundary.equinoxUtc);

      rows.push([
        year,
        eq.kernel ?? "",
        location.latitude,
        location.longitude,
        boundary.equinoxUtc.toISOString(),
        lon.solarLongitude.toString(),
        boundary.boundarySunsetUtc.toISOString(),
        boundary.usedNextDaySunset ? "true" : "false"
      ].join(","));

      if (year % 25 === 0) {
        console.log(`Processed year ${year}`);
      }
    } catch (err) {
      console.error(`Failed at year ${year}:`, err);
      break;
    }
  }

  writeFileSync("hpc-boundary-validation-2000-3000.csv", rows.join("\n"), "utf8");
  console.log("Done: hpc-boundary-validation-2000-3000.csv");
}

main().catch((err) => {
  console.error("Validation export failed:", err);
  process.exit(1);
});
