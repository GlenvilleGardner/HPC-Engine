import { HPC_CONFIG, HPC_EPOCH } from "./core/epoch";
import { buildTimeTracks } from "./core/time-tracks";
import { resolveHpcDate } from "./calendar/hpc-date";
import { resolveHpcYearBoundaryUtc } from "./astronomy/year-boundary";
import { predictCycleFromElapsedDay } from "./fertility/cycle-engine";
import { GeoLocation } from "./core/types";
import { gregorianToHpc, hpcToGregorian } from "./calendar/convert";
import { calculateGDD } from "./agriculture/gdd";
import { cropProgress } from "./agriculture/crop-model";
import { evaluatePlantingWindow } from "./agriculture/planting-window";
import crops from "./data/crops.json";

async function main(): Promise<void> {
  const now = new Date();
  const tracks = buildTimeTracks(now);

  const location: GeoLocation = {
    latitude: 40.744,
    longitude: -74.032
  };

  const hpc = await resolveHpcDate(now, location);
  const boundary = await resolveHpcYearBoundaryUtc(2026, location);

  const fertility = predictCycleFromElapsedDay(
    tracks.elapsedSolarDaysWhole,
    {
      cycleStartElapsedDay: tracks.elapsedSolarDaysWhole - 10,
      averageCycleLength: 28,
      averageLutealLength: 14
    }
  );

  const convertedNow = await gregorianToHpc(now, location);
  const backToGregorian = await hpcToGregorian(
    convertedNow.hpcYear,
    convertedNow.hpcMonth ?? 1,
    convertedNow.hpcDay ?? 1,
    location
  );

  const cornGdd = calculateGDD(18, 8, crops.corn.baseTempC);
  const cornProgress = cropProgress(420, crops.corn);
  const planting = evaluatePlantingWindow(12, 0.15, crops.corn);

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
  console.log("Resolved 2026 Year Boundary");
  console.log("---------------------------");
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
  console.log("");
  console.log("Bidirectional Conversion Preview");
  console.log("-------------------------------");
  console.log("Gregorian -> HPC Year:", convertedNow.hpcYear);
  console.log("Gregorian -> HPC Month:", convertedNow.hpcMonth);
  console.log("Gregorian -> HPC Day:", convertedNow.hpcDay);
  console.log("HPC -> Gregorian Approx:", backToGregorian.toISOString());
  console.log("");
  console.log("Agriculture Preview");
  console.log("-------------------");
  console.log("Corn Daily GDD:", cornGdd);
  console.log("Corn Progress:", cornProgress);
  console.log("Corn Planting Window:", planting);
}

main().catch((error) => {
  console.error("Engine error:", error);
  process.exit(1);
});
export * from "./services/year-boundary-service";
export * from "./services/year-structure-service";
export * from "./services/date-conversion-service";
export * from "./services/calendar-day-service";
