import { resolveHpcYearBoundaryUtc } from "./astronomy/year-boundary";
import { getEquinox, getSolarLongitude } from "./services/astronomy-authority-client";

const location = {
  latitude: 40.74,
  longitude: -74.03
};

async function main() {

  const years = [2024, 2025, 2026, 2027, 2028];

  for (const year of years) {

    const eq = await getEquinox(year);
    const result = await resolveHpcYearBoundaryUtc(year, location);
    const lon = await getSolarLongitude(result.equinoxUtc);

    console.log("--------------------------------------------------");
    console.log("Year:", year);
    console.log("Kernel:", eq.kernel ?? "unknown");
    console.log("Equinox UTC:", result.equinoxUtc.toISOString());
    console.log("Solar Longitude At Equinox:", lon.solarLongitude);
    console.log("Boundary Sunset UTC:", result.boundarySunsetUtc.toISOString());
    console.log("Used Next Day Sunset:", result.usedNextDaySunset);

  }

}

main().catch((err) => {
  console.error("Research diagnostics failed:", err);
  process.exit(1);
});
