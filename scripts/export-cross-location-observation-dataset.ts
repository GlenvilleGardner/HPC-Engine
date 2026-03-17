import fs from "fs";
import path from "path";
import { resolveGlobalHpcYearBoundaryUtc } from "../src/astronomy/global-season-boundary";
import { resolveLocalObservationBoundaryUtc } from "../src/astronomy/year-boundary";

type BenchmarkLocation = {
  locationName: string;
  latitude: number;
  longitude: number;
};

const LOCATIONS: BenchmarkLocation[] = [
  { locationName: "Hoboken", latitude: 40.7430, longitude: -74.0324 },
  { locationName: "Jerusalem", latitude: 31.7683, longitude: 35.2137 },
  { locationName: "Quito", latitude: -0.1807, longitude: -78.4678 },
  { locationName: "Sydney", latitude: -33.8688, longitude: 151.2093 },
  { locationName: "Tokyo", latitude: 35.6762, longitude: 139.6503 }
];

function csvEscape(value: unknown): string {
  const text = String(value ?? "");
  if (text.includes(",") || text.includes('"') || text.includes("\n")) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

function diffHours(a: Date, b: Date): number {
  return (b.getTime() - a.getTime()) / (1000 * 60 * 60);
}

async function main() {
  const startYear = 2000;
  const endYear = 2100;

  const rows: string[] = [];
  rows.push([
    "year",
    "locationName",
    "latitude",
    "longitude",
    "globalClassification",
    "globalYearType",
    "globalBoundarySunsetUtc",
    "localBoundarySunsetUtc",
    "differenceHoursFromGlobalBoundary"
  ].join(","));

  for (let year = startYear; year <= endYear; year++) {
    const globalBoundary = await resolveGlobalHpcYearBoundaryUtc(year);

    for (const location of LOCATIONS) {
      const localBoundary = await resolveLocalObservationBoundaryUtc(year, {
        latitude: location.latitude,
        longitude: location.longitude
      });

      const differenceHoursFromGlobalBoundary = diffHours(
        globalBoundary.boundarySunsetUtc,
        localBoundary.boundarySunsetUtc
      );

      rows.push([
        csvEscape(year),
        csvEscape(location.locationName),
        csvEscape(location.latitude),
        csvEscape(location.longitude),
        csvEscape(globalBoundary.classification),
        csvEscape(globalBoundary.yearType),
        csvEscape(globalBoundary.boundarySunsetUtc.toISOString()),
        csvEscape(localBoundary.boundarySunsetUtc.toISOString()),
        csvEscape(differenceHoursFromGlobalBoundary.toFixed(6))
      ].join(","));
    }

    console.log(`Exported cross-location observations for ${year}`);
  }

  const outputPath = path.resolve(
    "data",
    "validation",
    "cross-location-observation-2000-2100.csv"
  );

  fs.writeFileSync(outputPath, rows.join("\n"), "utf8");

  console.log(`Done. Wrote ${outputPath}`);
}

main().catch((error) => {
  console.error("Cross-location observation export failed:");
  console.error(error);
  process.exit(1);
});
