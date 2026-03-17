import { Router, Request, Response } from "express";
import { parseIsoDate } from "../utils/request-parsers";
import { toApiErrorResponse, ApiValidationError } from "../utils/api-errors";
import { getGlobalSeasonTimelineContext } from "../services/global-season-timeline-service";

const router = Router();

router.get("/hpc/global-season-timeline", async (req: Request, res: Response) => {
  try {
    const isoDate = parseIsoDate(req.query.isoDate, "isoDate");

    const result = await getGlobalSeasonTimelineContext(new Date(isoDate));

    res.json({
      inputIsoDate: isoDate,
      ...result
    });
  } catch (error) {
    const status = error instanceof ApiValidationError ? 400 : 500;
    res.status(status).json(toApiErrorResponse(error));
  }
});

export default router;
