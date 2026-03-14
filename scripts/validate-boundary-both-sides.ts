import { resolveHpcYearBoundaryUtc } from "../src/astronomy/year-boundary";
import { gregorianToHpc } from "../src/calendar/convert";

const location = {
  latitude: 40.743,
  longitude: -74.032
};

async function run() {
  const startYear = 2000;
  const endYear = 2025;

  console.log("Year | Before Boundary -> HPC Date / Weekday | After Boundary -> HPC Date / Weekday");

  for (let year = startYear; year <= endYear; year++) {
    const boundary = await resolveHpcYearBoundaryUtc(year, location);

    const beforeMoment = new Date(boundary.boundarySunsetUtc.getTime() - 60 * 1000);
    const afterMoment = new Date(boundary.boundarySunsetUtc.getTime() + 60 * 1000);

    const beforeHpc = await gregorianToHpc(beforeMoment, location);
    const afterHpc = await gregorianToHpc(afterMoment, location);

    console.log(
      year,
      "|",
      `${beforeHpc.hpcMonth}-${beforeHpc.hpcDay} ${beforeHpc.weekday}`,
      "|",
      `${afterHpc.hpcMonth}-${afterHpc.hpcDay} ${afterHpc.weekday}`
    );
  }
}

run().catch((err) => {
  console.error("Validation failed:", err);
  process.exit(1);
});
