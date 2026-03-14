import express, { Request, Response } from "express";
import { getYearBoundary } from "./services/year-boundary-service";
import { getYearStructure } from "./services/year-structure-service";
import {
  convertGregorianToHpc,
  convertHpcToGregorian
} from "./services/date-conversion-service";
import { getCalendarDay } from "./services/calendar-day-service";

const app = express();
app.use(express.json());

const PORT = 3000;

function parseNumber(value: unknown, name: string): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    throw new Error(`Invalid ${name}`);
  }
  return parsed;
}

app.get("/health", (_req: Request, res: Response) => {
  res.json({
    status: "ok",
    service: "hpc-engine-api"
  });
});

app.get("/hpc/year-boundary", async (req: Request, res: Response) => {
  try {
    const year = parseNumber(req.query.year, "year");
    const latitude = parseNumber(req.query.latitude, "latitude");
    const longitude = parseNumber(req.query.longitude, "longitude");

    const result = await getYearBoundary({
      year,
      latitude,
      longitude
    });

    res.json(result);
  } catch (error) {
    res.status(400).json({
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

app.get("/hpc/year-structure", async (req: Request, res: Response) => {
  try {
    const year = parseNumber(req.query.year, "year");
    const latitude = parseNumber(req.query.latitude, "latitude");
    const longitude = parseNumber(req.query.longitude, "longitude");

    const result = await getYearStructure({
      year,
      latitude,
      longitude
    });

    res.json(result);
  } catch (error) {
    res.status(400).json({
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

app.get("/hpc/convert/gregorian-to-hpc", async (req: Request, res: Response) => {
  try {
    const isoDate = String(req.query.isoDate ?? "");
    const latitude = parseNumber(req.query.latitude, "latitude");
    const longitude = parseNumber(req.query.longitude, "longitude");

    const result = await convertGregorianToHpc({
      isoDate,
      latitude,
      longitude
    });

    res.json(result);
  } catch (error) {
    res.status(400).json({
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

app.get("/hpc/convert/hpc-to-gregorian", async (req: Request, res: Response) => {
  try {
    const hpcYear = parseNumber(req.query.hpcYear, "hpcYear");
    const hpcMonth = parseNumber(req.query.hpcMonth, "hpcMonth");
    const hpcDay = parseNumber(req.query.hpcDay, "hpcDay");
    const latitude = parseNumber(req.query.latitude, "latitude");
    const longitude = parseNumber(req.query.longitude, "longitude");

    const result = await convertHpcToGregorian({
      hpcYear,
      hpcMonth,
      hpcDay,
      latitude,
      longitude
    });

    res.json(result);
  } catch (error) {
    res.status(400).json({
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

app.get("/hpc/calendar-day", async (req: Request, res: Response) => {
  try {
    const isoDate = String(req.query.isoDate ?? "");
    const latitude = parseNumber(req.query.latitude, "latitude");
    const longitude = parseNumber(req.query.longitude, "longitude");

    const result = await getCalendarDay({
      isoDate,
      latitude,
      longitude
    });

    res.json(result);
  } catch (error) {
    res.status(400).json({
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

app.listen(PORT, () => {
  console.log(`HPC API server running on http://localhost:${PORT}`);
});
