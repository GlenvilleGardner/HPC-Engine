import { Router, Request, Response } from "express";
import {
  convertGregorianToHpc,
  convertHpcToGregorian
} from "../services/date-conversion-service";
import { parseNumber, parseString } from "../utils/request-parsers";

const router = Router();

router.get("/hpc/convert/gregorian-to-hpc", async (req: Request, res: Response) => {
  try {
    const isoDate = parseString(req.query.isoDate, "isoDate");
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

router.get("/hpc/convert/hpc-to-gregorian", async (req: Request, res: Response) => {
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

export default router;
