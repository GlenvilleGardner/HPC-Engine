import fs from "fs";
import path from "path";

interface Row {
  year: number;
  classification: string;
  yearType: string;
}

function parseCsv(filePath: string): Row[] {
  const text = fs.readFileSync(filePath, "utf8");
  const lines = text.split(/\r?\n/).slice(1);

  return lines
    .filter((line) => line.trim().length > 0)
    .map((line) => {
      const cols = line.split(",");

      return {
        year: Number(cols[0]),
        classification: cols[6],
        yearType: cols[7]
      };
    });
}

function main() {
  const inputPath = path.resolve(
    "data",
    "validation",
    "global-boundary-2000-2100.csv"
  );

  const rows = parseCsv(inputPath);

  const uniqueYears = new Map<number, string>();

  for (const row of rows) {
    if (!Number.isNaN(row.year) && !uniqueYears.has(row.year)) {
      uniqueYears.set(row.year, row.yearType);
    }
  }

  let standard = 0;
  let adjustment = 0;

  for (const yearType of uniqueYears.values()) {
    if (yearType === "STANDARD") standard++;
    if (yearType === "EQUINOX_ADJUSTMENT") adjustment++;
  }

  const total = standard + adjustment;

  const outputLines = [
    "metric,value",
    `total_years,${total}`,
    `standard_years,${standard}`,
    `adjustment_years,${adjustment}`,
    `standard_percentage,${total > 0 ? ((standard / total) * 100).toFixed(2) : "0.00"}`,
    `adjustment_percentage,${total > 0 ? ((adjustment / total) * 100).toFixed(2) : "0.00"}`
  ];

  const outputPath = path.resolve(
    "data",
    "validation",
    "global-year-summary-2000-2100.csv"
  );

  fs.writeFileSync(outputPath, outputLines.join("\n"), "utf8");

  console.log("Summary complete:");
  console.log(outputLines.join("\n"));
}

main();
