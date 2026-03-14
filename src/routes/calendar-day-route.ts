import { Router, Request, Response } from "express";
import { getCalendarDay } from "../services/calendar-day-service";
import { parseNumber, parseString } from "../utils/request-parsers";

const router = Router();

router.get("/hpc/calendar-day", async (req: Request, res: Response) => {
  try {
    const isoDate = parseString(req.query.isoDate, "isoDate");
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

export default router;
