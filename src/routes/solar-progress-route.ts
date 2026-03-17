import { Router, Request, Response } from "express";
import { parseIsoDate, parseLatitude, parseLongitude } from "../utils/request-parsers";
import { toApiErrorResponse, ApiValidationError } from "../utils/api-errors";
import { getSolarProgressContext } from "../services/solar-progress-service";

const router = Router();

router.get("/hpc/solar-progress", async (req: Request, res: Response) => {
  try {
    const isoDate = parseIsoDate(req.query.isoDate, "isoDate");
    const latitude = parseLatitude(req.query.latitude);
    const longitude = parseLongitude(req.query.longitude);

    const result = await getSolarProgressContext(
      new Date(isoDate),
      { latitude, longitude }
    );

    res.json({
      inputIsoDate: isoDate,
      latitude,
      longitude,
      ...result
    });
  } catch (error) {
    const status = error instanceof ApiValidationError ? 400 : 500;
    res.status(status).json(toApiErrorResponse(error));
  }
});

export default router;
