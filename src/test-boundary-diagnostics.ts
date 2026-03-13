import { resolveHpcYearBoundaryUtc } from "./astronomy/year-boundary";

const location = {
  latitude: 40.74,
  longitude: -74.03
};

async function main() {
  const years = [2024, 2025, 2026, 2027, 2028];

  for (const year of years) {
    const result = await resolveHpcYearBoundaryUtc(year, location);

    console.log("--------------------------------------------------");
    console.log("Year:", year);
    console.log("Equinox UTC:", result.equinoxUtc.toISOString());
    console.log("Boundary Sunset UTC:", result.boundarySunsetUtc.toISOString());
    console.log("Used Next Day Sunset:", result.usedNextDaySunset);
  }
}

main().catch((err) => {
  console.error("Diagnostics failed:", err);
  process.exit(1);
});
