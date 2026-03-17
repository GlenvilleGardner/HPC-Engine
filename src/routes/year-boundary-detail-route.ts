import { Router, Request, Response } from "express";
import { resolveLocalObservationBoundaryUtc } from "../astronomy/year-boundary";
import { resolveGlobalHpcYearBoundaryUtc } from "../astronomy/global-season-boundary";
import { parseLatitude, parseLongitude } from "../utils/request-parsers";
import { toApiErrorResponse, ApiValidationError } from "../utils/api-errors";

const router = Router();

router.get("/hpc/year-boundary-detail", async (req: Request, res: Response) => {
  try {
    const yearParam = req.query.year;

    if (typeof yearParam !== "string" || yearParam.trim() === "") {
      throw new ApiValidationError("Missing required query parameter: year");
    }

    const year = Number(yearParam);

    if (!Number.isInteger(year)) {
      throw new ApiValidationError("year must be an integer");
    }

    const latitude = parseLatitude(req.query.latitude);
    const longitude = parseLongitude(req.query.longitude);

    const globalResult = await resolveGlobalHpcYearBoundaryUtc(year);
    const localResult = await resolveLocalObservationBoundaryUtc(year, { latitude, longitude });

    res.json({
      year,
      latitude,
      longitude,

      globalBoundary: {
        equinoxUtc: globalResult.equinoxUtc.toISOString(),
        eventLatitude: globalResult.eventLatitude,
        eventLongitude: globalResult.eventLongitude,
        observableWindowStartUtc: globalResult.observableWindowStartUtc.toISOString(),
        observableWindowEndUtc: globalResult.observableWindowEndUtc.toISOString(),
        classification: globalResult.classification,
        yearType: globalResult.yearType,
        boundarySunsetUtc: globalResult.boundarySunsetUtc.toISOString(),
        usedNextDaySunset: globalResult.usedNextDaySunset
      },

      localObservation: {
        equinoxUtc: localResult.equinoxUtc.toISOString(),
        observableWindowStartUtc: localResult.observableWindowStartUtc.toISOString(),
        observableWindowEndUtc: localResult.observableWindowEndUtc.toISOString(),
        boundarySunsetUtc: localResult.boundarySunsetUtc.toISOString(),
        usedNextDaySunset: localResult.usedNextDaySunset
      }
    });
  } catch (error) {
    const status = error instanceof ApiValidationError ? 400 : 500;
    res.status(status).json(toApiErrorResponse(error));
  }
});

export default router;
