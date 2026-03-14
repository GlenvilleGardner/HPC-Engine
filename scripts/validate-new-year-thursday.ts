import { resolveHpcYearBoundaryUtc } from "../src/astronomy/year-boundary";
import { gregorianToHpc } from "../src/calendar/convert";

const location = {
  latitude: 40.743,
  longitude: -74.032
};

async function run() {
  const startYear = 2000;
  const endYear = 2100;

  console.log("GregorianBoundaryYear | BoundaryUTC | HPC Year | HPC Date | Weekday");

  for (let year = startYear; year <= endYear; year++) {
    const boundary = await resolveHpcYearBoundaryUtc(year, location);

    const testMoment = new Date(boundary.boundarySunsetUtc.getTime() + 60 * 1000);
    const hpc = await gregorianToHpc(testMoment, location);

    console.log(
      year,
      "|",
      boundary.boundarySunsetUtc.toISOString(),
      "|",
      hpc.hpcYear,
      "|",
      hpc.hpcMonth + "-" + hpc.hpcDay,
      "|",
      hpc.weekday
    );
  }
}

run().catch((err) => {
  console.error("Validation failed:", err);
  process.exit(1);
});
