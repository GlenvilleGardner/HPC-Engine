import * as fs from "fs";

type Row = {
  GregorianBoundaryYear: string;
  EquinoxUTC: string;
  ObservableWindowStartUTC: string;
  ObservableWindowEndUTC: string;
  BoundarySunsetUTC: string;
  Classification: string;
  YearType: string;
  UsedNextDaySunset: string;
  BeforeBoundaryHPCYear: string;
  BeforeBoundaryHPCDate: string;
  BeforeBoundaryWeekday: string;
  AfterBoundaryHPCYear: string;
  AfterBoundaryHPCDate: string;
  AfterBoundaryWeekday: string;
};

function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    const next = line[i + 1];

    if (ch === '"' && inQuotes && next === '"') {
      current += '"';
      i++;
      continue;
    }

    if (ch === '"') {
      inQuotes = !inQuotes;
      continue;
    }

    if (ch === "," && !inQuotes) {
      result.push(current);
      current = "";
      continue;
    }

    current += ch;
  }

  result.push(current);
  return result;
}

function loadCsv(path: string): Row[] {
  const text = fs.readFileSync(path, "utf8");
  const lines = text.split(/\r?\n/).filter(Boolean);

  const headers = parseCsvLine(lines[0]);
  const rows: Row[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCsvLine(lines[i]);
    const row = {} as Row;

    headers.forEach((header, index) => {
      (row as any)[header] = values[index] ?? "";
    });

    rows.push(row);
  }

  return rows;
}

function increment(map: Record<string, number>, key: string) {
  map[key] = (map[key] ?? 0) + 1;
}

function run() {
  const path = "hpc-validation-report-1900-2200.csv";
  const rows = loadCsv(path);

  const yearTypeCounts: Record<string, number> = {};
  const classificationCounts: Record<string, number> = {};
  const beforeDateCounts: Record<string, number> = {};
  const beforeWeekdayCounts: Record<string, number> = {};
  const afterDateCounts: Record<string, number> = {};
  const afterWeekdayCounts: Record<string, number> = {};
  const transitionCounts: Record<string, number> = {};

  let validResetCount = 0;
  let invalidResetCount = 0;

  for (const row of rows) {
    increment(yearTypeCounts, row.YearType);
    increment(classificationCounts, row.Classification);
    increment(beforeDateCounts, row.BeforeBoundaryHPCDate);
    increment(beforeWeekdayCounts, row.BeforeBoundaryWeekday);
    increment(afterDateCounts, row.AfterBoundaryHPCDate);
    increment(afterWeekdayCounts, row.AfterBoundaryWeekday);

    const transition = `${row.BeforeBoundaryHPCDate} ${row.BeforeBoundaryWeekday} -> ${row.AfterBoundaryHPCDate} ${row.AfterBoundaryWeekday}`;
    increment(transitionCounts, transition);

    const validBeforeDate =
      row.BeforeBoundaryHPCDate === "13-28" ||
      row.BeforeBoundaryHPCDate === "13-29" ||
      row.BeforeBoundaryHPCDate === "13-30";

    const validBeforeWeekday = row.BeforeBoundaryWeekday === "Wednesday";
    const validAfterDate = row.AfterBoundaryHPCDate === "1-1";
    const validAfterWeekday = row.AfterBoundaryWeekday === "Thursday";

    if (validBeforeDate && validBeforeWeekday && validAfterDate && validAfterWeekday) {
      validResetCount++;
    } else {
      invalidResetCount++;
    }
  }

  console.log("========================================");
  console.log("HPC Validation Summary (1900-2200)");
  console.log("========================================");
  console.log("Total rows:", rows.length);
  console.log("");

  console.log("YearType counts:");
  console.log(yearTypeCounts);
  console.log("");

  console.log("Classification counts:");
  console.log(classificationCounts);
  console.log("");

  console.log("Before-boundary HPC date counts:");
  console.log(beforeDateCounts);
  console.log("");

  console.log("Before-boundary weekday counts:");
  console.log(beforeWeekdayCounts);
  console.log("");

  console.log("After-boundary HPC date counts:");
  console.log(afterDateCounts);
  console.log("");

  console.log("After-boundary weekday counts:");
  console.log(afterWeekdayCounts);
  console.log("");

  console.log("Boundary transition counts:");
  console.log(transitionCounts);
  console.log("");

  console.log("Valid Wednesday -> Thursday resets:", validResetCount);
  console.log("Invalid resets:", invalidResetCount);
}

run();
