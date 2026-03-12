import { HPC_CONFIG, HPC_EPOCH } from "./core/epoch";
import { buildTimeTracks } from "./core/time-tracks";
import { resolveHpcDate } from "./calendar/hpc-date";
import { resolveHpcYearBoundaryUtc } from "./astronomy/year-boundary";
import { predictCycleFromElapsedDay } from "./fertility/cycle-engine";
import { GeoLocation } from "./core/types";

async function main(): Promise<void> {
  const now = new Date();
  const tracks = buildTimeTracks(now);
  const hpc = resolveHpcDate(now);

  const location: GeoLocation = {
    latitude: 40.744,
    longitude: -74.032
  };

  const boundary = await resolveHpcYearBoundaryUtc(2026, location);

  const fertility = predictCycleFromElapsedDay(
    tracks.elapsedSolarDaysWhole,
    {
      cycleStartElapsedDay: tracks.elapsedSolarDaysWhole - 10,
      averageCycleLength: 28,
      averageLutealLength: 14
    }
  );

  console.log("HPC Engine Bootstrap");
  console.log("--------------------");
  console.log("Epoch:", HPC_EPOCH.epochGregorianLabel);
  console.log("Epoch UTC:", HPC_EPOCH.epochUtcIso);
  console.log("Epoch Weekday:", HPC_EPOCH.epochWeekday);
  console.log("Description:", HPC_EPOCH.epochDescription);
  console.log("");
  console.log("Engine Config");
  console.log("Base Creation Year at Epoch:", HPC_CONFIG.baseCreationYearAtEpoch);
  console.log("Counted Days Per Year:", HPC_CONFIG.countedDaysPerYear);
  console.log("Months Per Year:", HPC_CONFIG.monthsPerYear);
  console.log("Days Per Month:", HPC_CONFIG.daysPerMonth);
  console.log("Tropical Year Days:", HPC_CONFIG.tropicalYearDays);
  console.log("");
  console.log("Current UTC:", now.toISOString());
  console.log("Elapsed Solar Days (float):", tracks.elapsedSolarDaysFloat);
  console.log("Elapsed Solar Days (whole):", tracks.elapsedSolarDaysWhole);
  console.log("Julian Day:", tracks.julianDay);
  console.log("Julian Day Number:", tracks.julianDayNumber);
  console.log("Modified Julian Day:", tracks.modifiedJulianDay);
  console.log("");
  console.log("Resolved HPC Date");
  console.log("-----------------");
  console.log("HPC Year:", hpc.hpcYear);
  console.log("HPC Month:", hpc.hpcMonth);
  console.log("HPC Day:", hpc.hpcDay);
  console.log("Weekday:", hpc.weekday);
  console.log("Gregorian Reference:", hpc.gregorianReferenceLabel);
  console.log("");
  console.log("Resolved Year Boundary");
  console.log("----------------------");
  console.log("Equinox UTC:", boundary.equinoxUtc.toISOString());
  console.log("Boundary Sunset UTC:", boundary.boundarySunsetUtc.toISOString());
  console.log("Used Next Day Sunset:", boundary.usedNextDaySunset);
  console.log("");
  console.log("Zimrah Fertility Preview");
  console.log("------------------------");
  console.log("Cycle Day:", fertility.cycleDay);
  console.log("Estimated Ovulation Day:", fertility.estimatedOvulationDay);
  console.log("Fertile Window Start:", fertility.fertileWindowStart);
  console.log("Fertile Window End:", fertility.fertileWindowEnd);
  console.log("Luteal Day:", fertility.lutealDay);
}

main().catch((error) => {
  console.error("Engine error:", error);
  process.exit(1);
});
