import { resolveHpcYearBoundaryUtc } from "../src/astronomy/year-boundary";
import { resolveHpcYearForDate } from "../src/calendar/year-resolver";
import { gregorianToHpc } from "../src/calendar/convert";

const location = {
  latitude: 40.743,
  longitude: -74.032
};

async function inspect(year: number) {
  const boundary = await resolveHpcYearBoundaryUtc(year, location);

  const beforeMoment = new Date(boundary.boundarySunsetUtc.getTime() - 60 * 1000);
  const afterMoment = new Date(boundary.boundarySunsetUtc.getTime() + 60 * 1000);

  const resolvedBefore = await resolveHpcYearForDate(beforeMoment, location);
  const resolvedAfter = await resolveHpcYearForDate(afterMoment, location);

  const beforeHpc = await gregorianToHpc(beforeMoment, location);
  const afterHpc = await gregorianToHpc(afterMoment, location);

  console.log("==================================================");
  console.log("Boundary Gregorian Year:", year);
  console.log("Boundary UTC:", boundary.boundarySunsetUtc.toISOString());
  console.log("Equinox UTC:", boundary.equinoxUtc.toISOString());
  console.log("Classification:", boundary.classification);
  console.log("Year Type:", boundary.yearType);
  console.log("Used Next Day Sunset:", boundary.usedNextDaySunset);
  console.log("--- BEFORE ---");
  console.log("Before Moment UTC:", beforeMoment.toISOString());
  console.log("Resolved Before HPC Year:", resolvedBefore.hpcYear);
  console.log("Resolved Before Boundary Year:", resolvedBefore.gregorianBoundaryYear);
  console.log("Resolved Before Boundary UTC:", resolvedBefore.boundaryUtc.toISOString());
  console.log("Before HPC Date:", `${beforeHpc.hpcMonth}-${beforeHpc.hpcDay}`, beforeHpc.weekday);
  console.log("--- AFTER ---");
  console.log("After Moment UTC:", afterMoment.toISOString());
  console.log("Resolved After HPC Year:", resolvedAfter.hpcYear);
  console.log("Resolved After Boundary Year:", resolvedAfter.gregorianBoundaryYear);
  console.log("Resolved After Boundary UTC:", resolvedAfter.boundaryUtc.toISOString());
  console.log("After HPC Date:", `${afterHpc.hpcMonth}-${afterHpc.hpcDay}`, afterHpc.weekday);
}

async function run() {
  for (const year of [2003, 2008, 2014, 2020, 2025]) {
    await inspect(year);
  }
}

run().catch((err) => {
  console.error("Debug failed:", err);
  process.exit(1);
});
