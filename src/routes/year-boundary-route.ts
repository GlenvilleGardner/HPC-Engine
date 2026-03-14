import { Router, Request, Response } from "express";
import { getYearBoundary } from "../services/year-boundary-service";
import { parseNumber } from "../utils/request-parsers";

const router = Router();

router.get("/hpc/year-boundary", async (req: Request, res: Response) => {
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

export default router;
