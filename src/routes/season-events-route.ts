import { Router, Request, Response, NextFunction } from "express";
import { getSeasonEvents } from "../services/season-events-service";

const router = Router();

router.get("/hpc/season-events", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const yearParam = req.query.year;

    if (typeof yearParam !== "string" || yearParam.trim() === "") {
      return res.status(400).json({
        error: "Missing required query parameter: year",
      });
    }

    const year = Number(yearParam);

    if (!Number.isInteger(year)) {
      return res.status(400).json({
        error: "year must be an integer",
      });
    }

    const result = await getSeasonEvents(year);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

export default router;
