import { Router, Request, Response } from "express";
import { resolveGlobalHpcYearBoundaryUtc } from "../astronomy/global-season-boundary";
import { toApiErrorResponse, ApiValidationError } from "../utils/api-errors";

const router = Router();

router.get("/hpc/global-year-boundary", async (req: Request, res: Response) => {
  try {
    const yearParam = req.query.year;

    if (typeof yearParam !== "string" || yearParam.trim() === "") {
      throw new ApiValidationError("Missing required query parameter: year");
    }

    const year = Number(yearParam);

    if (!Number.isInteger(year)) {
      throw new ApiValidationError("year must be an integer");
    }

    const result = await resolveGlobalHpcYearBoundaryUtc(year);

    res.json({
      year,
      equinoxUtc: result.equinoxUtc.toISOString(),
      eventLatitude: result.eventLatitude,
      eventLongitude: result.eventLongitude,
      observableWindowStartUtc: result.observableWindowStartUtc.toISOString(),
      observableWindowEndUtc: result.observableWindowEndUtc.toISOString(),
      classification: result.classification,
      yearType: result.yearType,
      boundarySunsetUtc: result.boundarySunsetUtc.toISOString(),
      usedNextDaySunset: result.usedNextDaySunset
    });
  } catch (error) {
    const status = error instanceof ApiValidationError ? 400 : 500;
    res.status(status).json(toApiErrorResponse(error));
  }
});

export default router;
