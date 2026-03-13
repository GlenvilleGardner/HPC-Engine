import { resolveHpcYearBoundaryUtc } from "./astronomy/year-boundary";

const location = {
  latitude: 40.74,
  longitude: -74.03
};

async function main() {

  const result = await resolveHpcYearBoundaryUtc(2026, location);

  console.log("Equinox UTC:", result.equinoxUtc.toISOString());
  console.log("Boundary Sunset UTC:", result.boundarySunsetUtc.toISOString());
  console.log("Used Next Day Sunset:", result.usedNextDaySunset);

}

main();
