import { HPC_CONFIG, HPC_EPOCH } from "./core/epoch";
import { buildTimeTracks } from "./core/time-tracks";
import { resolveHpcDate } from "./calendar/hpc-date";

function main(): void {
  const now = new Date();
  const tracks = buildTimeTracks(now);
  const hpc = resolveHpcDate(now);

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
}

main();
