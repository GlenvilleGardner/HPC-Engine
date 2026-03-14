import { Router, Request, Response } from "express";
import {
  convertGregorianToHpc,
  convertHpcToGregorian
} from "../services/date-conversion-service";
import {
  parseHpcDay,
  parseHpcMonth,
  parseHpcYear,
  parseIsoDate,
  parseLatitude,
  parseLongitude
} from "../utils/request-parsers";
import { toApiErrorResponse, ApiValidationError } from "../utils/api-errors";

const router = Router();

router.get("/hpc/convert/gregorian-to-hpc", async (req: Request, res: Response) => {
  try {
    const isoDate = parseIsoDate(req.query.isoDate, "isoDate");
    const latitude = parseLatitude(req.query.latitude);
    const longitude = parseLongitude(req.query.longitude);

    const result = await convertGregorianToHpc({
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

router.get("/hpc/convert/hpc-to-gregorian", async (req: Request, res: Response) => {
  try {
    const hpcYear = parseHpcYear(req.query.hpcYear);
    const hpcMonth = parseHpcMonth(req.query.hpcMonth);
    const hpcDay = parseHpcDay(req.query.hpcDay);
    const latitude = parseLatitude(req.query.latitude);
    const longitude = parseLongitude(req.query.longitude);

    const result = await convertHpcToGregorian({
      hpcYear,
      hpcMonth,
      hpcDay,
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
