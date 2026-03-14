import { writeFileSync } from "node:fs";
import { resolveHpcYearBoundaryUtc } from "./astronomy/year-boundary";
import { getEquinox, getSolarLongitude } from "./services/astronomy-authority-client";

const location = {
  latitude: 40.74,
  longitude: -74.03,
};

const startYear = 2000;
const endYear = 2600;

async function main() {
  const rows: Array<{
    year: number;
    kernel: string;
    latitude: number;
    longitude: number;
    equinoxUtc: string;
    solarLongitudeDeg: number;
    boundarySunsetUtc: string;
    usedNextDaySunset: boolean;
  }> = [];

  for (let year = startYear; year <= endYear; year++) {
    try {
      const eq = await getEquinox(year);
      const boundary = await resolveHpcYearBoundaryUtc(year, location);
      const lon = await getSolarLongitude(boundary.equinoxUtc);

      rows.push({
        year,
        kernel: eq.kernel ?? "",
        latitude: location.latitude,
        longitude: location.longitude,
        equinoxUtc: boundary.equinoxUtc.toISOString(),
        solarLongitudeDeg: lon.solarLongitude,
        boundarySunsetUtc: boundary.boundarySunsetUtc.toISOString(),
        usedNextDaySunset: boundary.usedNextDaySunset
      });

      if (year % 25 === 0) {
        console.log(`Processed year ${year}`);
      }
    } catch (err) {
      console.error(`Failed at year ${year}:`, err);
      break;
    }
  }

  writeFileSync(
    "hpc-boundary-validation-2000-2600.json",
    JSON.stringify(rows, null, 2),
    "utf8"
  );

  console.log("Done: hpc-boundary-validation-2000-2600.json");
}

main().catch((err) => {
  console.error("Validation export failed:", err);
  process.exit(1);
});
