import { Router, Request, Response } from "express";
import { parseIsoDate, parseLatitude, parseLongitude } from "../utils/request-parsers";
import { toApiErrorResponse, ApiValidationError } from "../utils/api-errors";

import { resolveGlobalHpcYearBoundaryUtc } from "../astronomy/global-season-boundary";
import { resolveHpcYearBoundaryUtc } from "../astronomy/year-boundary";
import { getCalendarDay } from "../services/calendar-day-service";
import { getSolarProgressContext } from "../services/solar-progress-service";
import { getSeasonTimelineContext } from "../services/season-timeline-service";
import { getGlobalSeasonTimelineContext } from "../services/global-season-timeline-service";

const router = Router();

router.get("/hpc/validation-snapshot", async (req: Request, res: Response) => {
  try {
    const isoDate = parseIsoDate(req.query.isoDate, "isoDate");
    const latitude = parseLatitude(req.query.latitude);
    const longitude = parseLongitude(req.query.longitude);

    const target = new Date(isoDate);
    const year = target.getUTCFullYear();
    const location = { latitude, longitude };

    const [
      globalBoundary,
      localBoundary,
      calendarDay,
      solarProgress,
      localSeasonTimeline,
      globalSeasonTimeline
    ] = await Promise.all([
      resolveGlobalHpcYearBoundaryUtc(year),
      resolveHpcYearBoundaryUtc(year, location),
      getCalendarDay({
        isoDate,
        latitude,
        longitude
      }),
      getSolarProgressContext(target, location),
      getSeasonTimelineContext(target, location),
      getGlobalSeasonTimelineContext(target)
    ]);

    res.json({
      inputIsoDate: isoDate,
      latitude,
      longitude,

      globalBoundary: {
        equinoxUtc: globalBoundary.equinoxUtc.toISOString(),
        eventLatitude: globalBoundary.eventLatitude,
        eventLongitude: globalBoundary.eventLongitude,
        observableWindowStartUtc: globalBoundary.observableWindowStartUtc.toISOString(),
        observableWindowEndUtc: globalBoundary.observableWindowEndUtc.toISOString(),
        classification: globalBoundary.classification,
        yearType: globalBoundary.yearType,
        boundarySunsetUtc: globalBoundary.boundarySunsetUtc.toISOString(),
        usedNextDaySunset: globalBoundary.usedNextDaySunset
      },

      localBoundary: {
        equinoxUtc: localBoundary.equinoxUtc.toISOString(),
        observableWindowStartUtc: localBoundary.observableWindowStartUtc.toISOString(),
        observableWindowEndUtc: localBoundary.observableWindowEndUtc.toISOString(),
        classification: localBoundary.classification,
        yearType: localBoundary.yearType,
        boundarySunsetUtc: localBoundary.boundarySunsetUtc.toISOString(),
        usedNextDaySunset: localBoundary.usedNextDaySunset
      },

      calendarDay,
      solarProgress,
      localSeasonTimeline,
      globalSeasonTimeline
    });
  } catch (error) {
    const status = error instanceof ApiValidationError ? 400 : 500;
    res.status(status).json(toApiErrorResponse(error));
  }
});

export default router;
