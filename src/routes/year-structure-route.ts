import { Router, Request, Response } from "express";
import { getYearStructure } from "../services/year-structure-service";
import { parseNumber } from "../utils/request-parsers";

const router = Router();

router.get("/hpc/year-structure", async (req: Request, res: Response) => {
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

export default router;
