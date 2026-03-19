import { Router, Request, Response } from "express";
import { getSeasonalAnchors } from "../services/seasonal-anchor-service";
import { parseYear, parseLatitude, parseLongitude } from "../utils/request-parsers";
import { toApiErrorResponse, ApiValidationError } from "../utils/api-errors";

const router = Router();

// GET /hpc/seasonal-anchors?year=2026&latitude=40.744&longitude=-74.032
router.get("/hpc/seasonal-anchors", async (req: Request, res: Response) => {
  try {
    const year = parseYear(req.query.year);
    const latitude = parseLatitude(req.query.latitude);
    const longitude = parseLongitude(req.query.longitude);

    const result = await getSeasonalAnchors(year, { latitude, longitude });
    res.json(result);
  } catch (error) {
    const status = error instanceof ApiValidationError ? 400 : 500;
    res.status(status).json(toApiErrorResponse(error));
  }
});

export default router;