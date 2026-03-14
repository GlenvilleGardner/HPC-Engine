import { Router, Request, Response } from "express";
import { getCalendarDay } from "../services/calendar-day-service";
import { parseIsoDate, parseLatitude, parseLongitude } from "../utils/request-parsers";
import { toApiErrorResponse, ApiValidationError } from "../utils/api-errors";

const router = Router();

router.get("/hpc/calendar-day", async (req: Request, res: Response) => {
  try {
    const isoDate = parseIsoDate(req.query.isoDate, "isoDate");
    const latitude = parseLatitude(req.query.latitude);
    const longitude = parseLongitude(req.query.longitude);

    const result = await getCalendarDay({
      isoDate,
      latitude,
      longitude
    });

    res.json(result);
  } catch (error) {
    const status = error instanceof ApiValidationError ? 400 : 500;
    res.status(status).json(toApiErrorResponse(error));
  }
});

export default router;
