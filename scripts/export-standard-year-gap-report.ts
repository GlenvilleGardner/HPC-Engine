import fs from "fs";
import path from "path";

function main() {
  const inputPath = path.resolve(
    "data",
    "validation",
    "global-boundary-2000-2100.csv"
  );

  const text = fs.readFileSync(inputPath, "utf8");
  const lines = text.split(/\r?\n/).slice(1).filter(line => line.trim().length > 0);

  const standardYears: number[] = [];

  for (const line of lines) {
    const cols = line.split(",");
    const year = Number(cols[0]);
    const classification = cols[6];
    const yearType = cols[7];

    if (classification === "WITHIN_WEDNESDAY_WINDOW" && yearType === "STANDARD") {
      standardYears.push(year);
    }
  }

  const gaps: string[] = [];
  for (let i = 1; i < standardYears.length; i++) {
    gaps.push(`${standardYears[i - 1]}->${standardYears[i]} = ${standardYears[i] - standardYears[i - 1]} years`);
  }

  const outputLines = [
    "STANDARD YEARS:",
    standardYears.join(", "),
    "",
    "GAPS:",
    ...gaps
  ];

  const outputPath = path.resolve(
    "data",
    "validation",
    "standard-year-gap-report-2000-2100.txt"
  );

  fs.writeFileSync(outputPath, outputLines.join("\n"), "utf8");

  console.log(outputLines.join("\n"));
  console.log(`\nDone. Wrote ${outputPath}`);
}

main();
