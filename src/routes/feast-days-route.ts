import { Router, Request, Response } from "express";
import { getFeastDayCalendar, getFeastDayForDate } from "../calendar/feast-days";
import { resolveGlobalHpcYearBoundaryUtc } from "../astronomy/global-season-boundary";
import { parseYear } from "../utils/request-parsers";
import { toApiErrorResponse, ApiValidationError } from "../utils/api-errors";

const router = Router();

// GET /hpc/feast-days?year=2026
router.get("/hpc/feast-days", async (req: Request, res: Response) => {
  try {
    const year = parseYear(req.query.year);
    const globalBoundary = await resolveGlobalHpcYearBoundaryUtc(year);

    // HPC year = baseCreationYearAtEpoch + (gregorianYear - 2019) + 1
    const hpcYear = 6037 + (year - 2019) + 1;

    const calendar = getFeastDayCalendar(hpcYear, globalBoundary.yearType);
    res.json(calendar);
  } catch (error) {
    const status = error instanceof ApiValidationError ? 400 : 500;
    res.status(status).json(toApiErrorResponse(error));
  }
});

// GET /hpc/feast-day?month=1&day=14
router.get("/hpc/feast-day", (req: Request, res: Response) => {
  try {
    const month = parseInt(req.query.month as string);
    const day = parseInt(req.query.day as string);

    if (isNaN(month) || isNaN(day)) {
      res.status(400).json({ error: "month and day are required" });
      return;
    }

    const feast = getFeastDayForDate(month, day);

    if (!feast) {
      res.json({ feastDay: null, message: "No feast day on this date" });
      return;
    }

    res.json({ feastDay: feast });
  } catch (error) {
    const status = error instanceof ApiValidationError ? 400 : 500;
    res.status(status).json(toApiErrorResponse(error));
  }
});

export default router;