import * as fs from "fs";
import { resolveHpcYearBoundaryUtc } from "../src/astronomy/year-boundary";
import { gregorianToHpc } from "../src/calendar/convert";

const location = {
  latitude: 40.743,
  longitude: -74.032
};

function csvEscape(value: string | number | boolean | null): string {
  if (value === null) return "";

  const s = String(value);

  if (s.includes(",") || s.includes('"') || s.includes("\n")) {
    return `"${s.replace(/"/g, '""')}"`;
  }

  return s;
}

async function run() {
  const startYear = 1900;
  const endYear = 2200;

  const rows: string[] = [];

  rows.push([
    "GregorianBoundaryYear",
    "EquinoxUTC",
    "ObservableWindowStartUTC",
    "ObservableWindowEndUTC",
    "BoundarySunsetUTC",
    "Classification",
    "YearType",
    "UsedNextDaySunset",
    "BeforeBoundaryHPCYear",
    "BeforeBoundaryHPCDate",
    "BeforeBoundaryWeekday",
    "AfterBoundaryHPCYear",
    "AfterBoundaryHPCDate",
    "AfterBoundaryWeekday"
  ].join(","));

  for (let year = startYear; year <= endYear; year++) {

    console.log("Processing year:", year);

    const boundary = await resolveHpcYearBoundaryUtc(year, location);

    const beforeMoment = new Date(boundary.boundarySunsetUtc.getTime() - 60000);
    const afterMoment = new Date(boundary.boundarySunsetUtc.getTime() + 60000);

    const beforeHpc = await gregorianToHpc(beforeMoment, location);
    const afterHpc = await gregorianToHpc(afterMoment, location);

    rows.push([
      csvEscape(year),
      csvEscape(boundary.equinoxUtc.toISOString()),
      csvEscape(boundary.observableWindowStartUtc.toISOString()),
      csvEscape(boundary.observableWindowEndUtc.toISOString()),
      csvEscape(boundary.boundarySunsetUtc.toISOString()),
      csvEscape(boundary.classification),
      csvEscape(boundary.yearType),
      csvEscape(boundary.usedNextDaySunset),
      csvEscape(beforeHpc.hpcYear),
      csvEscape(`${beforeHpc.hpcMonth}-${beforeHpc.hpcDay}`),
      csvEscape(beforeHpc.weekday),
      csvEscape(afterHpc.hpcYear),
      csvEscape(`${afterHpc.hpcMonth}-${afterHpc.hpcDay}`),
      csvEscape(afterHpc.weekday)
    ].join(","));
  }

  const outPath = "hpc-validation-report-1900-2200.csv";

  fs.writeFileSync(outPath, rows.join("\n"), "utf8");

  console.log(`Validation report written to ${outPath}`);
}

run().catch((err) => {
  console.error("Validation report generation failed:", err);
  process.exit(1);
});
