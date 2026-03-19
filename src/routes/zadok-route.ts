import { Router, Request, Response } from "express";
import {
  resolveZadokDay,
  calculateNativity,
  PRIESTLY_COURSES,
  getWeekOfYear
} from "../calendar/zadok";
import { toApiErrorResponse, ApiValidationError } from "../utils/api-errors";

const router = Router();

// GET /hpc/zadok?hpcYear=6045&hpcMonth=1&hpcDay=1
router.get("/hpc/zadok", (req: Request, res: Response) => {
  try {
    const hpcYear = parseInt(req.query.hpcYear as string);
    const hpcMonth = parseInt(req.query.hpcMonth as string);
    const hpcDay = parseInt(req.query.hpcDay as string);

    if (isNaN(hpcYear) || isNaN(hpcMonth) || isNaN(hpcDay)) {
      res.status(400).json({ error: "hpcYear, hpcMonth and hpcDay are required" });
      return;
    }

    if (hpcMonth < 1 || hpcMonth > 13 || hpcDay < 1 || hpcDay > 30) {
      res.status(400).json({ error: "Invalid HPC month or day" });
      return;
    }

    const result = resolveZadokDay(hpcYear, hpcMonth, hpcDay);
    res.json(result);
  } catch (error) {
    const status = error instanceof ApiValidationError ? 400 : 500;
    res.status(status).json(toApiErrorResponse(error));
  }
});

// GET /hpc/zadok/week?hpcYear=6045&hpcMonth=1
// Returns all 28 days of a month with Zadok info
router.get("/hpc/zadok/month", (req: Request, res: Response) => {
  try {
    const hpcYear = parseInt(req.query.hpcYear as string);
    const hpcMonth = parseInt(req.query.hpcMonth as string);

    if (isNaN(hpcYear) || isNaN(hpcMonth)) {
      res.status(400).json({ error: "hpcYear and hpcMonth are required" });
      return;
    }

    const days = [];
    for (let day = 1; day <= 28; day++) {
      days.push(resolveZadokDay(hpcYear, hpcMonth, day));
    }

    res.json({
      hpcYear,
      hpcMonth,
      days
    });
  } catch (error) {
    const status = error instanceof ApiValidationError ? 400 : 500;
    res.status(status).json(toApiErrorResponse(error));
  }
});

// GET /hpc/zadok/courses
// Returns all 24 priestly courses
router.get("/hpc/zadok/courses", (_req: Request, res: Response) => {
  res.json({ courses: PRIESTLY_COURSES });
});

// GET /hpc/zadok/nativity?hpcYear=6045
router.get("/hpc/zadok/nativity", (req: Request, res: Response) => {
  try {
    const hpcYear = parseInt(req.query.hpcYear as string) || 6045;
    const result = calculateNativity(hpcYear);
    res.json(result);
  } catch (error) {
    const status = error instanceof ApiValidationError ? 400 : 500;
    res.status(status).json(toApiErrorResponse(error));
  }
});

export default router;