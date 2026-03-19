/**
 * generate-full-validation-dataset.ts
 *
 * Generates a comprehensive HPC validation dataset using the corrected
 * epoch-anchored drift accumulation classifier.
 *
 * Covers years 2000-2100 with full year boundary, classification,
 * feast day, and Zadok priestly course data.
 *
 * Run with: npx ts-node scripts/generate-full-validation-dataset.ts
 */

import fs from "fs";
import path from "path";
import { resolveGlobalHpcYearBoundaryUtc } from "../src/astronomy/global-season-boundary";
import { getSeasonalAnchors } from "../src/services/seasonal-anchor-service";
import { getFeastDayCalendar } from "../src/calendar/feast-days";
import { resolveZadokDay } from "../src/calendar/zadok";

const REFERENCE_LOCATION = {
  latitude: 31.7683,  // Jerusalem
  longitude: 35.2137
};

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

  console.log(`Generating HPC validation dataset ${startYear}-${endYear}`);
  console.log(`Reference location: Jerusalem (${REFERENCE_LOCATION.latitude}, ${REFERENCE_LOCATION.longitude})`);
  console.log("");

  // ── Year boundary dataset ─────────────────────────────────────────────────
  const boundaryRows: string[] = [];
  boundaryRows.push([
    "gregorianYear",
    "hpcYear",
    "equinoxUtc",
    "kernel",
    "yearType",
    "classification",
    "boundarySunsetUtc",
    "springEquinoxHpcDate",
    "summerSolsticeHpcDate",
    "autumnEquinoxHpcDate",
    "winterSolsticeHpcDate",
    "driftAfterYear"
  ].join(","));

  // ── Feast day dataset ─────────────────────────────────────────────────────
  const feastRows: string[] = [];
  feastRows.push([
    "gregorianYear",
    "hpcYear",
    "yearType",
    "feastName",
    "hebrewName",
    "hpcMonth",
    "hpcDay",
    "weekday",
    "scriptureRef",
    "dssAgreement"
  ].join(","));

  // ── Zadok dataset — Passover week ─────────────────────────────────────────
  const zadokRows: string[] = [];
  zadokRows.push([
    "gregorianYear",
    "hpcYear",
    "hpcMonth",
    "hpcDay",
    "weekOfYear",
    "isFestivalWeek",
    "activeCourse",
    "sixYearCyclePosition"
  ].join(","));

  let standardCount = 0;
  let adjustmentCount = 0;

  for (let year = startYear; year <= endYear; year++) {
    try {
      const [globalBoundary, seasonalAnchors] = await Promise.all([
        resolveGlobalHpcYearBoundaryUtc(year),
        getSeasonalAnchors(year, REFERENCE_LOCATION)
      ]);

      const hpcYear = 6037 + (year - 2019) + 1;

      if (globalBoundary.yearType === "STANDARD") standardCount++;
      else adjustmentCount++;

      // Year boundary row
      boundaryRows.push([
        csvEscape(year),
        csvEscape(hpcYear),
        csvEscape(globalBoundary.equinoxUtc.toISOString()),
        csvEscape("de440.bsp"),
        csvEscape(globalBoundary.yearType),
        csvEscape(globalBoundary.classification),
        csvEscape(globalBoundary.boundarySunsetUtc.toISOString()),
        csvEscape(`${seasonalAnchors.anchors.springEquinox.hpcMonth}-${seasonalAnchors.anchors.springEquinox.hpcDay}`),
        csvEscape(`${seasonalAnchors.anchors.summerSolstice.hpcMonth}-${seasonalAnchors.anchors.summerSolstice.hpcDay}`),
        csvEscape(`${seasonalAnchors.anchors.autumnEquinox.hpcMonth}-${seasonalAnchors.anchors.autumnEquinox.hpcDay}`),
        csvEscape(`${seasonalAnchors.anchors.winterSolstice.hpcMonth}-${seasonalAnchors.anchors.winterSolstice.hpcDay}`)
      ].join(","));

      // Feast day rows
      const feastCalendar = getFeastDayCalendar(hpcYear, globalBoundary.yearType);
      for (const feast of feastCalendar.feastDays) {
        feastRows.push([
          csvEscape(year),
          csvEscape(hpcYear),
          csvEscape(globalBoundary.yearType),
          csvEscape(feast.name),
          csvEscape(feast.hebrewName),
          csvEscape(feast.month),
          csvEscape(feast.day),
          csvEscape(feast.weekday),
          csvEscape(feast.scriptureRef),
          csvEscape(feast.dssAgreement)
        ].join(","));
      }

      // Zadok rows — sample key dates
      const keyDates = [
        { month: 1, day: 1 },   // New Year
        { month: 1, day: 14 },  // Passover
        { month: 3, day: 11 },  // Feast of Weeks
        { month: 7, day: 1 },   // Trumpets
        { month: 7, day: 10 },  // Atonement
        { month: 7, day: 15 },  // Tabernacles
      ];

      for (const date of keyDates) {
        const zadok = resolveZadokDay(hpcYear, date.month, date.day);
        zadokRows.push([
          csvEscape(year),
          csvEscape(hpcYear),
          csvEscape(date.month),
          csvEscape(date.day),
          csvEscape(zadok.weekOfYear),
          csvEscape(zadok.isFestivalWeek),
          csvEscape(zadok.activeCourse?.name ?? "ALL_COURSES"),
          csvEscape(zadok.sixYearCyclePosition)
        ].join(","));
      }

      if (year % 10 === 0) {
        console.log(`Processed year ${year} — ${globalBoundary.yearType}`);
      }

    } catch (err) {
      console.error(`Failed at year ${year}:`, err);
    }
  }

  // Write files
  const outputDir = path.resolve("data", "validation");
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const boundaryPath = path.join(outputDir, "hpc-full-boundary-validation-2000-2100.csv");
  const feastPath = path.join(outputDir, "hpc-feast-day-validation-2000-2100.csv");
  const zadokPath = path.join(outputDir, "hpc-zadok-validation-2000-2100.csv");

  fs.writeFileSync(boundaryPath, boundaryRows.join("\n"), "utf8");
  fs.writeFileSync(feastPath, feastRows.join("\n"), "utf8");
  fs.writeFileSync(zadokPath, zadokRows.join("\n"), "utf8");

  console.log("");
  console.log("=== VALIDATION SUMMARY ===");
  console.log(`Total years: ${endYear - startYear + 1}`);
  console.log(`Standard years: ${standardCount}`);
  console.log(`Equinox Adjustment years: ${adjustmentCount}`);
  console.log(`EAD rate: ${((adjustmentCount / (endYear - startYear + 1)) * 100).toFixed(1)}%`);
  console.log("");
  console.log(`Written: ${boundaryPath}`);
  console.log(`Written: ${feastPath}`);
  console.log(`Written: ${zadokPath}`);
}

main().catch((err) => {
  console.error("Validation generation failed:", err);
  process.exit(1);
});