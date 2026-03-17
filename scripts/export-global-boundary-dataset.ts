import fs from "fs";
import path from "path";
import { resolveGlobalHpcYearBoundaryUtc } from "../src/astronomy/global-season-boundary";

function csvEscape(value: unknown): string {
  const text = String(value ?? "");
  if (text.includes(",") || text.includes('"') || text.includes("\n")) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

async function main() {
  const startYear = 2000;
  const endYear = 2100;

  const rows: string[] = [];
  rows.push([
    "year",
    "equinoxUtc",
    "eventLatitude",
    "eventLongitude",
    "observableWindowStartUtc",
    "observableWindowEndUtc",
    "classification",
    "yearType",
    "boundarySunsetUtc",
    "usedNextDaySunset"
  ].join(","));

  for (let year = startYear; year <= endYear; year++) {
    const result = await resolveGlobalHpcYearBoundaryUtc(year);

    rows.push([
      csvEscape(year),
      csvEscape(result.equinoxUtc.toISOString()),
      csvEscape(result.eventLatitude),
      csvEscape(result.eventLongitude),
      csvEscape(result.observableWindowStartUtc.toISOString()),
      csvEscape(result.observableWindowEndUtc.toISOString()),
      csvEscape(result.classification),
      csvEscape(result.yearType),
      csvEscape(result.boundarySunsetUtc.toISOString()),
      csvEscape(result.usedNextDaySunset)
    ].join(","));

    console.log(`Exported global boundary for ${year}`);
  }

  const outputPath = path.resolve("data", "validation", "global-boundary-2000-2100.csv");
  fs.writeFileSync(outputPath, rows.join("\n"), "utf8");

  console.log(`Done. Wrote ${outputPath}`);
}

main().catch((error) => {
  console.error("Global boundary export failed:");
  console.error(error);
  process.exit(1);
});
