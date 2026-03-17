import { Router, Request, Response } from "express";
import { getGlobalSeasonEvents } from "../astronomy/global-season-events";
import { toApiErrorResponse, ApiValidationError } from "../utils/api-errors";

const router = Router();

router.get("/hpc/global-season-events", async (req: Request, res: Response) => {
  try {
    const yearParam = req.query.year;

    if (typeof yearParam !== "string" || yearParam.trim() === "") {
      throw new ApiValidationError("Missing required query parameter: year");
    }

    const year = Number(yearParam);

    if (!Number.isInteger(year)) {
      throw new ApiValidationError("year must be an integer");
    }

    const result = await getGlobalSeasonEvents(year);

    res.json({
      year,
      events: result.map((event) => ({
        eventKey: event.eventKey,
        eventUtc: event.eventUtc.toISOString(),
        eventLatitude: event.eventLatitude,
        eventLongitude: event.eventLongitude,
        observableWindowStartUtc: event.observableWindowStartUtc.toISOString(),
        observableWindowEndUtc: event.observableWindowEndUtc.toISOString(),
        observableTransitionUtc: event.observableTransitionUtc.toISOString(),
      })),
    });
  } catch (error) {
    const status = error instanceof ApiValidationError ? 400 : 500;
    res.status(status).json(toApiErrorResponse(error));
  }
});

export default router;
