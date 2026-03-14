import { Router, Request, Response } from "express";
import { getYearStructure } from "../services/year-structure-service";
import { parseLatitude, parseLongitude, parseYear } from "../utils/request-parsers";
import { toApiErrorResponse, ApiValidationError } from "../utils/api-errors";

const router = Router();

router.get("/hpc/year-structure", async (req: Request, res: Response) => {
  try {
    const year = parseYear(req.query.year);
    const latitude = parseLatitude(req.query.latitude);
    const longitude = parseLongitude(req.query.longitude);

    const result = await getYearStructure({
      year,
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
