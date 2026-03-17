import fs from "fs";
import path from "path";
import { getGlobalSeasonEvents } from "../src/astronomy/global-season-events";

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
    "seasonKey",
    "eventUtc",
    "eventLatitude",
    "eventLongitude",
    "observableWindowStartUtc",
    "observableWindowEndUtc",
    "observableTransitionUtc"
  ].join(","));

  for (let year = startYear; year <= endYear; year++) {
    const events = await getGlobalSeasonEvents(year);

    for (const event of events) {
      rows.push([
        csvEscape(year),
        csvEscape(event.eventKey),
        csvEscape(event.eventUtc.toISOString()),
        csvEscape(event.eventLatitude),
        csvEscape(event.eventLongitude),
        csvEscape(event.observableWindowStartUtc.toISOString()),
        csvEscape(event.observableWindowEndUtc.toISOString()),
        csvEscape(event.observableTransitionUtc.toISOString())
      ].join(","));
    }

    console.log(`Exported global seasonal anchors for ${year}`);
  }

  const outputPath = path.resolve(
    "data",
    "validation",
    "global-seasonal-anchors-2000-2100.csv"
  );

  fs.writeFileSync(outputPath, rows.join("\n"), "utf8");

  console.log(`Done. Wrote ${outputPath}`);
}

main().catch((error) => {
  console.error("Global seasonal anchor export failed:");
  console.error(error);
  process.exit(1);
});
